<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\Member;
use App\Services\MemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Member::query()->with('studentClass:id,name,code');

        if ($classId = $request->query('class_id')) {
            $query->where('class_id', (int) $classId);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nrp', 'like', "%{$search}%");
            });
        }

        if ($request->query('status') === 'inactive') {
            $query->where('is_active', false);
        } elseif ($request->query('status') === 'active') {
            $query->where('is_active', true);
        }

        return response()->json([
            'data' => $query->orderBy('nrp')->get(),
            'meta' => ['total' => $query->count()],
        ]);
    }

    public function store(StoreMemberRequest $request, MemberService $service): JsonResponse
    {
        $data = $request->validated();
        unset($data['photo_file']);

        $member = $service->create($data, $request->file('photo_file'));

        return response()->json([
            'message' => 'Mahasiswa berhasil ditambahkan.',
            'data' => $member->load('studentClass'),
        ], 201);
    }

    public function update(UpdateMemberRequest $request, Member $member, MemberService $service): JsonResponse
    {
        $data = $request->validated();
        unset($data['photo_file']);

        $updated = $service->update($member, $data, $request->file('photo_file'));

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $updated->load('studentClass'),
        ]);
    }

    public function destroy(Member $member, MemberService $service): JsonResponse
    {
        $service->delete($member);

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
