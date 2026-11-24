import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
  CheckCircle,
  XCircle,
  Ban,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LeaveRequestFormModal } from './LeaveRequestFormModal'
import { LeaveRequestDetailsModal } from './LeaveRequestDetailsModal'
import { leaveRequestService } from '../api/leaveRequestService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvé' },
  { value: 'REJECTED', label: 'Rejeté' },
  { value: 'CANCELLED', label: 'Annulé' },
]

const TYPE_FILTERS = [
  { value: 'ALL', label: 'Tous les types' },
  { value: 'ANNUAL', label: 'Annuel' },
  { value: 'SICK', label: 'Maladie' },
  { value: 'ADMINISTRATIVE', label: 'Administratif' },
  { value: 'UNPAID', label: 'Sans solde' },
]

const TYPE_LABELS = {
  ANNUAL: 'Annuel',
  SICK: 'Maladie',
  ADMINISTRATIVE: 'Administratif',
  UNPAID: 'Sans solde',
}

const STATUS_LABELS = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  CANCELLED: 'Annulé',
}

export function LeaveRequestList() {
  const { user, hasRole } = useAuth()
  const { success, error: toastError } = useToast()

  const currentUserId = user?.id
  const isAdmin = hasRole(['ROLE_ADMIN', 'admin'])

  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [onlyMine, setOnlyMine] = useState(!isAdmin)
  const [targetUserId, _setTargetUserId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination & items
  const [leaveRequests, setLeaveRequests] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const loadLeaveRequests = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        let effectiveUserId
        if (onlyMine) {
          effectiveUserId = currentUserId
        } else if (targetUserId) {
          effectiveUserId = targetUserId
        }

        const res = await leaveRequestService.getLeaveRequests({
          userId: effectiveUserId,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          page,
          size: pageSize,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          let items = res.data.items || []
          if (typeFilter !== 'ALL') {
            items = items.filter((item) => item.type === typeFilter)
          }
          setLeaveRequests(items)
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setLeaveRequests([])
          setTotalItems(0)
          setTotalPages(0)
          const msg = res.error?.message || 'Impossible de charger les demandes.'
          setLoadError(msg)
          if (!signal?.aborted) {
            toastError(msg)
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les demandes.'
          setLoadError(msg)
          toastError(msg)
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [currentUserId, onlyMine, targetUserId, statusFilter, typeFilter, page, pageSize, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadLeaveRequests({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadLeaveRequests])

  const handleQuickApprove = async (id) => {
    const res = await leaveRequestService.approveLeaveRequest(id)
    if (res.success) {
      success('Demande de congé approuvée.')
      loadLeaveRequests()
    } else {
      toastError(res.error?.message || 'Erreur lors de l’approbation.')
    }
  }

  const handleQuickReject = async (id) => {
    const reason = window.prompt('Motif du rejet (facultatif) :')
    if (reason === null) return
    const res = await leaveRequestService.rejectLeaveRequest(id, reason)
    if (res.success) {
      success('Demande de congé rejetée.')
      loadLeaveRequests()
    } else {
      toastError(res.error?.message || 'Erreur lors du rejet.')
    }
  }

  const handleCancelConfirm = async () => {
    if (!cancelTarget || isCancelling) return
    setIsCancelling(true)
    try {
      const res = await leaveRequestService.cancelLeaveRequest(cancelTarget.id)
      if (res.success) {
        success('Demande annulée avec succès.')
        setCancelTarget(null)
        loadLeaveRequests()
      } else {
        toastError(res.error?.message || 'Erreur lors de l’annulation de la demande.')
      }
    } finally {
      setIsCancelling(false)
    }
  }

  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return leaveRequests
    const q = searchTerm.toLowerCase()
    return leaveRequests.filter((r) => {
      const u = r.user || {}
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      const reason = (r.reason || '').toLowerCase()
      return name.includes(q) || reason.includes(q)
    })
  }, [leaveRequests, searchTerm])

  const columns = [
    {
      key: 'user',
      label: 'Demandeur / Utilisateur',
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || `Utilisateur #${row.userId}`
        return (
          <div className="min-w-0">
            <span className="font-semibold text-[#0F172A] text-xs block truncate">{name}</span>
            <span className="text-[11px] text-[#64748B]">Demande #{row.id}</span>
          </div>
        )
      },
    },
    {
      key: 'type',
      label: 'Type de congé',
      width: '140px',
      render: (val) => (
        <span className="text-xs text-[#475569]">{TYPE_LABELS[val] || val || 'Général'}</span>
      ),
    },
    {
      key: 'period',
      label: 'Période demandée',
      width: '200px',
      render: (_, row) => {
        const start = row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR') : '—'
        const end = row.endDate ? new Date(row.endDate).toLocaleDateString('fr-FR') : '—'
        return <span className="text-xs text-[#475569]">Du {start} au {end}</span>
      },
    },
    {
      key: 'status',
      label: 'Statut',
      width: '110px',
      render: (val) => <StatusBadge status={STATUS_LABELS[val] || val} size="xs" />,
    },
    {
      key: 'requestedAt',
      label: 'Date demande',
      width: '130px',
      render: (val) => (
        <span className="text-xs text-[#475569]">
          {val ? new Date(val).toLocaleDateString('fr-FR') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => {
        const isOwner = Number(row.userId) === Number(currentUserId)
        const isPending = row.status === 'PENDING'
        const canApproveOrReject = isAdmin && isPending && !isOwner
        const canCancel = isOwner && isPending

        return (
          <EntityTableActions
            row={row}
            actions={[
              {
                label: 'Détails',
                icon: Eye,
                onClick: () => setDetailItem(row),
              },
              {
                label: 'Approuver',
                icon: CheckCircle,
                hidden: !canApproveOrReject,
                onClick: () => handleQuickApprove(row.id),
              },
              {
                label: 'Rejeter',
                icon: XCircle,
                variant: 'danger',
                hidden: !canApproveOrReject,
                onClick: () => handleQuickReject(row.id),
              },
              {
                label: 'Annuler ma demande',
                icon: Ban,
                variant: 'danger',
                hidden: !canCancel,
                onClick: () => setCancelTarget(row),
              },
            ]}
          />
        )
      },
    },
  ]

  const hasActiveFilters =
    statusFilter !== 'ALL' || typeFilter !== 'ALL' || (isAdmin && onlyMine)
  const activeFiltersCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (typeFilter !== 'ALL' ? 1 : 0) +
    (isAdmin && onlyMine ? 1 : 0)

  const filtersContent = (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Statut
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Type de congé
        </label>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && (
        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#0F172A] pt-1">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => {
              setOnlyMine(e.target.checked)
              setPage(1)
            }}
            className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span>Mes demandes uniquement</span>
        </label>
      )}
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={() => {
          setEditingItem(null)
          setIsFormOpen(true)
        }}
        addNewLabel="Nouvelle demande"
        canAddNew={true}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par demandeur, motif..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={() => {
          setStatusFilter('ALL')
          setTypeFilter('ALL')
          setOnlyMine(false)
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={filteredRequests}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadLeaveRequests}
        emptyTitle="Aucune demande de congé"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucune demande ne correspond à vos filtres.'
            : 'Aucune demande de congé enregistrée.'
        }
        emptyAction={{
          label: 'Nouvelle demande',
          onClick: () => {
            setEditingItem(null)
            setIsFormOpen(true)
          },
        }}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        onRowClick={(row) => setDetailItem(row)}
      />

      {isFormOpen && (
        <LeaveRequestFormModal
          isOpen={isFormOpen}
          initialData={editingItem}
          onClose={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSuccess={() => loadLeaveRequests()}
        />
      )}

      {detailItem && (
        <LeaveRequestDetailsModal
          isOpen={Boolean(detailItem)}
          leaveRequest={detailItem}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setDetailItem(null)}
          onApprove={() => {
            setDetailItem(null)
            loadLeaveRequests()
          }}
          onReject={() => {
            setDetailItem(null)
            loadLeaveRequests()
          }}
          onCancel={() => {
            setDetailItem(null)
            loadLeaveRequests()
          }}
        />
      )}

      {cancelTarget && (
        <ConfirmDialog
          isOpen={Boolean(cancelTarget)}
          title="Annuler cette demande ?"
          message="Êtes-vous sûr de vouloir annuler votre demande de congé ? Cette action est irréversible."
          confirmLabel={isCancelling ? 'Annulation...' : 'Confirmer l’annulation'}
          variant="danger"
          isLoading={isCancelling}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  )
}

export default LeaveRequestList
