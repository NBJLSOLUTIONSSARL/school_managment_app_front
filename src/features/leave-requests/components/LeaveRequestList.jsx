import { useState, useEffect, useCallback } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LeaveRequestFormModal } from './LeaveRequestFormModal'
import { LeaveRequestDetailsModal } from './LeaveRequestDetailsModal'
import { leaveRequestService } from '../api/leaveRequestService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'PENDING', label: '⏳ En attente' },
  { value: 'APPROVED', label: '✅ Approuvé' },
  { value: 'REJECTED', label: '❌ Rejeté' },
  { value: 'CANCELLED', label: '🚫 Annulé' },
]

const TYPE_FILTERS = [
  { value: 'ALL', label: 'Tous les types' },
  { value: 'ANNUAL', label: '🏖️ Annuel' },
  { value: 'SICK', label: '🩺 Maladie' },
  { value: 'ADMINISTRATIVE', label: '📋 Administratif' },
  { value: 'UNPAID', label: '⏳ Sans solde' },
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
  const [targetUserId, setTargetUserId] = useState('')

  // Pagination & items
  const [leaveRequests, setLeaveRequests] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const loadLeaveRequests = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        let queryUserId = undefined
        if (!isAdmin || onlyMine) {
          queryUserId = currentUserId
        } else if (targetUserId.trim()) {
          queryUserId = Number(targetUserId)
        }

        const res = await leaveRequestService.getLeaveRequests({
          userId: queryUserId,
          status: statusFilter,
          type: typeFilter,
          page,
          size: pageSize,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setLeaveRequests(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setLeaveRequests([])
          setTotalItems(0)
          setTotalPages(0)
          if (!signal?.aborted) {
            toastError(res.error?.message || 'Erreur lors du chargement des demandes de congés.')
          }
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [isAdmin, onlyMine, currentUserId, targetUserId, statusFilter, typeFilter, page, pageSize, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadLeaveRequests({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadLeaveRequests])

  const handleCancelConfirm = async () => {
    if (!cancelTarget || isCancelling) return
    setIsCancelling(true)
    try {
      const res = await leaveRequestService.cancelLeaveRequest(cancelTarget.id)
      if (res.success) {
        success('Demande de congé annulée.')
        setCancelTarget(null)
        loadLeaveRequests()
      } else {
        toastError(res.error?.message || 'Erreur lors de l’annulation de la demande.')
      }
    } finally {
      setIsCancelling(false)
    }
  }

  const handleQuickApprove = async (id) => {
    try {
      const res = await leaveRequestService.approveLeaveRequest(id)
      if (res.success) {
        success('Demande approuvée.')
        loadLeaveRequests()
      } else {
        toastError(res.error?.message || 'Erreur lors de l’approbation.')
      }
    } catch {
      toastError('Erreur de connexion.')
    }
  }

  const handleQuickReject = async (id) => {
    try {
      const res = await leaveRequestService.rejectLeaveRequest(id)
      if (res.success) {
        success('Demande rejetée.')
        loadLeaveRequests()
      } else {
        toastError(res.error?.message || 'Erreur lors du rejet.')
      }
    } catch {
      toastError('Erreur de connexion.')
    }
  }

  const columns = [
    {
      key: 'userId',
      label: 'Demandeur',
      width: '120px',
      render: (val) => (
        <span className="font-medium text-slate-900">
          User #{val}
          {Number(val) === Number(currentUserId) ? ' (Moi)' : ''}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: '130px',
      render: (val) => <StatusBadge status={TYPE_LABELS[val] || val} size="xs" />,
    },
    {
      key: 'period',
      label: 'Période demandée',
      render: (_, row) => (
        <span className="text-slate-800">
          Du <strong>{row.startDate}</strong> au <strong>{row.endDate}</strong>
        </span>
      ),
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
      width: '140px',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      align: 'right',
      render: (_, row) => {
        const isOwner = Number(row.userId) === Number(currentUserId)
        const isPending = row.status === 'PENDING'
        const canApproveOrReject = isAdmin && isPending && !isOwner
        const canCancel = isOwner && isPending

        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="xs" onClick={() => setDetailItem(row)}>
              Détails
            </Button>
            {canApproveOrReject && (
              <>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleQuickApprove(row.id)}
                >
                  ✓
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleQuickReject(row.id)}
                >
                  ✕
                </Button>
              </>
            )}
            {canCancel && (
              <Button
                variant="ghost"
                size="xs"
                className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => setCancelTarget(row)}
              >
                Annuler
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none">
      <DocTypePageHead
        title="Gestion des Demandes de Congé"
        count={totalItems}
        primaryAction={{
          label: 'Nouvelle Demande',
          onClick: () => {
            setEditingItem(null)
            setIsFormOpen(true)
          },
        }}
      />

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 text-xs shadow-2xs">
        <div className="w-44">
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            options={STATUS_FILTERS}
          />
        </div>
        <div className="w-44">
          <Select
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val)
              setPage(1)
            }}
            options={TYPE_FILTERS}
          />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => {
                  setOnlyMine(e.target.checked)
                  setPage(1)
                }}
                className="rounded border-slate-300"
              />
              <span>Mes demandes uniquement</span>
            </label>

            {!onlyMine && (
              <div className="w-36">
                <input
                  type="number"
                  value={targetUserId}
                  onChange={(e) => {
                    setTargetUserId(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Filtrer User ID..."
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        <div className="ml-auto text-2xs text-slate-400">
          {isAdmin ? 'Espace validation & suivi RH' : 'Espace collaborateur'}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : leaveRequests.length === 0 ? (
        <EmptyState
          title="Aucune demande de congé"
          description="Aucune demande enregistrée ne correspond à vos filtres."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingItem(null)
                setIsFormOpen(true)
              }}
            >
              Déposer une demande de congé
            </Button>
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={leaveRequests}
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

      {/* Form Modal */}
      {isFormOpen && (
        <LeaveRequestFormModal
          key={editingItem?.id || 'new'}
          isOpen={isFormOpen}
          leaveRequest={editingItem}
          onClose={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSuccess={() => loadLeaveRequests()}
        />
      )}

      {/* Details Modal */}
      {detailItem && (
        <LeaveRequestDetailsModal
          isOpen={Boolean(detailItem)}
          leaveRequest={detailItem}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setDetailItem(null)}
          onStatusChanged={() => loadLeaveRequests()}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelTarget && (
        <ConfirmDialog
          isOpen={Boolean(cancelTarget)}
          title="Annuler cette demande de congé ?"
          message={`Êtes-vous sûr de vouloir annuler votre demande de congé du ${cancelTarget.startDate} au ${cancelTarget.endDate} ?`}
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
