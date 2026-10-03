<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkParticipantRequest;
use App\Http\Requests\StoreParticipantRequest;
use App\Models\TimahPanasParticipant;
use App\Models\TimahPanasRequirement;
use App\Services\CloudinaryService;
use App\Services\TimahPanasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TimahPanasParticipantController extends Controller
{
    public function index(TimahPanasRequirement $requirement, TimahPanasService $service): JsonResponse
    {
        $requirement->loadCount('participants');

        $participants = $requirement->participants()
            ->with('member:id,name,nrp,slug,role,photo,class_id,is_active', 'member.studentClass:id,name,code')
            ->orderBy('participation_date')
            ->orderBy('id')
            ->get();

        return response()->json([
            'requirement' => $requirement,
            'data' => $participants,
            'class_contribution' => $service->classContribution(),
        ]);
    }

    public function store(
        StoreParticipantRequest $request,
        TimahPanasRequirement $requirement,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $data = $request->validated();

        $exists = $requirement->participants()
            ->where('member_id', $data['member_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Mahasiswa ini sudah terdaftar pada persyaratan tersebut.',
            ], 422);
        }

        if ($file = $request->file('proof_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.proofs'), 'auto');
            $data['proof_url'] = $upload['url'];
            $data['proof_public_id'] = $upload['public_id'];
        }

        unset($data['proof_file']);

        $participant = $requirement->participants()->create($data);

        return response()->json([
            'message' => 'Peserta berhasil ditambahkan.',
            'data' => $participant->load('member.studentClass'),
        ], 201);
    }

    public function bulk(
        BulkParticipantRequest $request,
        TimahPanasRequirement $requirement,
        TimahPanasService $service
    ): JsonResponse {
        $data = $request->validated();

        $result = DB::transaction(fn () => $service->addParticipants(
            $requirement,
            $data['member_ids'],
            $data['participation_date'] ?? null,
            $data['notes'] ?? null,
        ));

        $message = "{$result['created']} peserta berhasil ditambahkan.";
        if ($result['skipped'] > 0) {
            $message .= " {$result['skipped']} dilewati karena sudah terdaftar.";
        }

        return response()->json([
            'message' => $message,
            'created' => $result['created'],
            'skipped' => $result['skipped'],
        ]);
    }

    public function update(
        StoreParticipantRequest $request,
        TimahPanasRequirement $requirement,
        int $participant,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $model = $requirement->participants()->findOrFail($participant);
        $data = $request->validated();

        $duplicate = $requirement->participants()
            ->where('member_id', $data['member_id'])
            ->where('id', '!=', $model->id)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'message' => 'Mahasiswa ini sudah terdaftar pada persyaratan tersebut.',
            ], 422);
        }

        if ($file = $request->file('proof_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.proofs'), 'auto');
            $cloudinary->destroy($model->proof_public_id, 'image');
            $data['proof_url'] = $upload['url'];
            $data['proof_public_id'] = $upload['public_id'];
        }

        unset($data['proof_file']);
        $model->update($data);

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $model->fresh()->load('member.studentClass'),
        ]);
    }

    public function destroy(
        TimahPanasRequirement $requirement,
        int $participant,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $model = $requirement->participants()->findOrFail($participant);
        $cloudinary->destroy($model->proof_public_id, 'image');
        $model->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
