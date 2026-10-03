<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkCashPaymentRequest extends FormRequest
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
            'cash_period_id' => ['required', 'integer', 'exists:cash_periods,id'],
            'amount' => ['nullable', 'integer', 'min:0'],
            'payment_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:paid,unpaid'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'member_ids.required' => 'Pilih minimal satu mahasiswa.',
            'member_ids.min' => 'Pilih minimal satu mahasiswa.',
            'cash_period_id.required' => 'Periode kas wajib dipilih.',
        ];
    }
}
