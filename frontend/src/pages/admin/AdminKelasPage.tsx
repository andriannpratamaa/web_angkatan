import { useEffect, useState } from 'react'
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { classService } from '../../services/classService'
import type { StudentClass } from '../../lib/types'
import { getErrorMessage } from '../../lib/api'
import { LightEmptyState, LightErrorState, LightSkeletonList } from '../../components/ui/LightFeedback'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Field, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

interface Form {
  name: string
  code: string
  description: string
}

const empty: Form = { name: '', code: '', description: '' }

export default function AdminKelasPage() {
  const toast = useToast()
  const [classes, setClasses] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<StudentClass | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<StudentClass | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = () => {
    setLoading(true)
    classService
      .adminList()
      .then(setClasses)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: StudentClass) => {
    setEditing(item)
    setForm({ name: item.name, code: item.code, description: item.description ?? '' })
    setOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload = { name: form.name, code: form.code, description: form.description || null }
      if (editing) {
        await classService.update(editing.id, payload)
        toast.success('Data berhasil diperbarui.')
      } else {
        await classService.create(payload)
        toast.success('Kelas berhasil ditambahkan.')
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
      await classService.remove(deleting.id)
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
          <h2 className="font-display text-xl font-semibold text-content">Data Kelas</h2>
          <p className="mt-1 text-sm text-muted">{classes.length} kelas Teknik Otomasi 2026.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Kelas
        </button>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={5} />
          </div>
        ) : classes.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada kelas." icon={<GraduationCap className="h-6 w-6" />} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Kelas</th>
                  <th className="px-4 py-3 text-center">Jumlah Mahasiswa</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {classes.map((item, index) => (
                  <tr key={item.id} className="transition hover:bg-elevated">
                    <td className="px-4 py-3 font-mono text-xs text-faint">{index + 1}</td>
                    <td className="px-4 py-3">
                      <span className="chip-info">{item.label ?? item.code}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-content">{item.name}</td>
                    <td className="px-4 py-3 text-center font-mono text-content">{item.members_count ?? 0}</td>
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
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Kelas' : 'Tambah Kelas'} theme="light">
        <div className="grid gap-4">
          <Field label="Nama Kelas">
            <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="D4 Teknik Otomasi 1A" />
          </Field>
          <Field label="Kode Kelas" hint="Contoh: TO-1A">
            <TextInput value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          </Field>
          <Field label="Deskripsi">
            <Textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        theme="light"
        title="Hapus kelas?"
        message={<>{deleting?.name} akan dihapus.</>}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
