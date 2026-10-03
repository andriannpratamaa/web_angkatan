<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityRequest;
use App\Models\Activity;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;

class ActivityController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Activity::query()->orderBy('event_date')->orderBy('id')->get(),
        ]);
    }

    public function store(StoreActivityRequest $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = Activity::makeSlug($data['title']);

        if ($file = $request->file('image_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.activities'), 'image');
            $data['image_url'] = $upload['url'];
            $data['cloudinary_public_id'] = $upload['public_id'];
        }

        unset($data['image_file']);
        $activity = Activity::create($data);

        return response()->json([
            'message' => 'Kegiatan berhasil ditambahkan.',
            'data' => $activity,
        ], 201);
    }

    public function update(
        StoreActivityRequest $request,
        Activity $activity,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $data = $request->validated();

        if ($data['title'] !== $activity->title) {
            $data['slug'] = Activity::makeSlug($data['title'], $activity->id);
        }

        if ($file = $request->file('image_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.activities'), 'image');
            $cloudinary->destroy($activity->cloudinary_public_id, 'image');
            $data['image_url'] = $upload['url'];
            $data['cloudinary_public_id'] = $upload['public_id'];
        }

        unset($data['image_file']);
        $activity->update($data);

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $activity->fresh(),
        ]);
    }

    public function destroy(Activity $activity, CloudinaryService $cloudinary): JsonResponse
    {
        $cloudinary->destroy($activity->cloudinary_public_id, 'image');
        $activity->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
