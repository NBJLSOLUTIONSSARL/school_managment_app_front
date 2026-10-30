import { useState, useCallback, useMemo } from 'react'

/**
 * Hook to manage local or server pagination state.
 *
 * @param {Object} [initial]
 * @param {number} [initial.initialPage=1]
 * @param {number} [initial.initialPageSize=10]
 * @param {number} [initial.initialTotal=0]
 */
export function usePagination({ initialPage = 1, initialPageSize = 10, initialTotal = 0 } = {}) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(initialTotal)

  const totalPages = useMemo(() => {
    return totalItems > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 0
  }, [totalItems, pageSize])

  const hasNext = page < totalPages
  const hasPrevious = page > 1

  const nextPage = useCallback(() => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev))
  }, [])

  const goToPage = useCallback(
    (newPage) => {
      const target = Math.max(1, Math.min(newPage, totalPages || 1))
      setPage(target)
    },
    [totalPages]
  )

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize)
    setPage(1) // Reset to first page on size change
  }, [])

  const syncWithNormalizedPage = useCallback((normalized) => {
    if (!normalized) return
    if (typeof normalized.page === 'number') setPage(normalized.page)
    if (typeof normalized.pageSize === 'number') setPageSize(normalized.pageSize)
    if (typeof normalized.totalItems === 'number') setTotalItems(normalized.totalItems)
  }, [])

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext,
    hasPrevious,
    nextPage,
    prevPage,
    goToPage,
    setPage,
    setPageSize: changePageSize,
    setTotalItems,
    syncWithNormalizedPage,
  }
}

export default usePagination
