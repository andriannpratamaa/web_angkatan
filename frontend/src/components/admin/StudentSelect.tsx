import { useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import type { Member, StudentClass } from '../../lib/types'
import { cn } from '../../lib/format'

interface StudentSelectProps {
  members: Member[]
  classes?: StudentClass[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  disabledIds?: number[]
  classId?: number | null
  onClassChange?: (classId: number | null) => void
  multi?: boolean
}

export function StudentSelect({
  members,
  classes = [],
  selectedIds,
  onChange,
  disabledIds = [],
  classId = null,
  onClassChange,
  multi = true,
}: StudentSelectProps) {
  const [query, setQuery] = useState('')
  const [localClass, setLocalClass] = useState<number | null>(classId)

  const activeClass = onClassChange ? classId : localClass

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return members.filter((member) => {
      const matchesClass = !activeClass || member.class_id === activeClass
      const matchesText =
        !text ||
        member.name.toLowerCase().includes(text) ||
        member.nrp.toLowerCase().includes(text)
      return matchesClass && matchesText
    })
  }, [members, query, activeClass])

  const handleClass = (value: number | null) => {
    setLocalClass(value)
    onClassChange?.(value)
  }

  const toggle = (member: Member) => {
    if (disabledIds.includes(member.id)) return
    if (!multi) {
      onChange([member.id])
      return
    }
    onChange(
      selectedIds.includes(member.id)
        ? selectedIds.filter((id) => id !== member.id)
        : [...selectedIds, member.id],
    )
  }

  const selectedMembers = members.filter((member) => selectedIds.includes(member.id))

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama atau NRP..."
            className="field pl-9"
          />
        </div>
        {classes.length ? (
          <select
            value={activeClass ?? ''}
            onChange={(event) => handleClass(event.target.value ? Number(event.target.value) : null)}
            className="field"
          >
            <option value="">Semua Kelas</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {selectedMembers.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <span
              key={member.id}
              className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs text-brand"
            >
              {member.name}
              <button
                type="button"
                onClick={() => toggle(member)}
                aria-label="Hapus"
                className="rounded-full hover:bg-brand/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="max-h-72 overflow-y-auto rounded-xl border border-line">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">Mahasiswa tidak ditemukan.</p>
        ) : (
          filtered.map((member) => {
            const checked = selectedIds.includes(member.id)
            const disabled = disabledIds.includes(member.id)
            return (
              <button
                key={member.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(member)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-line px-4 py-2.5 text-left transition last:border-b-0',
                  disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-elevated',
                  checked && 'bg-brand/5',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                    checked ? 'border-brand bg-brand text-white' : 'border-line',
                  )}
                >
                  {checked ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-content">
                    {member.name}
                  </span>
                  <span className="font-mono text-xs text-faint">{member.nrp}</span>
                </span>
                <span className="chip-muted">{member.student_class?.label ?? '-'}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
