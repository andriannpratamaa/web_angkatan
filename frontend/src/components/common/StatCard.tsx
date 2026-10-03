import type { ReactNode } from 'react'
import { cn } from '../../lib/format'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
  tone?: 'brand' | 'emerald' | 'flame' | 'aqua' | 'slate'
  className?: string
}

const tones = {
  brand: 'text-brand bg-brand/10 border-brand/30',
  emerald: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400',
  flame: 'text-brand-deep bg-brand/10 border-brand/30',
  aqua: 'text-brand-bright bg-brand/10 border-brand/30',
  slate: 'text-muted bg-elevated border-line',
} as const

export function StatCard({ label, value, icon, hint, tone = 'brand', className }: StatCardProps) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">{label}</p>
        {icon ? (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg border', tones[tone])}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-content">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

export function LightStatCard({ label, value, icon, hint, tone = 'brand' }: Omit<StatCardProps, 'className'>) {
  return <StatCard label={label} value={value} icon={icon} hint={hint} tone={tone} />
}
