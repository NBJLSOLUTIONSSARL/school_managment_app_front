import { cn } from '@/utils/classNames'
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
  const { type = 'info', title, message } = toast
  const style = toastTypeStyles[type] || toastTypeStyles.info

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded border px-3.5 py-2.5 shadow-md transition-all text-xs w-80 sm:w-96 select-none',
        style.container
      )}
    >
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded font-bold text-xs',
          style.iconColor
        )}
      >
        {style.icon}
      </div>

      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-xs leading-tight mb-0.5">{title}</p>}
        {message && <p className="text-2xs opacity-90 leading-normal break-words">{message}</p>}
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-700 p-0.5 text-xs rounded transition-colors"
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (!toasts || toasts.length === 0) return null

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
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
