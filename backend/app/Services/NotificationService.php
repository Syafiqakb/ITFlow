<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Ticket;
use App\Models\User;

class NotificationService
{
    public function notifyUser(
        User $user,
        string $type,
        string $title,
        string $message,
        ?Ticket $ticket = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'ticket_id' => $ticket?->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ]);
    }

    public function notifyUsers(
        iterable $users,
        string $type,
        string $title,
        string $message,
        ?Ticket $ticket = null
    ): void {
        foreach ($users as $user) {
            $this->notifyUser(
                $user,
                $type,
                $title,
                $message,
                $ticket
            );
        }
    }
}