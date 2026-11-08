import { cn } from '@/utils/classNames'

const statusMap = {
  // Frappe DocType statuses & EduTrack Figma statuses
  Draft: {
    bg: 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]',
    dot: 'bg-[#0F172A]',
  },
  Submitted: {
    bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    dot: 'bg-[#10B981]',
  },
  Completed: {
    bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    dot: 'bg-[#10B981]',
  },
  Active: {
    bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    dot: 'bg-[#10B981]',
  },
  Paid: {
    bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    dot: 'bg-[#10B981]',
  },
  Pending: {
    bg: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    dot: 'bg-[#F59E0B]',
  },
  Warning: {
    bg: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    dot: 'bg-[#F59E0B]',
  },
  Cancelled: {
    bg: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    dot: 'bg-[#EF4444]',
  },
  Overdue: {
    bg: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    dot: 'bg-[#EF4444]',
  },
  Suspended: {
    bg: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    dot: 'bg-[#EF4444]',
  },
  'At Risk': {
    bg: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    dot: 'bg-[#F59E0B]',
  },
  Inactive: {
    bg: 'bg-slate-100 text-[#64748B] border-slate-200',
    dot: 'bg-slate-400',
  },
  Locked: {
    bg: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    dot: 'bg-[#F59E0B]',
  },
  Open: {
    bg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    dot: 'bg-[#10B981]',
  },
  Info: {
    bg: 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]',
    dot: 'bg-[#0F172A]',
  },
}

export function StatusBadge({
  status = 'Draft',
  label,
  showDot = false,
  className = '',
  size = 'sm',
}) {
  const statusKey =
    typeof status === 'string'
      ? status
      : typeof status === 'object' && status !== null
        ? status.status || status.value || status.label || 'Draft'
        : 'Draft'

  const normalizedKey = statusMap[statusKey] ? statusKey : 'Draft'
  const current = statusMap[normalizedKey]

  const resolvedLabel =
    typeof label === 'string'
      ? label
      : typeof label === 'object' && label !== null
        ? label.label || label.name || String(label)
        : typeof status === 'string'
          ? status
          : typeof status === 'object' && status !== null
            ? status.label || status.name || status.status || 'Draft'
            : String(status || 'Draft')

  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border select-none',
        current.bg,
        sizeClasses,
        className
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', current.dot)} />}
      <span>{resolvedLabel}</span>
    </span>
  )
}

export default StatusBadge
