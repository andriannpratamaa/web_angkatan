import { useCallback, useEffect, useState } from 'react'
import { Clock3, Pencil, Plus, Trash2 } from 'lucide-react'
import { contentService } from '../../services/contentService'
import type { TimelinePayload } from '../../services/contentService'
import { getErrorMessage } from '../../lib/api'
import type { TimelineItem } from '../../lib/types'
import { usePagination } from '../../hooks/usePagination'
import { LightEmptyState, LightErrorState, LightSkeletonList } from '../../components/ui/LightFeedback'
import { Pagination } from '../../components/ui/Controls'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Field, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

interface Form {
  period: string
  title: string
  description: string
  sort_order: string
}

const empty: Form = { period: '', title: '', description: '', sort_order: '0' }

export default function AdminTimelinePage() {
  const toast = useToast()
  const [timelines, setTimelines] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TimelineItem | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<TimelineItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const pag = usePagination(timelines, 15)

  const load = useCallback(() => {
    setLoading(true)
    contentService
      .adminTimelines()
      .then(setTimelines)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: TimelineItem) => {
    setEditing(item)
    setForm({ period: item.period, title: item.title, description: item.description ?? '', sort_order: String(item.sort_order) })
    setOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload: TimelinePayload = {
        period: form.period,
        title: form.title,
        description: form.description || null,
        sort_order: Number(form.sort_order),
      }
      if (editing) {
        await contentService.updateTimeline(editing.id, payload)
        toast.success('Data berhasil diperbarui.')
      } else {
        await contentService.createTimeline(payload)
        toast.success('Timeline berhasil ditambahkan.')
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
      await contentService.deleteTimeline(deleting.id)
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
          <h2 className="font-display text-xl font-semibold text-content">Timeline</h2>
          <p className="mt-1 text-sm text-muted">Kelola timeline perjalanan angkatan.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Timeline
        </button>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={5} />
          </div>
        ) : timelines.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada timeline." icon={<Clock3 className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3 text-center">Urutan</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {pag.paged.map((item, index) => (
                    <tr key={item.id} className="transition hover:bg-elevated">
                      <td className="px-4 py-3 font-mono text-xs text-faint">
                        {(pag.page - 1) * pag.perPage + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="chip-info">{item.period}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-content">{item.title}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted">{item.sort_order}</td>
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Timeline' : 'Tambah Timeline'}>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Periode">
              <TextInput placeholder="Contoh: Agustus 2026" value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })} />
            </Field>
            <Field label="Urutan">
              <TextInput type="number" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} />
            </Field>
          </div>
          <Field label="Judul">
            <TextInput value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label="Deskripsi">
            <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} title="Hapus timeline?" message={<>{deleting?.title} akan dihapus dari timeline.</>} loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  )
}
