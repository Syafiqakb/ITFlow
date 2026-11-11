<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketCommentController;
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
});