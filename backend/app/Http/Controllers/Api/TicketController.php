<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketStatus;
use App\Models\SlaPolicy;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\AuditLogService;
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
    public function store(StoreTicketRequest $request, NotificationService $notificationService, AuditLogService $auditLogService): TicketResource
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

        $auditLogService->log(
            $request->user(),
            $ticket,
            'TICKET_CREATED',
            "Ticket {$ticket->ticket_number} was created.",
            null,
            [
                'title' => $ticket->title,
                'category_id' => $ticket->category_id,
                'priority_id' => $ticket->priority_id,
                'status_id' => $ticket->status_id,
            ]
        );

        $users = User::whereHas('role', function ($query) {
            $query->whereIn('code', [
                'IT_SUPPORT',
                'IT_MANAGER',
            ]);
        })
            ->where('id', '!=', $request->user()->id)
            ->get();

        $notificationService->notifyUsers(
            $users,
            'TICKET_CREATED',
            'New Ticket Created',
            "A new ticket {$ticket->ticket_number} has been created.",
            $ticket
        );

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
        Ticket $ticket,
        NotificationService $notificationService,
        AuditLogService $auditLogService
    ): TicketResource {
        $data = $request->validated();

        $oldStatusCode = $ticket->status?->code;

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

        $oldAssigneeId = $ticket->assigned_to;

        if (
            array_key_exists('assigned_to', $data) &&
            $data['assigned_to'] !== $oldAssigneeId &&
            $data['assigned_to'] !== null
        ) {
            $assignee = User::find($data['assigned_to']);

            if ($assignee) {
                $notificationService->notifyUser(
                    $assignee,
                    'TICKET_ASSIGNED',
                    'Ticket Assigned',
                    "Ticket {$ticket->ticket_number} has been assigned to you.",
                    $ticket
                );
            }
        }

        if (
            array_key_exists('assigned_to', $data) &&
            $data['assigned_to'] !== $oldAssigneeId
        ) {
            $auditLogService->log(
                $request->user(),
                $ticket,
                'TICKET_ASSIGNED',
                "Ticket {$ticket->ticket_number} assignment was changed.",
                [
                    'assigned_to' => $oldAssigneeId,
                ],
                [
                    'assigned_to' => $data['assigned_to'],
                ]
            );
        }

        $oldValues = [];

        if (array_key_exists('title', $data)) {
            $oldValues['title'] = $ticket->title;
        }

        if (array_key_exists('description', $data)) {
            $oldValues['description'] = $ticket->description;
        }

        if (array_key_exists('category_id', $data)) {
            $oldValues['category_id'] = $ticket->category_id;
        }

        if (array_key_exists('priority_id', $data)) {
            $oldValues['priority_id'] = $ticket->priority_id;
        }

        $ticket->update($data);

        $newValues = [];

        foreach ([
            'title',
            'description',
            'category_id',
            'priority_id',
        ] as $field) {
            if (array_key_exists($field, $data)) {
                $newValues[$field] = $ticket->{$field};
            }
        }

        if ($oldValues !== $newValues) {
            $auditLogService->log(
                $request->user(),
                $ticket,
                'TICKET_UPDATED',
                "Ticket {$ticket->ticket_number} details were updated.",
                $oldValues,
                $newValues
            );
        }

        $ticket->refresh();
        $ticket->load('status');

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

        if (
            isset($data['status_id']) &&
            $oldStatusCode !== $ticket->status?->code
        ) {
            $notificationService->notifyUser(
                $ticket->requester,
                'TICKET_STATUS_CHANGED',
                'Ticket Status Updated',
                "Ticket {$ticket->ticket_number} status has been changed to {$ticket->status?->name}.",
                $ticket
            );
        }

        if (
            isset($data['status_id']) &&
            $oldStatusCode !== $ticket->status?->code
        ) {
            $auditLogService->log(
                $request->user(),
                $ticket,
                'STATUS_CHANGED',
                "Ticket {$ticket->ticket_number} status changed from {$oldStatusCode} to {$ticket->status?->code}.",
                [
                    'status' => $oldStatusCode,
                ],
                [
                    'status' => $ticket->status?->code,
                ]
            );
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