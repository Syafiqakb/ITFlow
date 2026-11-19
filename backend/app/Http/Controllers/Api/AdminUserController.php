<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\AdminUserStoreRequest;
use App\Http\Requests\AdminUserUpdateRequest;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with([
                'role',
                'department',
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'role_code' => $user->role?->code,
                    'department' => $user->department?->name,
                    'is_active' => $user->is_active,
                ];
            }),
        ]);
    }
    public function store(AdminUserStoreRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'department_id' => $request->department_id,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $user->load([
            'role',
            'department',
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->name,
                'role_code' => $user->role?->code,
                'department' => $user->department?->name,
                'is_active' => $user->is_active,
            ],
        ], 201);
    }
    public function update(
        AdminUserUpdateRequest $request,
        User $user
    ): JsonResponse {
        if (
            $user->id === $request->user()->id &&
            !$request->boolean('is_active')
        ) {
            return response()->json([
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'department_id' => $request->department_id,
            'is_active' => $request->boolean('is_active'),
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        $user->load([
            'role',
            'department',
        ]);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->name,
                'role_code' => $user->role?->code,
                'department' => $user->department?->name,
                'is_active' => $user->is_active,
            ],
        ]);
    }
}