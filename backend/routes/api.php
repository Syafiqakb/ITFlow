<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketCommentController;
use App\Http\Controllers\Api\TicketAttachmentController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/users', [UserController::class, 'index']);

    Route::apiResource('tickets', TicketController::class);

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
});