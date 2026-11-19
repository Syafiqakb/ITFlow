<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminTicketCategoryStoreRequest;
use App\Http\Requests\AdminTicketCategoryUpdateRequest;
use App\Models\TicketCategory;
use Illuminate\Http\JsonResponse;

class AdminTicketCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = TicketCategory::query()
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'code' => $category->code,
                    'description' => $category->description,
                    'is_active' => $category->is_active,
                ];
            }),
        ]);
    }

    public function store(
        AdminTicketCategoryStoreRequest $request
    ): JsonResponse {
        $category = TicketCategory::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'Ticket category created successfully.',
            'data' => $category,
        ], 201);
    }

    public function update(
        AdminTicketCategoryUpdateRequest $request,
        TicketCategory $ticketCategory
    ): JsonResponse {
        $ticketCategory->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active'),
        ]);

        return response()->json([
            'message' => 'Ticket category updated successfully.',
            'data' => $ticketCategory->fresh(),
        ]);
    }
}