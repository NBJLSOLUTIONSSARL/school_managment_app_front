import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { GuardianSearch } from '@/features/guardians/components/GuardianSearch'
import { GuardianFormModal } from '@/features/guardians/components/GuardianFormModal'
import { studentService } from '../api/studentService'
import { useToast } from '@/hooks/useToast'

const RELATIONSHIPS = [
  { value: 'Père', label: 'Père' },
  { value: 'Mère', label: 'Mère' },
  { value: 'Tuteur légal', label: 'Tuteur légal' },
  { value: 'Oncle', label: 'Oncle' },
  { value: 'Tante', label: 'Tante' },
  { value: 'Grand-parent', label: 'Grand-parent' },
  { value: 'Autre', label: 'Autre' },
]

export function StudentGuardianModal({ isOpen, onClose, student, onSuccess }) {
  const { success, error: toastError } = useToast()

  const [selectedGuardian, setSelectedGuardian] = useState(null)
  const [relationship, setRelationship] = useState('Père')
  const [customRelationship, setCustomRelationship] = useState('')
  const [primaryContact, setPrimaryContact] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateGuardianOpen, setIsCreateGuardianOpen] = useState(false)
  const [error, setError] = useState('')

  const studentName = student?.user
    ? `${student.user.firstName} ${student.user.lastName}`.trim()
    : 'l’élève'

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (isSubmitting) return

    if (!selectedGuardian?.id) {
      setError('Veuillez sélectionner un tuteur.')
      return
    }

    const relValue = relationship === 'Autre' ? customRelationship.trim() : relationship
    if (!relValue) {
      setError('Veuillez spécifier le lien de parenté.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        guardianId: Number(selectedGuardian.id),
        relationship: relValue,
        primaryContact: Boolean(primaryContact),
      }

      const res = await studentService.assignGuardian(student.id, payload)
      if (res.success && res.data) {
        success('Tuteur associé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
        setSelectedGuardian(null)
        setRelationship('Père')
        setCustomRelationship('')
        setPrimaryContact(false)
      } else {
        const msg = res.error?.message || 'Erreur lors de l’association du tuteur.'
        toastError(msg)
        setError(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Associer un tuteur légal"
        description={`Ajout ou mise à jour du tuteur pour ${studentName}`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block text-2xs font-medium text-slate-700">
              Sélectionner le tuteur légal *
            </label>
            <GuardianSearch
              value={selectedGuardian}
              onChange={(g) => {
                setSelectedGuardian(g)
                if (error) setError('')
              }}
              onOpenCreateNew={() => setIsCreateGuardianOpen(true)}
              error={error}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Select
                label="Lien de parenté *"
                value={relationship}
                onChange={(val) => setRelationship(val)}
                options={RELATIONSHIPS}
                required
              />
            </div>

            {relationship === 'Autre' && (
              <Input
                label="Précisez la relation *"
                value={customRelationship}
                onChange={(e) => setCustomRelationship(e.target.value)}
                placeholder="Ex: Frère aîné, Cousin..."
                required
              />
            )}
          </div>

          <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 p-2.5">
            <input
              type="checkbox"
              id="primaryContactCheckbox"
              checked={primaryContact}
              onChange={(e) => setPrimaryContact(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="primaryContactCheckbox" className="text-2xs text-slate-700">
              Définir comme <strong>contact principal</strong> en cas d&apos;urgence ou de notification.
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Association...' : 'Valider l’association'}
            </Button>
          </div>
        </form>
      </Modal>

      {isCreateGuardianOpen && (
        <GuardianFormModal
          isOpen={isCreateGuardianOpen}
          onClose={() => setIsCreateGuardianOpen(false)}
          onSuccess={(newGuardian) => {
            setSelectedGuardian(newGuardian)
            setIsCreateGuardianOpen(false)
          }}
        />
      )}
    </>
  )
}

export default StudentGuardianModal
