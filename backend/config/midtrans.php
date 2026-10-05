<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi Midtrans Payment Gateway.
    | Gunakan Sandbox untuk development, Production untuk live.
    |
    */

    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),

    'sandbox' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'snap_url' => 'https://app.sandbox.midtrans.com/snap/snap.js',
        'api_url' => 'https://api.sandbox.midtrans.com/v2',
    ],

    'production' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'snap_url' => 'https://app.midtrans.com/snap/snap.js',
        'api_url' => 'https://api.midtrans.com/v2',
    ],

    'snap' => [
        'enabled_payments' => ['qris', 'gopay', 'shopeepay', 'bank_transfer', 'echannel', 'credit_card'],
        'credit_card' => [
            'secure' => true,
        ],
    ],
];