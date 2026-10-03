<?php

namespace App\Services;

use App\Models\Member;
use Illuminate\Http\UploadedFile;

class MemberService
{
    public function __construct(private readonly CloudinaryService $cloudinary)
    {
    }

    public function create(array $data, ?UploadedFile $photo = null): Member
    {
        $data['slug'] = Member::makeSlug($data['name']);

        if ($photo) {
            $upload = $this->cloudinary->upload($photo, config('cloudinary.folders.members'), 'image');
            $data['photo'] = $upload['url'];
            $data['cloudinary_public_id'] = $upload['public_id'];
        }

        return Member::create($data);
    }

    public function update(Member $member, array $data, ?UploadedFile $photo = null): Member
    {
        if (isset($data['name']) && $data['name'] !== $member->name) {
            $data['slug'] = Member::makeSlug($data['name'], $member->id);
        }

        // Upload the new file first; only delete the old one when the upload succeeds.
        if ($photo) {
            $upload = $this->cloudinary->upload($photo, config('cloudinary.folders.members'), 'image');
            $this->cloudinary->destroy($member->cloudinary_public_id, 'image');
            $data['photo'] = $upload['url'];
            $data['cloudinary_public_id'] = $upload['public_id'];
        }

        $member->update($data);

        return $member->fresh();
    }

    public function delete(Member $member): void
    {
        $this->cloudinary->destroy($member->cloudinary_public_id, 'image');
        $member->delete();
    }
}
