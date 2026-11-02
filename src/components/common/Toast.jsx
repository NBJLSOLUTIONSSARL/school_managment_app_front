import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'
import { useToast } from '@/hooks/useToast'

const toastTypeStyles = {
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    iconColor: 'text-emerald-600',
    icon: '✓',
  },
  error: {
    container: 'bg-rose-50 border-rose-200 text-rose-900',
    iconColor: 'text-rose-600',
    icon: '✕',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    iconColor: 'text-amber-600',
    icon: '⚠',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    iconColor: 'text-blue-600',
    icon: 'ℹ',
  },
}

export function ToastItem({ toast, onClose }) {
  const { t } = useI18n()
  const { type = 'info', title, message } = toast
  const style = toastTypeStyles[type] || toastTypeStyles.info

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex w-80 select-none items-start gap-3 rounded border px-3.5 py-2.5 text-xs shadow-md transition-all sm:w-96',
        style.container
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold',
          style.iconColor
        )}
      >
        {style.icon}
      </div>

      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 text-xs font-semibold leading-tight">{title}</p>}
        {message && <p className="break-words text-2xs leading-normal opacity-90">{message}</p>}
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded p-0.5 text-xs text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        aria-label={t('common.close')}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { t } = useI18n()
  const { toasts, removeToast } = useToast()

  if (!toasts || toasts.length === 0) return null

  return (
    <aside
      aria-label={t('common.notifications')}
      className="pointer-events-none fixed bottom-4 end-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </aside>
  )
}

export default ToastContainer
