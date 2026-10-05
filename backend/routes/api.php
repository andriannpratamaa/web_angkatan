<?php

use App\Http\Controllers\Api\Admin\ActivityController as AdminActivityController;
use App\Http\Controllers\Api\Admin\CashController as AdminCashController;
use App\Http\Controllers\Api\Admin\CashPaymentController as AdminCashPaymentController;
use App\Http\Controllers\Api\Admin\CashPeriodController as AdminCashPeriodController;
use App\Http\Controllers\Api\Admin\CashTransactionController as AdminCashTransactionController;
use App\Http\Controllers\Api\Admin\ClassController as AdminClassController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\Admin\MemberController as AdminMemberController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\TimahPanasController as AdminTimahPanasController;
use App\Http\Controllers\Api\Admin\TimahPanasParticipantController as AdminParticipantController;
use App\Http\Controllers\Api\Admin\TimelineController as AdminTimelineController;
use App\Http\Controllers\Api\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CashController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\MemberAuthController;
use App\Http\Controllers\Api\MemberCashController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MemberPaymentController;
use App\Http\Controllers\Api\MemberProfileController;
use App\Http\Controllers\Api\MidtransWebhookController;
use App\Http\Controllers\Api\TimahPanasController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware(['auth:sanctum', 'abilities:admin'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

/*
|--------------------------------------------------------------------------
| Student Portal (mahasiswa login dengan NRP + password)
|--------------------------------------------------------------------------
*/

Route::post('/portal/login', [MemberAuthController::class, 'login']);
Route::middleware(['auth:sanctum', 'abilities:student'])->prefix('portal')->group(function () {
    Route::get('/me', [MemberAuthController::class, 'me']);
    Route::post('/logout', [MemberAuthController::class, 'logout']);
    Route::post('/me/password', [MemberAuthController::class, 'changePassword']);

    Route::get('/profile', [MemberProfileController::class, 'show']);
    Route::post('/profile', [MemberProfileController::class, 'update']);

    Route::get('/cash', [MemberCashController::class, 'index']);

    // Midtrans Payment
    Route::post('/cash/{period}/pay', [MemberPaymentController::class, 'createTransaction']);
    Route::get('/cash/{period}/status', [MemberPaymentController::class, 'checkStatus']);
    Route::post('/cash/{period}/cancel', [MemberPaymentController::class, 'cancelTransaction']);
});

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

Route::get('/classes', [ClassController::class, 'index']);
Route::get('/members', [MemberController::class, 'index']);
Route::get('/members/{slug}', [MemberController::class, 'show']);

Route::get('/cash/summary', [CashController::class, 'summary']);
Route::get('/cash/classes', [CashController::class, 'classes']);
Route::get('/cash/payments', [CashController::class, 'payments']);
Route::get('/cash/transactions', [CashController::class, 'transactions']);

Route::get('/timah-panas', [TimahPanasController::class, 'index']);
Route::get('/timah-panas/{slug}', [TimahPanasController::class, 'show']);

Route::get('/galleries', [ContentController::class, 'galleries']);
Route::get('/activities', [ContentController::class, 'activities']);
Route::get('/timelines', [ContentController::class, 'timelines']);

/*
|--------------------------------------------------------------------------
| Midtrans Webhook
|--------------------------------------------------------------------------
*/

Route::post('/midtrans/notification', [MidtransWebhookController::class, 'handle']);

/*
|--------------------------------------------------------------------------
| Admin API
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'abilities:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Keuangan: super_admin, admin, bendahara
    Route::middleware('role:super_admin,admin,bendahara')->group(function () {
        Route::get('/cash/overview', [AdminCashController::class, 'overview']);

        Route::get('/cash/periods', [AdminCashPeriodController::class, 'index']);
        Route::post('/cash/periods', [AdminCashPeriodController::class, 'store']);
        Route::put('/cash/periods/{period}', [AdminCashPeriodController::class, 'update']);
        Route::delete('/cash/periods/{period}', [AdminCashPeriodController::class, 'destroy']);

        Route::get('/cash/payments', [AdminCashPaymentController::class, 'index']);
        Route::post('/cash/payments/bulk', [AdminCashPaymentController::class, 'bulk']);
        Route::post('/cash/payments', [AdminCashPaymentController::class, 'store']);
        Route::put('/cash/payments/{payment}', [AdminCashPaymentController::class, 'update']);
        Route::delete('/cash/payments/{payment}', [AdminCashPaymentController::class, 'destroy']);

        Route::get('/cash/transactions', [AdminCashTransactionController::class, 'index']);
        Route::post('/cash/transactions', [AdminCashTransactionController::class, 'store']);
        Route::put('/cash/transactions/{transaction}', [AdminCashTransactionController::class, 'update']);
        Route::delete('/cash/transactions/{transaction}', [AdminCashTransactionController::class, 'destroy']);

        Route::get('/settings/cash', [AdminSettingController::class, 'cash']);
        Route::put('/settings/cash', [AdminSettingController::class, 'updateCash']);
    });

    // Master data, konten, timah panas: super_admin, admin
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::get('/classes', [AdminClassController::class, 'index']);
        Route::post('/classes', [AdminClassController::class, 'store']);
        Route::put('/classes/{class}', [AdminClassController::class, 'update']);
        Route::delete('/classes/{class}', [AdminClassController::class, 'destroy']);

        Route::get('/members', [AdminMemberController::class, 'index']);
        Route::post('/members', [AdminMemberController::class, 'store']);
        Route::put('/members/{member}', [AdminMemberController::class, 'update']);
        Route::delete('/members/{member}', [AdminMemberController::class, 'destroy']);

        Route::post('/timah-panas', [AdminTimahPanasController::class, 'store']);
        Route::put('/timah-panas/{requirement}', [AdminTimahPanasController::class, 'update']);
        Route::delete('/timah-panas/{requirement}', [AdminTimahPanasController::class, 'destroy']);

        Route::get('/timah-panas/{requirement}/participants', [AdminParticipantController::class, 'index']);
        Route::post('/timah-panas/{requirement}/participants/bulk', [AdminParticipantController::class, 'bulk']);
        Route::post('/timah-panas/{requirement}/participants', [AdminParticipantController::class, 'store']);
        Route::put('/timah-panas/{requirement}/participants/{participant}', [AdminParticipantController::class, 'update']);
        Route::delete('/timah-panas/{requirement}/participants/{participant}', [AdminParticipantController::class, 'destroy']);

        Route::get('/galleries', [AdminGalleryController::class, 'index']);
        Route::post('/galleries', [AdminGalleryController::class, 'store']);
        Route::put('/galleries/{gallery}', [AdminGalleryController::class, 'update']);
        Route::delete('/galleries/{gallery}', [AdminGalleryController::class, 'destroy']);

        Route::get('/activities', [AdminActivityController::class, 'index']);
        Route::post('/activities', [AdminActivityController::class, 'store']);
        Route::put('/activities/{activity}', [AdminActivityController::class, 'update']);
        Route::delete('/activities/{activity}', [AdminActivityController::class, 'destroy']);

        Route::get('/timelines', [AdminTimelineController::class, 'index']);
        Route::post('/timelines', [AdminTimelineController::class, 'store']);
        Route::put('/timelines/{timeline}', [AdminTimelineController::class, 'update']);
        Route::delete('/timelines/{timeline}', [AdminTimelineController::class, 'destroy']);

        Route::post('/uploads', [AdminUploadController::class, 'store']);
        Route::delete('/uploads', [AdminUploadController::class, 'destroy']);
    });
});

Route::fallback(function () {
    return response()->json(['message' => 'Endpoint tidak ditemukan.'], 404);
});
