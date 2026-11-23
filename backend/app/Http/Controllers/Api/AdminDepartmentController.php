<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminDepartmentStoreRequest;
use App\Http\Requests\AdminDepartmentUpdateRequest;
use App\Models\Department;
use Illuminate\Http\JsonResponse;

class AdminDepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::query()
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $departments->map(function ($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'code' => $department->code,
                    'description' => $department->description,
                    'is_active' => $department->is_active,
                    'users_count' => $department->users_count,
                ];
            }),
        ]);
    }

    public function store(
        AdminDepartmentStoreRequest $request
    ): JsonResponse {
        $department = Department::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'Department created successfully.',
            'data' => $department,
        ], 201);
    }

    public function update(
        AdminDepartmentUpdateRequest $request,
        Department $department
    ): JsonResponse {
        $department->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active'),
        ]);

        return response()->json([
            'message' => 'Department updated successfully.',
            'data' => $department->fresh(),
        ]);
    }
}