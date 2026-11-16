<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Ticket;
use App\Models\User;

class AuditLogService
{
    public function log(
        ?User $user,
        ?Ticket $ticket,
        string $action,
        string $description,
        ?array $oldValues = null,
        ?array $newValues = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $user?->id,
            'ticket_id' => $ticket?->id,
            'action' => $action,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}