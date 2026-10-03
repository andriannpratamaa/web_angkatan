import api from '../lib/api'
import type { DashboardData, UploadResult } from '../lib/types'

export const dashboardService = {
  get: async () => {
    const { data } = await api.get<{ data: DashboardData }>('/admin/dashboard')
    return data.data
  },
}

export const uploadService = {
  upload: async (file: File, folder: string, type: 'image' | 'document' = 'image') => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', folder)
    form.append('type', type)
    const { data } = await api.post<{ message: string; data: UploadResult }>('/admin/uploads', form)
    return data.data
  },
  remove: async (publicId: string, resourceType = 'image') => {
    const { data } = await api.delete('/admin/uploads', {
      data: { public_id: publicId, resource_type: resourceType },
    })
    return data
  },
}
