import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { MembersResponse } from '../../lib/types'
import { Avatar } from '../common/Avatar'
import { ErrorState, Skeleton } from '../ui/Feedback'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from './SectionHeading'

export function PeopleSection() {
  const { data, loading, error } = useApi<MembersResponse>('/members')
  const members = (data?.data ?? []).slice(0, 8)

  return (
    <section className="section-pad relative border-t border-white/5">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Meet Our People"
            title="Kenalan dengan anggota TO26"
            description="Orang-orang di balik setiap proyek, kegiatan, dan kebersamaan angkatan."
          />
          <Reveal delay={0.1}>
            <Link to="/angkatan" className="btn-ghost">
              Lihat Semua Anggota
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        {error ? <div className="mt-10"><ErrorState message={error} /></div> : null}

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-2xl" />
              ))
            : members.map((member, index) => (
                <Reveal key={member.id} delay={index * 0.04}>
                  <Link
                    to="/angkatan"
                    className="card card-hover flex h-full flex-col items-center p-6 text-center"
                  >
                    <Avatar name={member.name} photo={member.photo} size="xl" />
                    <p className="mt-4 font-display text-base font-semibold text-snow">
                      {member.name}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-aqua">
                      {member.role}
                    </p>
                    <p className="mt-2 font-mono text-xs text-slate-500">{member.nrp}</p>
                  </Link>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  )
}
