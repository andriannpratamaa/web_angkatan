import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { Activity, TimelineItem } from '../../lib/types'
import { formatDate } from '../../lib/format'
import { ErrorState, Skeleton } from '../ui/Feedback'
import { Reveal } from '../ui/Reveal'
import { MediaThumb } from '../common/MediaThumb'
import { SectionHeading } from './SectionHeading'

export function TimelineSection() {
  const { data, loading, error } = useApi<{ data: TimelineItem[] }>('/timelines')
  const items = data?.data ?? []

  return (
    <section className="section-pad relative border-t border-white/5">
      <div className="container-x">
        <SectionHeading
          eyebrow="Timeline Angkatan"
          title="Perjalanan TO26 dari waktu ke waktu"
          align="center"
        />

        {error ? <div className="mx-auto mt-10 max-w-xl"><ErrorState message={error} /></div> : null}

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-azure/60 via-white/10 to-transparent sm:left-1/2" />
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.05}>
                  <div className="relative pl-12 sm:grid sm:grid-cols-2 sm:gap-10 sm:pl-0">
                    <span className="absolute left-[9px] top-2 h-3.5 w-3.5 rounded-full border-2 border-azure bg-ink sm:left-1/2 sm:-translate-x-1/2" />
                    <div className={index % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:col-start-2 sm:pl-10'}>
                      <span className="chip-info">
                        <Clock3 className="h-3.5 w-3.5" />
                        {item.period}
                      </span>
                      <h3 className="mt-3 font-display text-lg font-semibold text-snow">
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function ActivitiesSection() {
  const { data, loading, error } = useApi<{ data: Activity[] }>('/activities')
  const activities = (data?.data ?? []).slice(0, 6)

  return (
    <section id="kegiatan" className="section-pad relative border-t border-white/5">
      <div className="container-x">
        <SectionHeading
          eyebrow="Kegiatan"
          title="Agenda dan kegiatan angkatan"
          description="Pelatihan, kunjungan industri, hingga festival angkatan — semua terdokumentasi di sini."
        />

        {error ? <div className="mt-10"><ErrorState message={error} /></div> : null}

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-72 w-full rounded-2xl" />
              ))
            : activities.map((activity, index) => (
                <Reveal key={activity.id} delay={index * 0.05}>
                  <article className="card card-hover flex h-full flex-col overflow-hidden">
                    <MediaThumb
                      title={activity.title}
                      image={activity.image_url}
                      category="Kegiatan"
                      rounded="rounded-none"
                      className="h-40 w-full"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-aqua" />
                          {activity.event_date ? formatDate(activity.event_date) : 'TBA'}
                        </span>
                        {activity.location ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-aqua" />
                            {activity.location}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold text-snow">
                        {activity.title}
                      </h3>
                      {activity.description ? (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                          {activity.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  )
}
