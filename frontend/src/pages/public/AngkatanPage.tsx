import { useMemo, useState } from 'react'
import { GraduationCap, Users } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { MembersResponse } from '../../lib/types'
import { cn } from '../../lib/format'
import { MemberCard } from '../../components/common/MemberCard'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Reveal } from '../../components/ui/Reveal'
import { SearchInput } from '../../components/ui/Controls'

export default function AngkatanPage() {
  const { data, loading, error } = useApi<MembersResponse>('/members')
  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState<number | 'all'>('all')

  const members = data?.data ?? []
  const classes = data?.meta.classes ?? []

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    let list = members.filter((member) => {
      const matchesClass = classId === 'all' || member.class_id === classId
      const matchesSearch =
        !query || member.name.toLowerCase().includes(query) || member.nrp.toLowerCase().includes(query)
      return matchesClass && matchesSearch
    })
    const devIndex = list.findIndex(
      (member) => member.nrp === '0926040059' || member.name === 'Oktavian Andrian Pratama',
    )
    if (devIndex > 0) {
      const [dev] = list.splice(devIndex, 1)
      list.unshift(dev)
    } else if (devIndex === 0) {
      // already first
    } else {
      // maybe not in filtered list (search context) - try to ensure if search not filtering dev
      const devInAll = members.find(
        (member) => member.nrp === '0926040059' || member.name === 'Oktavian Andrian Pratama',
      )
      if (devInAll && list.every((m) => m.id !== devInAll.id)) {
        list.unshift(devInAll)
      }
    }
    return list
  }, [members, classId, search])

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-line py-16">
        <div className="absolute inset-0 blueprint opacity-60" />
        <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="container-x relative">
          <span className="eyebrow">
            <Users className="h-3.5 w-3.5" />
            {data?.meta.total ?? 0} Mahasiswa - {classes.length} Kelas
          </span>
          <h1 className="heading-xl mt-4">
            Angkatan <span className="text-brand">Teknik Otomasi 2026</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Master data mahasiswa TO26. Cari berdasarkan nama atau NRP dan filter berdasarkan kelas.
          </p>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau NRP..." className="lg:max-w-sm" />
            <div className="flex flex-wrap gap-2">
              <ClassChip active={classId === 'all'} onClick={() => setClassId('all')}>
                Semua
              </ClassChip>
              {classes.map((item) => (
                <ClassChip key={item.id} active={classId === item.id} onClick={() => setClassId(item.id)}>
                  {item.label}
                </ClassChip>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x">
          {error ? <ErrorState message={error} /> : null}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-20 text-center text-muted">Tidak ada mahasiswa yang cocok dengan pencarian.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((member, index) => {
                const isDev = member.nrp === '0926040059' || member.name === 'Oktavian Andrian Pratama'
                if (isDev) {
                  return (
                    <Reveal key={member.id} delay={Math.min(index, 8) * 0.04}>
                      <div className="relative transform-gpu transition-transform hover:scale-[1.02]">
                        <div className="absolute -inset-[2px] z-0 rounded-2xl bg-gradient-to-br from-yellow-400 via-brand to-pink-500 opacity-90 blur-md animate-pulse" />
                        <div className="absolute left-4 top-4 z-20 rounded-full bg-gradient-to-r from-yellow-400 to-brand px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-2xl ring-2 ring-white/30">
                          • DEVELOPMENT •
                        </div>
                        <div className="relative z-10">
                          <MemberCard member={member} to={`/angkatan/${member.slug}`} />
                        </div>
                      </div>
                    </Reveal>
                  )
                }
                return (
                  <Reveal key={member.id} delay={Math.min(index, 8) * 0.04}>
                    <MemberCard member={member} to={`/angkatan/${member.slug}`} />
                  </Reveal>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ClassChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
        active
          ? 'border-brand bg-brand text-white'
          : 'border-line bg-card text-muted hover:border-brand/50 hover:text-brand',
      )}
    >
      <GraduationCap className="h-3 w-3" />
      {children}
    </button>
  )
}
