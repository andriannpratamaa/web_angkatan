import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { StudentMember } from '../lib/types'
import { studentTokenStore } from '../lib/api'
import { studentService } from '../services/studentService'

interface StudentAuthContextValue {
  member: StudentMember | null
  loading: boolean
  login: (nrp: string, password: string) => Promise<StudentMember>
  logout: () => Promise<void>
  setMember: (member: StudentMember) => void
}

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null)

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMemberState] = useState<StudentMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentTokenStore.get()) {
      setLoading(false)
      return
    }

    studentService
      .me()
      .then((data) => setMemberState(data))
      .catch(() => studentTokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (nrp: string, password: string) => {
    const response = await studentService.login(nrp, password)
    studentTokenStore.set(response.token)
    setMemberState(response.member)
    return response.member
  }, [])

  const logout = useCallback(async () => {
    try {
      await studentService.logout()
    } catch {
      // ignore
    }
    studentTokenStore.clear()
    setMemberState(null)
  }, [])

  const setMember = useCallback((next: StudentMember) => setMemberState(next), [])

  return (
    <StudentAuthContext.Provider value={{ member, loading, login, logout, setMember }}>
      {children}
    </StudentAuthContext.Provider>
  )
}

export function useStudentAuth(): StudentAuthContextValue {
  const context = useContext(StudentAuthContext)
  if (!context) throw new Error('useStudentAuth harus digunakan di dalam StudentAuthProvider')
  return context
}
