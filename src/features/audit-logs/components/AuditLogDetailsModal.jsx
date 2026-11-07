import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'

export function AuditLogDetailsModal({ isOpen, onClose, log }) {
  if (!log) return null

  const formattedDate = log.createdAt
    ? new Date(log.createdAt).toLocaleDateString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      })
    : '-'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Journal d'audit #${log.id}`}
      subtitle={`Enregistré le ${formattedDate}`}
      footer={
        <div className="flex justify-end w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-3 rounded border border-slate-100 bg-slate-50 p-3">
          <div>
            <span className="block text-2xs text-slate-400">Action exécutée :</span>
            <StatusBadge status={log.action} size="xs" />
          </div>
          <div>
            <span className="block text-2xs text-slate-400">Entité ciblée :</span>
            <span className="font-semibold text-slate-800">{log.entity}</span>
          </div>
          <div>
            <span className="block text-2xs text-slate-400">Utilisateur ID :</span>
            <span className="font-semibold text-slate-800">
              {log.userId ? `User #${log.userId}` : 'Système / Anonyme'}
            </span>
          </div>
          <div>
            <span className="block text-2xs text-slate-400">Adresse IP :</span>
            <span className="font-mono text-slate-700">{log.ipAddress || 'Non renseignée'}</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-3 text-2xs text-slate-500">
          Ce journal d'audit est immuable et tracé au niveau de la couche de service du backend.
        </div>
      </div>
    </Modal>
  )
}

export default AuditLogDetailsModal
