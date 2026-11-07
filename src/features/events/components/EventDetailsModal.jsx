import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function EventDetailsModal({ isOpen, onClose, event, onOpenEdit }) {
  if (!event) return null

  const formatDateTime = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title || 'Détail de l’événement'}
      subtitle={`Lieu : ${event.location || 'Non spécifié'}`}
      footer={
        <div className="flex justify-between w-full">
          <div>
            {onOpenEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose?.()
                  onOpenEdit(event)
                }}
              >
                Modifier
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs text-slate-700">
        <div className="grid grid-cols-1 gap-2 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2">
          <div>
            <span className="block text-2xs font-semibold uppercase text-slate-400">Début :</span>
            <span className="font-medium text-slate-900">{formatDateTime(event.startAt)}</span>
          </div>
          <div>
            <span className="block text-2xs font-semibold uppercase text-slate-400">Fin :</span>
            <span className="font-medium text-slate-900">{formatDateTime(event.endAt)}</span>
          </div>
          <div className="sm:col-span-2 mt-1 pt-1 border-t border-slate-200">
            <span className="block text-2xs font-semibold uppercase text-slate-400">Lieu :</span>
            <span className="font-medium text-slate-900">📍 {event.location || '-'}</span>
          </div>
          {event.organizerId && (
            <div className="sm:col-span-2">
              <span className="text-2xs text-slate-400">Organisateur ID : #{event.organizerId}</span>
            </div>
          )}
        </div>

        {event.description ? (
          <div>
            <span className="block mb-1 text-2xs font-semibold uppercase text-slate-400">
              Description :
            </span>
            <div className="whitespace-pre-wrap rounded border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800">
              {event.description}
            </div>
          </div>
        ) : (
          <p className="text-2xs italic text-slate-400">Aucune description fournie.</p>
        )}
      </div>
    </Modal>
  )
}

export default EventDetailsModal
