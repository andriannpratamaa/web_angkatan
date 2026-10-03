import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Flame, Target, Users } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { TimahPanasDetailResponse } from '../../lib/types'
import { clampPercent } from '../../lib/format'
import { ErrorState, ProgressBar, Skeleton } from '../../components/ui/Feedback'
import { StatusBadge } from '../../components/common/StatusBadge'
import { ParticipantRoster } from '../../components/common/ParticipantRoster'

export default function TimahPanasDetailPage() {
  const { slug = '' } = useParams()
  const { data, loading, error } = useApi<TimahPanasDetailResponse>(`/timah-panas/${slug}`)
  const requirement = data?.data

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-white/5 py-14">
        <div className="absolute inset-0 blueprint opacity-50" />
        <div className="container-x relative">
          <Link
            to="/timahpanas"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-400 transition hover:text-aqua"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Timah Panas
          </Link>

          {loading ? (
            <Skeleton className="mt-6 h-12 w-72" />
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-flame/15 text-flame">
                <Flame className="h-6 w-6" />
              </span>
              <h1 className="heading-lg">{requirement?.name}</h1>
              {requirement ? <StatusBadge status={requirement.status} /> : null}
            </div>
          )}

          {requirement?.description ? (
            <p className="mt-4 max-w-2xl text-sm text-slate-400">{requirement.description}</p>
          ) : null}
        </div>
      </section>

      <section className="py-12">
        <div className="container-x">
          {error ? <ErrorState message={error} /> : null}

          {loading ? (
            <Skeleton className="h-28 w-full rounded-2xl" />
          ) : requirement ? (
            <div className="card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-ink/50 p-4">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    <Target className="h-3.5 w-3.5" /> Target
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-snow">
                    {requirement.target}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-ink/50 p-4">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    <Users className="h-3.5 w-3.5" /> Terpenuhi
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-aqua">
                    {requirement.fulfilled}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-slate-400">
                  <span>Progress</span>
                  <span>{Math.round(clampPercent(requirement.percentage))}%</span>
                </div>
                <ProgressBar
                  value={requirement.percentage}
                  tone={requirement.fulfilled >= requirement.target ? 'emerald' : 'brand'}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            <h2 className="heading-md">Daftar Peserta</h2>
            <p className="mt-2 text-sm text-slate-400">
              Mahasiswa yang berpartisipasi pada persyaratan ini.
            </p>
            <div className="mt-6">
              <ParticipantRoster
                participants={data?.participants ?? []}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
