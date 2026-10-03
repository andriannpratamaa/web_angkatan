import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Receipt,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useApi, useDebounce } from '../../hooks/useApi'
import { usePagination } from '../../hooks/usePagination'
import type {
  CashSummary,
  ClassBreakdown,
  MemberStatusRow,
  TransactionResponse,
} from '../../lib/types'
import { cn, formatDate, formatRupiah, MONTHS } from '../../lib/format'
import {
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonCards,
  SkeletonList,
} from '../../components/ui/Feedback'
import { StatCard } from '../../components/common/StatCard'
import { Pagination, SearchInput } from '../../components/ui/Controls'
import { StatusBadge } from '../../components/common/StatusBadge'
import { ProgressBar } from '../../components/ui/Feedback'

const PER_PAGE = 15

export default function KasPage() {
  const [periodId, setPeriodId] = useState<string>('')
  const [classId, setClassId] = useState<number | 'all'>('all')

  const summaryApi = useApi<{ data: CashSummary }>(
    `/cash/summary${periodId ? `?period_id=${periodId}` : ''}`,
  )
  const classesApi = useApi<{ data: ClassBreakdown[] }>(
    `/cash/classes${periodId ? `?period_id=${periodId}` : ''}`,
  )

  const summary = summaryApi.data?.data
  const classes = classesApi.data?.data ?? []
  const periods = summary?.periods ?? []

  return (
    <div className="pt-[72px]">
      <section className="relative overflow-hidden border-b border-line py-16">
        <div className="absolute inset-0 blueprint opacity-60" />
        <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="container-x relative">
          <span className="eyebrow">
            <Wallet className="h-3.5 w-3.5" />
            Transparansi Keuangan
          </span>
          <h1 className="heading-xl mt-4">
            Kas <span className="text-brand">Angkatan</span>
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-muted">Teknik Otomasi 2026</p>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Rekap pembayaran kas dan transaksi keuangan TO26, dapat dilihat per kelas.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-xs text-muted">
              <Eye className="h-4 w-4 text-brand" />
              Mode lihat saja
            </div>
            <select
              value={periodId}
              onChange={(event) => setPeriodId(event.target.value)}
              className="field w-auto min-w-[200px]"
            >
              {periods.length === 0 ? <option value="">Periode aktif</option> : null}
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="border-b border-line py-12">
        <div className="container-x">
          <h2 className="heading-md">Ringkasan Pembayaran</h2>
          <p className="mt-2 text-sm text-muted">
            {summary?.period ? `Periode ${summary.period.name}` : 'Periode aktif'} - dihitung otomatis.
          </p>

          {summaryApi.error ? (
            <div className="mt-6">
              <ErrorState message={summaryApi.error} />
            </div>
          ) : null}

          <div className="mt-8">
            {summaryApi.loading || !summary ? (
              <SkeletonCards count={4} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total Mahasiswa"
                  value={`${summary.total_members}`}
                  icon={<Users className="h-4 w-4" />}
                  tone="brand"
                />
                <StatCard
                  label="Sudah Bayar"
                  value={`${summary.paid}`}
                  hint={`${summary.percentage}% dari angkatan`}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  tone="emerald"
                />
                <StatCard
                  label="Belum Bayar"
                  value={`${summary.unpaid}`}
                  icon={<XCircle className="h-4 w-4" />}
                  tone="flame"
                />
                <StatCard
                  label="Saldo Kas"
                  value={formatRupiah(summary.balance)}
                  hint={`Terkumpul ${formatRupiah(summary.collected)}`}
                  icon={<Wallet className="h-4 w-4" />}
                  tone="aqua"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-line py-12">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="heading-md">Kas Per Kelas</h2>
              <p className="mt-2 text-sm text-muted">Klik kelas untuk melihat detail mahasiswa.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setClassId('all')}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                  classId === 'all' ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-brand',
                )}
              >
                Semua
              </button>
              {classes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setClassId(item.id)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                    classId === item.id ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-brand',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {classesApi.loading
              ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-40 w-full rounded-2xl" />)
              : classes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setClassId(item.id)}
                    className={cn(
                      'card card-hover p-5 text-left',
                      classId === item.id && 'border-brand',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-bold text-content">{item.label}</span>
                      <span className="font-mono text-xs text-faint">{item.percentage}%</span>
                    </div>
                    <p className="mt-3 font-display text-2xl font-bold text-brand">
                      {item.paid} <span className="text-sm font-medium text-faint">/ {item.total_members}</span>
                    </p>
                    <p className="text-xs text-muted">Sudah bayar</p>
                    <div className="mt-3">
                      <ProgressBar value={item.percentage} tone={item.paid >= item.total_members ? 'emerald' : 'brand'} />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {item.unpaid} mahasiswa belum bayar
                    </p>
                  </button>
                ))}
          </div>
        </div>
      </section>

      <MemberStatusSection periodId={periodId} classId={classId} />
      <TransactionsSection />
    </div>
  )
}

function MemberStatusSection({ periodId, classId }: { periodId: string; classId: number | 'all' }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const debounced = useDebounce(search)

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (classId !== 'all') params.set('class_id', String(classId))
    if (periodId) params.set('period_id', periodId)
    if (status) params.set('status', status)
    if (debounced) params.set('search', debounced)
    const query = params.toString()
    return `/cash/payments${query ? `?${query}` : ''}`
  }, [classId, periodId, status, debounced])

  const { data, loading, error } = useApi<{ data: MemberStatusRow[]; meta: Record<string, number> }>(url)
  const rows = data?.data ?? []
  const pag = usePagination(rows, 15)

  return (
    <section className="border-b border-line py-12">
      <div className="container-x">
        <h2 className="heading-md">Status Kas Mahasiswa</h2>
        <p className="mt-2 text-sm text-muted">Status pembayaran kas setiap mahasiswa pada periode ini.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari mahasiswa..." />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="field">
            <option value="">Semua Status</option>
            <option value="paid">Lunas</option>
            <option value="unpaid">Belum Bayar</option>
          </select>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="chip-ok">{data?.meta.paid ?? 0} Lunas</span>
            <span className="chip-warn">{data?.meta.unpaid ?? 0} Belum</span>
          </div>
        </div>

        {error ? (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <SkeletonList rows={6} />
          ) : rows.length === 0 ? (
            <EmptyState title="Belum ada data pembayaran pada periode ini." icon={<Wallet className="h-6 w-6" />} />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-elevated font-mono text-[11px] uppercase tracking-widest text-faint">
                      <tr>
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">NRP</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Kelas</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                        <th className="px-4 py-3">Tanggal Bayar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {pag.paged.map((row, index) => (
                        <tr key={row.member_id} className="transition hover:bg-elevated">
                          <td className="px-4 py-3 font-mono text-xs text-faint">
                            {(pag.page - 1) * pag.perPage + index + 1}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted">{row.nrp}</td>
                          <td className="px-4 py-3 font-medium text-content">{row.name}</td>
                          <td className="px-4 py-3 text-muted">{row.class}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={row.status === 'paid' ? 'Lunas' : 'Belum Bayar'} />
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-content">
                            {row.status === 'paid' ? formatRupiah(row.amount) : '-'}
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {row.payment_date ? formatDate(row.payment_date) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                {pag.paged.map((row) => (
                  <div key={row.member_id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-content">{row.name}</p>
                        <p className="font-mono text-xs text-muted">{row.nrp}</p>
                      </div>
                      <StatusBadge status={row.status === 'paid' ? 'Lunas' : 'Belum Bayar'} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">Kelas</p>
                        <p className="text-sm text-content">{row.class}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">Tanggal Bayar</p>
                        <p className="text-sm text-content">
                          {row.payment_date ? formatDate(row.payment_date) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Pagination page={pag.page} lastPage={pag.lastPage} total={pag.total} from={pag.from} to={pag.to} onChange={pag.setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function TransactionsSection() {
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search)

  useEffect(() => setPage(1), [debounced, month, year, type])

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (debounced) params.set('search', debounced)
    if (month) params.set('month', month)
    if (year) params.set('year', year)
    if (type) params.set('type', type)
    params.set('page', String(page))
    params.set('per_page', String(PER_PAGE))
    return `/cash/transactions?${params.toString()}`  }, [debounced, month, year, type, page])

  const { data, loading, error } = useApi<TransactionResponse>(url)
  const transactions = data?.data ?? []
  const years = data?.filters.years ?? []

  return (
    <section className="py-12">
      <div className="container-x">
        <h2 className="heading-md">Tabel Transaksi Kas</h2>
        <p className="mt-2 text-sm text-muted">Riwayat pemasukan dan pengeluaran kas angkatan.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari keterangan..." />
          <select value={month} onChange={(event) => setMonth(event.target.value)} className="field">
            <option value="">Semua Bulan</option>
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
          <select value={year} onChange={(event) => setYear(event.target.value)} className="field">
            <option value="">Semua Tahun</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={type} onChange={(event) => setType(event.target.value)} className="field">
            <option value="">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>

        {error ? (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <SkeletonList rows={6} />
          ) : transactions.length === 0 ? (
            <EmptyState title="Belum ada transaksi." icon={<Receipt className="h-6 w-6" />} />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-elevated font-mono text-[11px] uppercase tracking-widest text-faint">
                      <tr>
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Keterangan</th>
                        <th className="px-4 py-3">Jenis</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                        <th className="px-4 py-3 text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {transactions.map((transaction, index) => (
                        <tr key={transaction.id} className="transition hover:bg-elevated">
                          <td className="px-4 py-3 font-mono text-xs text-faint">
                            {(data!.current_page - 1) * PER_PAGE + index + 1}
                          </td>
                          <td className="px-4 py-3 text-muted">{formatDate(transaction.transaction_date)}</td>
                          <td className="px-4 py-3 text-content">{transaction.description}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                                transaction.type === 'income'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-brand/10 text-brand',
                              )}
                            >
                              {transaction.type === 'income' ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                          </td>
                          <td
                            className={cn(
                              'px-4 py-3 text-right font-mono',
                              transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand',
                            )}
                          >
                            {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-muted">
                            {formatRupiah(transaction.balance_after)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-content">{transaction.description}</p>
                        <p className="mt-1 font-mono text-xs text-faint">{formatDate(transaction.transaction_date)}</p>
                      </div>
                      <span
                        className={cn(
                          'font-mono text-sm',
                          transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand',
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-faint">Saldo</span>
                      <span className="font-mono text-sm text-muted">{formatRupiah(transaction.balance_after)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Pagination
                  page={data!.current_page}
                  lastPage={data!.last_page}
                  total={data!.total}
                  from={data!.from}
                  to={data!.to}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
