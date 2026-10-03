<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_date' => ['required', 'date'],
            'type' => ['required', 'in:income,expense'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'integer', 'min:1'],
            'created_by' => ['nullable', 'string', 'max:255'],
            'receipt_url' => ['nullable', 'string', 'max:2048'],
            'receipt_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
            'type.required' => 'Jenis transaksi wajib dipilih.',
            'type.in' => 'Jenis transaksi tidak valid.',
            'description.required' => 'Keterangan wajib diisi.',
            'amount.required' => 'Nominal wajib diisi.',
            'amount.integer' => 'Nominal harus berupa angka.',
            'amount.min' => 'Nominal harus lebih dari 0.',
            'receipt_file.max' => 'Ukuran bukti maksimal 10 MB.',
        ];
    }
}
