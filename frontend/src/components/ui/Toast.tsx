import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  push: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const config = {
  success: { icon: CheckCircle2, accent: 'text-emerald-400', ring: 'border-emerald-400/40' },
  error: { icon: AlertTriangle, accent: 'text-flame', ring: 'border-flame/40' },
  info: { icon: Info, accent: 'text-aqua', ring: 'border-aqua/40' },
} as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const push = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = Date.now() + Math.random()
      setToasts((items) => [...items, { id, message, type }])
      window.setTimeout(() => remove(id), 4200)
    },
    [remove],
  )

  const value: ToastContextValue = {
    push,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
    info: (message) => push(message, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const { icon: Icon, accent, ring } = config[toast.type]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${ring} bg-ink/95 p-4 shadow-card backdrop-blur`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${accent}`} />
                <p className="flex-1 text-sm text-snow">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => remove(toast.id)}
                  className="text-slate-500 transition hover:text-snow"
                  aria-label="Tutup notifikasi"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast harus digunakan di dalam ToastProvider')
  }
  return context
}
