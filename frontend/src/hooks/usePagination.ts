import { useEffect, useMemo, useState } from 'react'

export interface PaginationState<T> {
  page: number
  setPage: (page: number) => void
  lastPage: number
  paged: T[]
  total: number
  from: number | null
  to: number | null
  perPage: number
}

export function usePagination<T>(items: T[], perPage = 15): PaginationState<T> {
  const [page, setPage] = useState(1)

  const lastPage = Math.max(1, Math.ceil(items.length / perPage))

  useEffect(() => {
    if (page > lastPage) setPage(1)
  }, [lastPage, page])

  const paged = useMemo(
    () => items.slice((page - 1) * perPage, page * perPage),
    [items, page, perPage],
  )

  return {
    page,
    setPage,
    lastPage,
    paged,
    total: items.length,
    from: items.length === 0 ? null : (page - 1) * perPage + 1,
    to: Math.min(page * perPage, items.length),
    perPage,
  }
}
