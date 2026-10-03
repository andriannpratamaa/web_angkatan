import { cn, initials } from '../../lib/format'

interface AvatarProps {
  name: string
  photo?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-xl',
} as const

function hueFromName(name: string): number {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360
  }
  return hash
}

export function Avatar({ name, photo, className, size = 'md' }: AvatarProps) {
  const hue = hueFromName(name)

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        loading="lazy"
        className={cn('rounded-xl object-cover', sizeMap[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl font-display font-semibold text-white ring-1 ring-inset ring-white/15',
        sizeMap[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 72% 46%), hsl(${(hue + 45) % 360} 82% 32%))`,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  )
}
