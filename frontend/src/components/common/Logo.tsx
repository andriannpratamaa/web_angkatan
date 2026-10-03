import { cn } from '../../lib/format'

interface LogoProps {
  className?: string
  size?: number
  showText?: boolean
}

export function Logo({ className, size = 40, showText = true }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <img
        src="/to.png"
        alt="TO26"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-xl object-contain"
      />
      {showText ? (
        <span className="leading-none">
          <span className="block font-display text-lg font-bold tracking-[0.18em] text-content">
            TO<span className="text-brand">26</span>
          </span>
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
            Teknik Otomasi
          </span>
        </span>
      ) : null}
    </span>
  )
}
