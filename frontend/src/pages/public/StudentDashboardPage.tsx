import { useEffect, useRef, useState } from 'react'
import type { ElementType } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Save,
  Settings,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useStudentAuth } from '../../contexts/StudentAuthContext'
import { useApi } from '../../hooks/useApi'
import { studentService } from '../../services/studentService'
import { getErrorMessage } from '../../lib/api'
import type { PortalCash, PaymentStatusResponse, SnapTokenResponse, PortalPeriod } from '../../lib/types'
import { formatDate, formatRupiah } from '../../lib/format'
import { Avatar } from '../../components/common/Avatar'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { ErrorState, SkeletonList } from '../../components/ui/Feedback'
import { Field, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

type Tab = 'kas' | 'pengaturan'

export default function StudentDashboardPage() {
  const { member, logout, setMember } = useStudentAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('kas')

  if (!member) return null

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-line py-12">
        <div className="absolute inset-0 blueprint opacity-50" />
        <div className="container-x relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={member.name} photo={member.photo} size="lg" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand">
                  {member.student_class?.label ?? 'Portal Mahasiswa'}
                </p>
                <h1 className="font-display text-xl font-bold text-content sm:text-2xl">{member.name}</h1>
                <p className="font-mono text-xs text-muted">{member.nrp}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              className="btn-ghost btn-sm"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>

          {member.must_change_password ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Anda masih memakai password default. Silakan ganti password pada tab{' '}
                <button type="button" className="font-semibold underline" onClick={() => setTab('pengaturan')}>
                  Pengaturan
                </button>
                .
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-10">
        <div className="container-x">
          <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-line bg-card p-2">
            <TabButton active={tab === 'kas'} onClick={() => setTab('kas')} icon={Wallet} label="Tagihan Kas" />
            <TabButton active={tab === 'pengaturan'} onClick={() => setTab('pengaturan')} icon={Settings} label="Pengaturan" />
          </div>

          {tab === 'kas' ? <CashTab /> : <SettingsTab member={member} setMember={setMember} />}
        </div>
      </section>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ElementType
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white'
          : 'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted hover:bg-elevated hover:text-content'
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function CashTab() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = useApi<{ data: PortalCash }>(
    `/portal/cash?page=${page}&per_page=5`,
  )
  const portal = data?.data
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Midtrans Snap state
  const [snapLoadingId, setSnapLoadingId] = useState<number | null>(null)
  const [pollingId, setPollingId] = useState<number | null>(null)
  const [periodStatus, setPeriodStatus] = useState<Record<number, PaymentStatusResponse>>({})
  const snapLoadedRef = useRef(false)
  const notifiedPaidRef = useRef<Set<number>>(new Set())

  // Handle redirect from Midtrans (payment=finish|error|pending)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const paymentStatus = params.get('payment')
    
    if (paymentStatus && portal) {
      // Clean URL
      navigate(location.pathname, { replace: true })
      
      if (paymentStatus === 'finish') {
        // Don't show toast here - let polling handle success notification
        // Trigger immediate status check for all periods
        refetch()
      } else if (paymentStatus === 'error') {
        toast.error('Pembayaran gagal atau dibatalkan.')
      } else if (paymentStatus === 'pending') {
        toast.info('Pembayaran sedang diproses. Silakan tunggu...')
      }
    }
  }, [location.search, navigate, portal, refetch, toast])

  useEffect(() => {
    refetch()
  }, [page, refetch])

  // Load Midtrans Snap.js
  useEffect(() => {
    if (snapLoadedRef.current) return

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
    if (!clientKey) {
      console.warn('Midtrans Client Key not configured')
      return
    }

    // Check if already loaded
    if (window.snap) {
      snapLoadedRef.current = true
      return
    }

    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    script.async = true
    script.onload = () => {
      snapLoadedRef.current = true
    }
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap.js')
    }
    document.head.appendChild(script)

    return () => {
      // Don't remove script on unmount
    }
  }, [])

  // Polling for payment status
  useEffect(() => {
    if (!pollingId || !portal) return

    const interval = setInterval(async () => {
      try {
        const status = await studentService.checkPaymentStatus(pollingId)
        setPeriodStatus((prev) => ({ ...prev, [pollingId]: status }))

        // Stop polling if paid or failed
        if (status.status === 'paid' || status.payment_status === 'paid') {
          // Only show toast once per period
          if (!notifiedPaidRef.current.has(pollingId)) {
            notifiedPaidRef.current.add(pollingId)
            toast.success(`${status.period_name} telah LUNAS!`)
          }
          setPollingId(null)
          refetch() // Refresh the list
        } else if (status.payment_status === 'failed') {
          if (!notifiedPaidRef.current.has(pollingId)) {
            toast.error(`Pembayaran ${status.period_name} gagal atau kedaluwarsa.`)
          }
          setPollingId(null)
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [pollingId, portal, refetch, toast])

  const handlePay = async (periodId: number) => {
    setSnapLoadingId(periodId)
    try {
      const result: SnapTokenResponse = await studentService.createPayment(periodId)

      if (!window.snap) {
        throw new Error('Midtrans Snap belum dimuat. Silakan coba lagi.')
      }

      // Start polling after initiating payment
      setPollingId(periodId)

      window.snap.pay(result.snap_token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result)
          // Don't rely on this - use polling + webhook
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result)
        },
        onError: (result: any) => {
          console.error('Payment error:', result)
        },
        onClose: () => {
          console.log('Snap closed')
          // Continue polling to check actual status
        },
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || getErrorMessage(err) || 'Gagal memulai pembayaran')
    } finally {
      setSnapLoadingId(null)
    }
  }

  // Get combined status for a period
  const getPeriodDisplay = (period: PortalPeriod) => {
    const status = periodStatus[period.id]
    if (status) {
      return {
        status: status.status,
        label: status.status === 'paid' ? 'LUNAS' : status.status === 'pending' ? 'MENUNGGU PEMBAYARAN' : 'BELUM LUNAS',
        isLoading: false,
        paidAt: status.paid_at,
      }
    }
    return {
      status: period.status,
      label: period.status_label,
      isLoading: snapLoadingId === period.id,
      paidAt: period.payment_date,
    }
  }

  const handleCancel = async (periodId: number, periodName: string) => {
    if (!confirm(`Batalkan pembayaran untuk ${periodName}?`)) return
    try {
      await studentService.cancelPayment(periodId)
      toast.success('Transaksi dibatalkan.')
      setPeriodStatus((prev) => {
        const next = { ...prev }
        delete next[periodId]
        return next
      })
      setPollingId(null)
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || getErrorMessage(err) || 'Gagal membatalkan transaksi')
    }
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorState message={error} /> : null}

      {loading || !portal ? (
        <SkeletonList rows={4} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Tagihan" value={formatRupiah(portal.summary.total_tagihan)} icon={<Wallet className="h-4 w-4" />} />
            <StatCard label="Sudah Dibayar" value={formatRupiah(portal.summary.total_paid)} tone="emerald" icon={<CheckCircle2 className="h-4 w-4" />} hint={`${portal.summary.paid_count} periode`} />
            <StatCard label="Tunggakan" value={formatRupiah(portal.summary.total_unpaid)} tone="flame" icon={<XCircle className="h-4 w-4" />} hint={`${portal.summary.unpaid_count} periode`} />
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-base font-semibold text-content">Tagihan Kas</h2>
              <p className="mt-1 text-sm text-muted">Daftar tagihan kas bulanan Anda (urut dari 2026).</p>
            </div>
            <div className="divide-y divide-line">
              {portal.periods.map((period) => {
                const display = getPeriodDisplay(period)
                return (
                  <div key={period.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Clock className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-medium text-content">{period.name}</p>
                        <p className="font-mono text-xs text-muted">
                          {formatRupiah(period.amount)}
                          {period.due_date ? ` - jatuh tempo ${formatDate(period.due_date)}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={display.label} />
                      {display.status === 'paid' ? (
                        <span className="font-mono text-xs text-muted">
                          {display.paidAt ? formatDate(display.paidAt) : ''}
                        </span>
                      ) : display.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-sm text-brand">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            MENUNGGU PEMBAYARAN
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCancel(period.id, period.name)}
                            className="btn-ghost btn-sm text-error hover:text-error"
                          >
                            Batalkan
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={display.isLoading}
                          onClick={() => handlePay(period.id)}
                          className="btn-primary btn-sm"
                        >
                          {display.isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Memproses...
                            </>
                          ) : (
                            'Bayar Sekarang'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {portal.pagination ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-elevated px-5 py-3 text-xs text-muted">
                <span>
                  Halaman {portal.pagination.current_page} dari {portal.pagination.last_page} ({portal.pagination.total} periode)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn-ghost btn-sm"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={page >= portal.pagination.last_page}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-ghost btn-sm"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            ) : null}
            <div className="border-t border-line bg-elevated px-5 py-3 text-xs text-muted">
              Pembayaran via Midtrans (QRIS, GoPay, ShopeePay, dll). Status akan otomatis terupdate.
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SettingsTab({
  member,
  setMember,
}: {
  member: NonNullable<ReturnType<typeof useStudentAuth>['member']>
  setMember: (member: NonNullable<ReturnType<typeof useStudentAuth>['member']>) => void
}) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: member.name,
    gender: member.gender ?? '',
    quote: member.quote ?? '',
    instagram: member.instagram ?? '',
    linkedin: member.linkedin ?? '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  useEffect(() => {
    setForm({
      name: member.name,
      gender: member.gender ?? '',
      quote: member.quote ?? '',
      instagram: member.instagram ?? '',
      linkedin: member.linkedin ?? '',
    })
  }, [member])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const response = await studentService.updateProfile(
        {
          name: form.name,
          gender: form.gender === 'L' || form.gender === 'P' ? form.gender : null,
          quote: form.quote || null,
          instagram: form.instagram || null,
          linkedin: form.linkedin || null,
        },
        photo,
      )
      setMember(response.data)
      setPhoto(null)
      toast.success('Profil diperbarui. Perubahan otomatis tampil di website.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async () => {
    setSavingPwd(true)
    try {
      const response = await studentService.changePassword(pwd)
      setMember(response.member)
      setPwd({ current_password: '', password: '', password_confirmation: '' })
      toast.success('Password berhasil diperbarui.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-5 sm:p-6">
        <h2 className="font-display text-base font-semibold text-content">Profil Mahasiswa</h2>
        <p className="mt-1 text-sm text-muted">
          Perubahan di sini langsung tersinkron ke halaman Angkatan, Kas, dan Timah Panas.
        </p>

        <div className="mt-5 flex items-center gap-4">
          <Avatar name={form.name || member.name} photo={photo ? URL.createObjectURL(photo) : member.photo} size="lg" />
          <div>
            <p className="text-sm font-medium text-content">{member.nrp}</p>
            <p className="text-xs text-muted">{member.student_class?.label ?? '-'} - NRP & kelas diatur admin</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap" className="sm:col-span-2">
            <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Jenis Kelamin">
            <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="field">
              <option value="">-</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </Field>
          <Field label="Foto">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
          </Field>
          <Field label="Instagram">
            <TextInput value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} />
          </Field>
          <Field label="LinkedIn">
            <TextInput value={form.linkedin} onChange={(event) => setForm({ ...form, linkedin: event.target.value })} />
          </Field>

          <Field label="Quote" className="sm:col-span-2">
            <Textarea rows={2} value={form.quote} onChange={(event) => setForm({ ...form, quote: event.target.value })} />
          </Field>
        </div>

        <div className="mt-5">
          <button type="button" onClick={saveProfile} disabled={savingProfile} className="btn-primary">
            <Save className="h-4 w-4" />
            {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </div>

      <div className="card h-fit p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-content">
          <ShieldCheck className="h-4 w-4 text-brand" /> Ganti Password
        </h2>
        <p className="mt-1 text-sm text-muted">
          {member.must_change_password ? 'Anda masih memakai password default admin123.' : 'Perbarui password akun Anda.'}
        </p>

        <div className="mt-5 grid gap-4">
          <Field label="Password Lama">
            <TextInput
              type="password"
              value={pwd.current_password}
              onChange={(event) => setPwd({ ...pwd, current_password: event.target.value })}
            />
          </Field>
          <Field label="Password Baru" hint="Minimal 6 karakter">
            <TextInput
              type="password"
              value={pwd.password}
              onChange={(event) => setPwd({ ...pwd, password: event.target.value })}
            />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <TextInput
              type="password"
              value={pwd.password_confirmation}
              onChange={(event) => setPwd({ ...pwd, password_confirmation: event.target.value })}
            />
          </Field>
          <button type="button" onClick={savePassword} disabled={savingPwd} className="btn-primary">
            {savingPwd ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
