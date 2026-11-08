import { useState, useMemo } from 'react'
import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'
import { Pagination } from './Pagination'
import { Loader } from './Loader'
import { EmptyState } from './EmptyState'

export function PaginatedTable({
  columns = [],
  data = [],
  page = 1,
  pageSize = 10,
  totalItems = 0,
  totalPages,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDirection = 'asc',
  onSort,
  onRowClick,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  toolbar,
  className = '',
  rowKey = 'id',
}) {
  const { t } = useI18n()
  const [internalSortBy, setInternalSortBy] = useState(sortBy)
  const [internalSortDir, setInternalSortDir] = useState(sortDirection)

  const activeSortBy = onSort ? sortBy : internalSortBy
  const activeSortDir = onSort ? sortDirection : internalSortDir

  const handleHeaderClick = (col) => {
    if (!col.sortable) return

    if (onSort) {
      onSort(col.key)
    } else {
      if (internalSortBy === col.key) {
        setInternalSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setInternalSortBy(col.key)
        setInternalSortDir('asc')
      }
    }
  }

  const displayRows = useMemo(() => {
    if (onPageChange) {
      return data
    }

    const sorted = [...data]
    if (activeSortBy) {
      sorted.sort((a, b) => {
        const valA = a[activeSortBy]
        const valB = b[activeSortBy]
        if (valA === valB) return 0
        if (valA === null || valA === undefined) return 1
        if (valB === null || valB === undefined) return -1
        const cmp = valA < valB ? -1 : 1
        return activeSortDir === 'asc' ? cmp : -cmp
      })
    }
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [data, onPageChange, page, pageSize, activeSortBy, activeSortDir])

  const calculatedTotal = totalItems || data.length
  const resolvedEmptyTitle = emptyTitle ?? t('common.emptyTitle')
  const resolvedEmptyDescription = emptyDescription ?? t('common.emptyDescription')

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-2xs',
        className
      )}
    >
      {toolbar && <div className="border-b border-[#E2E8F0] bg-white p-3">{toolbar}</div>}

      <div className="relative min-h-[140px] overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-2xs">
            <Loader text={t('common.loadingData')} />
          </div>
        )}

        <table className="w-full border-collapse text-start text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[10px] uppercase tracking-wider text-[#64748B]">
              <th
                scope="col"
                className="w-10 px-3 py-2 text-center text-[10px] font-bold text-[#94A3B8]"
              >
                #
              </th>
              {columns.map((col) => {
                const isSorted = activeSortBy === col.key
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-end'
                      : 'text-start'

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      col.sortable
                        ? isSorted
                          ? activeSortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    style={{ width: col.width || 'auto' }}
                    className={cn(
                      'px-3 py-2 font-bold tracking-tight text-[#64748B]',
                      alignClass
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleHeaderClick(col)}
                        className={cn(
                          'inline-flex items-center gap-1.5 select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 cursor-pointer',
                          alignClass === 'text-end' && 'justify-end',
                          alignClass === 'text-center' && 'justify-center'
                        )}
                      >
                        <span>{col.label}</span>
                        <span className="text-[10px] text-[#94A3B8]" aria-hidden="true">
                          {isSorted ? (activeSortDir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    ) : (
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          alignClass === 'text-end' && 'justify-end',
                          alignClass === 'text-center' && 'justify-center'
                        )}
                      >
                        <span>{col.label}</span>
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {displayRows.length > 0 ? (
              displayRows.map((row, index) => {
                const key = row[rowKey] || index
                const rowNumber = (page - 1) * pageSize + index + 1
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, index)}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              onRowClick(row, index)
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    className={cn(
                      'transition-colors hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F172A]/20',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    <td className="px-3 py-2 text-center font-mono text-[10px] text-[#94A3B8]">
                      {rowNumber}
                    </td>
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-end'
                            : 'text-start'

                      return (
                        <td key={col.key} className={cn('px-3 py-2 text-xs text-[#0F172A]', alignClass)}>
                          {col.render
                            ? col.render(row[col.key], row, index)
                            : row[col.key] !== undefined && row[col.key] !== null
                              ? typeof row[col.key] === 'object'
                                ? row[col.key]?.name ||
                                  row[col.key]?.title ||
                                  row[col.key]?.label ||
                                  row[col.key]?.code ||
                                  '-'
                                : String(row[col.key])
                              : '-'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            ) : !isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-10">
                  <EmptyState title={resolvedEmptyTitle} description={resolvedEmptyDescription} />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={calculatedTotal}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}

export default PaginatedTable
