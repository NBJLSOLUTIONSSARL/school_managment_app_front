import { useI18n } from '@/hooks/useI18n'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  onClose,
  title,
  description,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  confirmVariant = 'danger',
  variant,
  isLoading = false,
}) {
  const { t } = useI18n()
  const handleCancel = onCancel || onClose
  const actualDescription = description ?? message ?? t('common.emptyDescription')
  const actualConfirmText = confirmText ?? confirmLabel ?? t('common.confirm')
  const actualCancelText = cancelText ?? cancelLabel ?? t('common.cancel')
  const actualVariant = variant ?? confirmVariant

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : handleCancel}
      title={title ?? t('common.confirm')}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEsc={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleCancel} disabled={isLoading}>
            {actualCancelText}
          </Button>
          <Button variant={actualVariant} size="sm" onClick={onConfirm} isLoading={isLoading}>
            {actualConfirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-1">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-600"
        >
          !
        </div>
        <p className="pt-1 text-xs leading-relaxed text-slate-600">
          {actualDescription}
        </p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
