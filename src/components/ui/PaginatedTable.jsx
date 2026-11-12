import { useState, useMemo } from 'react'
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Building2,
  FileText,
  Globe,
  MapPin,
  User,
  Tag,
} from 'lucide-react'
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
  enableSelection = true,
  selectedRowKeys = [],
  onSelectionChange,
}) {
  const { t } = useI18n()
  const [internalSortBy, setInternalSortBy] = useState(sortBy)
  const [internalSortDir, setInternalSortDir] = useState(sortDirection)
  const [internalSelectedKeys, setInternalSelectedKeys] = useState([])

  const activeSortBy = onSort ? sortBy : internalSortBy
  const activeSortDir = onSort ? sortDirection : internalSortDir
  const activeSelectedKeys = onSelectionChange ? selectedRowKeys : internalSelectedKeys

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
  const resolvedEmptyTitle = emptyTitle ?? t('common.emptyTitle', 'Aucune donnée')
  const resolvedEmptyDescription = emptyDescription ?? t('common.emptyDescription', 'Aucun élément à afficher pour le moment.')

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allKeys = displayRows.map((r, idx) => r[rowKey] || idx)
      if (onSelectionChange) onSelectionChange(allKeys)
      else setInternalSelectedKeys(allKeys)
    } else {
      if (onSelectionChange) onSelectionChange([])
      else setInternalSelectedKeys([])
    }
  }

  const handleSelectRow = (key, e) => {
    e.stopPropagation()
    let nextKeys = []
    if (activeSelectedKeys.includes(key)) {
      nextKeys = activeSelectedKeys.filter((k) => k !== key)
    } else {
      nextKeys = [...activeSelectedKeys, key]
    }
    if (onSelectionChange) onSelectionChange(nextKeys)
    else setInternalSelectedKeys(nextKeys)
  }

  const allSelected =
    displayRows.length > 0 &&
    displayRows.every((r, idx) => activeSelectedKeys.includes(r[rowKey] || idx))

  // Fallback default column icons based on column key
  const getColumnIcon = (col) => {
    if (col.icon) return col.icon
    const k = col.key.toLowerCase()
    if (k.includes('company') || k.includes('name') || k.includes('student') || k.includes('teacher'))
      return Building2
    if (k.includes('desc') || k.includes('detail') || k.includes('notes'))
      return FileText
    if (k.includes('domain') || k.includes('email') || k.includes('code') || k.includes('link') || k.includes('phone'))
      return Globe
    if (k.includes('location') || k.includes('city') || k.includes('department') || k.includes('room'))
      return MapPin
    if (k.includes('person') || k.includes('contact') || k.includes('guardian') || k.includes('instructor'))
      return User
    if (k.includes('status')) return Tag
    return null
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs select-none',
        className
      )}
    >
      {toolbar && <div className="border-b border-[#E5E7EB] bg-white p-3.5">{toolbar}</div>}

      <div className="relative min-h-[140px] overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-2xs">
            <Loader text={t('common.loadingData', 'Chargement des données...')} />
          </div>
        )}

        <table className="w-full border-collapse text-start text-xs">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-xs font-medium text-[#4B5563]">
              {/* Checkbox Header Column */}
              {enableSelection && (
                <th scope="col" className="w-10 px-3.5 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Sélectionner tous les éléments"
                    className="w-4 h-4 rounded border-gray-300 text-[#111827] focus:ring-black/10 transition cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = activeSortBy === col.key
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-end'
                      : 'text-start'
                const ColIcon = getColumnIcon(col)

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
                      'px-3.5 py-3 font-medium text-[#4B5563] text-xs',
                      alignClass
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleHeaderClick(col)}
                        className={cn(
                          'inline-flex items-center gap-1.5 select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer group',
                          alignClass === 'text-end' && 'justify-end',
                          alignClass === 'text-center' && 'justify-center'
                        )}
                      >
                        {ColIcon && (
                          <ColIcon className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#4B5563] shrink-0" />
                        )}
                        <span>{col.label}</span>
                        <span className="text-[#9CA3AF] group-hover:text-[#4B5563] shrink-0" aria-hidden="true">
                          {isSorted ? (
                            activeSortDir === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#111827]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#111827]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
                          )}
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
                        {ColIcon && <ColIcon className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />}
                        <span>{col.label}</span>
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {displayRows.length > 0 ? (
              displayRows.map((row, index) => {
                const key = row[rowKey] || index
                const isSelected = activeSelectedKeys.includes(key)

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
                      'transition-colors hover:bg-[#F9FAFB]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/10',
                      isSelected && 'bg-blue-50/40',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {/* Checkbox Cell */}
                    {enableSelection && (
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(key, e)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Sélectionner ligne ${index + 1}`}
                          className="w-4 h-4 rounded border-gray-300 text-[#111827] focus:ring-black/10 transition cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-end'
                            : 'text-start'

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            'px-3.5 py-3 text-xs text-[#111827] font-normal align-middle',
                            alignClass
                          )}
                        >
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
                <td colSpan={columns.length + (enableSelection ? 1 : 0)} className="py-12">
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
