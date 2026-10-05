import axios from 'axios'

const TOKEN_KEY = 'to26_token'
const STUDENT_TOKEN_KEY = 'to26_student_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const studentTokenStore = {
  get: () => localStorage.getItem(STUDENT_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(STUDENT_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(STUDENT_TOKEN_KEY),
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
  timeout: 25000,
})

api.interceptors.request.use((config) => {
  const url = config.url ?? ''
  const token = url.startsWith('/portal') ? studentTokenStore.get() : tokenStore.get()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined

    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first?.length) return first[0]
    }

    if (data?.message) return data.message

    if (!error.response) {
      return 'Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan.'
    }
  }

  return 'Terjadi kesalahan. Silakan coba kembali.'
}

export default api
