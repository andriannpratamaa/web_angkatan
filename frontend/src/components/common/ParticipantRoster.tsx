import { EmptyState, SkeletonList } from '../ui/Feedback'
import { Avatar } from '../common/Avatar'
import { formatDate } from '../../lib/format'
import type { TimahPanasParticipant } from '../../lib/types'
import { Users } from 'lucide-react'

interface ParticipantRosterProps {
  participants: TimahPanasParticipant[]
  loading?: boolean
}

export function ParticipantRoster({ participants, loading }: ParticipantRosterProps) {
  if (loading) {
    return <SkeletonList rows={4} />
  }

  if (!participants.length) {
    return (
      <EmptyState
        title="Belum ada mahasiswa yang berpartisipasi pada persyaratan ini."
        description="Peserta akan muncul setelah admin menambahkannya."
        icon={<Users className="h-6 w-6" />}
      />
    )
  }

  return (
    <ol className="space-y-3">
      {participants.map((participant, index) => (
        <li
          key={participant.id}
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <span className="font-mono text-xs text-slate-500">
            {String(index + 1).padStart(2, '0')}
          </span>
          <Avatar name={participant.member?.name ?? 'Mahasiswa'} photo={participant.member?.photo} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-content">{participant.member?.name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="font-mono text-xs text-muted">{participant.member?.nrp}</p>
              {participant.member?.student_class?.label ? (
                <span className="chip-info">{participant.member.student_class.label}</span>
              ) : null}
            </div>
            {participant.notes ? (
              <p className="mt-1 text-xs text-muted">{participant.notes}</p>
            ) : null}
            {participant.proof_url ? (
              <a
                href={participant.proof_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs font-medium text-brand hover:underline"
              >
                Lihat Bukti
              </a>
            ) : null}
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">Tanggal</p>
            <p className="font-mono text-xs text-brand">{formatDate(participant.participation_date)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
