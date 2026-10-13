import { useEffect, useRef, useState } from 'react'
import type { ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Save,
  Settings,
  ShieldCheck,
  Upload,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useStudentAuth } from '../../contexts/StudentAuthContext'
import { useApi } from '../../hooks/useApi'
import { studentService } from '../../services/studentService'
import { getErrorMessage } from '../../lib/api'
import type { PortalCash, PortalPeriod } from '../../lib/types'
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

  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [showQrId, setShowQrId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null)

  useEffect(() => {
    refetch()
  }, [page, refetch])

  const handleFileSelect = (periodId: number) => {
    setSelectedPeriodId(periodId)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedPeriodId || !selectedFile) return
    setUploadingId(selectedPeriodId)
    try {
      await studentService.uploadProof(selectedPeriodId, selectedFile)
      toast.success('Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.')
      setSelectedFile(null)
      setSelectedPeriodId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || getErrorMessage(err) || 'Gagal mengunggah bukti pembayaran')
    } finally {
      setUploadingId(null)
    }
  }

  const getPeriodDisplay = (period: PortalPeriod) => {
    return {
      status: period.status,
      label: period.status_label,
      paidAt: period.payment_date,
      receiptUrl: period.receipt_url,
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
                      ) : (
                        <div className="flex items-center gap-2">
                          {display.receiptUrl ? (
                            <span className="text-xs text-brand">Menunggu verifikasi</span>
                          ) : null}
                          <button
                            type="button"
                            disabled={uploadingId === period.id}
                            onClick={() => handleFileSelect(period.id)}
                            className="btn-primary btn-sm"
                          >
                            {uploadingId === period.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Mengunggah...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Bukti
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowQrId(showQrId === period.id ? null : period.id)}
                            className="btn-ghost btn-sm"
                          >
                            Lihat QR
                          </button>
                        </div>
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
              Scan QRIS untuk pembayaran, lalu upload bukti pembayaran. Status akan diverifikasi oleh admin.
            </div>
          </div>
        </>
      )}

      {showQrId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowQrId(null)}>
          <div className="card max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold text-content">QRIS Pembayaran Kas</h3>
            <p className="mt-1 text-sm text-muted">Scan QR berikut untuk membayar kas bulanan</p>
            <div className="mt-4 flex justify-center">
              <img src="/qr.jpeg" alt="QRIS Pembayaran" className="w-64 h-64 rounded-xl border border-line object-contain" />
            </div>
            <button
              type="button"
              onClick={() => setShowQrId(null)}
              className="btn-outline mt-4 w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile && selectedPeriodId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setSelectedFile(null); setSelectedPeriodId(null) }}>
          <div className="card max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold text-content">Konfirmasi Upload</h3>
            <p className="mt-1 text-sm text-muted">File: {selectedFile.name}</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setSelectedPeriodId(null) }}
                className="btn-outline"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploadingId !== null}
                className="btn-primary"
              >
                {uploadingId ? 'Mengunggah...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
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
