<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'cash_period_id' => ['required', 'integer', 'exists:cash_periods,id'],
            'amount' => ['required', 'integer', 'min:0'],
            'payment_date' => ['nullable', 'date'],
            'status' => ['required', 'in:paid,unpaid'],
            'notes' => ['nullable', 'string'],
            'receipt_url' => ['nullable', 'string', 'max:2048'],
            'receipt_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'member_id.required' => 'Mahasiswa wajib dipilih.',
            'member_id.exists' => 'Mahasiswa tidak ditemukan.',
            'cash_period_id.required' => 'Periode kas wajib dipilih.',
            'cash_period_id.exists' => 'Periode kas tidak ditemukan.',
            'amount.required' => 'Nominal wajib diisi.',
            'status.required' => 'Status pembayaran wajib dipilih.',
        ];
    }
}
