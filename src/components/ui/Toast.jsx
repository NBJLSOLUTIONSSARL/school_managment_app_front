import { Check, X, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'
import { useToast } from '@/hooks/useToast'

const toastTypeStyles = {
  success: {
    container: 'bg-white border-emerald-200 text-slate-900 shadow-md',
    iconColor: 'text-emerald-600',
    Icon: Check,
  },
  error: {
    container: 'bg-white border-rose-200 text-slate-900 shadow-md',
    iconColor: 'text-rose-600',
    Icon: X,
  },
  warning: {
    container: 'bg-white border-amber-200 text-slate-900 shadow-md',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-slate-900 border-slate-800 text-white shadow-md',
    iconColor: 'text-slate-300',
    Icon: Info,
  },
}

export function ToastItem({ toast, onClose }) {
  const { t } = useI18n()
  const { type = 'info', title, message } = toast
  const style = toastTypeStyles[type] || toastTypeStyles.info
  const IconComponent = style.Icon || Info

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex w-80 select-none items-start gap-3 rounded-lg border px-3.5 py-2.5 text-xs transition-opacity sm:w-96',
        style.container
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold mt-0.5',
          style.iconColor
        )}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 text-xs font-semibold leading-tight">{title}</p>}
        {message && <p className="break-words text-2xs leading-normal opacity-90">{message}</p>}
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
        aria-label={t('common.close')}
      >
        <X className="w-3.5 h-3.5" />
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
