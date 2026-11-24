import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { AuditLogDetailsModal } from './AuditLogDetailsModal'
import { auditLogService } from '../api/auditLogService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'Toutes les actions' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'APPROVE', label: 'APPROVE' },
  { value: 'REJECT', label: 'REJECT' },
  { value: 'CANCEL', label: 'CANCEL' },
  { value: 'SEND', label: 'SEND' },
  { value: 'READ', label: 'READ' },
]

const ENTITY_OPTIONS = [
  { value: 'ALL', label: 'Toutes les entités' },
  { value: 'Announcement', label: 'Announcement' },
  { value: 'Event', label: 'Event' },
  { value: 'Message', label: 'Message' },
  { value: 'Notification', label: 'Notification' },
  { value: 'LeaveRequest', label: 'LeaveRequest' },
  { value: 'Student', label: 'Student' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Staff', label: 'Staff' },
]

export function AuditLogList() {
  const { hasRole } = useAuth()
  const { error: toastError } = useToast()

  const isAdmin = hasRole(['ROLE_ADMIN', 'admin'])

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL')
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Data & pagination
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Details modal
  const [selectedLog, setSelectedLog] = useState(null)

  const loadAuditLogs = useCallback(
    async ({ signal } = {}) => {
      if (!isAdmin) return
      setIsLoading(true)
      setLoadError(null)
      try {
        const fromIso = fromDate ? `${fromDate}T00:00:00` : undefined
        const toIso = toDate ? `${toDate}T23:59:59` : undefined

        const res = await auditLogService.getAuditLogs({
          action: actionFilter,
          entityName: entityFilter,
          userId: userIdFilter ? Number(userIdFilter) : undefined,
          from: fromIso,
          to: toIso,
          page,
          size: pageSize,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setLogs(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setLogs([])
          setTotalItems(0)
          setTotalPages(0)
          const msg = res.error?.message || 'Impossible de charger le journal d’audit.'
          setLoadError(msg)
          if (!signal?.aborted) {
            toastError(msg)
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger le journal d’audit.'
          setLoadError(msg)
          toastError(msg)
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [isAdmin, actionFilter, entityFilter, userIdFilter, fromDate, toDate, page, pageSize, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadAuditLogs({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadAuditLogs])

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs
    const q = searchTerm.toLowerCase()
    return logs.filter((l) =>
      l.details?.toLowerCase().includes(q) ||
      l.entityName?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      String(l.userId).includes(q)
    )
  }, [logs, searchTerm])

  const columns = [
    {
      key: 'action',
      label: 'Action',
      width: '130px',
      render: (val) => {
        let badgeVariant = 'Cancelled'
        if (val === 'CREATE' || val === 'APPROVE') badgeVariant = 'Submitted'
        else if (val === 'UPDATE' || val === 'SEND') badgeVariant = 'Pending'
        else if (val === 'DELETE' || val === 'REJECT') badgeVariant = 'Cancelled'
        return <StatusBadge status={badgeVariant} label={val} size="xs" />
      },
    },
    {
      key: 'entityName',
      label: 'Entité Ciblée',
      width: '160px',
      render: (val, row) => (
        <span className="font-mono text-xs text-[#0F172A]">
          {val} {row.entityId ? `(#${row.entityId})` : ''}
        </span>
      ),
    },
    {
      key: 'userId',
      label: 'Utilisateur',
      width: '130px',
      render: (val) => <span className="text-xs text-[#475569]">{val ? `ID #${val}` : 'Système'}</span>,
    },
    {
      key: 'ipAddress',
      label: 'Adresse IP',
      width: '130px',
      render: (val) => <span className="font-mono text-xs text-[#64748B]">{val || '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Horodatage',
      width: '170px',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <EntityTableActions
          row={row}
          actions={[
            {
              label: 'Détails',
              icon: Eye,
              onClick: () => setSelectedLog(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters =
    actionFilter !== 'ALL' ||
    entityFilter !== 'ALL' ||
    Boolean(userIdFilter) ||
    Boolean(fromDate) ||
    Boolean(toDate)

  const activeFiltersCount =
    (actionFilter !== 'ALL' ? 1 : 0) +
    (entityFilter !== 'ALL' ? 1 : 0) +
    (userIdFilter ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0)

  const filtersContent = (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Action
        </label>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          {ACTION_OPTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Entité
        </label>
        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          {ENTITY_OPTIONS.map((ent) => (
            <option key={ent.value} value={ent.value}>
              {ent.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          ID Utilisateur
        </label>
        <input
          type="number"
          value={userIdFilter}
          onChange={(e) => {
            setUserIdFilter(e.target.value)
            setPage(1)
          }}
          placeholder="Ex: 42"
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Période du / au
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value)
              setPage(1)
            }}
            className="w-full h-8 px-2 text-2xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value)
              setPage(1)
            }}
            className="w-full h-8 px-2 text-2xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher dans les journaux..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={() => {
          setActionFilter('ALL')
          setEntityFilter('ALL')
          setUserIdFilter('')
          setFromDate('')
          setToDate('')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadAuditLogs}
        emptyTitle="Aucun journal d'audit"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucune entrée ne correspond aux filtres.'
            : 'Aucun enregistrement d’audit dans le système.'
        }
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        onRowClick={(row) => setSelectedLog(row)}
      />

      {selectedLog && (
        <AuditLogDetailsModal
          isOpen={Boolean(selectedLog)}
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  )
}

export default AuditLogList
