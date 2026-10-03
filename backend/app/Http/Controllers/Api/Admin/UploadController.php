<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadRequest;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(UploadRequest $request, CloudinaryService $cloudinary): JsonResponse
    {
        $folderKey = $request->input('folder', 'documents');
        $folder = config("cloudinary.folders.{$folderKey}", config('cloudinary.folders.documents'));
        $type = $request->input('type', 'image');
        $resourceType = $type === 'image' ? 'image' : 'auto';

        $upload = $cloudinary->upload($request->file('file'), $folder, $resourceType);

        return response()->json([
            'message' => 'File berhasil diupload.',
            'data' => $upload,
        ], 201);
    }

    public function destroy(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'public_id' => ['required', 'string'],
            'resource_type' => ['nullable', 'in:image,raw,video,auto'],
        ]);

        $cloudinary->destroy($data['public_id'], $data['resource_type'] ?? 'image');

        return response()->json(['message' => 'File berhasil dihapus.']);
    }
}
