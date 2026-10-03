import type { ReactNode } from 'react'
import { cn } from '../../lib/format'
import { Reveal } from '../ui/Reveal'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <span className="eyebrow">
        <span className="h-1.5 w-1.5 rounded-full bg-aqua animate-pulse-glow" />
        {eyebrow}
      </span>
      <h2 className="heading-lg mt-4">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-slate-400">{description}</p>
      ) : null}
    </Reveal>
  )
}
