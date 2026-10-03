<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Gallery;
use App\Models\Timeline;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
{
    public function galleries(): JsonResponse
    {
        return response()->json([
            'data' => Gallery::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function activities(): JsonResponse
    {
        return response()->json([
            'data' => Activity::query()
                ->orderBy('event_date')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function timelines(): JsonResponse
    {
        return response()->json([
            'data' => Timeline::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        ]);
    }
}
