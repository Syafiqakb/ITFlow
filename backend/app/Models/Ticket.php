<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number',
        'title',
        'description',
        'requester_id',
        'category_id',
        'priority_id',
        'status_id',
        'assigned_to',
        'due_at',
        'resolved_at',
        'closed_at',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category_id');
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(TicketPriority::class, 'priority_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(TicketStatus::class, 'status_id');
    }

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            $year = now()->year;

            $lastTicket = self::whereYear('created_at', $year)
                ->orderByDesc('id')
                ->first();

            $nextNumber = $lastTicket
                ? ((int) substr($lastTicket->ticket_number, -6)) + 1
                : 1;

            $ticket->ticket_number = sprintf(
                'IT-%d-%06d',
                $year,
                $nextNumber
            );
        });
    }
    
    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }
}
