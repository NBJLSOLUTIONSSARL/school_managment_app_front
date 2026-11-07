import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { eventService } from '../api/eventService'
import { useToast } from '@/hooks/useToast'

function formatDateForInput(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getInitialData(item) {
  if (!item) {
    const now = new Date()
    now.setHours(now.getHours() + 1, 0, 0, 0)
    const end = new Date(now)
    end.setHours(end.getHours() + 2)
    return {
      title: '',
      startAt: formatDateForInput(now.toISOString()),
      endAt: formatDateForInput(end.toISOString()),
      location: '',
      description: '',
    }
  }
  return {
    title: item.title || '',
    startAt: formatDateForInput(item.startAt),
    endAt: formatDateForInput(item.endAt),
    location: item.location || '',
    description: item.description || '',
  }
}

export function EventFormModal({ isOpen, onClose, onSuccess, event = null }) {
  const { success, error: toastError } = useToast()
  const isEditing = Boolean(event?.id)

  const [formData, setFormData] = useState(() => getInitialData(event))
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
    if (!formData.title?.trim()) {
      errors.title = 'Le titre de l’événement est requis.'
    } else if (formData.title.length > 200) {
      errors.title = 'Le titre ne peut pas dépasser 200 caractères.'
    }

    if (!formData.startAt) {
      errors.startAt = 'La date et heure de début sont requises.'
    }
    if (!formData.endAt) {
      errors.endAt = 'La date et heure de fin sont requises.'
    }

    if (formData.startAt && formData.endAt) {
      const start = new Date(formData.startAt)
      const end = new Date(formData.endAt)
      if (end < start) {
        errors.endAt = 'La date de fin doit être postérieure ou égale au début.'
      }
    }

    if (!formData.location?.trim()) {
      errors.location = 'Le lieu est requis.'
    } else if (formData.location.length > 255) {
      errors.location = 'Le lieu ne peut pas dépasser 255 caractères.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: formData.title,
        startAt: formData.startAt.length === 16 ? `${formData.startAt}:00` : formData.startAt,
        endAt: formData.endAt.length === 16 ? `${formData.endAt}:00` : formData.endAt,
        location: formData.location,
        description: formData.description,
      }

      let res
      if (isEditing) {
        res = await eventService.updateEvent(event.id, payload)
      } else {
        res = await eventService.createEvent(payload)
      }

      if (res.success) {
        success(isEditing ? 'Événement mis à jour avec succès.' : 'Événement programmé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        if (res.error?.fieldErrors) {
          setFieldErrors(res.error.fieldErrors)
        }
        toastError(res.error?.message || 'Erreur lors de l’enregistrement de l’événement.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier l’événement' : 'Programmer un événement'}
      subtitle="Gestion du calendrier scolaire et des événements officiels"
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
            {isEditing ? 'Mettre à jour' : 'Enregistrer l’événement'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Titre de l’événement <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ex : Réunion pédagogique, Cérémonie de remise des diplômes..."
            maxLength={200}
            error={fieldErrors.title}
            disabled={isSubmitting}
          />
          {fieldErrors.title && <p className="mt-1 text-2xs text-red-600">{fieldErrors.title}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-slate-700">
              Début <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.startAt}
              onChange={(e) => handleChange('startAt', e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
            />
            {fieldErrors.startAt && (
              <p className="mt-1 text-2xs text-red-600">{fieldErrors.startAt}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-medium text-slate-700">
              Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.endAt}
              onChange={(e) => handleChange('endAt', e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
            />
            {fieldErrors.endAt && (
              <p className="mt-1 text-2xs text-red-600">{fieldErrors.endAt}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Lieu <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Ex : Amphithéâtre A, Salle 204, Terrain de sport..."
            maxLength={255}
            error={fieldErrors.location}
            disabled={isSubmitting}
          />
          {fieldErrors.location && (
            <p className="mt-1 text-2xs text-red-600">{fieldErrors.location}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block font-medium text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Ordre du jour ou détails additionnels..."
            rows={3}
            maxLength={10000}
            disabled={isSubmitting}
            className="w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
          />
        </div>
      </form>
    </Modal>
  )
}

export default EventFormModal
