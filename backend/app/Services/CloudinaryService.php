<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class CloudinaryService
{
    protected ?Cloudinary $cloudinary = null;

    public function configured(): bool
    {
        return (bool) config('cloudinary.cloud_name')
            && (bool) config('cloudinary.api_key')
            && (bool) config('cloudinary.api_secret');
    }

    protected function client(): Cloudinary
    {
        if (! $this->configured()) {
            throw new RuntimeException('Cloudinary belum dikonfigurasi. Lengkapi CLOUDINARY_* pada file .env backend.');
        }

        if (! $this->cloudinary) {
            $this->cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key' => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
                'url' => ['secure' => true],
            ]);
        }

        return $this->cloudinary;
    }

    /**
     * @return array{url:string, public_id:string, resource_type:string, original_filename:string, format:?string, size:int, mime_type:?string}
     */
    public function upload(UploadedFile $file, string $folder, string $resourceType = 'image'): array
    {
        $result = $this->client()->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => $resourceType,
        ]);

        return [
            'url' => $result['secure_url'] ?? $result['url'],
            'public_id' => $result['public_id'],
            'resource_type' => $result['resource_type'] ?? $resourceType,
            'original_filename' => $result['original_filename'] ?? $file->getClientOriginalName(),
            'format' => $result['format'] ?? null,
            'size' => (int) ($result['bytes'] ?? $file->getSize()),
            'mime_type' => $file->getClientMimeType(),
        ];
    }

    public function destroy(?string $publicId, string $resourceType = 'image'): void
    {
        if (! $publicId || ! $this->configured()) {
            return;
        }

        try {
            $this->client()->uploadApi()->destroy($publicId, [
                'resource_type' => $resourceType,
                'invalidate' => true,
            ]);
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
}
