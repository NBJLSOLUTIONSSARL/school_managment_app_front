import { cn } from '@/utils/classNames'

const statusMap = {
  // Frappe DocType statuses
  Draft: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
  Submitted: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Completed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Active: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Paid: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  Warning: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  Cancelled: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  Overdue: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  Suspended: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  Inactive: {
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  Info: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
}

export function StatusBadge({ status = 'Draft', showDot = false, className = '', size = 'sm' }) {
  const normalizedKey = statusMap[status] ? status : 'Draft'
  const current = statusMap[normalizedKey]

  const sizeClasses = size === 'xs' ? 'text-[10px] px-1.5 py-0.2' : 'text-2xs px-2 py-0.5'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-medium border select-none',
        current.bg,
        sizeClasses,
        className
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', current.dot)} />}
      <span>{status}</span>
    </span>
  )
}

export default StatusBadge
