import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/format'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  tone?: 'dark' | 'light'
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field pl-9"
      />
    </div>
  )
}

interface PaginationProps {
  page: number
  lastPage: number
  onChange: (page: number) => void
  total?: number
  from?: number | null
  to?: number | null
  tone?: 'dark' | 'light'
}

export function Pagination({ page, lastPage, onChange, total, from, to }: PaginationProps) {
  if (lastPage <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, page - 1)
  const end = Math.min(lastPage, start + 2)
  for (let index = start; index <= end; index += 1) pages.push(index)

  const buttonBase =
    'flex h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-card px-3 text-sm font-medium text-muted transition hover:border-brand hover:text-brand disabled:opacity-40'

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted">
        {typeof total === 'number' && from != null && to != null
          ? `Menampilkan ${from}-${to} dari ${total} data`
          : `Halaman ${page} dari ${lastPage}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={buttonBase}
        >
          Sebelumnya
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              buttonBase,
              item === page && 'border-brand bg-brand text-white hover:text-white',
            )}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= lastPage}
          className={buttonBase}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}

interface FieldWrapProps {
  label?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function Field({ label, hint, children, className }: FieldWrapProps) {
  return (
    <label className={cn('block', className)}>
      {label ? <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span> : null}
      {children}
      {hint ? <span className="mt-1 block text-xs text-faint">{hint}</span> : null}
    </label>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('field', className)} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn('field', className)}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('field resize-y', className)} />
}
