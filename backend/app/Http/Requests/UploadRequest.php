<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:10240'],
            'folder' => ['nullable', 'string', 'in:members,gallery,activities,receipts,proofs,documents'],
            'type' => ['nullable', 'in:image,document'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $file = $this->file('file');
            if (! $file) {
                return;
            }

            $type = $this->input('type', 'image');
            $extension = strtolower($file->getClientOriginalExtension());

            if ($type === 'image') {
                $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                if (! in_array($extension, $allowed, true)) {
                    $validator->errors()->add('file', 'Format gambar harus jpg, jpeg, png, atau webp.');
                }
            } else {
                $allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
                if (! in_array($extension, $allowed, true)) {
                    $validator->errors()->add('file', 'Format dokumen harus PDF, DOC, DOCX, XLS, atau XLSX.');
                }
            }
        });
    }
}
