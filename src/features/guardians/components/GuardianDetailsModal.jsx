import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'

export function GuardianDetailsModal({ isOpen, onClose, guardian }) {
  if (!guardian) return null

  const user = guardian.user || {}
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Tuteur'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={`Fiche détaillée du tuteur #${guardian.id}`}
      size="md"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 rounded border border-slate-200 bg-slate-50 p-3">
          <div>
            <span className="text-2xs text-slate-400">Statut du compte</span>
            <div className="mt-0.5">
              <StatusBadge status={user.active ? 'ACTIVE' : 'INACTIVE'} showDot />
            </div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Profession</span>
            <div className="mt-0.5 font-medium text-slate-800">
              {guardian.profession || 'Non renseignée'}
            </div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Adresse e-mail</span>
            <div className="mt-0.5 font-medium text-slate-800">{user.email || '-'}</div>
          </div>
          <div>
            <span className="text-2xs text-slate-400">Téléphone</span>
            <div className="mt-0.5 font-medium text-slate-800">{user.phone || '-'}</div>
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

export default GuardianDetailsModal
