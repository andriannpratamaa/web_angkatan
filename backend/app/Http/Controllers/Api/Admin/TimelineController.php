<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimelineRequest;
use App\Models\Timeline;
use Illuminate\Http\JsonResponse;

class TimelineController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Timeline::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(StoreTimelineRequest $request): JsonResponse
    {
        $timeline = Timeline::create($request->validated());

        return response()->json([
            'message' => 'Timeline berhasil ditambahkan.',
            'data' => $timeline,
        ], 201);
    }

    public function update(StoreTimelineRequest $request, Timeline $timeline): JsonResponse
    {
        $timeline->update($request->validated());

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $timeline->fresh(),
        ]);
    }

    public function destroy(Timeline $timeline): JsonResponse
    {
        $timeline->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
