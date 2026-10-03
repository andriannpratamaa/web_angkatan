import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Flame, Target, Users } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { TimahPanasDetailResponse, TimahPanasRequirement, TimahPanasResponse } from '../../lib/types'
import { clampPercent } from '../../lib/format'
import { ErrorState, Skeleton, SkeletonCards } from '../../components/ui/Feedback'
import { ProgressBar } from '../../components/ui/Feedback'
import { StatusBadge } from '../../components/common/StatusBadge'
import { ParticipantRoster } from '../../components/common/ParticipantRoster'
import { Reveal } from '../../components/ui/Reveal'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/common/StatCard'

export default function TimahPanasPage() {
  const { data, loading, error } = useApi<TimahPanasResponse>('/timah-panas')
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const requirements = data?.data ?? []
  const summary = data?.summary

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-white/5 py-16">
        <div className="absolute inset-0 blueprint opacity-50" />
        <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-flame/15 blur-[120px]" />
        <div className="container-x relative">
          <span className="eyebrow text-flame/90">
            <Flame className="h-3.5 w-3.5" />
            Monitoring Persyaratan
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-[0.08em] text-snow sm:text-5xl lg:text-6xl">
            Timah Panas
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-widest text-slate-400">
            Teknik Otomasi 2026
          </p>
          <p className="mt-4 max-w-3xl text-base text-slate-400">
            Halaman ini digunakan untuk memantau perkembangan dan ketercapaian persyaratan Timah
            Panas Angkatan Teknik Otomasi 2026.
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 py-12">
        <div className="container-x">
          <h2 className="heading-md">Ringkasan Timah Panas</h2>
          <p className="mt-2 text-sm text-slate-400">
            Seluruh nilai dihitung otomatis dari data persyaratan dan peserta.
          </p>

          {error ? <div className="mt-6"><ErrorState message={error} /></div> : null}

          <div className="mt-8">
            {loading || !summary ? (
              <SkeletonCards count={4} />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total Persyaratan"
                    value={`${summary.total_requirements}`}
                    icon={<Target className="h-4 w-4" />}
                    tone="brand"
                  />
                  <StatCard
                    label="Persyaratan Terpenuhi"
                    value={`${summary.fulfilled_requirements}`}
                    icon={<Flame className="h-4 w-4" />}
                    tone="emerald"
                  />
                  <StatCard
                    label="Total Partisipasi"
                    value={`${summary.total_participation}`}
                    icon={<Users className="h-4 w-4" />}
                    tone="aqua"
                  />
                  <StatCard
                    label="Progress Keseluruhan"
                    value={`${Math.round(clampPercent(summary.overall_progress))}%`}
                    icon={<Activity className="h-4 w-4" />}
                    tone="flame"
                  />
                </div>
                <div className="mt-5 card p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                      Overall Progress
                    </span>
                    <span className="font-display text-sm font-semibold text-snow">
                      {summary.total_participation} / {summary.total_target}
                    </span>
                  </div>
                  <ProgressBar value={summary.overall_progress} className="mt-3" />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-line py-12">
        <div className="container-x">
          <h2 className="heading-md">Kontribusi per Kelas</h2>
          <p className="mt-2 text-sm text-muted">Jumlah partisipasi Timah Panas dari setiap kelas.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(data?.class_contribution ?? []).map((item) => (
              <div key={item.id} className="card p-5 text-center">
                <p className="font-display text-lg font-bold text-content">{item.label}</p>
                <p className="mt-2 font-display text-3xl font-bold text-brand">{item.total}</p>
                <p className="text-xs text-muted">partisipasi</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-x">
          <h2 className="heading-md">Persyaratan Timah Panas</h2>
          <p className="mt-2 text-sm text-slate-400">
            Klik "Lihat Peserta" untuk melihat mahasiswa yang telah memenuhi persyaratan.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-64 w-full rounded-2xl" />
                ))
              : requirements.map((requirement, index) => (
                  <Reveal key={requirement.id} delay={index * 0.05}>
                    <RequirementCard
                      requirement={requirement}
                      onView={() => setActiveSlug(requirement.slug)}
                    />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      <ParticipantsModal slug={activeSlug} onClose={() => setActiveSlug(null)} />
    </div>
  )
}

function RequirementCard({
  requirement,
  onView,
}: {
  requirement: TimahPanasRequirement
  onView: () => void
}) {
  return (
    <div className="card card-hover flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide text-snow">
          {requirement.name}
        </h3>
        <StatusBadge status={requirement.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-ink/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Target</p>
          <p className="mt-1 font-display text-2xl font-bold text-snow">{requirement.target}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Terpenuhi</p>
          <p className="mt-1 font-display text-2xl font-bold text-aqua">{requirement.fulfilled}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-slate-400">
          <span>Progress</span>
          <span>{Math.round(requirement.percentage)}%</span>
        </div>
        <ProgressBar
          value={requirement.percentage}
          tone={requirement.fulfilled >= requirement.target ? 'emerald' : 'brand'}
        />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button type="button" onClick={onView} className="btn-primary btn-sm flex-1">
          Lihat Peserta
        </button>
        <Link to={`/timahpanas/${requirement.slug}`} className="btn-ghost btn-sm">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function ParticipantsModal({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const { data, loading } = useApi<TimahPanasDetailResponse>(slug ? `/timah-panas/${slug}` : null)
  const requirement = data?.data

  return (
    <Modal
      open={Boolean(slug)}
      onClose={onClose}
      title={requirement?.name ?? 'Peserta'}
      description={
        requirement
          ? `Target: ${requirement.target} - Terpenuhi: ${requirement.fulfilled}`
          : undefined
      }
      size="lg"
    >
      <ParticipantRoster participants={data?.participants ?? []} loading={loading} />
    </Modal>
  )
}
