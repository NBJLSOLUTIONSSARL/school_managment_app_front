import { useState, useMemo } from 'react'
import { cn } from '@/utils/classNames'
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
  emptyTitle = 'Aucune donnée trouvée',
  emptyDescription = 'Aucun enregistrement ne correspond aux critères actuels.',
  toolbar,
  className = '',
  rowKey = 'id',
}) {
  // Local sorting if no external onSort handler is provided
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

  // If external pagination is not provided, slice locally
  const displayRows = useMemo(() => {
    if (onPageChange) {
      return data
    }
    // Local pagination
    let sorted = [...data]
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

  return (
    <div
      className={cn(
        'w-full rounded border border-slate-200 bg-white shadow-2xs overflow-hidden',
        className
      )}
    >
      {/* Optional Toolbar */}
      {toolbar && <div className="border-b border-slate-100 bg-slate-50/50 p-3">{toolbar}</div>}

      {/* Table Content */}
      <div className="overflow-x-auto relative min-h-[160px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs z-10 flex items-center justify-center">
            <Loader text="Chargement des données..." />
          </div>
        )}

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <th className="w-10 px-3 py-2.5 text-center text-slate-400 text-2xs font-normal">
                #
              </th>
              {columns.map((col) => {
                const isSorted = activeSortBy === col.key
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'

                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    style={{ width: col.width || 'auto' }}
                    className={cn(
                      'px-3.5 py-2.5 font-medium tracking-tight text-slate-700',
                      alignClass,
                      col.sortable && 'cursor-pointer hover:bg-slate-100/70 select-none'
                    )}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        alignClass === 'text-right' && 'justify-end'
                      )}
                    >
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="text-2xs text-slate-400">
                          {isSorted ? (activeSortDir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayRows.length > 0 ? (
              displayRows.map((row, index) => {
                const key = row[rowKey] || index
                const rowNumber = (page - 1) * pageSize + index + 1
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, index)}
                    className={cn(
                      'hover:bg-slate-50/80 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    <td className="px-3 py-2 text-center text-slate-400 text-2xs font-mono">
                      {rowNumber}
                    </td>
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'

                      return (
                        <td key={col.key} className={cn('px-3.5 py-2 text-slate-800', alignClass)}>
                          {col.render
                            ? col.render(row[col.key], row, index)
                            : row[col.key] !== undefined && row[col.key] !== null
                              ? String(row[col.key])
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
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
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
