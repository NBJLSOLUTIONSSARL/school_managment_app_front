import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export function TeacherDetailsModal({ isOpen, onClose, teacher, onOpenEdit }) {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])

  if (!teacher) return null

  const user = teacher.user || {}
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Enseignant'
  const dept = teacher.department

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={`Fiche de l'enseignant #${teacher.id}`}
      size="md"
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{teacher.specialization || 'Enseignant'}</span>
            <StatusBadge status={user.active ? 'ACTIVE' : 'INACTIVE'} showDot />
          </div>
          {canEdit && onOpenEdit && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                onClose?.()
                onOpenEdit(teacher)
              }}
            >
              Modifier
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded border border-slate-200 bg-slate-50 p-3">
          <div>
            <span className="text-2xs text-slate-400">Département</span>
            <div className="mt-0.5 font-medium text-slate-900">{dept?.name || 'Non rattaché'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Type de contrat</span>
            <div className="mt-0.5 font-medium text-slate-900">{teacher.contractType || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Adresse e-mail</span>
            <div className="mt-0.5 font-medium text-slate-900 truncate">{user.email || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Téléphone</span>
            <div className="mt-0.5 font-medium text-slate-900">{user.phone || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Date d'embauche</span>
            <div className="mt-0.5 font-medium text-slate-900">{teacher.hireDate || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Spécialisation</span>
            <div className="mt-0.5 font-medium text-slate-900">{teacher.specialization || '-'}</div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TeacherDetailsModal
