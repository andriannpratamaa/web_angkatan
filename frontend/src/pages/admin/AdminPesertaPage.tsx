import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { timahPanasService } from '../../services/timahPanasService'
import { memberService } from '../../services/memberService'
import { classService } from '../../services/classService'
import { getErrorMessage } from '../../lib/api'
import type { Member, ParticipantsResponse, StudentClass, TimahPanasParticipant } from '../../lib/types'
import { formatDate, todayISO } from '../../lib/format'
import { Avatar } from '../../components/common/Avatar'
import { StudentSelect } from '../../components/admin/StudentSelect'
import { usePagination } from '../../hooks/usePagination'
import { LightEmptyState, LightErrorState, LightProgress, LightSkeletonList } from '../../components/ui/LightFeedback'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Field, Pagination, TextInput, Textarea } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

export default function AdminPesertaPage() {
  const { id = '' } = useParams()
  const toast = useToast()
  const [data, setData] = useState<ParticipantsResponse | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [classes, setClasses] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bulkOpen, setBulkOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkDate, setBulkDate] = useState(todayISO())
  const [bulkNotes, setBulkNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<TimahPanasParticipant | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [proof, setProof] = useState<File | null>(null)

  const [deleting, setDeleting] = useState<TimahPanasParticipant | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      timahPanasService.participants(Number(id)),
      memberService.adminList(),
      classService.adminList(),
    ])
      .then(([participants, memberList, classList]) => {
        setData(participants)
        setMembers(memberList)
        setClasses(classList)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(load, [load])

  const requirement = data?.requirement
  const participants = data?.data ?? []
  const registeredIds = participants.map((p) => p.member_id)
  const pag = usePagination(participants, 15)

  const openEdit = (participant: TimahPanasParticipant) => {
    setEditing(participant)
    setEditDate(participant.participation_date ?? '')
    setEditNotes(participant.notes ?? '')
    setProof(null)
    setEditOpen(true)
  }

  const submitBulk = async () => {
    if (!selectedIds.length) {
      toast.error('Pilih minimal satu mahasiswa.')
      return
    }
    setSaving(true)
    try {
      const response = await timahPanasService.bulkParticipants(Number(id), {
        member_ids: selectedIds,
        participation_date: bulkDate || null,
        notes: bulkNotes || null,
      })
      toast.success(response.message)
      setBulkOpen(false)
      setSelectedIds([])
      setBulkNotes('')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const submitEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await timahPanasService.updateParticipant(Number(id), editing.id, {
        member_id: editing.member_id,
        participation_date: editDate || null,
        notes: editNotes || null,
      }, proof)
      toast.success('Data berhasil diperbarui.')
      setEditOpen(false)
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
      await timahPanasService.deleteParticipant(Number(id), deleting.id)
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
      <Link to="/admin/timahpanas" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Persyaratan
      </Link>

      {error ? <LightErrorState message={error} /> : null}

      {requirement ? (
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-faint">Persyaratan</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-content">{requirement.name}</h2>
            </div>
            <div className="flex gap-6">
              <Stat label="Target" value={requirement.target} />
              <Stat label="Terpenuhi" value={requirement.fulfilled} accent />
              <Stat label="Progress" value={`${Math.round(requirement.percentage)}%`} />
            </div>
          </div>
          <div className="mt-5">
            <LightProgress value={requirement.percentage} tone={requirement.fulfilled >= requirement.target ? 'emerald' : 'brand'} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-5">
        {(data?.class_contribution ?? []).map((item) => (
          <div key={item.id} className="card p-4 text-center">
            <p className="font-display text-sm font-semibold text-content">{item.label}</p>
            <p className="mt-1 font-display text-xl font-bold text-brand">{item.total}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-content">Daftar Peserta</h3>
          <p className="mt-1 text-sm text-muted">{participants.length} mahasiswa terdaftar.</p>
        </div>
        <button type="button" onClick={() => { setSelectedIds([]); setBulkOpen(true) }} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Peserta
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {loading ? (
          <div className="p-5">
            <LightSkeletonList rows={5} />
          </div>
        ) : participants.length === 0 ? (
          <div className="p-5">
            <LightEmptyState title="Belum ada peserta pada persyaratan ini." icon={<Users className="h-6 w-6" />} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">NRP</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pag.paged.map((participant, index) => (
                  <tr key={participant.id} className="transition hover:bg-elevated">
                    <td className="px-4 py-3 font-mono text-xs text-faint">
                      {(pag.page - 1) * pag.perPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={participant.member?.name ?? 'Mahasiswa'} photo={participant.member?.photo} size="sm" />
                        <span className="font-medium text-content">{participant.member?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{participant.member?.nrp}</td>
                    <td className="px-4 py-3 text-muted">{participant.member?.student_class?.label ?? '-'}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(participant.participation_date)}</td>
                    <td className="max-w-[200px] px-4 py-3 text-muted">
                      {participant.notes || '-'}
                      {participant.proof_url ? (
                        <a href={participant.proof_url} target="_blank" rel="noreferrer" className="ml-2 text-xs font-medium text-brand hover:underline">
                          Bukti
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(participant)} className="btn-outline-light btn-sm">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => setDeleting(participant)} className="btn-danger btn-sm">
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

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Tambah Peserta" description="Pilih mahasiswa dari master data. Cari berdasarkan nama, NRP, atau kelas." size="lg" theme="light">
        <StudentSelect members={members} classes={classes} selectedIds={selectedIds} onChange={setSelectedIds} disabledIds={registeredIds} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal Partisipasi">
            <TextInput type="date" value={bulkDate} onChange={(event) => setBulkDate(event.target.value)} />
          </Field>
          <Field label="Keterangan (opsional)">
            <TextInput value={bulkNotes} onChange={(event) => setBulkNotes(event.target.value)} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setBulkOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submitBulk} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : `Tambahkan ${selectedIds.length} Peserta`}
          </button>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Peserta" theme="light">
        {editing ? (
          <div className="grid gap-4">
            <div className="rounded-xl border border-line bg-elevated p-4">
              <p className="text-sm font-medium text-content">{editing.member?.name}</p>
              <p className="font-mono text-xs text-muted">{editing.member?.nrp}</p>
            </div>
            <Field label="Tanggal Partisipasi">
              <TextInput type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} />
            </Field>
            <Field label="Keterangan">
              <Textarea rows={3} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} />
            </Field>
            <Field label="Bukti (opsional)">
              <input type="file" accept="image/*,application/pdf" onChange={(event) => setProof(event.target.files?.[0] ?? null)} className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white" />
            </Field>
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setEditOpen(false)} className="btn-outline-light">Batal</button>
          <button type="button" onClick={submitEdit} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        theme="light"
        title="Hapus peserta?"
        message={<><span className="font-semibold">{deleting?.member?.name}</span> akan dihapus dari persyaratan {requirement?.name}. Jumlah terpenuhi otomatis berubah.</>}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-faint">{label}</p>
      <p className={`font-display text-2xl font-bold ${accent ? 'text-brand' : 'text-content'}`}>{value}</p>
    </div>
  )
}
