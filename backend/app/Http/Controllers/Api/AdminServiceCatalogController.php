<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceCatalogRequest;
use App\Http\Requests\UpdateServiceCatalogRequest;
use App\Models\ServiceCatalog;
use Illuminate\Http\JsonResponse;

class AdminServiceCatalogController extends Controller
{
    public function index(): JsonResponse
    {
        $services = ServiceCatalog::query()
            ->with('category:id,name')
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
                    'is_active' => $service->is_active,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at,
                ];
            }),
        ]);
    }

    public function store(
        StoreServiceCatalogRequest $request
    ): JsonResponse {
        $service = ServiceCatalog::create(
            $request->validated()
        );

        $service->load('category:id,name');

        return response()->json([
            'message' => 'Service catalog created successfully.',
            'data' => $service,
        ], 201);
    }

    public function update(
        UpdateServiceCatalogRequest $request,
        ServiceCatalog $serviceCatalog
    ): JsonResponse {
        $serviceCatalog->update(
            $request->validated()
        );

        $serviceCatalog->load('category:id,name');

        return response()->json([
            'message' => 'Service catalog updated successfully.',
            'data' => $serviceCatalog,
        ]);
    }

    public function destroy(
        ServiceCatalog $serviceCatalog
    ): JsonResponse {
        $serviceCatalog->delete();

        return response()->json([
            'message' => 'Service catalog deleted successfully.',
        ]);
    }
}