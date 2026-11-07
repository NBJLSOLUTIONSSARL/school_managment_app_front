import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { leaveRequestService } from '../api/leaveRequestService'
import { useToast } from '@/hooks/useToast'

const TYPE_LABELS = {
  ANNUAL: 'Congé annuel',
  SICK: 'Congé maladie',
  ADMINISTRATIVE: 'Congé administratif',
  UNPAID: 'Congé sans solde',
}

const STATUS_LABELS = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  CANCELLED: 'Annulé',
}

export function LeaveRequestDetailsModal({
  isOpen,
  onClose,
  leaveRequest,
  currentUserId,
  isAdmin,
  onStatusChanged,
}) {
  const { success, error: toastError } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!leaveRequest) return null

  const isOwner = currentUserId && Number(leaveRequest.userId) === Number(currentUserId)
  const isPending = leaveRequest.status === 'PENDING'
  const canApproveOrReject = isAdmin && isPending && !isOwner
  const canCancel = isOwner && isPending

  const handleAction = async (actionFn, successMsg) => {
    setIsProcessing(true)
    try {
      const res = await actionFn(leaveRequest.id)
      if (res.success) {
        success(successMsg)
        onStatusChanged?.()
        onClose?.()
      } else {
        toastError(res.error?.message || 'Erreur lors du traitement de la demande.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const durationDays = () => {
    if (!leaveRequest.startDate || !leaveRequest.endDate) return null
    const s = new Date(leaveRequest.startDate)
    const e = new Date(leaveRequest.endDate)
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 1
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détail de la demande de congé"
      subtitle={`Demande #${leaveRequest.id} - ${TYPE_LABELS[leaveRequest.type] || leaveRequest.type}`}
      footer={
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            {canApproveOrReject && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isProcessing}
                  disabled={isProcessing}
                  onClick={() =>
                    handleAction(
                      leaveRequestService.approveLeaveRequest,
                      'Demande de congé approuvée.'
                    )
                  }
                >
                  Approuver
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isProcessing}
                  disabled={isProcessing}
                  onClick={() =>
                    handleAction(
                      leaveRequestService.rejectLeaveRequest,
                      'Demande de congé rejetée.'
                    )
                  }
                >
                  Rejeter
                </Button>
              </>
            )}
            {canCancel && (
              <Button
                variant="dangerSubtle"
                size="sm"
                isLoading={isProcessing}
                disabled={isProcessing}
                onClick={() =>
                  handleAction(
                    leaveRequestService.cancelLeaveRequest,
                    'Demande de congé annulée.'
                  )
                }
              >
                Annuler ma demande
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isProcessing}>
            Fermer
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-3 rounded border border-slate-100 bg-slate-50 p-3">
          <div>
            <span className="block text-2xs text-slate-400">Demandeur :</span>
            <span className="font-semibold text-slate-800">
              User #{leaveRequest.userId} {isOwner ? '(Vous)' : ''}
            </span>
          </div>
          <div>
            <span className="block text-2xs text-slate-400">Statut actuel :</span>
            <StatusBadge
              status={STATUS_LABELS[leaveRequest.status] || leaveRequest.status}
              size="xs"
            />
          </div>
          <div>
            <span className="block text-2xs text-slate-400">Période :</span>
            <span className="font-medium text-slate-800">
              Du {leaveRequest.startDate} au {leaveRequest.endDate}
            </span>
          </div>
          <div>
            <span className="block text-2xs text-slate-400">Durée :</span>
            <span className="font-medium text-slate-800">
              {durationDays()} jour{durationDays() > 1 ? 's' : ''}
            </span>
          </div>
          {leaveRequest.requestedAt && (
            <div className="col-span-2 text-2xs text-slate-400">
              Déposée le{' '}
              {new Date(leaveRequest.requestedAt).toLocaleDateString('fr-FR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
          )}
        </div>

        <div>
          <span className="block mb-1 text-2xs font-semibold uppercase text-slate-400">
            Motif de la demande :
          </span>
          <div className="whitespace-pre-wrap rounded border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800">
            {leaveRequest.reason || 'Aucun motif renseigné.'}
          </div>
        </div>

        {isAdmin && isOwner && isPending && (
          <div className="rounded border border-amber-200 bg-amber-50 p-2 text-2xs text-amber-800">
            ℹ️ Vous ne pouvez pas auto-valider ou auto-rejeter votre propre demande de congé (règle backend).
          </div>
        )}
      </div>
    </Modal>
  )
}

export default LeaveRequestDetailsModal
