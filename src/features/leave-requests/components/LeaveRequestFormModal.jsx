import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { leaveRequestService } from '../api/leaveRequestService'
import { useToast } from '@/hooks/useToast'

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Congé annuel' },
  { value: 'SICK', label: 'Congé maladie' },
  { value: 'ADMINISTRATIVE', label: 'Congé administratif' },
  { value: 'UNPAID', label: 'Congé sans solde' },
]

function getInitialData(item) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const afterTomorrow = new Date(tomorrow)
  afterTomorrow.setDate(afterTomorrow.getDate() + 2)

  const toDateStr = (d) => d.toISOString().slice(0, 10)

  if (!item) {
    return {
      startDate: toDateStr(tomorrow),
      endDate: toDateStr(afterTomorrow),
      type: 'ANNUAL',
      reason: '',
    }
  }
  return {
    startDate: item.startDate || toDateStr(tomorrow),
    endDate: item.endDate || toDateStr(afterTomorrow),
    type: item.type || 'ANNUAL',
    reason: item.reason || '',
  }
}

export function LeaveRequestFormModal({
  isOpen,
  onClose,
  onSuccess,
  leaveRequest = null,
}) {
  const { success, error: toastError } = useToast()
  const isEditing = Boolean(leaveRequest?.id)

  const [formData, setFormData] = useState(() => getInitialData(leaveRequest))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (isSubmitting) return

    const errors = {}
    const todayStr = new Date().toISOString().slice(0, 10)

    if (!formData.startDate) {
      errors.startDate = 'La date de début est requise.'
    } else if (formData.startDate < todayStr) {
      errors.startDate = 'La date de début doit être future ou présente.'
    }

    if (!formData.endDate) {
      errors.endDate = 'La date de fin est requise.'
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      errors.endDate = 'La date de fin doit être postérieure ou égale au début.'
    }

    if (!formData.reason?.trim()) {
      errors.reason = 'Le motif de la demande est requis.'
    } else if (formData.reason.length > 2000) {
      errors.reason = 'Le motif ne peut pas dépasser 2000 caractères.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      let res
      if (isEditing) {
        res = await leaveRequestService.updateLeaveRequest(leaveRequest.id, formData)
      } else {
        res = await leaveRequestService.createLeaveRequest(formData)
      }

      if (res.success) {
        success(isEditing ? 'Demande de congé mise à jour.' : 'Demande de congé déposée avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        if (res.error?.fieldErrors) {
          setFieldErrors(res.error.fieldErrors)
        }
        toastError(res.error?.message || 'Erreur lors de la soumission de la demande.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier la demande de congé' : 'Nouvelle Demande de Congé'}
      subtitle="Les demandes soumises passent à l'état En attente d'approbation"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? 'Mettre à jour' : 'Soumettre la demande'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Type de congé <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.type}
            onChange={(val) => handleChange('type', val)}
            options={LEAVE_TYPES}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-slate-700">
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
            />
            {fieldErrors.startDate && (
              <p className="mt-1 text-2xs text-red-600">{fieldErrors.startDate}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-medium text-slate-700">
              Date de fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
            />
            {fieldErrors.endDate && (
              <p className="mt-1 text-2xs text-red-600">{fieldErrors.endDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Motif / Justification <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            placeholder="Précisez le motif ou les coordonnées en cas d'urgence..."
            rows={4}
            maxLength={2000}
            disabled={isSubmitting}
            className="w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
          />
          {fieldErrors.reason && (
            <p className="mt-1 text-2xs text-red-600">{fieldErrors.reason}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default LeaveRequestFormModal
