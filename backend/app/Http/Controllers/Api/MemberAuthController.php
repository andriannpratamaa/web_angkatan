<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MemberAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'nrp' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'nrp.required' => 'NRP wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $member = Member::query()
            ->where('nrp', $credentials['nrp'])
            ->where('is_active', true)
            ->first();

        if (! $member || ! $member->password || ! Hash::check($credentials['password'], $member->password)) {
            return response()->json(['message' => 'NRP atau password salah.'], 422);
        }

        $token = $member->createToken('to26-member', ['student'])->plainTextToken;

        $member->update(['last_login_at' => now()]);

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $token,
            'member' => $member->load('studentClass'),
            'must_change_password' => (bool) $member->must_change_password,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('studentClass'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $member = $request->user();

        if (! Hash::check($request->input('current_password'), $member->password)) {
            return response()->json(['message' => 'Password lama salah.'], 422);
        }

        $member->update([
            'password' => $request->input('password'),
            'must_change_password' => false,
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui.',
            'member' => $member->fresh()->load('studentClass'),
        ]);
    }
}
