import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { EntityTableSkeleton } from './EntityTableSkeleton'
import { Button } from '@/components/ui/Button'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RotateCcw,
  Inbox,
  Plus,
} from 'lucide-react'
import { cn } from '@/utils/classNames'

export function EntityDataTable({
  columns = [],
  data = [],
  isLoading = false,
  error = null,
  onRetry,

  // Empty state
  emptyTitle = 'Aucun élément trouvé',
  emptyDescription = 'Aucun enregistrement ne correspond à vos critères.',
  emptyAction,

  // Pagination
  page = 1,
  pageSize = 10,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],

  // Sorting
  sortBy,
  sortDirection = 'asc',
  onSort,

  // Row interactions
  onRowClick,
  rowKey = 'id',
  className = '',
}) {
  const colSpan = Math.max(1, columns.length)

  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSort) return
    onSort(col.key)
  }

  const getRowKey = (row, index) => {
    if (typeof rowKey === 'function') return rowKey(row, index)
    return row[rowKey] ?? index
  }

  const calculatedTotal = totalItems !== undefined ? totalItems : data.length
  const calculatedTotalPages =
    totalPages !== undefined
      ? totalPages
      : Math.max(1, Math.ceil(calculatedTotal / pageSize))

  const startRecord = calculatedTotal === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, calculatedTotal)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50/70">
              {columns.map((col) => {
                const isSorted = sortBy === col.key
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'

                return (
                  <TableHead
                    key={col.key || col.label}
                    style={{ width: col.width }}
                    onClick={() => handleHeaderClick(col)}
                    className={cn(
                      'h-8 px-3.5 py-1.5 text-2xs font-semibold text-slate-500 select-none',
                      alignClass,
                      col.sortable && 'cursor-pointer hover:text-slate-900 hover:bg-slate-100/60 transition-colors',
                      col.className
                    )}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'right' && 'justify-end w-full',
                        col.align === 'center' && 'justify-center w-full'
                      )}
                    >
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="shrink-0 text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#5B5FC7]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#5B5FC7]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-60 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <EntityTableSkeleton columns={columns} rowCount={Math.min(pageSize, 6)} />
            ) : error ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      Erreur de chargement
                    </div>
                    <div className="text-2xs text-slate-500">
                      {typeof error === 'string'
                        ? error
                        : error.message || 'Une erreur inattendue est survenue.'}
                    </div>
                    {onRetry && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={onRetry}
                        className="mt-2 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Réessayer</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-slate-900">{emptyTitle}</div>
                    <div className="text-2xs text-slate-500">{emptyDescription}</div>
                    {emptyAction && (
                      <Button
                        type="button"
                        variant="primary"
                        size="xs"
                        onClick={emptyAction.onClick}
                        className="mt-2 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{emptyAction.label}</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const key = getRowKey(row, index)
                return (
                  <TableRow
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => {
                      const value = row[col.key]
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'

                      return (
                        <TableCell
                          key={col.key || col.label}
                          className={cn('px-3.5 py-2.5 text-xs text-slate-900 align-middle', alignClass, col.cellClassName)}
                        >
                          {col.render ? col.render(value, row, index) : (value ?? '—')}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Compact Pagination */}
      {onPageChange && !isLoading && !error && calculatedTotal > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-2xs text-slate-500 select-none">
          <div className="flex items-center gap-2">
            <span>
              Affichage de <span className="font-semibold text-slate-900 tabular-nums">{startRecord}</span> à{' '}
              <span className="font-semibold text-slate-900 tabular-nums">{endRecord}</span> sur{' '}
              <span className="font-semibold text-slate-900 tabular-nums">{calculatedTotal}</span>
            </span>

            {onPageSizeChange && (
              <div className="flex items-center gap-1.5 ml-3">
                <span>Lignes :</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="h-6 px-1.5 text-2xs bg-white border border-slate-200 rounded text-slate-900 focus:outline-hidden focus:border-slate-400"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 tabular-nums">
              Page {page} sur {calculatedTotalPages}
            </span>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= calculatedTotalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EntityDataTable
