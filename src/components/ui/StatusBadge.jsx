import { Plus } from 'lucide-react'
import { cn } from '@/utils/classNames'

// Disciplined Frappe Desk Status Variants: Quiet, toned-down semantic tones
const statusVariants = {
  // Complete / Success (Emerald)
  complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Information / In Progress (Sky)
  'follow-up': 'bg-sky-50 text-sky-700 border-sky-200',
  under_review: 'bg-sky-50 text-sky-700 border-sky-200',
  'under review': 'bg-sky-50 text-sky-700 border-sky-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  'in progress': 'bg-sky-50 text-sky-700 border-sky-200',
  partial: 'bg-sky-50 text-sky-700 border-sky-200',

  // Pending / Warning (Amber)
  'in negotiation': 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  waitlisted: 'bg-amber-50 text-amber-700 border-amber-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  'at risk': 'bg-amber-50 text-amber-700 border-amber-200',
  unpaid: 'bg-amber-50 text-amber-700 border-amber-200',

  // Draft / Inactive / Neutral (Slate)
  'to contact': 'bg-slate-50 text-slate-700 border-slate-200',
  draft: 'bg-slate-50 text-slate-700 border-slate-200',
  inactive: 'bg-slate-50 text-slate-600 border-slate-200',

  // Danger / Terminated (Rose)
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function StatusBadge({
  status = 'Draft',
  label,
  showDot = true,
  showPlus = false,
  className = '',
  size = 'sm',
}) {
  const statusKey =
    typeof status === 'string'
      ? status
      : typeof status === 'object' && status !== null
        ? status.status || status.value || status.label || 'Draft'
        : 'Draft'

  const normalizedKey = String(statusKey).toLowerCase().trim()
  const variantClass =
    statusVariants[normalizedKey] ||
    (normalizedKey.includes('active') || normalizedKey.includes('paid') || normalizedKey.includes('complete')
      ? statusVariants.complete
      : normalizedKey.includes('pending') || normalizedKey.includes('wait')
        ? statusVariants['in negotiation']
        : normalizedKey.includes('review') || normalizedKey.includes('follow')
          ? statusVariants['follow-up']
          : statusVariants['to contact'])

  const rawLabel =
    typeof label === 'string'
      ? label
      : typeof label === 'object' && label !== null
        ? label.label || label.name || String(label)
        : typeof status === 'string'
          ? status
          : typeof status === 'object' && status !== null
            ? status.label || status.name || status.status || 'Draft'
            : String(status || 'Draft')

  const resolvedLabel = rawLabel.replace(/^([+•\-\s]+)/, '').trim()

  const sizeClasses = size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium border select-none transition-colors shadow-2xs',
        variantClass,
        sizeClasses,
        className
      )}
    >
      {showPlus && <Plus className="w-3 h-3 stroke-[2] opacity-75 shrink-0" />}
      {showDot && !showPlus && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      <span className="truncate">{resolvedLabel}</span>
    </span>
  )
}

export default StatusBadge
