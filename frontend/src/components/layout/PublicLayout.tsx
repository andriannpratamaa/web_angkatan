import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogIn, Menu, User, X } from 'lucide-react'
import { Logo } from '../common/Logo'
import { ThemeToggle } from '../common/ThemeToggle'
import { GithubIcon, InstagramIcon, LinkedinIcon } from '../common/SocialIcons'
import { useStudentAuth } from '../../contexts/StudentAuthContext'
import { cn } from '../../lib/format'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Angkatan', to: '/angkatan' },
  { label: 'Kas', to: '/kas' },
  { label: 'Timah Panas', to: '/timahpanas' },
  { label: 'Galeri', to: '/galeri' },
  { label: 'Kegiatan', to: '/kegiatan' },
]

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { member } = useStudentAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  const handleNav = (to: string) => {
    if (to.startsWith('/#')) {
      const id = to.slice(2)
      if (location.pathname !== '/') {
        navigate('/')
        window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 320)
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', to)
      }
    } else {
      navigate(to)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface">
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition duration-300',
          scrolled ? 'border-b border-line bg-surface/90 backdrop-blur-xl' : 'border-b border-transparent',
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <Link to="/" aria-label="TO26 Home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => handleNav(item.to)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-elevated',
                  location.pathname === item.to ? 'text-brand' : 'text-muted hover:text-content',
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {member ? (
              <Link to="/akun" className="btn-ghost btn-sm hidden sm:inline-flex">
                <User className="h-4 w-4" />
                Akun
              </Link>
            ) : (
              <Link to="/masuk" className="btn-ghost btn-sm hidden sm:inline-flex">
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-content lg:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-[72px] z-40 border-b border-line bg-surface px-5 py-4 lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => handleNav(item.to)}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-content transition hover:bg-elevated"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to={member ? '/akun' : '/masuk'}
                className="btn-ghost mt-2"
              >
                <User className="h-4 w-4" />
                {member ? 'Akun Saya' : 'Masuk'}
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="relative z-10">{children}</main>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Teknik Otomasi Angkatan 2026. Portal resmi angkatan — kolaborasi, inovasi, dan
            kebersamaan mahasiswa otomasi.
          </p>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.28em] text-brand">
            Automate The Future. Together.
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-faint">Navigasi</p>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              { label: 'Angkatan', to: '/angkatan' },
              { label: 'Kas Angkatan', to: '/kas' },
              { label: 'Timah Panas', to: '/timahpanas' },
              { label: 'Galeri', to: '/galeri' },
              { label: 'Kegiatan', to: '/kegiatan' },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-muted">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-faint">Terhubung</p>
          <div className="mt-4 flex gap-3">
            {[InstagramIcon, LinkedinIcon, GithubIcon].map((Icon, index) => (
              <span
                key={index}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-elevated text-muted"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Program Studi Teknik Otomasi
            <br />
            Angkatan 2026
          </p>
        </div>
      </div>

<div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <p>&copy; {new Date().getFullYear()} TO26 - Teknik Otomasi 2026</p>
        </div>
      </div>
    </footer>
  )
}

export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}
