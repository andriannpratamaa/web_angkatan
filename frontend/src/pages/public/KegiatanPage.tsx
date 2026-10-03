import { CalendarDays, MapPin } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { Activity } from '../../lib/types'
import { formatDate } from '../../lib/format'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Reveal } from '../../components/ui/Reveal'
import { MediaThumb } from '../../components/common/MediaThumb'

export default function KegiatanPage() {
  const { data, loading, error } = useApi<{ data: Activity[] }>('/activities')
  const activities = data?.data ?? []

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-line py-16">
        <div className="absolute inset-0 blueprint opacity-60" />
        <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="container-x relative">
          <span className="eyebrow">
            <CalendarDays className="h-3.5 w-3.5" />
            Agenda Angkatan
          </span>
          <h1 className="heading-xl mt-4">
            Kegiatan <span className="text-brand">TO26</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Pelatihan, kunjungan industri, hingga festival angkatan Teknik Otomasi 2026.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x">
          {error ? <ErrorState message={error} /> : null}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="py-20 text-center text-muted">Belum ada kegiatan.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity, index) => (
                <Reveal key={activity.id} delay={Math.min(index, 8) * 0.04}>
                  <article className="card card-hover flex h-full flex-col overflow-hidden">
                    <MediaThumb
                      title={activity.title}
                      image={activity.image_url}
                      category="Kegiatan"
                      rounded="rounded-none"
                      className="h-44 w-full"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-faint">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-brand" />
                          {activity.event_date ? formatDate(activity.event_date) : 'TBA'}
                        </span>
                        {activity.location ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-brand" />
                            {activity.location}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold text-content">{activity.title}</h3>
                      {activity.description ? (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{activity.description}</p>
                      ) : null}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
