import { useEffect, useState } from 'react'
import { CheckCircle2, Database, Globe, Server } from 'lucide-react'
import { cashService } from '../../services/cashService'
import { getErrorMessage } from '../../lib/api'
import { formatRupiah } from '../../lib/format'
import { StatCard } from '../../components/common/StatCard'
import { LightErrorState, LightSkeletonCards } from '../../components/ui/LightFeedback'
import { Field, TextInput } from '../../components/ui/Controls'
import { useToast } from '../../components/ui/Toast'

export default function AdminSettingsPage() {
  const toast = useToast()
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
  const [form, setForm] = useState({ monthly_amount: '', treasurer_name: '', notes: '' })
  const [summaryBalance, setSummaryBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([cashService.settings(), cashService.summary()])
      .then(([settings, summary]) => {
        setForm({ monthly_amount: String(settings.monthly_amount), treasurer_name: settings.treasurer_name ?? '', notes: settings.notes ?? '' })
        setSummaryBalance(summary.balance)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const submit = async () => {
    setSaving(true)
    try {
      await cashService.updateSettings({
        monthly_amount: Number(form.monthly_amount),
        treasurer_name: form.treasurer_name || null,
        notes: form.notes || null,
      })
      toast.success('Pengaturan berhasil disimpan.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-content">Settings</h2>
        <p className="mt-1 text-sm text-muted">Konfigurasi kas dan informasi sistem.</p>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      {loading ? (
        <LightSkeletonCards count={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Status Backend" value={error ? 'Terputus' : 'Terhubung'} hint={apiUrl} icon={<Server className="h-4 w-4" />} tone={error ? 'flame' : 'emerald'} />
          <StatCard label="Saldo Kas" value={formatRupiah(summaryBalance)} icon={<Database className="h-4 w-4" />} />
          <StatCard label="Media" value="Cloudinary" hint="Foto & dokumen" icon={<Globe className="h-4 w-4" />} tone="aqua" />
        </div>
      )}

      <div className="card p-5 sm:p-6">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-content">
          <CheckCircle2 className="h-4 w-4 text-brand" />
          Pengaturan Kas
        </h3>
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
      </div>
    </div>
  )
}