import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { studentService } from '../api/studentService'
import { useToast } from '@/hooks/useToast'

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Masculin' },
  { value: 'FEMALE', label: 'Féminin' },
  { value: 'OTHER', label: 'Autre' },
]

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
]

function getInitialStudentFormData(student) {
  if (!student) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      studentNumber: '',
      phone: '',
      birthDate: '',
      gender: 'MALE',
      address: '',
      previousSchool: '',
      status: 'ACTIVE',
      password: '',
    }
  }
  const u = student.user || {}
  return {
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    studentNumber: student.studentNumber || '',
    phone: u.phone || '',
    birthDate: student.birthDate || '',
    gender: student.gender || 'MALE',
    address: student.address || '',
    previousSchool: student.previousSchool || '',
    status: student.status || (u.active ? 'ACTIVE' : 'INACTIVE'),
    password: '',
  }
}

export function StudentFormModal({ isOpen, onClose, onSuccess, student = null }) {
  const { success, error: toastError } = useToast()
  const isEditing = Boolean(student?.id)

  const [formData, setFormData] = useState(() => getInitialStudentFormData(student))
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
    if (!formData.firstName.trim()) errors.firstName = 'Le prénom est obligatoire.'
    if (!formData.lastName.trim()) errors.lastName = 'Le nom est obligatoire.'
    if (!isEditing && !formData.email.trim()) errors.email = "L'e-mail est obligatoire."

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
          birthDate: formData.birthDate || null,
          gender: formData.gender,
          address: formData.address.trim() || null,
          previousSchool: formData.previousSchool.trim() || null,
          status: formData.status,
          active: formData.status === 'ACTIVE',
        }
        res = await studentService.updateStudent(student.id, payload)
      } else {
        const payload = {
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          studentNumber: formData.studentNumber.trim() || undefined,
          phone: formData.phone.trim() || null,
          birthDate: formData.birthDate || null,
          gender: formData.gender,
          address: formData.address.trim() || null,
          previousSchool: formData.previousSchool.trim() || null,
          status: formData.status,
          password: formData.password || undefined,
        }
        res = await studentService.createStudent(payload)
      }

      if (res.success && res.data) {
        success(isEditing ? 'Élève mis à jour avec succès.' : 'Élève créé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        toastError(res.error?.message || 'Erreur lors de la sauvegarde de l’élève.')
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
      title={isEditing ? "Modifier l'élève" : 'Nouvel élève'}
      description={
        isEditing
          ? `Modification de l'élève #${student.id} (${student.studentNumber || ''})`
          : 'Renseignez les informations de l’élève pour créer son profil et son compte.'
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
            placeholder="Ex: Moussa"
            required
            autoFocus
          />
          <Input
            label="Nom *"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={fieldErrors.lastName}
            placeholder="Ex: Diallo"
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
            placeholder="moussa.diallo@school.edu"
            disabled={isEditing}
            required={!isEditing}
          />
          <Input
            label="Numéro de téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={fieldErrors.phone}
            placeholder="+221 77 000 00 00"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Date de naissance"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            error={fieldErrors.birthDate}
          />
          <div>
            <Select
              label="Genre"
              value={formData.gender}
              onChange={(val) => handleChange('gender', val)}
              options={GENDER_OPTIONS}
            />
          </div>
          <div>
            <Select
              label="Statut"
              value={formData.status}
              onChange={(val) => handleChange('status', val)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Matricule (optionnel)"
            value={formData.studentNumber}
            onChange={(e) => handleChange('studentNumber', e.target.value)}
            error={fieldErrors.studentNumber}
            placeholder="Génération automatique si vide"
            disabled={isEditing}
          />
          {!isEditing && (
            <Input
              label="Mot de passe temporaire (optionnel)"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={fieldErrors.password}
              placeholder="Génération automatique si vide"
            />
          )}
        </div>

        <Input
          label="Établissement précédent"
          value={formData.previousSchool}
          onChange={(e) => handleChange('previousSchool', e.target.value)}
          error={fieldErrors.previousSchool}
          placeholder="Ex: Lycée Jean Mermoz"
        />

        <Input
          label="Adresse de résidence"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          error={fieldErrors.address}
          placeholder="Ex: 12 Rue des Almadies, Dakar"
        />

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer l’élève'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudentFormModal
