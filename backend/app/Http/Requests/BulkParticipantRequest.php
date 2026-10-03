<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_ids' => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer', 'exists:members,id'],
            'participation_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'member_ids.required' => 'Pilih minimal satu mahasiswa.',
            'member_ids.min' => 'Pilih minimal satu mahasiswa.',
        ];
    }
}
