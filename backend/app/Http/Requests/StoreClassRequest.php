<?php

namespace App\Http\Requests;

use App\Models\StudentClass;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $class = $this->route('class');
        $ignoreId = $class instanceof StudentClass ? $class->id : $class;

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('classes', 'code')->ignore($ignoreId)],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kelas wajib diisi.',
            'code.required' => 'Kode kelas wajib diisi.',
            'code.unique' => 'Kode kelas sudah digunakan.',
        ];
    }
}
