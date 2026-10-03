import { Activity, Target, Users, Wallet } from 'lucide-react'
import { StatCard } from '../common/StatCard'
import { SectionHeading } from './SectionHeading'
import { formatRupiah } from '../../lib/format'

interface StatsSectionProps {
  memberCount: number
  balance: number
  requirementCount: number
  fulfilledRequirements: number
  totalParticipation: number
}

export function StatsSection({
  memberCount,
  balance,
  requirementCount,
  fulfilledRequirements,
  totalParticipation,
}: StatsSectionProps) {
  return (
    <section className="section-pad relative border-t border-white/5">
      <div className="container-x">
        <SectionHeading
          eyebrow="Statistik Angkatan"
          title="Data angkatan secara ringkas"
          description="Angka di bawah ini dihitung otomatis dari data yang tersimpan pada sistem."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Mahasiswa"
            value={`${memberCount}`}
            hint="Terdaftar di angkatan"
            icon={<Users className="h-4 w-4" />}
            tone="brand"
          />
          <StatCard
            label="Saldo Kas"
            value={formatRupiah(balance)}
            hint="Pemasukan - pengeluaran"
            icon={<Wallet className="h-4 w-4" />}
            tone="aqua"
          />
          <StatCard
            label="Persyaratan Timah Panas"
            value={`${fulfilledRequirements}/${requirementCount}`}
            hint="Terpenuhi dari total"
            icon={<Target className="h-4 w-4" />}
            tone="emerald"
          />
          <StatCard
            label="Total Partisipasi"
            value={`${totalParticipation}`}
            hint="Pendaftaran peserta"
            icon={<Activity className="h-4 w-4" />}
            tone="flame"
          />
        </div>
      </div>
    </section>
  )
}
