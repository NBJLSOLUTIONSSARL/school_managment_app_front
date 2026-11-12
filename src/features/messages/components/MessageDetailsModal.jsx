import { useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { messageService } from '../api/messageService'

export function MessageDetailsModal({
  isOpen,
  onClose,
  message,
  currentUserId,
  onMessageRead,
  onReply,
}) {
  const isRecipient = message && currentUserId && Number(message.recipientId) === Number(currentUserId)

  useEffect(() => {
    if (isOpen && message?.id && !message.read && isRecipient) {
      messageService
        .markAsRead(message.id)
        .then((res) => {
          if (res?.success) {
            onMessageRead?.(message.id)
          }
        })
        .catch(() => {})
    }
  }, [isOpen, message?.id, message?.read, isRecipient, onMessageRead])

  if (!message) return null

  const formattedDate = message.sentAt
    ? new Date(message.sentAt).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={message.subject || 'Message'}
      subtitle={`Date d’envoi : ${formattedDate}`}
      footer={
        <div className="flex justify-between w-full">
          <div>
            {isRecipient && onReply && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose?.()
                  onReply(message)
                }}
              >
                Répondre
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div>
              <span className="text-2xs text-slate-400">Expéditeur : </span>
              <span className="font-semibold text-slate-800">
                User #{message.senderId}
                {Number(message.senderId) === Number(currentUserId) ? ' (Moi)' : ''}
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400">Destinataire : </span>
              <span className="font-semibold text-slate-800">
                User #{message.recipientId}
                {Number(message.recipientId) === Number(currentUserId) ? ' (Moi)' : ''}
              </span>
            </div>
          </div>
          <StatusBadge status={message.read ? 'Lu' : 'Non lu'} size="xs" />
        </div>

        <div className="whitespace-pre-wrap rounded border border-slate-200 bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-800 min-h-[120px]">
          {message.content}
        </div>
      </div>
    </Modal>
  )
}

export default MessageDetailsModal
