import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'

function formatDateTime(dateVal) {
  if (!dateVal) return '-'
  try {
    const d = new Date(dateVal)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'medium',
    })
  } catch {
    return '-'
  }
}

export function AuditLogDetailsModal({ isOpen, onClose, log }) {
  if (!log) return null

  const formattedDate = formatDateTime(log.createdAt)

  const renderDetails = () => {
    const details = log.details || log.description || log.message || log.payload
    if (!details) return null

    if (typeof details === 'object') {
      return (
        <div>
          <span className="block text-2xs font-medium text-slate-500 mb-1">
            Données complémentaires :
          </span>
          <pre className="max-h-48 overflow-auto rounded border border-slate-200 bg-slate-900 p-2.5 font-mono text-2xs text-emerald-400">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div>
        <span className="block text-2xs font-medium text-slate-500 mb-1">
          Détails / Message :
        </span>
        <div className="rounded border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-800 break-words">
          {String(details)}
        </div>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Journal d'audit #${log.id ?? ''}`}
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
            <span className="font-semibold text-slate-800">{log.entity || '-'}</span>
          </div>
          {log.entityId != null && (
            <div>
              <span className="block text-2xs text-slate-400">Identifiant Entité :</span>
              <span className="font-mono text-slate-800">#{log.entityId}</span>
            </div>
          )}
          <div>
            <span className="block text-2xs text-slate-400">Utilisateur :</span>
            <span className="font-semibold text-slate-800">
              {log.userId ? `User #${log.userId}` : 'Système / Anonyme'}
              {log.username ? ` (${log.username})` : ''}
            </span>
          </div>
          <div>
            <span className="block text-2xs text-slate-400">Adresse IP :</span>
            <span className="font-mono text-slate-700">{log.ipAddress || 'Non renseignée'}</span>
          </div>
          {log.userAgent && (
            <div className="col-span-2">
              <span className="block text-2xs text-slate-400">Navigateur / User Agent :</span>
              <span className="font-mono text-2xs text-slate-600 break-words">{log.userAgent}</span>
            </div>
          )}
        </div>

        {renderDetails()}
      </div>
    </Modal>
  )
}

export default AuditLogDetailsModal
