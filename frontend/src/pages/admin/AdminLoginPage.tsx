import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cpu, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../lib/api'
import { Logo } from '../../components/common/Logo'
import { ThemeToggle } from '../../components/common/ThemeToggle'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login berhasil.')
      navigate('/admin')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-black via-brand-deep to-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 blueprint opacity-20" />
        <Link to="/" className="relative">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Cpu className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-[0.18em]">TO26</span>
          </span>
        </Link>
        <div className="relative">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Portal Admin
            <br />
            Teknik Otomasi 2026
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Kelola master data mahasiswa, kas angkatan per kelas, dan persyaratan Timah Panas dari
            satu dashboard terintegrasi.
          </p>
        </div>
        <p className="relative font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
          Automate The Future. Together.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Logo />
            <ThemeToggle />
          </div>

          <span className="chip-info">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Area
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-content">Masuk ke Dashboard</h2>
          <p className="mt-2 text-sm text-muted">
            Gunakan akun admin yang diberikan. Hubungi super admin bila lupa kredensial.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@to26.test"
                  className="field pl-9"
                />
              </div>
            </label>

            <label className="block">
              <span className="label">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="field pl-9"
                />
              </div>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 rounded-xl border border-line bg-elevated p-4 text-xs text-muted">
            Akun development: <span className="font-mono text-content">admin@to26.test</span> /{' '}
            <span className="font-mono text-content">password</span>
          </p>

          <Link to="/" className="mt-6 inline-block text-sm text-muted transition hover:text-brand">
            &larr; Kembali ke website
          </Link>
        </div>
      </div>
    </div>
  )
}
