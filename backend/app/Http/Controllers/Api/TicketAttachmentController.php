<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\AuditLogService;
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
        Ticket $ticket,
        AuditLogService $auditLogService
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

        $auditLogService->log(
            $request->user(),
            $ticket,
            'ATTACHMENT_UPLOADED',
            "Attachment {$attachment->original_name} was uploaded to ticket {$ticket->ticket_number}.",
            null,
            [
                'attachment_id' => $attachment->id,
                'file_name' => $attachment->original_name,
                'file_size' => $attachment->file_size,
            ]
        );

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
        Request $request,
        Ticket $ticket,
        int $attachment,
        AuditLogService $auditLogService
    ): JsonResponse {
        $ticketAttachment = $ticket->attachments()
            ->findOrFail($attachment);

        Storage::disk('public')->delete(
            $ticketAttachment->file_path
        );

        $auditLogService->log(
            $request->user(),
            $ticket,
            'ATTACHMENT_DELETED',
            "Attachment {$ticketAttachment->original_name} was deleted from ticket {$ticket->ticket_number}.",
            [
                'attachment_id' => $ticketAttachment->id,
                'file_name' => $ticketAttachment->original_name,
                'file_size' => $ticketAttachment->file_size,
            ],
            null
        );

        $ticketAttachment->delete();

        return response()->json([
            'message' => 'Attachment deleted successfully.',
        ]);
    }
}