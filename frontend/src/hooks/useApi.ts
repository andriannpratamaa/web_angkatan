import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import api, { getErrorMessage } from '../lib/api'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
  setData: Dispatch<SetStateAction<T | null>>
}

export function useApi<T>(url: string | null): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(url))
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!url) {
      setData(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    api
      .get<T>(url)
      .then((response) => {
        if (active) setData(response.data)
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [url, version])

  const refetch = useCallback(() => setVersion((value) => value + 1), [])

  return { data, loading, error, refetch, setData }
}

export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    timer.current = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer.current)
  }, [value, delay])

  return debounced
}
