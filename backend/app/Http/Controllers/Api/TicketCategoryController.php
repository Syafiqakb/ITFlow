<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketCategory;
use Illuminate\Http\JsonResponse;

class TicketCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = TicketCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'code' => $category->code,
                    'description' => $category->description,
                ];
            }),
        ]);
    }
}