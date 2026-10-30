import { useMemo } from 'react'
import { cn } from '@/utils/classNames'

export function Pagination({
  page = 1,
  pageSize = 10,
  totalItems = 0,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  showSummary = true,
  className = '',
}) {
  const totalPages =
    propTotalPages !== undefined ? propTotalPages : Math.max(1, Math.ceil(totalItems / pageSize))

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

  // Generate pagination buttons with smart ellipsis
  const pagesList = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = [1]
    const leftThreshold = Math.max(2, page - 1)
    const rightThreshold = Math.min(totalPages - 1, page + 1)

    if (leftThreshold > 2) {
      pages.push('...')
    }

    for (let i = leftThreshold; i <= rightThreshold; i++) {
      pages.push(i)
    }

    if (rightThreshold < totalPages - 1) {
      pages.push('...')
    }

    pages.push(totalPages)
    return pages
  }, [page, totalPages])

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 text-xs text-slate-600 border-t border-slate-200 bg-white select-none',
        className
      )}
    >
      {/* Left: Summary */}
      {showSummary && (
        <div className="text-2xs text-slate-500">
          Affichage de <span className="font-medium text-slate-800">{startItem}</span> à{' '}
          <span className="font-medium text-slate-800">{endItem}</span> sur{' '}
          <span className="font-medium text-slate-800">{totalItems}</span> résultats
        </div>
      )}

      {/* Center/Right: Navigation & Page Size */}
      <div className="flex items-center gap-3">
        {/* Page size selector */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-2xs">
            <span className="text-slate-500">Lignes :</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded border border-slate-300 bg-white px-2 text-2xs text-slate-700 hover:border-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons list */}
        <div className="flex items-center gap-1">
          {/* Previous */}
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
            title="Page précédente"
          >
            ‹
          </button>

          {/* Numbered buttons */}
          {pagesList.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1 text-slate-400 text-2xs">
                  …
                </span>
              )
            }

            const isCurrent = p === page
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange?.(p)}
                className={cn(
                  'inline-flex h-7 min-w-[28px] px-1.5 items-center justify-center rounded text-2xs font-medium transition-colors',
                  isCurrent
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                )}
              >
                {p}
              </button>
            )
          })}

          {/* Next */}
          <button
            type="button"
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => onPageChange?.(page + 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
            title="Page suivante"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
