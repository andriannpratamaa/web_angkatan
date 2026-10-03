import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, Cpu, Gauge, Minus, Target, Users, Wallet } from 'lucide-react'
import { clampPercent, formatRupiah } from '../../lib/format'

interface HeroProps {
  memberCount: number
  balance: number
  requirementCount: number
  progress: number
}

export function Hero({ memberCount, balance, requirementCount, progress }: HeroProps) {
  const [minimized, setMinimized] = useState(false)

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      <div className="absolute inset-0 blueprint animate-grid-pan opacity-20" />
      <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-azure/20 blur-[120px]" />
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-aqua/10 blur-[130px]" />

      <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 select-none font-display text-[26vw] font-bold leading-none text-white/[0.02] lg:block">
        TO26
      </span>

      <div className="container-x relative grid items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="chip-info"
          >
            <Cpu className="h-3.5 w-3.5" />
            Teknik Otomasi 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Automate The
            <br />
            <span className="bg-gradient-to-r from-azure via-aqua to-azure bg-clip-text text-transparent">
              Future. Together.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg"
          >
            Kami adalah angkatan Teknik Otomasi 2026 — sekumpulan mahasiswa yang belajar merancang,
            membangun, dan mengendalikan sistem otomasi industri. Satu angkatan, satu tujuan:
            tumbuh bersama.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link to="/angkatan" className="btn-primary">
              <Users className="h-4 w-4" />
              Jelajahi Angkatan
            </Link>
            <Link to="/kas" className="btn-ghost">
              <Wallet className="h-4 w-4" />
              Transparansi Kas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-widest text-slate-300"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-aqua" /> {memberCount} Mahasiswa
            </span>
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-aqua" /> {requirementCount} Persyaratan
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-end"
        >
          <AnimatePresence mode="wait" initial={false}>
            {minimized ? (
              <motion.button
                key="hero-tab"
                type="button"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setMinimized(false)}
                aria-label="Tampilkan panel"
                className="-mr-5 flex items-center gap-3 rounded-l-2xl border border-r-0 border-line bg-card py-5 pl-3 pr-2 text-muted shadow-card transition hover:text-brand sm:-mr-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  Info TO26
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="hero-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative w-full"
              >
                <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-3xl border border-azure/20 bg-azure/5" />
                <div className="panel clip-corner relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-flame/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                        TO26 / panel
                      </span>
                      <button
                        type="button"
                        onClick={() => setMinimized(true)}
                        aria-label="Minimize panel"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand hover:text-brand"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-5">
                    <PanelStat
                      icon={<Wallet className="h-4 w-4" />}
                      label="Saldo Kas Angkatan"
                      value={formatRupiah(balance)}
                    />
                    <PanelStat
                      icon={<Users className="h-4 w-4" />}
                      label="Total Mahasiswa"
                      value={`${memberCount} orang`}
                    />
                    <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                          <Gauge className="h-4 w-4 text-aqua" />
                          Progress Timah Panas
                        </span>
                        <span className="font-display text-lg font-bold text-snow">
                          {Math.round(clampPercent(progress))}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-azure to-aqua"
                          initial={{ width: 0 }}
                          animate={{ width: `${clampPercent(progress)}%` }}
                          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function PanelStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink/60 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-azure/15 text-aqua">
        {icon}
      </span>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
        <p className="font-display text-lg font-bold text-snow">{value}</p>
      </div>
    </div>
  )
}
