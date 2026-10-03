import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, GraduationCap, Target, Users, Wallet, XCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import type { DashboardData } from '../../lib/types'
import { formatRupiah, formatShortDate } from '../../lib/format'
import { LightStatCard } from '../../components/common/StatCard'
import { LightErrorState, LightProgress, LightSkeleton, LightSkeletonCards } from '../../components/ui/LightFeedback'

export default function AdminDashboard() {
  const { data, loading, error } = useApi<{ data: DashboardData }>('/admin/dashboard')
  const stats = data?.data

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-gradient-to-br from-black via-brand-deep to-brand p-6 text-white sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">Dashboard Admin</p>
        <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Selamat datang di panel TO26</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75">
          Kelola master data, kas per kelas, Timah Panas, dan konten website. Semua perubahan langsung
          tersinkron dengan halaman publik.
        </p>
      </div>

      {error ? <LightErrorState message={error} /> : null}

      {loading || !stats ? (
        <LightSkeletonCards count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LightStatCard label="Total Mahasiswa" value={`${stats.total_members}`} icon={<Users className="h-4 w-4" />} hint={`${stats.total_classes} kelas`} />
          <LightStatCard label="Saldo Kas" value={formatRupiah(stats.balance)} icon={<Wallet className="h-4 w-4" />} hint={`Terkumpul ${formatRupiah(stats.collected)}`} tone="emerald" />
          <LightStatCard label="Sudah Bayar" value={`${stats.paid}`} icon={<CheckCircle2 className="h-4 w-4" />} hint={`${stats.percentage}% - ${stats.period?.name ?? '-'}`} />
          <LightStatCard label="Belum Bayar" value={`${stats.unpaid}`} icon={<XCircle className="h-4 w-4" />} hint="Periode aktif" tone="flame" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-content">Status Kas per Kelas</h3>
            <Link to="/admin/kas" className="text-xs font-semibold text-brand hover:underline">Kelola</Link>
          </div>
          <div className="mt-5 space-y-5">
            {loading || !stats ? (
              <LightSkeleton className="h-40 w-full" />
            ) : (
              stats.classes.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-content">{item.label}</span>
                    <span className="font-mono text-xs text-muted">{item.paid}/{item.total_members} bayar</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <LightProgress value={item.percentage} tone={item.paid >= item.total_members ? 'emerald' : 'brand'} />
                    <span className="w-12 shrink-0 text-right font-mono text-xs text-muted">{item.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-content">Progress Timah Panas</h3>
            <Link to="/admin/timahpanas" className="text-xs font-semibold text-brand hover:underline">Kelola</Link>
          </div>
          <div className="mt-5 space-y-5">
            {loading || !stats ? (
              <LightSkeleton className="h-40 w-full" />
            ) : (
              stats.requirements.map((requirement) => (
                <div key={requirement.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-content">{requirement.name}</span>
                    <span className="font-mono text-xs text-muted">{requirement.fulfilled}/{requirement.target}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <LightProgress value={requirement.percentage} tone={requirement.fulfilled >= requirement.target ? 'emerald' : 'brand'} />
                    <span className="w-10 shrink-0 text-right font-mono text-xs text-muted">{Math.round(requirement.percentage)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-content">Transaksi Terbaru</h3>
            <Link to="/admin/kas" className="text-xs font-semibold text-brand hover:underline">Kelola Kas</Link>
          </div>
          <div className="mt-5 space-y-3">
            {loading || !stats ? (
              <LightSkeleton className="h-40 w-full" />
            ) : stats.recent_transactions.length === 0 ? (
              <p className="text-sm text-muted">Belum ada transaksi.</p>
            ) : (
              stats.recent_transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-elevated px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-content">{transaction.description}</p>
                    <p className="font-mono text-xs text-faint">{formatShortDate(transaction.transaction_date)}</p>
                  </div>
                  <span className={transaction.type === 'income' ? 'whitespace-nowrap font-mono text-sm text-emerald-600 dark:text-emerald-400' : 'whitespace-nowrap font-mono text-sm text-brand'}>
                    {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Kelola Mahasiswa', to: '/admin/mahasiswa', icon: Users },
            { label: 'Data Kelas', to: '/admin/kelas', icon: GraduationCap },
            { label: 'Persyaratan Timah Panas', to: '/admin/timahpanas', icon: Target },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="group flex items-center justify-between rounded-2xl border border-line bg-card p-5 transition hover:border-brand/50">
              <span className="flex items-center gap-3 font-display text-sm font-semibold text-content">
                <item.icon className="h-4 w-4 text-brand" />
                {item.label}
              </span>
              <ArrowRight className="h-4 w-4 text-faint transition group-hover:translate-x-1 group-hover:text-brand" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
