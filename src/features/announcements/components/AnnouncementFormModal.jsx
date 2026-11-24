import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { announcementService } from '../api/announcementService'
import { useToast } from '@/hooks/useToast'

const TARGET_ROLE_OPTIONS = [
  { value: 'ALL', label: 'Tout le monde (ALL)' },
  { value: 'STUDENT', label: 'Élèves uniquement' },
  { value: 'TEACHER', label: 'Enseignants uniquement' },
  { value: 'GUARDIAN', label: 'Parents / Tuteurs' },
  { value: 'STAFF', label: 'Personnel administratif' },
]

const STATUS_OPTIONS = [
  { value: 'PUBLISHED', label: 'Publiée (visible par le public cible)' },
  { value: 'DRAFT', label: 'Brouillon (non visible)' },
  { value: 'ARCHIVED', label: 'Archivée' },
]

function getInitialData(item) {
  if (!item) {
    return {
      title: '',
      content: '',
      targetRole: 'ALL',
      status: 'PUBLISHED',
    }
  }
  return {
    title: item.title || '',
    content: item.content || '',
    targetRole: item.targetRole || 'ALL',
    status: item.status || 'PUBLISHED',
  }
}

export function AnnouncementFormModal({ isOpen, onClose, onSuccess, announcement = null }) {
  const { success, error: toastError } = useToast()
  const isEditing = Boolean(announcement?.id)

  const [formData, setFormData] = useState(() => getInitialData(announcement))
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
      errors.title = 'Le titre est requis.'
    } else if (formData.title.length > 200) {
      errors.title = 'Le titre ne peut pas dépasser 200 caractères.'
    }

    if (!formData.content?.trim()) {
      errors.content = 'Le contenu de l’annonce est requis.'
    } else if (formData.content.length > 10000) {
      errors.content = 'Le contenu ne peut pas dépasser 10000 caractères.'
    }

    if (!formData.targetRole) {
      errors.targetRole = 'Le public cible est requis.'
    }

    if (!formData.status) {
      errors.status = 'Le statut est requis.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      let res
      if (isEditing) {
        res = await announcementService.updateAnnouncement(announcement.id, formData)
      } else {
        res = await announcementService.createAnnouncement(formData)
      }

      if (res.success) {
        success(isEditing ? 'Annonce mise à jour avec succès.' : 'Annonce enregistrée avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        if (res.error?.fieldErrors) {
          setFieldErrors(res.error.fieldErrors)
        }
        toastError(res.error?.message || 'Erreur lors de l’enregistrement de l’annonce.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitLabel = isEditing
    ? 'Mettre à jour'
    : formData.status === 'DRAFT'
      ? 'Enregistrer le brouillon'
      : formData.status === 'ARCHIVED'
        ? 'Archiver l’annonce'
        : 'Publier l’annonce'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier l’annonce' : 'Nouvelle annonce'}
      subtitle="Diffusion d'information ciblée aux utilisateurs du système"
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
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Titre de l’annonce <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ex : Réunion de rentrée des classes..."
            maxLength={200}
            error={fieldErrors.title}
            disabled={isSubmitting}
          />
          {fieldErrors.title && <p className="mt-1 text-2xs text-red-600">{fieldErrors.title}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-slate-700">
              Public cible <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.targetRole}
              onChange={(val) => handleChange('targetRole', val)}
              options={TARGET_ROLE_OPTIONS}
              disabled={isSubmitting}
            />
            {fieldErrors.targetRole && (
              <p className="mt-1 text-2xs text-red-600">{fieldErrors.targetRole}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-700">
              Statut <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.status}
              onChange={(val) => handleChange('status', val)}
              options={STATUS_OPTIONS}
              disabled={isSubmitting}
            />
            {fieldErrors.status && (
              <p className="mt-1 text-2xs text-red-600">{fieldErrors.status}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Contenu du message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Rédigez ici le détail de l'annonce..."
            rows={5}
            maxLength={10000}
            disabled={isSubmitting}
            className="w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
          />
          {fieldErrors.content && (
            <p className="mt-1 text-2xs text-red-600">{fieldErrors.content}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default AnnouncementFormModal
