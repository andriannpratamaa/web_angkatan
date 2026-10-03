import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { memberService } from '../../services/memberService'
import type { MemberPayload } from '../../services/memberService'
import { classService } from '../../services/classService'
import { usePagination } from '../../hooks/usePagination'
import type { Member, StudentClass } from '../../lib/types'
import { getErrorMessage } from '../../lib/api'
import { Avatar } from '../../components/common/Avatar'
import { LightEmptyState, LightErrorState, LightSkeletonList } from '../../components/ui/LightFeedback'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Field, Pagination, SearchInput, Select, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

interface FormState {
  name: string
  nrp: string
  class_id: string
  gender: string
  role: string
  bio: string
  quote: string
  instagram: string
  linkedin: string
  github: string
  is_active: boolean
}

const emptyForm: FormState = {
  name: '',
  nrp: '',
  class_id: '',
  gender: '',
  role: 'Anggota',
  bio: '',
  quote: '',
  instagram: '',
  linkedin: '',
  github: '',
  is_active: true,
}

export default function AdminMahasiswaPage() {
  const toast = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [classes, setClasses] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [photo, setPhoto] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Member | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([memberService.adminList(), classService.adminList()])
      .then(([memberList, classList]) => {
        setMembers(memberList)
        setClasses(classList)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return members.filter((member) => {
      const matchesClass = !classFilter || member.class_id === Number(classFilter)
      const matchesSearch =
        !query || member.name.toLowerCase().includes(query) || member.nrp.toLowerCase().includes(query)
      return matchesClass && matchesSearch
    })
  }, [members, search, classFilter])

  const pag = usePagination(filtered, 15)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setPhoto(null)
    setOpen(true)
  }

  const openEdit = (member: Member) => {
    setEditing(member)
    setForm({
      name: member.name,
      nrp: member.nrp,
      class_id: member.class_id ? String(member.class_id) : '',
      gender: member.gender ?? '',
      role: member.role,
      bio: member.bio ?? '',
      quote: member.quote ?? '',
      instagram: member.instagram ?? '',
      linkedin: member.linkedin ?? '',
      github: member.github ?? '',
      is_active: member.is_active,
    })
    setPhoto(null)
    setOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload: MemberPayload = {
        name: form.name,
        nrp: form.nrp,
        class_id: form.class_id ? Number(form.class_id) : null,
        gender: form.gender === 'L' || form.gender === 'P' ? form.gender : null,
        role: form.role || 'Anggota',
        bio: form.bio || null,
        quote: form.quote || null,
        instagram: form.instagram || null,
        linkedin: form.linkedin || null,
        github: form.github || null,
        is_active: form.is_active,
      }
      if (editing) {
        await memberService.update(editing.id, payload, photo)
        toast.success('Data berhasil diperbarui.')
      } else {
        await memberService.create(payload, photo)
        toast.success('Mahasiswa berhasil ditambahkan.')
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
      await memberService.remove(deleting.id)
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
          <h2 className="font-display text-xl font-semibold text-content">Data Mahasiswa</h2>
          <p className="mt-1 text-sm text-muted">{members.length} mahasiswa. Perubahan otomatis tersinkron ke seluruh fitur.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama / NRP..." tone="light" />
        <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
          <option value="">Semua Kelas</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label ?? item.code}
            </option>
          ))}
        </Select>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={8} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada data mahasiswa." icon={<Users className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Mahasiswa</th>
                  <th className="px-4 py-3">NRP</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pag.paged.map((member, index) => (
                  <tr key={member.id} className="transition hover:bg-elevated">
                    <td className="px-4 py-3 font-mono text-xs text-faint">
                      {(pag.page - 1) * pag.perPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} photo={member.photo} size="sm" />
                        <div>
                          <p className="font-medium text-content">{member.name}</p>
                          <p className="text-xs text-faint">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{member.nrp}</td>
                    <td className="px-4 py-3 text-muted">{member.student_class?.label ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={member.is_active ? 'chip-ok' : 'chip-warn'}>
                        {member.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(member)} className="btn-outline-light btn-sm">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => setDeleting(member)} className="btn-danger btn-sm">
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'} size="lg" theme="light">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap">
            <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="NRP">
            <TextInput value={form.nrp} onChange={(event) => setForm({ ...form, nrp: event.target.value })} />
          </Field>
          <Field label="Kelas">
            <Select value={form.class_id} onChange={(event) => setForm({ ...form, class_id: event.target.value })}>
              <option value="">Belum ditentukan</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.label ?? item.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jenis Kelamin">
            <Select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
              <option value="">-</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </Select>
          </Field>
          <Field label="Role">
            <TextInput value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
          </Field>
          <Field label="Foto (jpg/png/webp, maks 5MB)">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
          </Field>
          {editing?.photo && !photo ? (
            <div className="sm:col-span-2 flex items-center gap-3">
              <Avatar name={editing.name} photo={editing.photo} size="md" />
              <span className="text-xs text-muted">Foto saat ini</span>
            </div>
          ) : null}
          <Field label="Instagram">
            <TextInput value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} />
          </Field>
          <Field label="LinkedIn">
            <TextInput value={form.linkedin} onChange={(event) => setForm({ ...form, linkedin: event.target.value })} />
          </Field>
          <Field label="GitHub">
            <TextInput value={form.github} onChange={(event) => setForm({ ...form, github: event.target.value })} />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <Textarea rows={3} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
          </Field>
          <Field label="Quote" className="sm:col-span-2">
            <Textarea rows={2} value={form.quote} onChange={(event) => setForm({ ...form, quote: event.target.value })} />
          </Field>
          <label className="flex items-center gap-3 text-sm text-content sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
              className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            Mahasiswa aktif
          </label>
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
        title="Hapus mahasiswa?"
        message={<>Data <span className="font-semibold">{deleting?.name}</span> akan dihapus. Disarankan menonaktifkan (is_active) bila ingin menjaga histori.</>}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
