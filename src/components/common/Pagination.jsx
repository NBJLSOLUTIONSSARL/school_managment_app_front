import { useMemo } from 'react'
import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'

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
  const { t } = useI18n()

  const totalPages =
    propTotalPages !== undefined ? propTotalPages : Math.max(1, Math.ceil(totalItems / pageSize))

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

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
        'flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 select-none sm:flex-row',
        className
      )}
    >
      {showSummary && (
        <div className="text-2xs text-slate-500" aria-live="polite">
          {t('pagination.summary', { start: startItem, end: endItem, total: totalItems })}
        </div>
      )}

      <div className="flex items-center gap-3">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-2xs">
            <span className="text-slate-500">{t('pagination.rows')}</span>
            <select
              aria-label={t('pagination.rows')}
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

        <nav aria-label={t('pagination.label')} className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            title={t('pagination.previousPage')}
            aria-label={t('pagination.previousPage')}
          >
            <span aria-hidden="true" className="inline-block rtl:rotate-180">
              ‹
            </span>
          </button>

          {pagesList.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1 text-2xs text-slate-400">
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
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={t('pagination.page', { page: p })}
                className={cn(
                  'inline-flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-2xs font-medium transition-colors',
                  isCurrent
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                {p}
              </button>
            )
          })}

          <button
            type="button"
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => onPageChange?.(page + 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            title={t('pagination.nextPage')}
            aria-label={t('pagination.nextPage')}
          >
            <span aria-hidden="true" className="inline-block rtl:rotate-180">
              ›
            </span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default Pagination
