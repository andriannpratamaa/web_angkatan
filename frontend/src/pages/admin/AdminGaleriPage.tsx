import { useCallback, useEffect, useState } from 'react'
import { Images, Pencil, Plus, Trash2 } from 'lucide-react'
import { contentService } from '../../services/contentService'
import type { GalleryPayload } from '../../services/contentService'
import { getErrorMessage } from '../../lib/api'
import type { Gallery } from '../../lib/types'
import { MediaThumb } from '../../components/common/MediaThumb'
import { usePagination } from '../../hooks/usePagination'
import { LightEmptyState, LightErrorState, LightSkeletonList } from '../../components/ui/LightFeedback'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Field, Pagination, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

interface Form {
  title: string
  category: string
  description: string
  sort_order: string
}

const empty: Form = { title: '', category: '', description: '', sort_order: '0' }

export default function AdminGaleriPage() {
  const toast = useToast()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Gallery | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [image, setImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Gallery | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    contentService
      .adminGalleries()
      .then(setGalleries)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const pag = usePagination(galleries, 15)

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setImage(null)
    setOpen(true)
  }

  const openEdit = (item: Gallery) => {
    setEditing(item)
    setForm({ title: item.title, category: item.category ?? '', description: item.description ?? '', sort_order: String(item.sort_order) })
    setImage(null)
    setOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload: GalleryPayload = {
        title: form.title,
        category: form.category || null,
        description: form.description || null,
        sort_order: Number(form.sort_order),
      }
      if (editing) {
        await contentService.updateGallery(editing.id, payload, image)
        toast.success('Data berhasil diperbarui.')
      } else {
        await contentService.createGallery(payload, image)
        toast.success('Galeri berhasil ditambahkan.')
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
      await contentService.deleteGallery(deleting.id)
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
          <h2 className="font-display text-xl font-semibold text-content">Galeri</h2>
          <p className="mt-1 text-sm text-muted">Upload gambar ke Cloudinary dan kelola dokumentasi.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Galeri
        </button>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={5} />
          </div>
        ) : galleries.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada data galeri." icon={<Images className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Kategori</th>
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
                      <MediaThumb title={item.title} image={item.image_url} rounded="rounded-lg" className="h-12 w-20" />
                    </td>
                    <td className="px-4 py-3 font-medium text-content">{item.title}</td>
                    <td className="px-4 py-3 text-muted">{item.category || '-'}</td>
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Galeri' : 'Tambah Galeri'} theme="light">
        <div className="grid gap-4">
          <Field label="Judul">
            <TextInput value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <TextInput value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            </Field>
            <Field label="Urutan">
              <TextInput type="number" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} />
            </Field>
          </div>
          <Field label="Gambar (jpg/png/webp, maks 5MB)">
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

      <ConfirmDialog open={Boolean(deleting)} theme="light" title="Hapus galeri?" message={<>{deleting?.title} akan dihapus beserta gambarnya di Cloudinary.</>} loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  )
}
