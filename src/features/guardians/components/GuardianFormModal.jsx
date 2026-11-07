import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { guardianService } from '../api/guardianService'
import { useToast } from '@/hooks/useToast'

export function GuardianFormModal({ isOpen, onClose, onSuccess }) {
  const { success, error: toastError } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profession: '',
    password: '',
    language: 'fr',
  })

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

    // Basic frontend check
    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'Le prénom est obligatoire'
    if (!formData.lastName.trim()) errors.lastName = 'Le nom est obligatoire'
    if (!formData.email.trim()) errors.email = "L'email est obligatoire"
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        profession: formData.profession.trim() || null,
        password: formData.password || undefined,
        language: formData.language || 'fr',
      }

      const res = await guardianService.createGuardian(payload)
      if (res.success && res.data) {
        success('Tuteur créé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          profession: '',
          password: '',
          language: 'fr',
        })
      } else {
        toastError(res.error?.message || 'Erreur lors de la création du tuteur.')
        if (res.error?.fieldErrors) {
          setFieldErrors(res.error.fieldErrors)
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
      title="Créer un nouveau tuteur"
      description="Renseignez les coordonnées du parent ou tuteur légal."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Prénom *"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={fieldErrors.firstName}
            placeholder="Ex: Fatou"
            required
          />
          <Input
            label="Nom *"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={fieldErrors.lastName}
            placeholder="Ex: Ndiaye"
            required
          />
        </div>

        <Input
          label="Adresse e-mail *"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={fieldErrors.email}
          placeholder="tuteur@example.com"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={fieldErrors.phone}
            placeholder="+221 77 123 45 67"
          />
          <Input
            label="Profession"
            value={formData.profession}
            onChange={(e) => handleChange('profession', e.target.value)}
            error={fieldErrors.profession}
            placeholder="Ex: Avocat, Enseignant, etc."
          />
        </div>

        <Input
          label="Mot de passe (optionnel)"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={fieldErrors.password}
          placeholder="Laisser vide pour générer automatiquement"
        />

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Création en cours...' : 'Enregistrer le tuteur'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default GuardianFormModal
