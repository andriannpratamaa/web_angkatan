import type { ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { clampPercent, cn } from '../../lib/format'

export function LightSkeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function LightSkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <LightSkeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  )
}

export function LightSkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <LightSkeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  )
}

export function LightEmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-elevated px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="font-display text-base font-semibold text-content">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function LightErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export function LightProgress({
  value,
  tone = 'brand',
  className,
}: {
  value: number
  tone?: 'brand' | 'emerald' | 'flame'
  className?: string
}) {
  const tones = {
    brand: 'from-brand to-brand-bright',
    emerald: 'from-emerald-500 to-emerald-400',
    flame: 'from-brand-deep to-brand',
  } as const

  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-elevated', className)}>
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', tones[tone])}
        style={{ width: `${clampPercent(value)}%` }}
      />
    </div>
  )
}
