import { useState, useEffect, useCallback } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
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

  // Data & pagination
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Details modal
  const [selectedLog, setSelectedLog] = useState(null)

  const loadAuditLogs = useCallback(
    async ({ signal } = {}) => {
      if (!isAdmin) return
      setIsLoading(true)
      try {
        const fromIso = fromDate ? `${fromDate}T00:00:00` : undefined
        const toIso = toDate ? `${toDate}T23:59:59` : undefined

        const res = await auditLogService.getAuditLogs({
          userId: userIdFilter.trim() ? Number(userIdFilter) : undefined,
          action: actionFilter,
          entity: entityFilter,
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
          if (!signal?.aborted) {
            toastError(res.error?.message || 'Erreur lors du chargement des logs d’audit.')
          }
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [isAdmin, userIdFilter, actionFilter, entityFilter, fromDate, toDate, page, pageSize, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadAuditLogs({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadAuditLogs])

  if (!isAdmin) {
    return (
      <div className="p-6">
        <EmptyState
          title="Accès Restreint"
          description="Cette section d'audit système est strictement réservée aux administrateurs."
        />
      </div>
    )
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: '70px',
      render: (val) => <span className="font-mono text-slate-500">#{val}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      width: '110px',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'entity',
      label: 'Entité',
      width: '140px',
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
    },
    {
      key: 'userId',
      label: 'Utilisateur',
      width: '120px',
      render: (val) => (val ? `User #${val}` : 'Système'),
    },
    {
      key: 'ipAddress',
      label: 'Adresse IP',
      width: '140px',
      render: (val) => <span className="font-mono text-slate-600">{val || '-'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Horodatage',
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
          : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '90px',
      align: 'right',
      render: (_, row) => (
        <Button variant="ghost" size="xs" onClick={() => setSelectedLog(row)}>
          Détails
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4 p-4 md:p-6">
      <DocTypePageHead
        title="Journal d'Audit Système (Audit Logs)"
        count={totalItems}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white p-3 text-xs shadow-2xs">
        <div className="w-36">
          <Select
            value={actionFilter}
            onChange={(val) => {
              setActionFilter(val)
              setPage(1)
            }}
            options={ACTION_OPTIONS}
          />
        </div>

        <div className="w-40">
          <Select
            value={entityFilter}
            onChange={(val) => {
              setEntityFilter(val)
              setPage(1)
            }}
            options={ENTITY_OPTIONS}
          />
        </div>

        <div className="w-32">
          <input
            type="number"
            value={userIdFilter}
            onChange={(e) => {
              setUserIdFilter(e.target.value)
              setPage(1)
            }}
            placeholder="User ID..."
            className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-2xs text-slate-400">Du :</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value)
              setPage(1)
            }}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-2xs text-slate-400">Au :</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value)
              setPage(1)
            }}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
          />
        </div>

        {(fromDate || toDate || userIdFilter) && (
          <button
            type="button"
            onClick={() => {
              setFromDate('')
              setToDate('')
              setUserIdFilter('')
              setPage(1)
            }}
            className="text-2xs text-slate-400 hover:text-slate-600 underline"
          >
            Réinitialiser
          </button>
        )}

        <div className="ml-auto text-2xs text-slate-400">
          🔒 Section réservée aux administrateurs
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="Aucun événement d'audit"
          description="Aucune trace d'audit ne correspond aux filtres sélectionnés."
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={logs}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
          isLoading={isLoading}
        />
      )}

      {/* Details Modal */}
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
