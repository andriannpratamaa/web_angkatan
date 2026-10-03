<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Gallery;
use App\Models\Timeline;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $timelines = [
            ['Agustus 2026', 'PKKMB & Pengenalan Kampus', 'Awal perkenalan seluruh mahasiswa baru Teknik Otomasi 2026.', 1],
            ['September 2026', 'Makrab Angkatan', 'Malam keakraban untuk membangun kekompakan TO26.', 2],
            ['Oktober 2026', 'Pelatihan Dasar Otomasi', 'Pelatihan PLC, sensor, dan dasar sistem kontrol industri.', 3],
            ['November 2026', 'Kunjungan Industri', 'Observasi langsung penerapan otomasi di industri mitra.', 4],
            ['Desember 2026', 'TO26 Festival', 'Pameran karya dan kompetisi internal antar kelompok.', 5],
            ['Januari 2027', 'Persiapan Timah Panas', 'Pembinaan intensif menuju seluruh persyaratan Timah Panas.', 6],
        ];

        foreach ($timelines as [$period, $title, $description, $sortOrder]) {
            Timeline::updateOrCreate(
                ['title' => $title],
                [
                    'period' => $period,
                    'description' => $description,
                    'sort_order' => $sortOrder,
                ]
            );
        }

        $activities = [
            ['Pelatihan PLC & HMI', 'pelatihan-plc-hmi', 'Pelatihan pemrograman PLC dan perancangan HMI untuk kebutuhan industri.', 'Laboratorium Otomasi', '2026-10-08'],
            ['Workshop Internet of Things', 'workshop-internet-of-things', 'Membangun sistem monitoring berbasis IoT dengan sensor dan mikrokontroler.', 'Aula Teknik Elektro', '2026-10-22'],
            ['Kunjungan Industri', 'kunjungan-industri', 'Melihat langsung lini produksi otomatis dan sistem kontrol di industri mitra.', 'PT Nusantara Otomasi', '2026-11-12'],
            ['Lomba Internal Robotik', 'lomba-internal-robotik', 'Kompetisi robotik antar kelompok sebagai persiapan lomba nasional.', 'Gedung Olahraga', '2026-11-26'],
            ['TO26 Festival', 'to26-festival', 'Pameran karya, showcase proyek, dan malam keakraban angkatan.', 'Lapangan Utama', '2026-12-19'],
            ['Bakti Sosial Angkatan', 'bakti-sosial-angkatan', 'Kegiatan sosial bersama masyarakat sekitar kampus.', 'Desa Binaan', '2027-01-16'],
        ];

        foreach ($activities as [$title, $slug, $description, $location, $date]) {
            Activity::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'description' => $description,
                    'location' => $location,
                    'event_date' => $date,
                ]
            );
        }

        $galleries = [
            ['Pembukaan PKKMB', 'Kegiatan', 1],
            ['Foto Bersama Angkatan', 'Kebersamaan', 2],
            ['Latihan PLC Pertama', 'Akademik', 3],
            ['Makrab TO26', 'Kebersamaan', 4],
            ['Workshop IoT', 'Akademik', 5],
            ['Lomba Internal Robotik', 'Lomba', 6],
            ['Kunjungan Industri', 'Kegiatan', 7],
            ['Malam Keakraban', 'Kebersamaan', 8],
            ['TO26 Festival', 'Kegiatan', 9],
        ];

        foreach ($galleries as [$title, $category, $sortOrder]) {
            Gallery::updateOrCreate(
                ['title' => $title],
                [
                    'category' => $category,
                    'description' => 'Dokumentasi '.$title.' Teknik Otomasi 2026.',
                    'sort_order' => $sortOrder,
                ]
            );
        }
    }
}
