import api from '../lib/api'
import { buildFormData } from '../lib/formData'
import type {
  ParticipantsResponse,
  TimahPanasDetailResponse,
  TimahPanasParticipant,
  TimahPanasResponse,
} from '../lib/types'

export interface RequirementPayload {
  name: string
  description: string | null
  target: number
  sort_order: number
  is_active: boolean
}

export interface ParticipantPayload {
  member_id: number
  participation_date: string | null
  notes: string | null
}

export const timahPanasService = {
  list: async (includeInactive = false) => {
    const { data } = await api.get<TimahPanasResponse>('/timah-panas', {
      params: includeInactive ? { include_inactive: 1 } : {},
    })
    return data
  },
  show: async (slug: string) => {
    const { data } = await api.get<TimahPanasDetailResponse>(`/timah-panas/${slug}`)
    return data
  },

  create: async (payload: RequirementPayload) => {
    const { data } = await api.post('/admin/timah-panas', payload)
    return data
  },
  update: async (id: number, payload: RequirementPayload) => {
    const { data } = await api.put(`/admin/timah-panas/${id}`, payload)
    return data
  },
  remove: async (id: number) => {
    const { data } = await api.delete(`/admin/timah-panas/${id}`)
    return data
  },

  participants: async (requirementId: number) => {
    const { data } = await api.get<ParticipantsResponse>(
      `/admin/timah-panas/${requirementId}/participants`,
    )
    return data
  },
  addParticipant: async (requirementId: number, payload: ParticipantPayload, proof?: File | null) => {
    const form = buildFormData({ ...payload }, { proof_file: proof })
    const { data } = await api.post(`/admin/timah-panas/${requirementId}/participants`, form)
    return data
  },
  bulkParticipants: async (
    requirementId: number,
    payload: { member_ids: number[]; participation_date?: string | null; notes?: string | null },
  ) => {
    const { data } = await api.post(
      `/admin/timah-panas/${requirementId}/participants/bulk`,
      payload,
    )
    return data
  },
  updateParticipant: async (
    requirementId: number,
    participantId: number,
    payload: ParticipantPayload,
    proof?: File | null,
  ) => {
    const form = buildFormData({ ...payload }, { proof_file: proof }, 'PUT')
    const { data } = await api.post(
      `/admin/timah-panas/${requirementId}/participants/${participantId}`,
      form,
    )
    return data
  },
  deleteParticipant: async (requirementId: number, participantId: number) => {
    const { data } = await api.delete(
      `/admin/timah-panas/${requirementId}/participants/${participantId}`,
    )
    return data
  },
}

export type { TimahPanasParticipant }
