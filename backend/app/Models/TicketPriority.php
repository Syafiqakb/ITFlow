<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Ticket;

class TicketPriority extends Model
{
    protected $fillable = [
        'name',
        'code',
        'level',
        'description',
        'is_active',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'priority_id');
    }

    public function slaPolicy(): HasOne
    {
        return $this->hasOne(SlaPolicy::class, 'priority_id');
    }
}
