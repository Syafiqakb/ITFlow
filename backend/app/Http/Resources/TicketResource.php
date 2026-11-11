<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,

            'title' => $this->title,
            'description' => $this->description,

            'requester' => [
                'id' => $this->requester?->id,
                'name' => $this->requester?->name,
                'email' => $this->requester?->email,
            ],

            'category' => [
                'id' => $this->category?->id,
                'name' => $this->category?->name,
                'code' => $this->category?->code,
            ],

            'priority' => [
                'id' => $this->priority?->id,
                'name' => $this->priority?->name,
                'code' => $this->priority?->code,
                'level' => $this->priority?->level,
            ],

            'status' => [
                'id' => $this->status?->id,
                'name' => $this->status?->name,
                'code' => $this->status?->code,
            ],

            'assignee' => $this->assigned_to
                ? [
                    'id' => $this->assignee?->id,
                    'name' => $this->assignee?->name,
                    'email' => $this->assignee?->email,
                ]
                : null,

            'due_at' => $this->due_at?->toISOString(),
            'sla_status' => $this->due_at
                ? (
                    in_array($this->status?->code, ['RESOLVED', 'CLOSED'], true)
                        ? 'COMPLETED'
                        : ($this->due_at->isPast() ? 'BREACHED' : 'ON_TRACK')
                )
                : null,
            'resolved_at' => $this->resolved_at?->toISOString(),
            'closed_at' => $this->closed_at?->toISOString(),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
