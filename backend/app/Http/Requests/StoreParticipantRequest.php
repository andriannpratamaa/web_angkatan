<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'participation_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'proof_url' => ['nullable', 'string', 'max:2048'],
            'proof_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'member_id.required' => 'Mahasiswa wajib dipilih.',
            'member_id.exists' => 'Mahasiswa tidak ditemukan.',
        ];
    }
}
