<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\StudentClass;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $data = require database_path('data/members_to26.php');

        foreach ($data as $code => $members) {
            $class = StudentClass::query()->where('code', $code)->first();

            foreach ($members as $nrp => $name) {
                Member::updateOrCreate(
                    ['nrp' => (string) $nrp],
                    [
                        'class_id' => $class?->id,
                        'name' => $name,
                        'slug' => Member::makeSlug($name),
                        'email' => $nrp.'@to26.local',
                        'password' => 'admin123',
                        'must_change_password' => true,
                        'gender' => null,
                        'role' => 'Anggota',
                        'bio' => 'Mahasiswa Teknik Otomasi Angkatan 2026.',
                        'quote' => 'Automate The Future. Together.',
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
