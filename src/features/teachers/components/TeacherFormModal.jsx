import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { teacherService } from '../api/teacherService'
import { departmentService } from '@/features/departments/api/departmentService'
import { useToast } from '@/hooks/useToast'

const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI (Contrat à durée indéterminée)' },
  { value: 'CDD', label: 'CDD (Contrat à durée déterminée)' },
  { value: 'VACATAIRE', label: 'Vacataire' },
  { value: 'FULL_TIME', label: 'Temps plein' },
  { value: 'PART_TIME', label: 'Temps partiel' },
]

function getInitialFormData(teacher) {
  if (!teacher) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      departmentId: '',
      specialization: '',
      contractType: 'CDI',
      hireDate: '',
    }
  }
  const u = teacher.user || {}
  return {
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    password: '',
    phone: u.phone || '',
    departmentId: teacher.department?.id ? String(teacher.department.id) : '',
    specialization: teacher.specialization || '',
    contractType: teacher.contractType || 'CDI',
    hireDate: teacher.hireDate || '',
  }
}

export function TeacherFormModal({ isOpen, onClose, onSuccess, teacher = null }) {
  const { success, error: toastError } = useToast()
  const isEditing = Boolean(teacher?.id)

  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState(() => getInitialFormData(teacher))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Fetch departments for dropdown
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
          specialization: formData.specialization.trim() || null,
          contractType: formData.contractType || null,
          hireDate: formData.hireDate || null,
          active: true,
        }
        res = await teacherService.updateTeacher(teacher.id, payload)
      } else {
        const payload = {
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || null,
          departmentId: Number(formData.departmentId),
          specialization: formData.specialization.trim() || null,
          contractType: formData.contractType || null,
          hireDate: formData.hireDate || null,
          language: 'fr',
        }
        res = await teacherService.createTeacher(payload)
      }

      if (res.success && res.data) {
        success(isEditing ? 'Enseignant mis à jour.' : 'Enseignant créé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        toastError(res.error?.message || 'Erreur lors de l’enregistrement de l’enseignant.')
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
      title={isEditing ? "Modifier l'enseignant" : 'Nouvel enseignant'}
      description={
        isEditing
          ? `Mise à jour du profil enseignant #${teacher.id}`
          : 'Créer un compte enseignant et le rattacher à un département académique.'
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
            placeholder="Ex: Cheikh"
            required
            autoFocus
          />
          <Input
            label="Nom *"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={fieldErrors.lastName}
            placeholder="Ex: Anta Diop"
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
            placeholder="cheikh.diop@school.edu"
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
          <div>
            <Select
              label="Département académique *"
              value={formData.departmentId}
              onChange={(val) => handleChange('departmentId', val)}
              options={departmentOptions}
              error={fieldErrors.departmentId}
              required
            />
          </div>
          <Input
            label="Spécialité / Discipline"
            value={formData.specialization}
            onChange={(e) => handleChange('specialization', e.target.value)}
            error={fieldErrors.specialization}
            placeholder="Ex: Physique-Chimie, Histoire..."
          />
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
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer l’enseignant'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TeacherFormModal
