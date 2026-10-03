import api from '../lib/api'
import type { Member, MembersResponse } from '../lib/types'

export interface MemberQuery {
  class_id?: number | string
  search?: string
  role?: string
}

export interface MemberPayload {
  name: string
  nrp: string
  class_id: number | null
  gender: 'L' | 'P' | null
  role: string
  bio: string | null
  quote: string | null
  instagram: string | null
  linkedin: string | null
  github: string | null
  is_active: boolean
}

function toFormData(payload: Partial<MemberPayload>, photo?: File | null): FormData {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
  })
  if (photo) form.append('photo_file', photo)
  return form
}

export const memberService = {
  list: async (params: MemberQuery = {}) => {
    const { data } = await api.get<MembersResponse>('/members', { params })
    return data
  },
  show: async (slug: string) => {
    const { data } = await api.get<{ data: Member }>(`/members/${slug}`)
    return data.data
  },
  adminList: async (params: MemberQuery = {}) => {
    const { data } = await api.get<{ data: Member[] }>('/admin/members', { params })
    return data.data
  },
  create: async (payload: MemberPayload, photo?: File | null) => {
    const { data } = await api.post('/admin/members', toFormData(payload, photo))
    return data
  },
  update: async (id: number, payload: MemberPayload, photo?: File | null) => {
    const form = toFormData(payload, photo)
    form.append('_method', 'PUT')
    const { data } = await api.post(`/admin/members/${id}`, form)
    return data
  },
  remove: async (id: number) => {
    const { data } = await api.delete(`/admin/members/${id}`)
    return data
  },
}
