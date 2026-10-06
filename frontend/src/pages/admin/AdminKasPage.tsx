import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CalendarClock,
  CheckCircle2,
  Pencil,
  Plus,
  Receipt,
  Settings2,
  Trash2,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import { cashService } from '../../services/cashService'
import { classService } from '../../services/classService'
import { memberService } from '../../services/memberService'
import { usePagination } from '../../hooks/usePagination'
import { getErrorMessage } from '../../lib/api'
import type {
  CashOverview,
  CashPeriod,
  CashSummary,
  CashTransaction,
  ClassBreakdown,
  Member,
  MemberStatusRow,
  StudentClass,
  TransactionResponse,
} from '../../lib/types'
import { cn, currentYear, formatDate, formatRupiah, monthName, MONTHS, todayISO } from '../../lib/format'
import { StatCard } from '../../components/common/StatCard'
import { LightStatusBadge } from '../../components/common/StatusBadge'
import { StudentSelect } from '../../components/admin/StudentSelect'
import { LightEmptyState, LightErrorState, LightProgress, LightSkeletonCards, LightSkeletonList } from '../../components/ui/LightFeedback'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Field, Pagination, SearchInput, Select, TextInput } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

type Tab = 'overview' | 'pembayaran' | 'transaksi' | 'periode' | 'pengaturan'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'pembayaran', label: 'Pembayaran', icon: CheckCircle2 },
  { id: 'transaksi', label: 'Transaksi', icon: Receipt },
  { id: 'periode', label: 'Periode', icon: CalendarClock },
  { id: 'pengaturan', label: 'Pengaturan Kas', icon: Settings2 },
]

export default function AdminKasPage() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('overview')
  const [classes, setClasses] = useState<StudentClass[]>([])
  const [periods, setPeriods] = useState<CashPeriod[]>([])

  const loadMeta = useCallback(() => {
    classService.adminList().then(setClasses).catch(() => undefined)
    cashService.periods().then(setPeriods).catch(() => undefined)
  }, [])

  useEffect(loadMeta, [loadMeta])

  const initialClass = params.get('class') ?? 'all'
  const [classFilter, setClassFilter] = useState(initialClass)

  const goToPayments = (id: number | 'all') => {
    setClassFilter(id === 'all' ? 'all' : String(id))
    setTab('pembayaran')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-card p-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id)
              if (item.id === 'pembayaran') setParams({ class: classFilter })
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
              tab === item.id ? 'bg-brand text-white' : 'text-muted hover:bg-elevated hover:text-content',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? <OverviewTab classes={classes} onPickClass={goToPayments} /> : null}
      {tab === 'pembayaran' ? (
        <PaymentTab classes={classes} periods={periods} classFilter={classFilter} setClassFilter={setClassFilter} />
      ) : null}
      {tab === 'transaksi' ? <TransactionTab /> : null}
      {tab === 'periode' ? <PeriodTab periods={periods} reload={loadMeta} /> : null}
      {tab === 'pengaturan' ? <SettingTab /> : null}
    </div>
  )
}

function OverviewTab({ classes }: { classes: StudentClass[] }) {
  const navigate = useNavigate()
  const onPickClass = (id: number) => {
    navigate(`/admin/kas/detail/${id}`)
  }
  const [data, setData] = useState<CashOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    cashService
      .adminOverview()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {error ? <LightErrorState message={error} /> : null}
      {loading || !data ? (
        <LightSkeletonCards count={5} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Mahasiswa" value={`${data.total_members}`} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Sudah Bayar" value={`${data.paid}`} icon={<CheckCircle2 className="h-4 w-4" />} tone="emerald" />
          <StatCard label="Belum Bayar" value={`${data.unpaid}`} icon={<XCircle className="h-4 w-4" />} tone="flame" />
          <StatCard label="Persentase" value={`${data.percentage}%`} hint={data.period?.name ?? '-'} />
          <StatCard label="Total Kas" value={formatRupiah(data.balance)} hint={`Terkumpul ${formatRupiah(data.collected)}`} icon={<Wallet className="h-4 w-4" />} tone="aqua" />
        </div>
      )}

      <div className="card p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-content">Rekap Seluruh Angkatan</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3 text-center">Jumlah</th>
                <th className="px-4 py-3 text-center">Sudah Bayar</th>
                <th className="px-4 py-3 text-center">Belum Bayar</th>
                <th className="px-4 py-3">Persentase</th>
                <th className="px-4 py-3 text-right">Total Pembayaran</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(data?.classes ?? []).map((item: ClassBreakdown) => (
                <tr key={item.id} className="transition hover:bg-elevated">
                  <td className="px-4 py-3 font-semibold text-content">{item.label}</td>
                  <td className="px-4 py-3 text-center font-mono text-content">{item.total_members}</td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-600 dark:text-emerald-400">{item.paid}</td>
                  <td className="px-4 py-3 text-center font-mono text-brand">{item.unpaid}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <LightProgress value={item.percentage} tone={item.paid >= item.total_members ? 'emerald' : 'brand'} />
                      <span className="w-12 shrink-0 text-right font-mono text-xs text-muted">{item.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-content">{formatRupiah(item.total_amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => onPickClass(item.id)} className="btn-outline-light btn-sm">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(classes.length ? classes : []).map((item) => {
          const breakdown = data?.classes.find((c) => c.id === item.id)
          return (
            <button key={item.id} type="button" onClick={() => onPickClass(item.id)} className="card card-hover p-5 text-left">
              <p className="font-display text-lg font-bold text-content">{item.label ?? item.code}</p>
              <p className="mt-3 font-display text-2xl font-bold text-brand">{breakdown?.paid ?? 0}/{breakdown?.total_members ?? 0}</p>
              <p className="text-xs text-muted">sudah bayar</p>
              <div className="mt-3">
                <LightProgress value={breakdown?.percentage ?? 0} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PaymentTab({
  classes,
  periods,
  classFilter,
  setClassFilter,
}: {
  classes: StudentClass[]
  periods: CashPeriod[]
  classFilter: string
  setClassFilter: (value: string) => void
}) {
  const toast = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [periodId, setPeriodId] = useState(periods.find((p) => p.is_active)?.id ? String(periods.find((p) => p.is_active)!.id) : String(periods[0]?.id ?? ''))
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<MemberStatusRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<'paid' | 'unpaid'>('paid')
  const [bulkDate, setBulkDate] = useState(todayISO())

  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<MemberStatusRow | null>(null)
  const [formMemberId, setFormMemberId] = useState<number | null>(null)
  const [formAmount, setFormAmount] = useState('')
  const [formStatus, setFormStatus] = useState<'paid' | 'unpaid'>('paid')
  const [formDate, setFormDate] = useState(todayISO())
  const [formNotes, setFormNotes] = useState('')
  const [receipt, setReceipt] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<MemberStatusRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    memberService.adminList().then(setMembers).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!periodId && periods.length) setPeriodId(String(periods[0].id))
  }, [periods, periodId])

  const load = useCallback(() => {
    if (!periodId) return
    setLoading(true)
    cashService
      .adminPayments({
        class_id: classFilter !== 'all' ? classFilter : undefined,
        period_id: periodId,
        status: status || undefined,
        search: search || undefined,
      })
      .then((response) => setRows(response.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [classFilter, periodId, status, search])

  useEffect(() => {
    load()
    setSelected([])
  }, [load])

  const amount = periods.find((p) => String(p.id) === periodId)?.amount ?? 20000
  const pag = usePagination(rows, 15)

  const runBulk = async () => {
    if (!selected.length || !periodId) return
    setSaving(true)
    try {
      const response = await cashService.bulkPayment({
        member_ids: selected,
        cash_period_id: Number(periodId),
        status: bulkStatus,
        payment_date: bulkDate,
        amount,
      })
      toast.success(response.message)
      setBulkOpen(false)
      setSelected([])
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openForm = (row?: MemberStatusRow) => {
    if (row) {
      setEditingRow(row)
      setFormMemberId(row.member_id)
      setFormAmount(String(row.amount || amount))
      setFormStatus(row.status)
      setFormDate(row.payment_date ?? todayISO())
      setFormNotes(row.notes ?? '')
    } else {
      setEditingRow(null)
      setFormMemberId(null)
      setFormAmount(String(amount))
      setFormStatus('paid')
      setFormDate(todayISO())
      setFormNotes('')
    }
    setReceipt(null)
    setFormOpen(true)
  }

  const submitForm = async () => {
    if (!formMemberId || !periodId) {
      toast.error('Mahasiswa dan periode wajib dipilih.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        member_id: formMemberId,
        cash_period_id: Number(periodId),
        amount: Number(formAmount || amount),
        payment_date: formStatus === 'paid' ? formDate : null,
        status: formStatus,
        notes: formNotes || null,
      }
      if (editingRow?.payment_id) {
        await cashService.updatePayment(editingRow.payment_id, payload, receipt)
        toast.success('Data berhasil diperbarui.')
      } else {
        await cashService.createPayment(payload, receipt)
        toast.success('Pembayaran berhasil disimpan.')
      }
      setFormOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting?.payment_id) return
    setDeleteLoading(true)
    try {
      await cashService.deletePayment(deleting.payment_id)
      toast.success('Data berhasil dihapus.')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleAll = () =>
    setSelected(selected.length === rows.length ? [] : rows.map((row) => row.member_id))

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
          <option value="all">Semua Kelas</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label ?? item.code}
            </option>
          ))}
        </Select>
        <Select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="unpaid">Belum Bayar</option>
        </Select>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari mahasiswa..." tone="light" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{rows.length} mahasiswa pada periode ini.</p>
        <div className="flex gap-2">
          {selected.length > 0 ? (
            <button type="button" onClick={() => setBulkOpen(true)} className="btn-primary btn-sm">
              <CheckCircle2 className="h-4 w-4" /> Tandai ({selected.length})
            </button>
          ) : null}
          <button type="button" onClick={() => openForm()} className="btn-outline-light btn-sm">
            <Plus className="h-4 w-4" /> Tambah Pembayaran
          </button>
        </div>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={8} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada pembayaran pada periode ini." icon={<Wallet className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={selected.length === rows.length && rows.length > 0} onChange={toggleAll} className="h-4 w-4 rounded border-line text-brand focus:ring-brand" />
                  </th>
                  <th className="px-4 py-3">NRP</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal Bayar</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pag.paged.map((row) => (
                  <tr key={row.member_id} className="transition hover:bg-elevated">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.member_id)}
                        onChange={(event) =>
                          setSelected((current) =>
                            event.target.checked ? [...current, row.member_id] : current.filter((id) => id !== row.member_id),
                          )
                        }
                        className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{row.nrp}</td>
                    <td className="px-4 py-3 font-medium text-content">{row.name}</td>
                    <td className="px-4 py-3 text-muted">{row.class}</td>
                    <td className="px-4 py-3 text-right font-mono text-content">{row.status === 'paid' ? formatRupiah(row.amount) : '-'}</td>
                    <td className="px-4 py-3">
                      <LightStatusBadge status={row.status === 'paid' ? 'Lunas' : 'Belum Bayar'} />
                    </td>
                    <td className="px-4 py-3 text-muted">{row.payment_date ? formatDate(row.payment_date) : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openForm(row)} className="btn-outline-light btn-sm">
                          <Pencil className="h-3.5 w-3.5" /> {row.payment_id ? 'Edit' : 'Bayar'}
                        </button>
                        {row.payment_id ? (
                          <button type="button" onClick={() => setDeleting(row)} className="btn-danger btn-sm">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="border-t border-line p-4">
              <Pagination page={pag.page} lastPage={pag.lastPage} total={pag.total} from={pag.from} to={pag.to} onChange={pag.setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Tandai Pembayaran" description={`${selected.length} mahasiswa dipilih`} theme="light" size="sm">
        <div className="grid gap-4">
          <Field label="Status">
            <Select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as 'paid' | 'unpaid')}>
              <option value="paid">Sudah Bayar</option>
              <option value="unpaid">Belum Bayar</option>
            </Select>
          </Field>
          <Field label="Tanggal Bayar">
            <TextInput type="date" value={bulkDate} onChange={(event) => setBulkDate(event.target.value)} disabled={bulkStatus === 'unpaid'} />
          </Field>
          <p className="text-xs text-muted">Nominal: {formatRupiah(amount)} per mahasiswa.</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setBulkOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={runBulk} disabled={saving} className="btn-primary">
            {saving ? 'Memproses...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingRow?.payment_id ? 'Edit Pembayaran' : 'Tambah Pembayaran'} theme="light">
        <div className="grid gap-4">
          {!editingRow?.payment_id ? (
            <Field label="Pilih Mahasiswa">
              <StudentSelect
                members={members}
                classes={classes}
                selectedIds={formMemberId ? [formMemberId] : []}
                onChange={(ids) => setFormMemberId(ids[0] ?? null)}
                multi={false}
                classId={classFilter !== 'all' ? Number(classFilter) : null}
              />
            </Field>
          ) : (
            <div className="rounded-xl border border-line bg-elevated p-4">
              <p className="text-sm font-medium text-content">{editingRow.name}</p>
              <p className="font-mono text-xs text-muted">{editingRow.nrp}</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nominal">
              <TextInput type="number" value={formAmount} onChange={(event) => setFormAmount(event.target.value)} />
            </Field>
            <Field label="Status">
              <Select value={formStatus} onChange={(event) => setFormStatus(event.target.value as 'paid' | 'unpaid')}>
                <option value="paid">Lunas</option>
                <option value="unpaid">Belum Bayar</option>
              </Select>
            </Field>
            <Field label="Tanggal Bayar">
              <TextInput type="date" value={formDate} onChange={(event) => setFormDate(event.target.value)} disabled={formStatus === 'unpaid'} />
            </Field>
            <Field label="Catatan">
              <TextInput value={formNotes} onChange={(event) => setFormNotes(event.target.value)} />
            </Field>
          </div>
          <Field label="Bukti Pembayaran (opsional)">
            <input type="file" accept="image/*,application/pdf" onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setFormOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submitForm} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} theme="light" title="Hapus pembayaran?" message="Data pembayaran ini akan dihapus." loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  )
}

function TransactionTab() {
  const toast = useToast()
  const [rows, setRows] = useState<TransactionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CashTransaction | null>(null)
  const [form, setForm] = useState({ transaction_date: todayISO(), type: 'income' as 'income' | 'expense', category: '', description: '', amount: '' })
  const [receipt, setReceipt] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<CashTransaction | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    cashService
      .adminTransactions({ page, per_page: 15, search: search || undefined, type: type || undefined })
      .then(setRows)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, search, type])

  useEffect(load, [load])

  const openForm = (tx?: CashTransaction) => {
    if (tx) {
      setEditing(tx)
      setForm({ transaction_date: tx.transaction_date, type: tx.type, category: tx.category ?? '', description: tx.description, amount: String(tx.amount) })
    } else {
      setEditing(null)
      setForm({ transaction_date: todayISO(), type: 'income', category: '', description: '', amount: '' })
    }
    setReceipt(null)
    setFormOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload = {
        transaction_date: form.transaction_date,
        type: form.type,
        category: form.category || null,
        description: form.description,
        amount: Number(form.amount),
      }
      if (editing) {
        await cashService.updateTransaction(editing.id, payload, receipt)
        toast.success('Data berhasil diperbarui.')
      } else {
        await cashService.createTransaction(payload, receipt)
        toast.success('Transaksi berhasil disimpan.')
      }
      setFormOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await cashService.deleteTransaction(deleting.id)
      toast.success('Data berhasil dihapus.')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari keterangan..." tone="light" />
          <Select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </Select>
        </div>
        <button type="button" onClick={() => openForm()} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Transaksi
        </button>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={6} />
          </div>
        ) : !rows || rows.data.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada transaksi." icon={<Receipt className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.data.map((tx) => (
                    <tr key={tx.id} className="transition hover:bg-elevated">
                      <td className="px-4 py-3 text-muted">{formatDate(tx.transaction_date)}</td>
                      <td className="px-4 py-3 text-muted">{tx.category ?? '-'}</td>
                      <td className="px-4 py-3 font-medium text-content">{tx.description}</td>
                      <td className="px-4 py-3">
                        <span className={tx.type === 'income' ? 'chip-ok' : 'chip-warn'}>
                          {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className={cn('px-4 py-3 text-right font-mono', tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand')}>
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openForm(tx)} className="btn-outline-light btn-sm">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => setDeleting(tx)} className="btn-danger btn-sm">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line p-4">
              <Pagination page={rows.current_page} lastPage={rows.last_page} total={rows.total} from={rows.from} to={rows.to} onChange={setPage} tone="light" />
            </div>
          </>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Transaksi' : 'Tambah Transaksi'} theme="light">
        <div className="grid gap-4">
          <Field label="Tanggal">
            <TextInput type="date" value={form.transaction_date} onChange={(event) => setForm({ ...form, transaction_date: event.target.value })} />
          </Field>
          <Field label="Jenis">
            <div className="grid grid-cols-2 gap-3">
              {(['income', 'expense'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setForm({ ...form, type: item })}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-medium transition',
                    form.type === item ? 'border-brand bg-brand/10 text-brand' : 'border-line text-muted',
                  )}
                >
                  {item === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Kategori">
            <TextInput value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Kas Angkatan / Sponsor / Konsumsi" />
          </Field>
          <Field label="Keterangan">
            <TextInput value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <Field label="Nominal">
            <TextInput type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </Field>
          <Field label="Bukti (opsional)">
            <input type="file" accept="image/*,application/pdf" onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setFormOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} theme="light" title="Hapus transaksi?" message="Transaksi ini akan dihapus dan saldo dihitung ulang." loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  )
}

function PeriodTab({ periods, reload }: { periods: CashPeriod[]; reload: () => void }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CashPeriod | null>(null)
  const [form, setForm] = useState({ name: '', month: String(new Date().getMonth() + 1), year: String(currentYear()), amount: '20000', due_date: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<CashPeriod | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const openForm = (period?: CashPeriod) => {
    if (period) {
      setEditing(period)
      setForm({ name: period.name, month: String(period.month), year: String(period.year), amount: String(period.amount), due_date: period.due_date ?? '', is_active: period.is_active })
    } else {
      setEditing(null)
      setForm({ name: '', month: String(new Date().getMonth() + 1), year: String(currentYear()), amount: '20000', due_date: '', is_active: true })
    }
    setOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name || `Kas ${monthName(Number(form.month))} ${form.year}`,
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount),
        due_date: form.due_date || null,
        is_active: form.is_active,
      }
      if (editing) {
        await cashService.updatePeriod(editing.id, payload)
        toast.success('Data berhasil diperbarui.')
      } else {
        await cashService.createPeriod(payload)
        toast.success('Periode berhasil ditambahkan.')
      }
      setOpen(false)
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await cashService.deletePeriod(deleting.id)
      toast.success('Data berhasil dihapus.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-content">Periode Kas</h3>
          <p className="mt-1 text-sm text-muted">Buat periode tagihan kas bulanan. Tidak perlu membuat 162 record.</p>
        </div>
        <button type="button" onClick={() => openForm()} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Periode
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {periods.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada periode kas." icon={<CalendarClock className="h-6 w-6" />} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3 text-center">Bulan</th>
                  <th className="px-4 py-3 text-center">Tahun</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3">Jatuh Tempo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {periods.map((period) => (
                  <tr key={period.id} className="transition hover:bg-elevated">
                    <td className="px-4 py-3 font-medium text-content">{period.name}</td>
                    <td className="px-4 py-3 text-center text-muted">{monthName(period.month)}</td>
                    <td className="px-4 py-3 text-center font-mono text-muted">{period.year}</td>
                    <td className="px-4 py-3 text-right font-mono text-content">{formatRupiah(period.amount)}</td>
                    <td className="px-4 py-3 text-muted">{period.due_date ? formatDate(period.due_date) : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={period.is_active ? 'chip-ok' : 'chip-muted'}>{period.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openForm(period)} className="btn-outline-light btn-sm">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => setDeleting(period)} className="btn-danger btn-sm">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Periode' : 'Tambah Periode'} theme="light">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Periode" className="sm:col-span-2">
            <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Kas Oktober 2026" />
          </Field>
          <Field label="Bulan">
            <Select value={form.month} onChange={(event) => setForm({ ...form, month: event.target.value })}>
              {MONTHS.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tahun">
            <TextInput type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
          </Field>
          <Field label="Nominal">
            <TextInput type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </Field>
          <Field label="Jatuh Tempo">
            <TextInput type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} />
          </Field>
          <label className="flex items-center gap-3 text-sm text-content sm:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="h-4 w-4 rounded border-line text-brand focus:ring-brand" />
            Jadikan periode aktif
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} theme="light" title="Hapus periode?" message="Semua pembayaran pada periode ini akan ikut terhapus." loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  )
}

function SettingTab() {
  const toast = useToast()
  const [summary, setSummary] = useState<CashSummary | null>(null)
  const [form, setForm] = useState({ monthly_amount: '', treasurer_name: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([cashService.settings(), cashService.summary()])
      .then(([settings, sum]) => {
        setForm({ monthly_amount: String(settings.monthly_amount), treasurer_name: settings.treasurer_name ?? '', notes: settings.notes ?? '' })
        setSummary(sum)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async () => {
    setSaving(true)
    try {
      await cashService.updateSettings({ monthly_amount: Number(form.monthly_amount), treasurer_name: form.treasurer_name || null, notes: form.notes || null })
      toast.success('Pengaturan kas berhasil disimpan.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Kas Bulanan" value={formatRupiah(Number(form.monthly_amount || 0))} hint="Per mahasiswa" />
        <StatCard label="Total Terkumpul" value={formatRupiah(summary?.collected ?? 0)} tone="emerald" hint={summary?.period?.name ?? '-'} />
        <StatCard label="Saldo Kas" value={formatRupiah(summary?.balance ?? 0)} tone="aqua" />
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-content">Pengaturan Kas</h3>
        {loading ? (
          <LightSkeletonList rows={3} />
        ) : (
          <div className="mt-4 grid gap-4 sm:max-w-md">
            <Field label="Nominal Kas Bulanan">
              <TextInput type="number" value={form.monthly_amount} onChange={(event) => setForm({ ...form, monthly_amount: event.target.value })} />
            </Field>
            <Field label="Nama Bendahara">
              <TextInput value={form.treasurer_name} onChange={(event) => setForm({ ...form, treasurer_name: event.target.value })} />
            </Field>
            <Field label="Catatan">
              <TextInput value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </Field>
            <button type="button" onClick={submit} disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
