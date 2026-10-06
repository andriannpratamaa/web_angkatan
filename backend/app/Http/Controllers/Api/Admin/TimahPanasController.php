<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequirementRequest;
use App\Models\TimahPanasParticipant;
use App\Models\TimahPanasRequirement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    /**
     * Get attendance dates for a date-based requirement
     */
    public function attendances(TimahPanasRequirement $requirement): JsonResponse
    {
        if ($requirement->type !== 'date') {
            return response()->json(['message' => 'Persyaratan ini bukan tipe presensi tanggal.'], 422);
        }

        $dates = $requirement->attendances()
            ->select('participation_date')
            ->distinct()
            ->orderBy('participation_date')
            ->get()
            ->map(fn ($p) => $p->participation_date->format('Y-m-d'));

        return response()->json([
            'data' => $dates,
        ]);
    }

    /**
     * Add an attendance date for a date-based requirement
     */
    public function addAttendance(Request $request, TimahPanasRequirement $requirement): JsonResponse
    {
        if ($requirement->type !== 'date') {
            return response()->json(['message' => 'Persyaratan ini bukan tipe presensi tanggal.'], 422);
        }

        $request->validate([
            'participation_date' => ['required', 'date'],
        ]);

        $date = $request->input('participation_date');

        // Check if already at target
        $currentCount = $requirement->fulfilled;
        if ($currentCount >= $requirement->target) {
            return response()->json([
                'message' => 'Target presensi sudah terpenuhi.',
            ], 422);
        }

        // Check if date already exists
        $exists = $requirement->attendances()
            ->where('participation_date', $date)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Tanggal presensi sudah terdaftar.',
            ], 422);
        }

        // Add attendance date (member_id = null for date-based)
        TimahPanasParticipant::create([
            'requirement_id' => $requirement->id,
            'member_id' => null,
            'participation_date' => $date,
            'notes' => 'Presensi Timah Panas',
        ]);

        return response()->json([
            'message' => 'Tanggal presensi berhasil ditambahkan.',
            'data' => [
                'participation_date' => $date,
                'fulfilled' => $requirement->fresh()->fulfilled,
                'target' => $requirement->target,
            ],
        ]);
    }

    /**
     * Remove an attendance date for a date-based requirement
     */
    public function removeAttendance(Request $request, TimahPanasRequirement $requirement): JsonResponse
    {
        if ($requirement->type !== 'date') {
            return response()->json(['message' => 'Persyaratan ini bukan tipe presensi tanggal.'], 422);
        }

        $request->validate([
            'participation_date' => ['required', 'date'],
        ]);

        $date = $request->input('participation_date');

        $deleted = $requirement->attendances()
            ->where('participation_date', $date)
            ->delete();

        if (! $deleted) {
            return response()->json([
                'message' => 'Tanggal presensi tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Tanggal presensi berhasil dihapus.',
            'data' => [
                'fulfilled' => $requirement->fresh()->fulfilled,
                'target' => $requirement->target,
            ],
        ]);
    }
}
