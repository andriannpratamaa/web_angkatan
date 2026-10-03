<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),

    'folders' => [
        'members' => 'to26/members',
        'gallery' => 'to26/gallery',
        'activities' => 'to26/activities',
        'receipts' => 'to26/cash/receipts',
        'proofs' => 'to26/timah-panas/proofs',
        'documents' => 'to26/documents',
    ],
];
