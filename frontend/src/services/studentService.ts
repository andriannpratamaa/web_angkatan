import api from '../lib/api'
import { buildFormData } from '../lib/formData'
import type { PortalCash, StudentLoginResponse, StudentMember } from '../lib/types'

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
  uploadProof: async (periodId: number, file: File) => {
    const form = buildFormData({}, { proof_file: file })
    const { data } = await api.post<{
      message: string
      data: { payment_id: number; status: string; receipt_url: string }
    }>(`/portal/cash/${periodId}/pay`, form)
    return data
  },
}
