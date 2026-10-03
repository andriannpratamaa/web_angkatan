<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClassRequest;
use App\Models\StudentClass;
use Illuminate\Http\JsonResponse;

class ClassController extends Controller
{
    public function index(): JsonResponse
    {
        $classes = StudentClass::query()
            ->withCount('members')
            ->orderBy('code')
            ->get();

        return response()->json(['data' => $classes]);
    }

    public function store(StoreClassRequest $request): JsonResponse
    {
        $class = StudentClass::create($request->validated());

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan.',
            'data' => $class,
        ], 201);
    }

    public function update(StoreClassRequest $request, StudentClass $class): JsonResponse
    {
        $class->update($request->validated());

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $class->fresh(),
        ]);
    }

    public function destroy(StudentClass $class): JsonResponse
    {
        $class->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
