<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalTickets = Ticket::count();

        $openTickets = Ticket::whereHas('status', function ($query) {
            $query->whereIn('code', [
                'NEW',
                'ASSIGNED',
                'WAITING_USER',
            ]);
        })->count();

        $inProgressTickets = Ticket::whereHas('status', function ($query) {
            $query->where('code', 'IN_PROGRESS');
        })->count();

        $resolvedTickets = Ticket::whereHas('status', function ($query) {
            $query->where('code', 'RESOLVED');
        })->count();

        $closedTickets = Ticket::whereHas('status', function ($query) {
            $query->where('code', 'CLOSED');
        })->count();

        $slaBreached = Ticket::whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->whereHas('status', function ($query) {
                $query->whereNotIn('code', [
                    'RESOLVED',
                    'CLOSED',
                ]);
            })
            ->count();

        return response()->json([
            'data' => [
                'total_tickets' => $totalTickets,
                'open_tickets' => $openTickets,
                'in_progress_tickets' => $inProgressTickets,
                'resolved_tickets' => $resolvedTickets,
                'closed_tickets' => $closedTickets,
                'sla_breached' => $slaBreached,
            ],
        ]);
    }
}