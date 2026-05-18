import { useCallback, useMemo, useState } from "react"

type UsePaginationOptions = {
  initialPageSize?: number
}

export function usePagination<T>(items: T[], options: UsePaginationOptions = {}) {
  const [page, setPageState] = useState(1)
  const [pageSize, setPageSizeState] = useState(options.initialPageSize ?? 10)
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + pageSize, totalItems)
  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [endIndex, items, startIndex]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(Math.min(Math.max(1, nextPage), totalPages))
    },
    [totalPages]
  )

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize)
    setPageState(1)
  }, [])

  const nextPage = useCallback(() => {
    setPageState(Math.min(currentPage + 1, totalPages))
  }, [currentPage, totalPages])

  const previousPage = useCallback(() => {
    setPageState(Math.max(currentPage - 1, 1))
  }, [currentPage])

  const resetPage = useCallback(() => {
    setPageState(1)
  }, [])

  return {
    items,
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    resetPage,
  }
}
