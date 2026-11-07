import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'

const ROLE_LABELS = {
  ALL: 'Tout le monde',
  STUDENT: 'Élèves',
  TEACHER: 'Enseignants',
  GUARDIAN: 'Parents / Tuteurs',
  STAFF: 'Personnel administratif',
}

export function AnnouncementDetailsModal({ isOpen, onClose, announcement, onOpenEdit }) {
  if (!announcement) return null

  const targetLabel = ROLE_LABELS[announcement.targetRole] || announcement.targetRole || 'ALL'
  const publishedDate = announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : 'Date inconnue'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={announcement.title || 'Détail de l’annonce'}
      subtitle={`Publié le ${publishedDate}`}
      footer={
        <div className="flex justify-between w-full">
          <div>
            {onOpenEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose?.()
                  onOpenEdit(announcement)
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
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-2xs font-semibold uppercase text-slate-400">Audience :</span>
          <StatusBadge status={targetLabel} size="xs" />
          {announcement.publishedByUserId && (
            <span className="ml-auto text-2xs text-slate-400">
              Auteur ID : #{announcement.publishedByUserId}
            </span>
          )}
        </div>

        <div className="whitespace-pre-wrap rounded border border-slate-100 bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-800">
          {announcement.content}
        </div>
      </div>
    </Modal>
  )
}

export default AnnouncementDetailsModal
