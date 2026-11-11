<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with([
            'role',
            'department',
        ])
            ->where('is_active', true)
            ->whereHas('role', function ($query) {
                $query->whereIn('code', [
                    'IT_SUPPORT',
                    'IT_MANAGER',
                ]);
            })
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'department' => $user->department?->name,
                ];
            }),
        ]);
    }
}