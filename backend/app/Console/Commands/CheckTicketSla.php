<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Ticket;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class CheckTicketSla extends Command
{
    protected $signature = 'app:check-ticket-sla';

    protected $description = 'Check tickets for SLA breaches and notify relevant users';

    public function handle(
        NotificationService $notificationService
    ): int {
        $tickets = Ticket::query()
            ->with([
                'requester',
                'status',
                'assignee',
            ])
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->whereHas('status', function ($query) {
                $query->whereNotIn('code', [
                    'RESOLVED',
                    'CLOSED',
                ]);
            })
            ->get();

        $notified = 0;

        foreach ($tickets as $ticket) {
            $alreadyNotified = Notification::query()
                ->where('ticket_id', $ticket->id)
                ->where('type', 'SLA_BREACHED')
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            $users = collect([
                $ticket->requester,
                $ticket->assignee,
            ])
                ->filter()
                ->unique('id');

            $notificationService->notifyUsers(
                $users,
                'SLA_BREACHED',
                'SLA Breached',
                "Ticket {$ticket->ticket_number} has exceeded its resolution SLA.",
                $ticket
            );

            $notified++;

            $this->info(
                "SLA breach notification created for {$ticket->ticket_number}."
            );
        }

        $this->info(
            "SLA check completed. {$notified} ticket(s) notified."
        );

        return self::SUCCESS;
    }
}