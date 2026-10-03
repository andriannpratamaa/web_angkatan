import { cn } from '../../lib/format'

interface StatusBadgeProps {
  status: string
  className?: string
}

function stateOf(status: string) {
  const normalized = status.toLowerCase()
  const isPositive = normalized === 'lunas' || normalized === 'terpenuhi' || normalized === 'paid'
  const isNegative =
    normalized === 'belum lunas' || normalized === 'belum terpenuhi' || normalized === 'unpaid'
  return { isPositive, isNegative }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { isPositive, isNegative } = stateOf(status)

  return (
    <span
      className={cn(
        'chip',
        isPositive && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        isNegative && 'border-brand/40 bg-brand/10 text-brand',
        !isPositive && !isNegative && 'border-line bg-elevated text-muted',
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isPositive ? 'bg-emerald-500' : isNegative ? 'bg-brand' : 'bg-faint',
        )}
      />
      {status}
    </span>
  )
}

export function LightStatusBadge({ status }: { status: string }) {
  const { isPositive, isNegative } = stateOf(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        isPositive && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        isNegative && 'bg-brand/10 text-brand',
        !isPositive && !isNegative && 'bg-elevated text-muted',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isPositive ? 'bg-emerald-500' : isNegative ? 'bg-brand' : 'bg-faint',
        )}
      />
      {status}
    </span>
  )
}
