import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { contentService } from '../../services/contentService'
import type { ActivityPayload } from '../../services/contentService'
import { getErrorMessage } from '../../lib/api'
import type { Activity } from '../../lib/types'
import { formatDate } from '../../lib/format'
import { usePagination } from '../../hooks/usePagination'
import { LightEmptyState, LightErrorState, LightSkeletonList } from '../../components/ui/LightFeedback'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Field, Pagination, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

interface Form {
  title: string
  event_date: string
  location: string
  description: string
}

const empty: Form = { title: '', event_date: '', location: '', description: '' }

export default function AdminKegiatanPage() {
  const toast = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [image, setImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Activity | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    contentService
      .adminActivities()
      .then(setActivities)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const pag = usePagination(activities, 15)

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setImage(null)
    setOpen(true)
  }

  const openEdit = (item: Activity) => {
    setEditing(item)
    setForm({ title: item.title, event_date: item.event_date ?? '', location: item.location ?? '', description: item.description ?? '' })
    setImage(null)
    setOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload: ActivityPayload = {
        title: form.title,
        event_date: form.event_date || null,
        location: form.location || null,
        description: form.description || null,
      }
      if (editing) {
        await contentService.updateActivity(editing.id, payload, image)
        toast.success('Data berhasil diperbarui.')
      } else {
        await contentService.createActivity(payload, image)
        toast.success('Kegiatan berhasil ditambahkan.')
      }
      setOpen(false)
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
      await contentService.deleteActivity(deleting.id)
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-content">Kegiatan</h2>
          <p className="mt-1 text-sm text-muted">Kelola agenda dan kegiatan angkatan.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Kegiatan
        </button>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={5} />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada kegiatan." icon={<CalendarDays className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pag.paged.map((item, index) => (
                  <tr key={item.id} className="transition hover:bg-elevated">
                    <td className="px-4 py-3 font-mono text-xs text-faint">
                      {(pag.page - 1) * pag.perPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-content">{item.title}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(item.event_date)}</td>
                    <td className="px-4 py-3 text-muted">{item.location || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(item)} className="btn-outline-light btn-sm">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => setDeleting(item)} className="btn-danger btn-sm">
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Kegiatan' : 'Tambah Kegiatan'} theme="light">
        <div className="grid gap-4">
          <Field label="Judul Kegiatan">
            <TextInput value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal">
              <TextInput type="date" value={form.event_date} onChange={(event) => setForm({ ...form, event_date: event.target.value })} />
            </Field>
            <Field label="Lokasi">
              <TextInput value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            </Field>
          </div>
          <Field label="Gambar (opsional)">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white" />
          </Field>
          <Field label="Deskripsi">
            <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Mengunggah...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} theme="light" title="Hapus kegiatan?" message={<>{deleting?.title} akan dihapus.</>} loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  )
}
