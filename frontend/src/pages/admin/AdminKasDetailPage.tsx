import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Wallet,
  RotateCcw,
} from 'lucide-react'
import { cashService } from '../../services/cashService'
import { getErrorMessage } from '../../lib/api'
import type { CashPeriod, MemberStatusRow, StudentClass } from '../../lib/types'
import { formatDate, formatRupiah } from '../../lib/format'
import { LightStatusBadge } from '../../components/common/StatusBadge'
import { LightEmptyState, LightErrorState, LightSkeletonList } from '../../components/ui/LightFeedback'
import { Modal } from '../../components/ui/Modal'
import { Field, SearchInput, Select } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

export default function AdminKasDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()

  const [periods, setPeriods] = useState<CashPeriod[]>([])
  const [rows, setRows] = useState<MemberStatusRow[]>([])
  const [classInfo, setClassInfo] = useState<StudentClass | null>(null)

  const [periodId, setPeriodId] = useState(searchParams.get('period') ?? '')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<MemberStatusRow | null>(null)
  const [editStatus, setEditStatus] = useState<'paid' | 'unpaid'>('paid')
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    cashService.periods()
      .then((data) => setPeriods(Array.isArray(data) ? data : []))
      .catch(() => setPeriods([]))
  }, [])

  const loadClassInfo = useCallback(async () => {
    if (!classId) return
    try {
      const list = await cashService.adminClasses()
      const cls = list.find((c: StudentClass) => c.id === Number(classId))
      if (cls) setClassInfo(cls)
    } catch (err) {
      console.error('Failed to load class info:', err)
    }
  }, [])

  useEffect(() => { loadClassInfo() }, [loadClassInfo])

  const load = useCallback(async () => {
    if (!periodId || !classId) return
    setLoading(true)
    setError(null)
    try {
      const response = await cashService.adminPayments({
        class_id: Number(classId),
        period_id: Number(periodId),
        status: status || undefined,
        search: search || undefined,
      })
      setRows(response.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [classId, periodId, status, search])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (periodId) params.period = periodId
    if (status) params.status = status
    if (search) params.search = search
    setSearchParams(params, { replace: true })
  }, [periodId, status, search, setSearchParams])

  // Auto-select active period if none selected
  useEffect(() => {
    const periodsArray = Array.isArray(periods) ? periods : []
    if (!periodId && periodsArray.length > 0) {
      const active = periodsArray.find((p) => p.is_active)
      setPeriodId(active ? String(active.id) : String(periodsArray[0].id))
    }
  }, [periods, periodId])

  if (!classId) return null

  const periodsArray = Array.isArray(periods) ? periods : []
  const activePeriod = periodsArray.find((p) => String(p.id) === periodId)

  // Edit payment status
  const handleEditClick = (row: MemberStatusRow) => {
    setEditingRow(row)
    setEditStatus(row.status === 'paid' ? 'paid' : 'unpaid')
    setEditModalOpen(true)
  }

  const handleStatusChange = async () => {
    if (!editingRow) return
    setEditLoading(true)
    try {
      await cashService.updatePaymentStatus(editingRow.payment_id!, editStatus)
      toast.success(`Status berhasil diubah ke ${editStatus === 'paid' ? 'Lunas' : 'Belum Bayar'}`)
      // Update local state
      setRows(rows.map((row) =>
        row.member_id === editingRow.member_id
          ? { ...row, status: editStatus, status_label: editStatus === 'paid' ? 'LUNAS' : 'BELUM BAYAR' }
          : row
      ))
      setEditModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setEditLoading(false)
    }
  }

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return <div className="p-5"><LightSkeletonList rows={8} /></div>
    }
    if (rows.length === 0) {
      return <div className="p-5"><LightEmptyState title="Belum ada data pembayaran." icon={<Wallet className="h-6 w-6" />} /></div>
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">NRP</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3 text-right">Nominal</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal Bayar</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.member_id} className="transition hover:bg-elevated">
                <td className="px-4 py-3 font-mono text-xs text-muted">{row.nrp}</td>
                <td className="px-4 py-3 font-medium text-content">{row.name}</td>
                <td className="px-4 py-3 text-right font-mono text-content">{row.status === 'paid' ? formatRupiah(row.amount) : '-'}</td>
                <td className="px-4 py-3"><LightStatusBadge status={row.status === 'paid' ? 'Lunas' : 'Belum Bayar'} /></td>
                <td className="px-4 py-3 text-muted">{row.payment_date ? formatDate(row.payment_date) : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleEditClick(row)}
                    className="btn-primary btn-sm"
                  >
                    {row.status === 'paid' ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Batalkan Bayar
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Tandai Lunas
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Show edit modal if open
  if (editModalOpen && editingRow) {
    return (
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Ubah Status: ${editingRow.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Ubah status pembayaran untuk <strong className="text-content">{editingRow.name}</strong> (NRP: {editingRow.nrp})
          </p>
          <p className="text-sm text-muted">
            Periode: {activePeriod?.name ?? '-'} · Nominal: {formatRupiah(editingRow.amount)}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value as 'paid' | 'unpaid')}>
                <option value="paid">Lunas</option>
                <option value="unpaid">Belum Bayar</option>
              </Select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setEditModalOpen(false)} className="btn-outline-light">
              Batal
            </button>
            <button
              type="button"
              onClick={handleStatusChange}
              disabled={editLoading}
              className="btn-primary"
            >
              {editLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/kas" className="flex items-center gap-2 text-sm text-muted hover:text-brand mb-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Kas
          </Link>
          <h1 className="font-display text-2xl font-bold text-content">
            Detail Kas {classInfo?.label ?? `Kelas ${classId}`}
          </h1>
          <p className="mt-1 text-sm text-muted">Rekap pembayaran per mahasiswa</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>{period.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="unpaid">Belum Bayar</option>
        </Select>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari mahasiswa..." tone="light" />
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-content">
                Periode: {activePeriod?.name ?? 'Pilih periode'}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {rows.length} mahasiswa · Lunas: {rows.filter((r) => r.status === 'paid').length} · Belum: {rows.filter((r) => r.status === 'unpaid').length}
              </p>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}