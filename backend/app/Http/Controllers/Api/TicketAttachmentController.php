<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TicketAttachmentController extends Controller
{
    public function index(Ticket $ticket): JsonResponse
    {
        $attachments = $ticket->attachments()
            ->with('user')
            ->latest()
            ->get();

        return response()->json([
            'data' => $attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'original_name' => $attachment->original_name,
                    'file_name' => $attachment->file_name,
                    'mime_type' => $attachment->mime_type,
                    'file_size' => $attachment->file_size,
                    'uploaded_by' => [
                        'id' => $attachment->user->id,
                        'name' => $attachment->user->name,
                    ],
                    'created_at' => $attachment->created_at,
                ];
            }),
        ]);
    }

    public function store(
        Request $request,
        Ticket $ticket
    ): JsonResponse {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,pdf,txt,csv,doc,docx,xls,xlsx,zip',
            ],
        ]);

        $file = $validated['file'];

        $path = $file->store(
            "tickets/{$ticket->id}",
            'public'
        );

        $attachment = $ticket->attachments()->create([
            'user_id' => $request->user()->id,
            'original_name' => $file->getClientOriginalName(),
            'file_name' => basename($path),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        $attachment->load('user');

        return response()->json([
            'message' => 'Attachment uploaded successfully.',
            'data' => [
                'id' => $attachment->id,
                'original_name' => $attachment->original_name,
                'file_name' => $attachment->file_name,
                'mime_type' => $attachment->mime_type,
                'file_size' => $attachment->file_size,
                'uploaded_by' => [
                    'id' => $attachment->user->id,
                    'name' => $attachment->user->name,
                ],
                'created_at' => $attachment->created_at,
            ],
        ], 201);
    }

    public function destroy(
        Ticket $ticket,
        int $attachment
    ): JsonResponse {
        $ticketAttachment = $ticket->attachments()
            ->findOrFail($attachment);

        Storage::disk('public')->delete(
            $ticketAttachment->file_path
        );

        $ticketAttachment->delete();

        return response()->json([
            'message' => 'Attachment deleted successfully.',
        ]);
    }
}