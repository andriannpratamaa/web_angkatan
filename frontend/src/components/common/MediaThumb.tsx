import { ImageIcon } from 'lucide-react'
import { cn } from '../../lib/format'

interface MediaThumbProps {
  title: string
  image?: string | null
  category?: string | null
  className?: string
  rounded?: string
}

function hueFromText(text: string): number {
  let hash = 17
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 37 + text.charCodeAt(index)) % 360
  }
  return hash
}

export function MediaThumb({ title, image, category, className, rounded = 'rounded-2xl' }: MediaThumbProps) {
  if (image) {
    return (
      <div className={cn('group relative overflow-hidden', rounded, className)}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
        <ThumbCaption title={title} category={category} />
      </div>
    )
  }

  const hue = hueFromText(title)

  return (
    <div
      className={cn('group relative overflow-hidden', rounded, className)}
      style={{
        backgroundImage: `linear-gradient(140deg, hsl(${hue} 68% 34%), hsl(${(hue + 48) % 360} 78% 18%))`,
      }}
    >
      <div className="absolute inset-0 blueprint opacity-40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="h-10 w-10 text-white/25 transition duration-500 group-hover:scale-110 group-hover:text-white/40" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
      <ThumbCaption title={title} category={category} />
    </div>
  )
}

function ThumbCaption({ title, category }: { title: string; category?: string | null }) {
  return (
    <div className="absolute inset-x-0 bottom-0 p-4">
      {category ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-aqua">{category}</span>
      ) : null}
      <p className="mt-1 font-display text-sm font-semibold text-snow">{title}</p>
    </div>
  )
}
