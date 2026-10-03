<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentClass;
use Illuminate\Http\JsonResponse;

class ClassController extends Controller
{
    public function index(): JsonResponse
    {
        $classes = StudentClass::query()
            ->withCount(['members' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('code')
            ->get()
            ->map(fn (StudentClass $class) => [
                'id' => $class->id,
                'name' => $class->name,
                'code' => $class->code,
                'label' => $class->label,
                'description' => $class->description,
                'members_count' => (int) $class->members_count,
            ]);

        return response()->json(['data' => $classes]);
    }
}
