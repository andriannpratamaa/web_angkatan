<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\StudentClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Member::query()
            ->with('studentClass:id,name,code')
            ->where('is_active', true);

        if ($class = $request->query('class')) {
            if (is_numeric($class)) {
                $query->where('class_id', (int) $class);
            } else {
                $query->whereHas('studentClass', fn ($builder) => $builder->where('code', $class));
            }
        }

        if ($classId = $request->query('class_id')) {
            $query->where('class_id', (int) $classId);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nrp', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        $members = $query->orderBy('nrp')->get();

        return response()->json([
            'data' => $members,
            'meta' => [
                'total' => $members->count(),
                'classes' => StudentClass::query()
                    ->withCount(['members' => fn ($q) => $q->where('is_active', true)])
                    ->orderBy('code')
                    ->get()
                    ->map(fn (StudentClass $class) => [
                        'id' => $class->id,
                        'code' => $class->code,
                        'label' => $class->label,
                        'name' => $class->name,
                        'members_count' => (int) $class->members_count,
                    ]),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $member = Member::query()
            ->with('studentClass:id,name,code')
            ->where('slug', $slug)
            ->firstOrFail();

        $member->load([
            'timahPanasParticipants.requirement:id,name,slug,target',
            'cashPayments.period:id,name,month,year',
        ]);

        return response()->json(['data' => $member]);
    }
}
