<?php

namespace App\Http\Requests;

use App\Models\CashPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCashPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $period = $this->route('period');
        $ignoreId = $period instanceof CashPeriod ? $period->id : $period;

        return [
            'name' => ['required', 'string', 'max:255'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2000,2100'],
            'amount' => ['required', 'integer', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $period = $this->route('period');
            $ignoreId = $period instanceof CashPeriod ? $period->id : $period;

            $exists = CashPeriod::query()
                ->where('month', $this->integer('month'))
                ->where('year', $this->integer('year'))
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists();

            if ($exists) {
                $validator->errors()->add('month', 'Periode kas untuk bulan dan tahun tersebut sudah ada.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama periode wajib diisi.',
            'month.required' => 'Bulan wajib dipilih.',
            'year.required' => 'Tahun wajib diisi.',
            'amount.required' => 'Nominal kas wajib diisi.',
        ];
    }
}
