<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketStatus;
use App\Models\SlaPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Ticket::with([
            'requester',
            'category',
            'priority',
            'status',
            'assignee',
        ]);

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($query) use ($search) {
                $query
                    ->where('ticket_number', 'ilike', "%{$search}%")
                    ->orWhere('title', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->whereHas('status', function ($query) use ($request) {
                $query->where('code', $request->string('status'));
            });
        }

        if ($request->filled('priority')) {
            $query->whereHas('priority', function ($query) use ($request) {
                $query->where('code', $request->string('priority'));
            });
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->integer('assigned_to'));
        }

        if ($request->filled('category')) {
            $query->whereHas('category', function ($query) use ($request) {
                $query->where('code', $request->string('category'));
            });
        }

        $tickets = $query
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return TicketResource::collection($tickets);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(StoreTicketRequest $request): TicketResource
    {
        $newStatus = TicketStatus::where('code', 'NEW')->firstOrFail();

        $priorityId = $request->validated('priority_id');

        $slaPolicy = SlaPolicy::where(
            'priority_id',
            $priorityId
        )
            ->where('is_active', true)
            ->firstOrFail();

        $dueAt = now()->addMinutes(
            $slaPolicy->resolution_time_minutes
        );

        $ticket = Ticket::create([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'requester_id' => $request->user()->id,
            'category_id' => $request->validated('category_id'),
            'priority_id' => $request->validated('priority_id'),
            'status_id' => $newStatus->id,
            'due_at' => $dueAt,
        ]);

        $ticket->load([
            'requester',
            'category',
            'priority',
            'status',
            'assignee',
        ]);

        return new TicketResource($ticket);
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket): TicketResource
    {
        $ticket->load([
            'requester',
            'category',
            'priority',
            'status',
            'assignee',
        ]);

        return new TicketResource($ticket);
    }

    /**
     * Update the specified ticket.
     */
    public function update(
        UpdateTicketRequest $request,
        Ticket $ticket
    ): TicketResource {
        $data = $request->validated();

        if (isset($data['status_id'])) {
            $currentStatus = $ticket->status?->code;

            $newStatus = TicketStatus::find(
                $data['status_id']
            )?->code;

            $allowedTransitions = [
                'NEW' => [
                    'ASSIGNED',
                ],

                'ASSIGNED' => [
                    'IN_PROGRESS',
                ],

                'IN_PROGRESS' => [
                    'WAITING_USER',
                    'RESOLVED',
                ],

                'WAITING_USER' => [
                    'IN_PROGRESS',
                ],

                'RESOLVED' => [
                    'CLOSED',
                ],

                'CLOSED' => [],
            ];

            if (
                $currentStatus !== $newStatus &&
                !in_array(
                    $newStatus,
                    $allowedTransitions[$currentStatus] ?? [],
                    true
                )
            ) {
                abort(
                    422,
                    "Invalid status transition from {$currentStatus} to {$newStatus}."
                );
            }
        }

        $ticket->update($data);

        if (
            isset($data['status_id']) &&
            $ticket->status?->code === 'RESOLVED'
        ) {
            $ticket->update([
                'resolved_at' => $ticket->resolved_at ?? now(),
            ]);
        }

        if (
            isset($data['status_id']) &&
            $ticket->status?->code !== 'RESOLVED'
        ) {
            $ticket->update([
                'resolved_at' => null,
            ]);
        }

        if (
            isset($data['status_id']) &&
            $ticket->status?->code === 'CLOSED'
        ) {
            $ticket->update([
                'closed_at' => $ticket->closed_at ?? now(),
            ]);
        }

        if (
            isset($data['status_id']) &&
            $ticket->status?->code !== 'CLOSED'
        ) {
            $ticket->update([
                'closed_at' => null,
            ]);
        }

        $ticket->load([
            'requester',
            'category',
            'priority',
            'status',
            'assignee',
        ]);

        return new TicketResource($ticket);
    }

    /**
     * Remove the specified ticket.
     */
    public function destroy(Ticket $ticket): JsonResponse
    {
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully.',
        ]);
    }
}