<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimahPanasRequirement;
use App\Services\TimahPanasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimahPanasController extends Controller
{
    public function index(Request $request, TimahPanasService $service): JsonResponse
    {
        return response()->json($service->index($request->boolean('include_inactive')));
    }

    public function show(string $slug, TimahPanasService $service): JsonResponse
    {
        $requirement = TimahPanasRequirement::query()->where('slug', $slug)->firstOrFail();

        return response()->json($service->show($requirement));
    }
}
