import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { messageService } from '../api/messageService'
import { useToast } from '@/hooks/useToast'

export function MessageComposeModal({
  isOpen,
  onClose,
  onSuccess,
  defaultRecipientId = '',
  defaultSubject = '',
}) {
  const { success, error: toastError } = useToast()

  const [recipientId, setRecipientId] = useState(defaultRecipientId ? String(defaultRecipientId) : '')
  const [subject, setSubject] = useState(defaultSubject || '')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (isSubmitting) return

    const errors = {}
    const parsedId = Number(recipientId)
    if (!recipientId || Number.isNaN(parsedId) || parsedId <= 0) {
      errors.recipientId = 'Un identifiant destinataire valide (entier positif) est requis.'
    }

    if (!subject.trim()) {
      errors.subject = 'L’objet du message est requis.'
    } else if (subject.length > 200) {
      errors.subject = 'L’objet ne peut pas dépasser 200 caractères.'
    }

    if (!content.trim()) {
      errors.content = 'Le contenu du message est requis.'
    } else if (content.length > 10000) {
      errors.content = 'Le contenu ne peut pas dépasser 10000 caractères.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await messageService.sendMessage({
        recipientId: parsedId,
        subject,
        content,
      })

      if (res.success) {
        success('Message envoyé avec succès.')
        onSuccess?.(res.data)
        onClose?.()
      } else {
        if (res.error?.fieldErrors) {
          setFieldErrors(res.error.fieldErrors)
        }
        toastError(res.error?.message || 'Erreur lors de l’envoi du message.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau Message"
      subtitle="Messagerie interne sécurisée"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Envoyer le message
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="mb-1 block font-medium text-slate-700">
            ID du destinataire (User ID) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={recipientId}
            onChange={(e) => {
              setRecipientId(e.target.value)
              if (fieldErrors.recipientId) {
                setFieldErrors((prev) => {
                  const next = { ...prev }
                  delete next.recipientId
                  return next
                })
              }
            }}
            placeholder="Ex : 2, 5, 12..."
            error={fieldErrors.recipientId}
            disabled={isSubmitting}
          />
          {fieldErrors.recipientId && (
            <p className="mt-1 text-2xs text-red-600">{fieldErrors.recipientId}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Objet <span className="text-red-500">*</span>
          </label>
          <Input
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value)
              if (fieldErrors.subject) {
                setFieldErrors((prev) => {
                  const next = { ...prev }
                  delete next.subject
                  return next
                })
              }
            }}
            placeholder="Objet de la communication..."
            maxLength={200}
            error={fieldErrors.subject}
            disabled={isSubmitting}
          />
          {fieldErrors.subject && (
            <p className="mt-1 text-2xs text-red-600">{fieldErrors.subject}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block font-medium text-slate-700">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (fieldErrors.content) {
                setFieldErrors((prev) => {
                  const next = { ...prev }
                  delete next.content
                  return next
                })
              }
            }}
            placeholder="Rédigez votre message ici..."
            rows={5}
            maxLength={10000}
            disabled={isSubmitting}
            className="w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
          />
          {fieldErrors.content && (
            <p className="mt-1 text-2xs text-red-600">{fieldErrors.content}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default MessageComposeModal
