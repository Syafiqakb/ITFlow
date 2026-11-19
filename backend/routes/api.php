<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketCommentController;
use App\Http\Controllers\Api\TicketAttachmentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/users', [UserController::class, 'index'])
        ->middleware('role:ADMIN,IT_MANAGER');

    Route::apiResource('tickets', TicketController::class)
        ->except(['update', 'destroy']);

    Route::put('/tickets/{ticket}', [TicketController::class, 'update'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT');

    Route::patch('/tickets/{ticket}', [TicketController::class, 'update'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT');

    Route::delete('/tickets/{ticket}', [TicketController::class, 'destroy'])
        ->middleware('role:ADMIN,IT_MANAGER');

    Route::get(
        '/tickets/{ticket}/comments',
        [TicketCommentController::class, 'index']
    );

    Route::post(
        '/tickets/{ticket}/comments',
        [TicketCommentController::class, 'store']
    );

    Route::get(
        '/tickets/{ticket}/attachments',
        [TicketAttachmentController::class, 'index']
    );

    Route::post(
        '/tickets/{ticket}/attachments',
        [TicketAttachmentController::class, 'store']
    );

    Route::delete(
        '/tickets/{ticket}/attachments/{attachment}',
        [TicketAttachmentController::class, 'destroy']
    );

    Route::get(
        '/notifications',
        [NotificationController::class, 'index']
    );

    Route::get(
        '/notifications/unread-count',
        [NotificationController::class, 'unreadCount']
    );

    Route::patch(
        '/notifications/{notification}/read',
        [NotificationController::class, 'markAsRead']
    );

    Route::patch(
        '/notifications/read-all',
        [NotificationController::class, 'markAllAsRead']
    );

    Route::get(
        '/tickets/{ticket}/audit-logs',
        [AuditLogController::class, 'index']
    );

    Route::get(
        '/reports/tickets/status',
        [ReportController::class, 'ticketStatus'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT'
        );

    Route::get(
        '/reports/tickets/priority',
        [ReportController::class, 'ticketPriority'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT'
        );

    Route::get(
        '/reports/tickets/category',
        [ReportController::class, 'ticketCategory'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT'
        );

    Route::get(
        '/reports/tickets/assignee',
        [ReportController::class, 'ticketAssignee'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT'
        );

    Route::get(
        '/reports/tickets/trend',
        [ReportController::class, 'ticketTrend'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT'
        );

    Route::get(
        '/reports/tickets/sla',
        [ReportController::class, 'slaPerformance'])
        ->middleware('role:ADMIN,IT_MANAGER,IT_SUPPORT'
        );
});