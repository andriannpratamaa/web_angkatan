<?php

namespace Database\Seeders;

use App\Models\StudentClass;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['name' => 'D4 Teknik Otomasi 1A', 'code' => 'TO-1A', 'description' => 'Kelas D4 Teknik Otomasi 1A Angkatan 2026'],
            ['name' => 'D4 Teknik Otomasi 1B', 'code' => 'TO-1B', 'description' => 'Kelas D4 Teknik Otomasi 1B Angkatan 2026'],
            ['name' => 'D4 Teknik Otomasi 1C', 'code' => 'TO-1C', 'description' => 'Kelas D4 Teknik Otomasi 1C Angkatan 2026'],
            ['name' => 'D4 Teknik Otomasi 1D', 'code' => 'TO-1D', 'description' => 'Kelas D4 Teknik Otomasi 1D Angkatan 2026'],
            ['name' => 'D4 Teknik Otomasi 1E', 'code' => 'TO-1E', 'description' => 'Kelas D4 Teknik Otomasi 1E Angkatan 2026'],
        ];

        foreach ($classes as $class) {
            StudentClass::updateOrCreate(['code' => $class['code']], $class);
        }
    }
}
