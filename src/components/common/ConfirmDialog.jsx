import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmation',
  description = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette opération est irréversible.',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onCancel}
      title={title}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEsc={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 font-bold text-sm">
          !
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pt-1">{description}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
