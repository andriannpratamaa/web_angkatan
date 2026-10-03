import api from '../lib/api'
import { buildFormData } from '../lib/formData'
import type {
  CashPayment,
  CashPeriod,
  CashSummary,
  CashTransaction,
  CashOverview,
  ClassBreakdown,
  MemberStatusRow,
  TransactionResponse,
} from '../lib/types'

export interface PaymentPayload {
  member_id: number
  cash_period_id: number
  amount: number
  payment_date: string | null
  status: 'paid' | 'unpaid'
  notes: string | null
}

export interface PeriodPayload {
  name: string
  month: number
  year: number
  amount: number
  due_date: string | null
  is_active: boolean
}

export interface TransactionPayload {
  transaction_date: string
  type: 'income' | 'expense'
  category: string | null
  description: string
  amount: number
}

export const cashService = {
  summary: async (periodId?: number) => {
    const { data } = await api.get<{ data: CashSummary }>('/cash/summary', {
      params: { period_id: periodId },
    })
    return data.data
  },
  classes: async (periodId?: number) => {
    const { data } = await api.get<{ data: ClassBreakdown[]; period: CashPeriod | null }>(
      '/cash/classes',
      { params: { period_id: periodId } },
    )
    return data
  },
  payments: async (params: Record<string, unknown> = {}) => {
    const { data } = await api.get<{ data: MemberStatusRow[]; meta: Record<string, number> }>(
      '/cash/payments',
      { params },
    )
    return data
  },
  transactions: async (params: Record<string, unknown> = {}) => {
    const { data } = await api.get<TransactionResponse>('/cash/transactions', { params })
    return data
  },

  adminOverview: async (periodId?: number) => {
    const { data } = await api.get<{ data: CashOverview }>('/admin/cash/overview', {
      params: { period_id: periodId },
    })
    return data.data
  },
  adminPayments: async (params: Record<string, unknown> = {}) => {
    const { data } = await api.get<{ data: MemberStatusRow[]; meta: Record<string, number> }>(
      '/admin/cash/payments',
      { params },
    )
    return data
  },
  periods: async () => {
    const { data } = await api.get<{ data: CashPeriod[] }>('/admin/cash/periods')
    return data.data
  },
  createPeriod: async (payload: PeriodPayload) => {
    const { data } = await api.post('/admin/cash/periods', payload)
    return data
  },
  updatePeriod: async (id: number, payload: PeriodPayload) => {
    const { data } = await api.put(`/admin/cash/periods/${id}`, payload)
    return data
  },
  deletePeriod: async (id: number) => {
    const { data } = await api.delete(`/admin/cash/periods/${id}`)
    return data
  },

  createPayment: async (payload: PaymentPayload, receipt?: File | null) => {
    const form = buildFormData({ ...payload }, { receipt_file: receipt })
    const { data } = await api.post('/admin/cash/payments', form)
    return data
  },
  updatePayment: async (id: number, payload: PaymentPayload, receipt?: File | null) => {
    const form = buildFormData({ ...payload }, { receipt_file: receipt }, 'PUT')
    const { data } = await api.post(`/admin/cash/payments/${id}`, form)
    return data
  },
  bulkPayment: async (payload: {
    member_ids: number[]
    cash_period_id: number
    amount?: number
    payment_date?: string | null
    status?: 'paid' | 'unpaid'
    notes?: string | null
  }) => {
    const { data } = await api.post('/admin/cash/payments/bulk', payload)
    return data
  },
  deletePayment: async (id: number) => {
    const { data } = await api.delete(`/admin/cash/payments/${id}`)
    return data
  },

  adminTransactions: async (params: Record<string, unknown> = {}) => {
    const { data } = await api.get<TransactionResponse>('/admin/cash/transactions', { params })
    return data
  },
  createTransaction: async (payload: TransactionPayload, receipt?: File | null) => {
    const form = buildFormData({ ...payload }, { receipt_file: receipt })
    const { data } = await api.post('/admin/cash/transactions', form)
    return data
  },
  updateTransaction: async (id: number, payload: TransactionPayload, receipt?: File | null) => {
    const form = buildFormData({ ...payload }, { receipt_file: receipt }, 'PUT')
    const { data } = await api.post(`/admin/cash/transactions/${id}`, form)
    return data
  },
  deleteTransaction: async (id: number) => {
    const { data } = await api.delete(`/admin/cash/transactions/${id}`)
    return data
  },

  settings: async () => {
    const { data } = await api.get<{ data: { id: number; monthly_amount: number; treasurer_name: string | null; notes: string | null } }>(
      '/admin/settings/cash',
    )
    return data.data
  },
  updateSettings: async (payload: { monthly_amount: number; treasurer_name: string | null; notes: string | null }) => {
    const { data } = await api.put('/admin/settings/cash', payload)
    return data
  },
}

export type { CashPayment, CashTransaction }
