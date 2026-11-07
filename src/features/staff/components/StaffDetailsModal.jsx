import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export function StaffDetailsModal({ isOpen, onClose, staff, onOpenEdit }) {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['admin', 'ROLE_ADMIN', 'staff', 'ROLE_STAFF'])

  if (!staff) return null

  const user = staff.user || {}
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Personnel'
  const dept = staff.department

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={`Fiche du personnel administratif #${staff.id}`}
      size="md"
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{staff.position || 'Personnel'}</span>
            <StatusBadge status={user.active ? 'ACTIVE' : 'INACTIVE'} showDot />
          </div>
          {canEdit && onOpenEdit && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                onClose?.()
                onOpenEdit(staff)
              }}
            >
              Modifier
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded border border-slate-200 bg-slate-50 p-3">
          <div>
            <span className="text-2xs text-slate-400">Poste / Fonction</span>
            <div className="mt-0.5 font-medium text-slate-900">{staff.position || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Département</span>
            <div className="mt-0.5 font-medium text-slate-900">{dept?.name || 'Non rattaché'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Type de contrat</span>
            <div className="mt-0.5 font-medium text-slate-900">{staff.contractType || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Date d'embauche</span>
            <div className="mt-0.5 font-medium text-slate-900">{staff.hireDate || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Adresse e-mail</span>
            <div className="mt-0.5 font-medium text-slate-900 truncate">{user.email || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Téléphone</span>
            <div className="mt-0.5 font-medium text-slate-900">{user.phone || '-'}</div>
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

export default StaffDetailsModal
