import type { ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { clampPercent, cn } from '../../lib/format'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  )
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white',
        className,
      )}
    />
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-azure/10 text-aqua">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="font-display text-base font-semibold text-content">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-flame/30 bg-flame/5 px-5 py-4 text-sm text-flame">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

interface ProgressBarProps {
  value: number
  tone?: 'brand' | 'emerald' | 'flame'
  className?: string
  showLabel?: boolean
}

const tones = {
  brand: 'from-azure to-aqua',
  emerald: 'from-emerald-500 to-emerald-300',
  flame: 'from-flame to-amber-300',
} as const

export function ProgressBar({ value, tone = 'brand', className, showLabel }: ProgressBarProps) {
  const percent = clampPercent(value)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', tones[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel ? (
        <span className="w-12 shrink-0 font-mono text-xs text-muted">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  )
}
