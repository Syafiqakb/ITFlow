<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function ticketStatus(): JsonResponse
    {
        $data = Ticket::query()
            ->with('status')
            ->get()
            ->groupBy(fn ($ticket) => $ticket->status?->name ?? 'Unknown')
            ->map(fn ($tickets, $status) => [
                'status' => $status,
                'total' => $tickets->count(),
            ])
            ->values();

        return response()->json([
            'data' => $data,
        ]);
    }

    public function ticketPriority(): JsonResponse
    {
        $data = Ticket::query()
            ->with('priority')
            ->get()
            ->groupBy(fn ($ticket) => $ticket->priority?->name ?? 'Unknown')
            ->map(fn ($tickets, $priority) => [
                'priority' => $priority,
                'total' => $tickets->count(),
            ])
            ->values();

        return response()->json([
            'data' => $data,
        ]);
    }

    public function ticketCategory(): JsonResponse
    {
        $data = Ticket::query()
            ->with('category')
            ->get()
            ->groupBy(fn ($ticket) => $ticket->category?->name ?? 'Unknown')
            ->map(fn ($tickets, $category) => [
                'category' => $category,
                'total' => $tickets->count(),
            ])
            ->values();

        return response()->json([
            'data' => $data,
        ]);
    }

    public function ticketAssignee(): JsonResponse
    {
        $data = Ticket::query()
            ->with('assignee')
            ->get()
            ->groupBy(fn ($ticket) => $ticket->assignee?->name ?? 'Unassigned')
            ->map(fn ($tickets, $assignee) => [
                'assignee' => $assignee,
                'total' => $tickets->count(),
            ])
            ->values();

        return response()->json([
            'data' => $data,
        ]);
    }

    public function ticketTrend(): JsonResponse
    {
        $data = Ticket::query()
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'data' => $data,
        ]);
    }

    public function slaPerformance(): JsonResponse
    {
        $tickets = Ticket::query()
            ->whereNotNull('due_at')
            ->with('status')
            ->get();

        $slaMet = 0;
        $slaBreached = 0;
        $slaOnTrack = 0;

        foreach ($tickets as $ticket) {
            $completionTime = $ticket->resolved_at ?? $ticket->closed_at;

            if ($completionTime) {
                if ($completionTime <= $ticket->due_at) {
                    $slaMet++;
                } else {
                    $slaBreached++;
                }

                continue;
            }

            if ($ticket->due_at->isPast()) {
                $slaBreached++;
            } else {
                $slaOnTrack++;
            }
        }

        $totalCompleted = $slaMet + $slaBreached;

        $complianceRate = $totalCompleted > 0
            ? round(($slaMet / $totalCompleted) * 100, 2)
            : 0;

        return response()->json([
            'data' => [
                'total_with_sla' => $tickets->count(),
                'sla_met' => $slaMet,
                'sla_breached' => $slaBreached,
                'sla_on_track' => $slaOnTrack,
                'compliance_rate' => $complianceRate,
            ],
        ]);
    }
}