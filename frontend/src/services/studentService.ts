import api from '../lib/api'
import { buildFormData } from '../lib/formData'
import type { PortalCash, StudentLoginResponse, StudentMember, SnapTokenResponse, PaymentStatusResponse } from '../lib/types'

export interface StudentProfilePayload {
  name: string
  gender: 'L' | 'P' | null
  quote: string | null
  instagram: string | null
  linkedin: string | null
}

export const studentService = {
  login: async (nrp: string, password: string) => {
    const { data } = await api.post<StudentLoginResponse>('/portal/login', { nrp, password })
    return data
  },
  me: async () => {
    const { data } = await api.get<{ data: StudentMember }>('/portal/me')
    return data.data
  },
  logout: async () => {
    await api.post('/portal/logout')
  },
  changePassword: async (payload: {
    current_password: string
    password: string
    password_confirmation: string
  }) => {
    const { data } = await api.post<{ message: string; member: StudentMember }>(
      '/portal/me/password',
      payload,
    )
    return data
  },
  updateProfile: async (payload: StudentProfilePayload, photo?: File | null) => {
    const form = buildFormData({ ...payload }, { photo_file: photo })
    const { data } = await api.post<{ message: string; data: StudentMember }>(
      '/portal/profile',
      form,
    )
    return data
  },
  cash: async (params?: { page?: number; per_page?: number }) => {
    const { data } = await api.get<{ data: PortalCash }>('/portal/cash', { params })
    return data.data
  },
  createPayment: async (periodId: number): Promise<SnapTokenResponse> => {
    const { data } = await api.post<{ data: SnapTokenResponse }>(`/portal/cash/${periodId}/pay`)
    return data.data
  },
  checkPaymentStatus: async (periodId: number): Promise<PaymentStatusResponse> => {
    const { data } = await api.get<{ data: PaymentStatusResponse }>(`/portal/cash/${periodId}/status`)
    return data.data
  },
  cancelPayment: async (periodId: number): Promise<{ message: string; data: { tagihan_id: number; status: string } }> => {
    const { data } = await api.post(`/portal/cash/${periodId}/cancel`)
    return data
  },
}
