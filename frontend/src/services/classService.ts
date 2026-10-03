import api from '../lib/api'
import type { StudentClass } from '../lib/types'

export const classService = {
  list: async () => {
    const { data } = await api.get<{ data: StudentClass[] }>('/classes')
    return data.data
  },
  adminList: async () => {
    const { data } = await api.get<{ data: StudentClass[] }>('/admin/classes')
    return data.data
  },
  create: async (payload: Partial<StudentClass>) => {
    const { data } = await api.post('/admin/classes', payload)
    return data
  },
  update: async (id: number, payload: Partial<StudentClass>) => {
    const { data } = await api.put(`/admin/classes/${id}`, payload)
    return data
  },
  remove: async (id: number) => {
    const { data } = await api.delete(`/admin/classes/${id}`)
    return data
  },
}
