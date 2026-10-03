<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGalleryRequest;
use App\Models\Gallery;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Gallery::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(StoreGalleryRequest $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validated();

        if ($file = $request->file('image_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.gallery'), 'image');
            $data['image_url'] = $upload['url'];
            $data['cloudinary_public_id'] = $upload['public_id'];
        }

        unset($data['image_file']);
        $gallery = Gallery::create($data);

        return response()->json([
            'message' => 'Galeri berhasil ditambahkan.',
            'data' => $gallery,
        ], 201);
    }

    public function update(
        StoreGalleryRequest $request,
        Gallery $gallery,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $data = $request->validated();

        if ($file = $request->file('image_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.gallery'), 'image');
            $cloudinary->destroy($gallery->cloudinary_public_id, 'image');
            $data['image_url'] = $upload['url'];
            $data['cloudinary_public_id'] = $upload['public_id'];
        }

        unset($data['image_file']);
        $gallery->update($data);

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $gallery->fresh(),
        ]);
    }

    public function destroy(Gallery $gallery, CloudinaryService $cloudinary): JsonResponse
    {
        $cloudinary->destroy($gallery->cloudinary_public_id, 'image');
        $gallery->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
