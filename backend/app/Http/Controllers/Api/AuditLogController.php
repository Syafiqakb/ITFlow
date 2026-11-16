<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(Ticket $ticket): JsonResponse
    {
        $logs = AuditLog::query()
            ->where('ticket_id', $ticket->id)
            ->with('user')
            ->latest()
            ->get();

        return response()->json([
            'data' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                    ] : null,
                    'created_at' => $log->created_at,
                ];
            }),
        ]);
    }
}