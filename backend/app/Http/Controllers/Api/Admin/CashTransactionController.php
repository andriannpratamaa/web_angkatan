<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCashTransactionRequest;
use App\Models\CashTransaction;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CashTransaction::query();

        if ($search = $request->query('search')) {
            $query->where('description', 'like', "%{$search}%");
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($month = $request->query('month')) {
            $query->whereMonth('transaction_date', (int) $month);
        }

        if ($year = $request->query('year')) {
            $query->whereYear('transaction_date', (int) $year);
        }

        $perPage = min(max((int) $request->query('per_page', 10), 1), 100);

        return response()->json(
            $query->orderByDesc('transaction_date')->orderByDesc('id')->paginate($perPage)
        );
    }

    public function store(StoreCashTransactionRequest $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validated();

        if ($file = $request->file('receipt_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.receipts'), 'auto');
            $data['receipt_url'] = $upload['url'];
            $data['receipt_public_id'] = $upload['public_id'];
        }

        unset($data['receipt_file']);
        $data['created_by'] = $data['created_by'] ?? $request->user()?->name ?? 'Admin TO26';

        $transaction = CashTransaction::create($data);

        return response()->json([
            'message' => 'Transaksi berhasil disimpan.',
            'data' => $transaction,
        ], 201);
    }

    public function update(
        StoreCashTransactionRequest $request,
        CashTransaction $transaction,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $data = $request->validated();

        if ($file = $request->file('receipt_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.receipts'), 'auto');
            $cloudinary->destroy($transaction->receipt_public_id, 'image');
            $data['receipt_url'] = $upload['url'];
            $data['receipt_public_id'] = $upload['public_id'];
        }

        unset($data['receipt_file']);

        $transaction->update($data);

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $transaction->fresh(),
        ]);
    }

    public function destroy(CashTransaction $transaction, CloudinaryService $cloudinary): JsonResponse
    {
        $cloudinary->destroy($transaction->receipt_public_id, 'image');
        $transaction->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
