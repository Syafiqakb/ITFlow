<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Http\Requests\UpdateTicketRequest;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets.
     */
    public function index(): AnonymousResourceCollection
    {
        $tickets = Ticket::with([
            'requester',
            'category',
            'priority',
            'status',
            'assignee',
        ])
            ->latest()
            ->paginate(15);

        return TicketResource::collection($tickets);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(StoreTicketRequest $request): TicketResource
    {
        $newStatus = TicketStatus::where('code', 'NEW')->firstOrFail();

        $ticket = Ticket::create([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'requester_id' => $request->user()->id,
            'category_id' => $request->validated('category_id'),
            'priority_id' => $request->validated('priority_id'),
            'status_id' => $newStatus->id,
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

        $ticket->update($data);

        if (
            isset($data['status_id']) &&
            $ticket->status?->code === 'RESOLVED' &&
            !$ticket->resolved_at
        ) {
            $ticket->update([
                'resolved_at' => now(),
            ]);
        }

        if (
            isset($data['status_id']) &&
            $ticket->status?->code === 'CLOSED' &&
            !$ticket->closed_at
        ) {
            $ticket->update([
                'closed_at' => now(),
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