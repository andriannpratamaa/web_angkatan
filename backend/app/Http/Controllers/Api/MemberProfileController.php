<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateMyProfileRequest;
use App\Services\MemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('studentClass'),
        ]);
    }

    public function update(UpdateMyProfileRequest $request, MemberService $service): JsonResponse
    {
        $member = $request->user();
        $data = $request->validated();
        unset($data['photo_file']);

        $updated = $service->update($member, $data, $request->file('photo_file'));

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data' => $updated->load('studentClass'),
        ]);
    }
}
