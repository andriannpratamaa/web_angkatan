<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'nrp' => ['required', 'string', 'max:30', 'unique:members,nrp'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
            'gender' => ['nullable', 'in:L,P'],
            'role' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string'],
            'quote' => ['nullable', 'string'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'github' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'photo' => ['nullable', 'string', 'max:2048'],
            'photo_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama mahasiswa wajib diisi.',
            'nrp.required' => 'NRP wajib diisi.',
            'nrp.unique' => 'NRP sudah terdaftar pada mahasiswa lain.',
            'class_id.exists' => 'Kelas tidak ditemukan.',
            'photo_file.image' => 'Foto harus berupa gambar.',
            'photo_file.max' => 'Ukuran foto maksimal 5 MB.',
        ];
    }
}
