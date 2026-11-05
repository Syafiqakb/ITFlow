<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Ticket;


class TicketStatus extends Model
{
    protected $fillable = [
        'name',
        'code',
        'sort_order',
        'is_closed',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_closed' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'status_id');
    }
}
