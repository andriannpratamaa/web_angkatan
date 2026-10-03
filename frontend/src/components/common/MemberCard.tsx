import { Link } from 'react-router-dom'
import type { Member } from '../../lib/types'
import { Avatar } from './Avatar'
import { GithubIcon, InstagramIcon, LinkedinIcon } from './SocialIcons'

interface MemberCardProps {
  member: Member
  to?: string
}

export function MemberCard({ member, to }: MemberCardProps) {
  const socials = [
    { icon: InstagramIcon, value: member.instagram },
    { icon: LinkedinIcon, value: member.linkedin },
    { icon: GithubIcon, value: member.github },
  ].filter((item) => item.value)

  const body = (
    <>
      <div className="relative">
        <Avatar name={member.name} photo={member.photo} size="xl" />
        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
      </div>
      <p className="mt-4 font-display text-base font-semibold text-content">{member.name}</p>
      <p className="mt-2 font-mono text-xs text-faint">{member.nrp}</p>
      <span className="chip-info mt-3">{member.student_class?.label ?? '-'}</span>

      {member.quote ? (
        <p className="mt-4 line-clamp-2 text-xs italic leading-relaxed text-muted">
          "{member.quote}"
        </p>
      ) : null}

      {socials.length ? (
        <div className="mt-5 flex gap-2">
          {socials.map((item, index) => (
            <a
              key={index}
              href={item.value as string}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-elevated text-muted transition hover:border-brand/50 hover:text-brand"
            >
              <item.icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className="card card-hover flex h-full cursor-pointer flex-col items-center p-6 text-center">
        {body}
      </Link>
    )
  }

  return <div className="card flex h-full flex-col items-center p-6 text-center">{body}</div>
}
