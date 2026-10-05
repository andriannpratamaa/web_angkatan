import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, User } from 'lucide-react'
import { useStudentAuth } from '../../contexts/StudentAuthContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { getErrorMessage } from '../../lib/api'
import { Logo } from '../../components/common/Logo'
import { ThemeToggle } from '../../components/common/ThemeToggle'

export default function StudentLoginPage() {
  const { login: loginStudent } = useStudentAuth()
  const { login: loginAdmin } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const id = identifier.trim()
      if (id.includes('@')) {
        await loginAdmin(id, password)
        toast.success('Login berhasil.')
        navigate('/admin')
      } else {
        await loginStudent(id, password)
        toast.success('Login berhasil.')
        navigate('/akun')
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-[72px]">
      <section className="relative flex min-h-[calc(100svh-72px)] items-center overflow-hidden py-16">
        <div className="absolute inset-0 blueprint opacity-50" />
        <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />

        <div className="container-x relative">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <ThemeToggle />
            </div>

            <div className="card p-6 sm:p-8">
              <span className="chip-info">
                <GraduationCap className="h-3.5 w-3.5" />
                Portal Masuk
              </span>
              <h1 className="mt-4 font-display text-2xl font-bold text-content">Masuk TO26</h1>
              <p className="mt-2 text-sm text-muted">
                Masuk dengan NRP (mahasiswa) atau Email (admin).
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4">
                <label className="block">
                  <span className="label">NRP / Email</span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="0926040001 atau admin@example.com"
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

              <Link to="/" className="mt-6 inline-block text-sm text-muted transition hover:text-brand">
                &larr; Kembali ke website
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
