import api from '../lib/api'
import type { AdminUser, LoginResponse } from '../lib/types'

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    return data
  },
  me: async () => {
    const { data } = await api.get<{ data: AdminUser }>('/auth/me')
    return data
  },
  logout: async () => {
    await api.post('/auth/logout')
  },
}
