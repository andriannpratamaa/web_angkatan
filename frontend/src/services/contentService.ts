import api from '../lib/api'
import { buildFormData } from '../lib/formData'
import type { Activity, Gallery, TimelineItem } from '../lib/types'

export interface GalleryPayload {
  title: string
  category: string | null
  description: string | null
  sort_order: number
  image_url?: string | null
}

export interface ActivityPayload {
  title: string
  description: string | null
  location: string | null
  event_date: string | null
  image_url?: string | null
}

export interface TimelinePayload {
  period: string
  title: string
  description: string | null
  sort_order: number
}

export const contentService = {
  galleries: async () => {
    const { data } = await api.get<{ data: Gallery[] }>('/galleries')
    return data.data
  },
  activities: async () => {
    const { data } = await api.get<{ data: Activity[] }>('/activities')
    return data.data
  },
  timelines: async () => {
    const { data } = await api.get<{ data: TimelineItem[] }>('/timelines')
    return data.data
  },

  adminGalleries: async () => {
    const { data } = await api.get<{ data: Gallery[] }>('/admin/galleries')
    return data.data
  },
  createGallery: async (payload: GalleryPayload, image?: File | null) => {
    const form = buildFormData({ ...payload }, { image_file: image })
    const { data } = await api.post('/admin/galleries', form)
    return data
  },
  updateGallery: async (id: number, payload: GalleryPayload, image?: File | null) => {
    const form = buildFormData({ ...payload }, { image_file: image }, 'PUT')
    const { data } = await api.post(`/admin/galleries/${id}`, form)
    return data
  },
  deleteGallery: async (id: number) => {
    const { data } = await api.delete(`/admin/galleries/${id}`)
    return data
  },

  adminActivities: async () => {
    const { data } = await api.get<{ data: Activity[] }>('/admin/activities')
    return data.data
  },
  createActivity: async (payload: ActivityPayload, image?: File | null) => {
    const form = buildFormData({ ...payload }, { image_file: image })
    const { data } = await api.post('/admin/activities', form)
    return data
  },
  updateActivity: async (id: number, payload: ActivityPayload, image?: File | null) => {
    const form = buildFormData({ ...payload }, { image_file: image }, 'PUT')
    const { data } = await api.post(`/admin/activities/${id}`, form)
    return data
  },
  deleteActivity: async (id: number) => {
    const { data } = await api.delete(`/admin/activities/${id}`)
    return data
  },

  adminTimelines: async () => {
    const { data } = await api.get<{ data: TimelineItem[] }>('/admin/timelines')
    return data.data
  },
  createTimeline: async (payload: TimelinePayload) => {
    const { data } = await api.post('/admin/timelines', payload)
    return data
  },
  updateTimeline: async (id: number, payload: TimelinePayload) => {
    const { data } = await api.put(`/admin/timelines/${id}`, payload)
    return data
  },
  deleteTimeline: async (id: number) => {
    const { data } = await api.delete(`/admin/timelines/${id}`)
    return data
  },
}
