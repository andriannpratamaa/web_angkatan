import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Target, Wallet } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { Member } from '../../lib/types'
import { formatDate, formatRupiah } from '../../lib/format'
import { Avatar } from '../../components/common/Avatar'
import { GithubIcon, InstagramIcon, LinkedinIcon } from '../../components/common/SocialIcons'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { StatusBadge } from '../../components/common/StatusBadge'

export default function AngkatanDetailPage() {
  const { slug = '' } = useParams()
  const { data, loading, error } = useApi<{ data: Member }>(`/members/${slug}`)
  const member = data?.data

  const socials = member
    ? [
        { icon: InstagramIcon, value: member.instagram, label: 'Instagram' },
        { icon: LinkedinIcon, value: member.linkedin, label: 'LinkedIn' },
        { icon: GithubIcon, value: member.github, label: 'GitHub' },
      ].filter((item) => item.value)
    : []

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-line py-14">
        <div className="absolute inset-0 blueprint opacity-60" />
        <div className="container-x relative">
          <Link
            to="/angkatan"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Angkatan
          </Link>

          {error ? (
            <div className="mt-6">
              <ErrorState message={error} />
            </div>
          ) : null}

          {loading ? (
            <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
          ) : member ? (
            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-end">
              <Avatar name={member.name} photo={member.photo} size="xl" className="h-28 w-28" />
              <div className="text-center sm:text-left">
                <span className="chip-info">{member.student_class?.label ?? '-'}</span>
                <h1 className="heading-lg mt-3">{member.name}</h1>
                <p className="mt-1 font-mono text-sm text-muted">{member.nrp}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-brand">{member.role}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-12">
        <div className="container-x grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {member?.bio ? (
              <div className="card p-6">
                <h2 className="font-display text-lg font-semibold text-content">Tentang</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{member.bio}</p>
                {member.quote ? (
                  <p className="mt-4 border-l-2 border-brand pl-4 text-sm italic text-content">
                    "{member.quote}"
                  </p>
                ) : null}
                {socials.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {socials.map((item, index) => (
                      <a key={index} href={item.value as string} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-content">
                <Target className="h-5 w-5 text-brand" />
                Partisipasi Timah Panas
              </h2>
              {member?.timah_panas_participants?.length ? (
                <div className="mt-4 space-y-2">
                  {member.timah_panas_participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-elevated px-4 py-3"
                    >
                      <span className="text-sm text-content">{participant.requirement?.name}</span>
                      <span className="font-mono text-xs text-brand">{formatDate(participant.participation_date)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">Belum terdaftar pada persyaratan Timah Panas.</p>
              )}
            </div>
          </div>

          <div className="card h-fit p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-content">
              <Wallet className="h-5 w-5 text-brand" />
              Status Kas
            </h2>
            {member?.cash_payments?.length ? (
              <div className="mt-4 space-y-2">
                {member.cash_payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                    <div>
                      <p className="text-sm text-content">{payment.period?.name}</p>
                      <p className="font-mono text-xs text-faint">{formatRupiah(payment.amount)}</p>
                    </div>
                    <StatusBadge status={payment.status === 'paid' ? 'Lunas' : 'Belum Bayar'} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">Belum ada pembayaran kas tercatat.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
