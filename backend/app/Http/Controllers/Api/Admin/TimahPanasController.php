<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequirementRequest;
use App\Models\TimahPanasRequirement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class TimahPanasController extends Controller
{
    public function store(StoreRequirementRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['sort_order'] = $data['sort_order']
            ?? ((int) TimahPanasRequirement::query()->max('sort_order') + 1);
        $data['is_active'] = $data['is_active'] ?? true;

        $requirement = TimahPanasRequirement::create($data);
        $requirement->loadCount('participants');

        return response()->json([
            'message' => 'Persyaratan berhasil ditambahkan.',
            'data' => $requirement,
        ], 201);
    }

    public function update(StoreRequirementRequest $request, TimahPanasRequirement $requirement): JsonResponse
    {
        $data = $request->validated();

        if ($data['name'] !== $requirement->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $requirement->id);
        }

        $requirement->update($data);
        $requirement->loadCount('participants');

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $requirement,
        ]);
    }

    public function destroy(TimahPanasRequirement $requirement): JsonResponse
    {
        $requirement->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'persyaratan';
        $slug = $base;
        $suffix = 2;

        while (TimahPanasRequirement::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
