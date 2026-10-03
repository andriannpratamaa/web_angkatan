<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\TimahPanasParticipant;
use App\Models\TimahPanasRequirement;
use Illuminate\Database\Seeder;

class TimahPanasSeeder extends Seeder
{
    public function run(): void
    {
        $requirements = [
            [
                'name' => 'Prestasi Nasional',
                'slug' => 'prestasi-nasional',
                'description' => 'Prestasi mahasiswa pada tingkat nasional.',
                'target' => 5,
                'sort_order' => 1,
                'take' => 3,
                'offset' => 0,
                'date' => '2026-10-05',
                'notes' => 'Juara kompetisi tingkat nasional.',
            ],
            [
                'name' => 'LKMM TD',
                'slug' => 'lkmm-td',
                'description' => 'Latihan Keterampilan Manajemen Mahasiswa Tingkat Dasar.',
                'target' => 25,
                'sort_order' => 2,
                'take' => 22,
                'offset' => 0,
                'date' => '2026-08-22',
                'notes' => 'Peserta aktif LKMM TD.',
            ],
            [
                'name' => 'Kandidat Keikutsertaan Lomba',
                'slug' => 'kandidat-keikutsertaan-lomba',
                'description' => 'Mahasiswa yang dipersiapkan mengikuti kompetisi tingkat nasional.',
                'target' => 50,
                'sort_order' => 3,
                'take' => 18,
                'offset' => 5,
                'date' => '2026-09-09',
                'notes' => 'Kandidat lomba otomasi.',
            ],
            [
                'name' => 'Presensi Timah Panas 100%',
                'slug' => 'presensi-timah-panas-100',
                'description' => 'Mahasiswa dengan kehadiran penuh pada seluruh rangkaian Timah Panas.',
                'target' => 3,
                'sort_order' => 4,
                'take' => 3,
                'offset' => 10,
                'date' => '2026-11-28',
                'notes' => 'Presensi penuh 100%.',
            ],
        ];

        foreach ($requirements as $data) {
            $requirement = TimahPanasRequirement::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'target' => $data['target'],
                    'sort_order' => $data['sort_order'],
                    'is_active' => true,
                ],
            );

            $members = $this->interleavedMembers()
                ->skip($data['offset'])
                ->take($data['take'])
                ->values();

            foreach ($members as $member) {
                TimahPanasParticipant::updateOrCreate(
                    [
                        'requirement_id' => $requirement->id,
                        'member_id' => $member->id,
                    ],
                    [
                        'participation_date' => $data['date'],
                        'notes' => $data['notes'],
                    ],
                );
            }
        }
    }

    /**
     * Interleave members by class so seeded participants are spread across
     * TO-1/A ... TO-1/E instead of clustering in the first class.
     */
    private function interleavedMembers()
    {
        $byClass = Member::query()
            ->orderBy('nrp')
            ->get()
            ->groupBy('class_id')
            ->values();

        $interleaved = collect();
        $max = (int) $byClass->max(fn ($group) => $group->count());

        for ($index = 0; $index < $max; $index++) {
            foreach ($byClass as $group) {
                if (isset($group[$index])) {
                    $interleaved->push($group[$index]);
                }
            }
        }

        return $interleaved;
    }
}
