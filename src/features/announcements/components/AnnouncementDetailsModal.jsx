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

const STATUS_LABELS = {
  PUBLISHED: 'Publiée',
  DRAFT: 'Brouillon',
  ARCHIVED: 'Archivée',
}

export function AnnouncementDetailsModal({ isOpen, onClose, announcement, onOpenEdit }) {
  if (!announcement) return null

  const targetLabel = ROLE_LABELS[announcement.targetRole] || announcement.targetRole || 'ALL'
  const statusLabel = STATUS_LABELS[announcement.status] || announcement.status || 'Publiée'
  const isDraft = announcement.status === 'DRAFT'

  const subtitle =
    isDraft && !announcement.publishedAt
      ? 'Brouillon enregistré (non publié)'
      : announcement.publishedAt
        ? `Publié le ${new Date(announcement.publishedAt).toLocaleString('fr-FR', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}`
        : 'Date de publication inconnue'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={announcement.title || 'Détail de l’annonce'}
      subtitle={subtitle}
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
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-2xs font-semibold uppercase text-slate-400">Audience :</span>
          <StatusBadge status={targetLabel} size="xs" />
          <span className="text-2xs font-semibold uppercase text-slate-400 ml-2">Statut :</span>
          <StatusBadge status={statusLabel} size="xs" />
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
