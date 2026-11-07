import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { departmentService } from '../api/departmentService'
import { useToast } from '@/hooks/useToast'

export function DepartmentFormModal({ isOpen, onClose, onSuccess, department = null }) {
  const { success, error: toastError } = useToast()
  const isEditing = Boolean(department?.id)

  const [name, setName] = useState(() => department?.name || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (isSubmitting) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFieldError('Le nom du département est obligatoire.')
      return
    }

    setIsSubmitting(true)
    setFieldError('')

    try {
      let res
      if (isEditing) {
        res = await departmentService.updateDepartment(department.id, { name: trimmedName })
      } else {
        res = await departmentService.createDepartment({ name: trimmedName })
      }

      if (res.success && res.data) {
        success(isEditing ? 'Département modifié avec succès.' : 'Département créé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        toastError(res.error?.message || 'Erreur lors de la sauvegarde du département.')
        if (res.error?.fieldErrors?.name) {
          setFieldError(res.error.fieldErrors.name)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier le département' : 'Nouveau département'}
      description={
        isEditing
          ? `Modification du département #${department.id}`
          : 'Créer un département pour organiser les enseignants et le personnel.'
      }
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du département *"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (fieldError) setFieldError('')
          }}
          error={fieldError}
          placeholder="Ex: Mathématiques, Sciences, Administration..."
          required
          autoFocus
        />

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default DepartmentFormModal
