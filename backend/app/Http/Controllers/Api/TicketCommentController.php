<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketCommentController extends Controller
{
    public function index(Ticket $ticket): JsonResponse
    {
        $comments = $ticket->comments()
            ->with('user')
            ->latest()
            ->get();

        return response()->json([
            'data' => $comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'comment' => $comment->comment,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'email' => $comment->user->email,
                    ],
                    'created_at' => $comment->created_at,
                    'updated_at' => $comment->updated_at,
                ];
            }),
        ]);
    }

    public function store(
        Request $request,
        Ticket $ticket
    ): JsonResponse {
        $validated = $request->validate([
            'comment' => [
                'required',
                'string',
                'min:2',
            ],
        ]);

        $comment = $ticket->comments()->create([
            'user_id' => $request->user()->id,
            'comment' => $validated['comment'],
        ]);

        if (
            !$ticket->first_responded_at &&
            in_array($request->user()->role?->code, [
                'IT_SUPPORT',
                'IT_MANAGER',
            ], true)
        ) {
            $ticket->update([
                'first_responded_at' => now(),
            ]);
        }

        $comment->load('user');

        return response()->json([
            'message' => 'Comment added successfully.',
            'data' => [
                'id' => $comment->id,
                'comment' => $comment->comment,
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                    'email' => $comment->user->email,
                ],
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
            ],
        ], 201);
    }
}