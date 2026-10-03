<?php

namespace App\Http\Requests;

use App\Models\Member;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends StoreMemberRequest
{
    public function rules(): array
    {
        $member = $this->route('member');
        $ignoreId = $member instanceof Member ? $member->id : $member;

        return array_merge(parent::rules(), [
            'nrp' => ['required', 'string', 'max:30', Rule::unique('members', 'nrp')->ignore($ignoreId)],
        ]);
    }
}
