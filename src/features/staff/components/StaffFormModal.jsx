import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { staffService } from '../api/staffService'
import { departmentService } from '@/features/departments/api/departmentService'
import { useToast } from '@/hooks/useToast'

const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI (Contrat à durée indéterminée)' },
  { value: 'CDD', label: 'CDD (Contrat à durée déterminée)' },
  { value: 'STAGE', label: 'Stage' },
  { value: 'FULL_TIME', label: 'Temps plein' },
  { value: 'PART_TIME', label: 'Temps partiel' },
]

function getInitialFormData(staff) {
  if (!staff) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      departmentId: '',
      position: '',
      contractType: 'CDI',
      hireDate: '',
    }
  }
  const u = staff.user || {}
  return {
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    password: '',
    phone: u.phone || '',
    departmentId: staff.department?.id ? String(staff.department.id) : '',
    position: staff.position || '',
    contractType: staff.contractType || 'CDI',
    hireDate: staff.hireDate || '',
  }
}

export function StaffFormModal({ isOpen, onClose, onSuccess, staff = null }) {
  const { success, error: toastError } = useToast()
  const isEditing = Boolean(staff?.id)

  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState(() => getInitialFormData(staff))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    async function fetchDepartments() {
      const res = await departmentService.getDepartments()
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data)
      }
    }
    if (isOpen) {
      fetchDepartments()
    }
  }, [isOpen])

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
    if (!formData.firstName.trim()) errors.firstName = 'Le prénom est obligatoire.'
    if (!formData.lastName.trim()) errors.lastName = 'Le nom est obligatoire.'
    if (!isEditing && !formData.email.trim()) errors.email = "L'e-mail est obligatoire."
    if (!isEditing && !formData.password.trim()) errors.password = 'Le mot de passe est obligatoire.'
    if (!formData.position.trim()) errors.position = 'Le poste est obligatoire.'
    if (!formData.departmentId) errors.departmentId = 'Le département est obligatoire.'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      let res
      if (isEditing) {
        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || null,
          departmentId: Number(formData.departmentId),
          position: formData.position.trim(),
          contractType: formData.contractType || null,
          hireDate: formData.hireDate || null,
          active: true,
        }
        res = await staffService.updateStaff(staff.id, payload)
      } else {
        const payload = {
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || null,
          departmentId: Number(formData.departmentId),
          position: formData.position.trim(),
          contractType: formData.contractType || null,
          hireDate: formData.hireDate || null,
          language: 'fr',
        }
        res = await staffService.createStaff(payload)
      }

      if (res.success && res.data) {
        success(isEditing ? 'Membre mis à jour.' : 'Membre du personnel créé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        toastError(res.error?.message || 'Erreur lors de l’enregistrement.')
        if (res.error?.fieldErrors) {
          setFieldErrors(res.error.fieldErrors)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const departmentOptions = [
    { value: '', label: 'Sélectionner un département...' },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier le membre du personnel' : 'Nouveau membre du personnel'}
      description={
        isEditing
          ? `Mise à jour du profil staff #${staff.id}`
          : 'Créer un compte administratif et le rattacher à un département.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Prénom *"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={fieldErrors.firstName}
            placeholder="Ex: Awa"
            required
            autoFocus
          />
          <Input
            label="Nom *"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={fieldErrors.lastName}
            placeholder="Ex: Seck"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Adresse e-mail *"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email}
            placeholder="awa.seck@school.edu"
            disabled={isEditing}
            required={!isEditing}
          />
          {!isEditing ? (
            <Input
              label="Mot de passe *"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={fieldErrors.password}
              placeholder="Mot de passe initial"
              required
            />
          ) : (
            <Input
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={fieldErrors.phone}
              placeholder="+221 77 000 00 00"
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Poste / Fonction *"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            error={fieldErrors.position}
            placeholder="Ex: Comptable, Secrétaire de scolarité..."
            required
          />
          <div>
            <Select
              label="Département *"
              value={formData.departmentId}
              onChange={(val) => handleChange('departmentId', val)}
              options={departmentOptions}
              error={fieldErrors.departmentId}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Select
              label="Type de contrat"
              value={formData.contractType}
              onChange={(val) => handleChange('contractType', val)}
              options={CONTRACT_TYPES}
            />
          </div>
          <Input
            label="Date d'embauche"
            type="date"
            value={formData.hireDate}
            onChange={(e) => handleChange('hireDate', e.target.value)}
            error={fieldErrors.hireDate}
          />
        </div>

        {!isEditing && (
          <Input
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={fieldErrors.phone}
            placeholder="+221 77 000 00 00"
          />
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le membre'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StaffFormModal
