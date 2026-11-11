<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SlaPolicy extends Model
{
    protected $fillable = [
        'priority_id',
        'response_time_minutes',
        'resolution_time_minutes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function priority(): BelongsTo
    {
        return $this->belongsTo(
            TicketPriority::class,
            'priority_id'
        );
    }
}