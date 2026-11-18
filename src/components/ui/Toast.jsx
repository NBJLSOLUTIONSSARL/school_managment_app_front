import { Check, X, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'
import { useToast } from '@/hooks/useToast'

const toastTypeStyles = {
  success: {
    container: 'bg-[var(--emerald-wash)] border-[var(--emerald)]/30 text-[var(--ink)]',
    iconColor: 'text-[var(--emerald)]',
    Icon: Check,
  },
  error: {
    container: 'bg-[var(--rose-wash)] border-[var(--rose)]/30 text-[var(--ink)]',
    iconColor: 'text-[var(--rose)]',
    Icon: X,
  },
  warning: {
    container: 'bg-[var(--amber-wash)] border-[var(--amber)]/30 text-[var(--ink)]',
    iconColor: 'text-[var(--amber)]',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-[var(--blue-wash)] border-[var(--blue-muted)]/30 text-[var(--ink)]',
    iconColor: 'text-[var(--blue-core)]',
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
        'flex w-80 select-none items-start gap-3 rounded-card border px-4 py-3 text-body shadow-elevated transition-all sm:w-96',
        style.container
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-tight text-xs font-bold',
          style.iconColor
        )}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 text-body font-semibold leading-tight">{title}</p>}
        {message && <p className="break-words text-label leading-normal opacity-90">{message}</p>}
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded-tight p-1 text-[var(--ink-muted)]/50 transition-colors hover:text-[var(--ink)] hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-core)]/20 cursor-pointer"
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