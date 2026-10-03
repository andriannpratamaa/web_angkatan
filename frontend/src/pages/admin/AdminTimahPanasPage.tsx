import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Target, Trash2, Users } from 'lucide-react'
import api, { getErrorMessage } from '../../lib/api'
import { useApi } from '../../hooks/useApi'
import { usePagination } from '../../hooks/usePagination'
import type { TimahPanasRequirement, TimahPanasResponse } from '../../lib/types'
import { LightProgress, LightEmptyState, LightErrorState, LightSkeletonList } from '../../components/ui/LightFeedback'
import { LightStatusBadge } from '../../components/common/StatusBadge'
import { Pagination } from '../../components/ui/Controls'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Field, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

interface RequirementForm {
  name: string
  target: string
  description: string
  sort_order: string
  is_active: boolean
}

const emptyForm: RequirementForm = {
  name: '',
  target: '1',
  description: '',
  sort_order: '0',
  is_active: true,
}

export default function AdminTimahPanasPage() {
  const { data, loading, error, refetch } = useApi<TimahPanasResponse>('/timah-panas?include_inactive=1')
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TimahPanasRequirement | null>(null)
  const [form, setForm] = useState<RequirementForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<TimahPanasRequirement | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const requirements = data?.data ?? []
  const pag = usePagination(requirements, 15)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (requirement: TimahPanasRequirement) => {
    setEditing(requirement)
    setForm({
      name: requirement.name,
      target: String(requirement.target),
      description: requirement.description ?? '',
      sort_order: String(requirement.sort_order),
      is_active: requirement.is_active,
    })
    setFormOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        target: Number(form.target),
        description: form.description || null,
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
      }
      if (editing) {
        await api.put(`/admin/timah-panas/${editing.id}`, payload)
        toast.success('Data berhasil diperbarui.')
      } else {
        await api.post('/admin/timah-panas', payload)
        toast.success('Persyaratan berhasil ditambahkan.')
      }
      setFormOpen(false)
      refetch()
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await api.delete(`/admin/timah-panas/${deleting.id}`)
      toast.success('Data berhasil dihapus.')
      setDeleting(null)
      refetch()
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-content">Persyaratan Timah Panas</h2>
          <p className="mt-1 text-sm text-muted">Kelola persyaratan, target, dan peserta Timah Panas.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Persyaratan
        </button>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={5} />
          </div>
        ) : requirements.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada persyaratan." icon={<Target className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Persyaratan</th>
                    <th className="px-4 py-3 text-center">Target</th>
                    <th className="px-4 py-3 text-center">Terpenuhi</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {pag.paged.map((requirement, index) => (
                    <tr key={requirement.id} className="transition hover:bg-elevated">
                      <td className="px-4 py-3 font-mono text-xs text-faint">
                        {(pag.page - 1) * pag.perPage + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-content">{requirement.name}</p>
                        {!requirement.is_active ? <span className="text-xs text-faint">(nonaktif)</span> : null}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-content">{requirement.target}</td>
                      <td className="px-4 py-3 text-center font-mono text-brand">{requirement.fulfilled}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <LightProgress value={requirement.percentage} tone={requirement.fulfilled >= requirement.target ? 'emerald' : 'brand'} />
                          <span className="w-10 shrink-0 text-right font-mono text-xs text-muted">{Math.round(requirement.percentage)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <LightStatusBadge status={requirement.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/timahpanas/${requirement.id}/peserta`} className="btn-primary btn-sm">
                            <Users className="h-3.5 w-3.5" /> Peserta
                          </Link>
                          <button type="button" onClick={() => openEdit(requirement)} className="btn-outline-light btn-sm">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => setDeleting(requirement)} className="btn-danger btn-sm">
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
              <Pagination page={pag.page} lastPage={pag.lastPage} total={pag.total} from={pag.from} to={pag.to} onChange={pag.setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Persyaratan' : 'Tambah Persyaratan'}>
        <div className="grid gap-4">
          <Field label="Nama Persyaratan">
            <TextInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Target">
              <TextInput type="number" min={1} value={form.target} onChange={(event) => setForm((current) => ({ ...current, target: event.target.value }))} />
            </Field>
            <Field label="Urutan">
              <TextInput type="number" min={0} value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))} />
            </Field>
          </div>
          <Field label="Deskripsi (opsional)">
            <Textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <label className="flex items-center gap-3 text-sm text-content">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 rounded border-line text-brand focus:ring-brand" />
            Aktifkan persyaratan ini
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setFormOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Hapus persyaratan?"
        message={<>Persyaratan <span className="font-semibold text-content">{deleting?.name}</span> beserta seluruh peserta di dalamnya akan dihapus.</>}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
