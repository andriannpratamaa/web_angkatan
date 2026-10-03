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
    return members.filter((member) => {
      const matchesClass = classId === 'all' || member.class_id === classId
      const matchesSearch =
        !query || member.name.toLowerCase().includes(query) || member.nrp.toLowerCase().includes(query)
      return matchesClass && matchesSearch
    })
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
              {filtered.map((member, index) => (
                <Reveal key={member.id} delay={Math.min(index, 8) * 0.04}>
                  <MemberCard member={member} to={`/angkatan/${member.slug}`} />
                </Reveal>
              ))}
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
