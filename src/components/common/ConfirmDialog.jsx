import { useI18n } from '@/hooks/useI18n'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
  confirmVariant = 'danger',
  isLoading = false,
}) {
  const { t } = useI18n()

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onCancel}
      title={title ?? t('common.confirm')}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEsc={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelText ?? t('common.cancel')}
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmText ?? t('common.confirm')}
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
          {description ?? t('common.emptyDescription')}
        </p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
