import { useEffect, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Target,
  Users,
  Wallet,
  GraduationCap,
  X,
} from 'lucide-react'
import { Logo } from '../common/Logo'
import { ThemeToggle } from '../common/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/format'
import type { AdminRole } from '../../lib/types'

interface NavGroup {
  section: string
  roles: AdminRole[]
  items: { label: string; to: string; icon: ElementType }[]
}

const ADMIN: AdminRole[] = ['super_admin', 'admin']
const ALL: AdminRole[] = ['super_admin', 'admin', 'bendahara']

const groups: NavGroup[] = [
  {
    section: 'Umum',
    roles: ALL,
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard }],
  },
  {
    section: 'Master Data',
    roles: ADMIN,
    items: [
      { label: 'Mahasiswa', to: '/admin/mahasiswa', icon: Users },
      { label: 'Kelas', to: '/admin/kelas', icon: GraduationCap },
    ],
  },
  {
    section: 'Keuangan',
    roles: ALL,
    items: [{ label: 'Kas', to: '/admin/kas', icon: Wallet }],
  },
  {
    section: 'Timah Panas',
    roles: ADMIN,
    items: [{ label: 'Persyaratan', to: '/admin/timahpanas', icon: Target }],
  },
  {
    section: 'Content',
    roles: ADMIN,
    items: [
      { label: 'Galeri', to: '/admin/galeri', icon: Images },
      { label: 'Kegiatan', to: '/admin/kegiatan', icon: CalendarDays },
      { label: 'Timeline', to: '/admin/timeline', icon: Clock3 },
    ],
  },
  {
    section: 'Sistem',
    roles: ['super_admin'],
    items: [{ label: 'Settings', to: '/admin/settings', icon: Settings }],
  },
]

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/mahasiswa': 'Data Mahasiswa',
  '/admin/kelas': 'Data Kelas',
  '/admin/kas': 'Manajemen Kas',
  '/admin/timahpanas': 'Persyaratan Timah Panas',
  '/admin/galeri': 'Galeri',
  '/admin/kegiatan': 'Kegiatan',
  '/admin/timeline': 'Timeline',
  '/admin/settings': 'Settings',
}

function resolveTitle(pathname: string): string {
  if (titles[pathname]) return titles[pathname]
  if (pathname.includes('/admin/timahpanas/') && pathname.endsWith('/peserta')) return 'Kelola Peserta'
  return 'Admin TO26'
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => setOpen(false), [location.pathname])

  const visibleGroups = groups.filter((group) => user && group.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-surface text-content">
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-card transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
          <Link to="/admin">
            <Logo size={38} />
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="text-muted lg:hidden" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6 no-scrollbar">
          {visibleGroups.map((group) => (
            <div key={group.section}>
              <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-faint">
                {group.section}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                        isActive
                          ? 'bg-brand/10 text-brand'
                          : 'text-muted hover:bg-elevated hover:text-content',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <Link to="/" className="btn-ghost w-full">
            <ExternalLink className="h-4 w-4" />
            Lihat Website
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
          <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-content lg:hidden"
                aria-label="Buka menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faint">TO26 Admin</p>
                <h1 className="font-display text-lg font-semibold text-content">
                  {resolveTitle(location.pathname)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="hidden items-center gap-3 sm:flex">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-content">{user.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                      {user.role}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  await logout()
                  navigate('/admin/login')
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition hover:border-brand hover:text-brand"
                aria-label="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
