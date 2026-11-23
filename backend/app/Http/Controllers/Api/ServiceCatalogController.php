<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCatalog;
use Illuminate\Http\JsonResponse;

class ServiceCatalogController extends Controller
{
    public function index(): JsonResponse
    {
        $services = ServiceCatalog::query()
            ->with('category:id,name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'code' => $service->code,
                    'description' => $service->description,
                    'icon' => $service->icon,
                    'category_id' => $service->category_id,
                    'category_name' => $service->category?->name,
                ];
            }),
        ]);
    }
}