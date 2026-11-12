import { Plus } from 'lucide-react'
import { cn } from '@/utils/classNames'

// Category mapping to the 4 status styles in the reference image:
// 1. To Contact (neutral / slate)
// 2. Follow-Up (sky blue)
// 3. In Negotiation (amber / warning)
// 4. Complete / Active (emerald / success)
const statusVariants = {
  // Complete / Success (Green)
  complete: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  active: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  paid: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  accepted: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  submitted: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  completed: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  open: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',

  // Follow-Up / Information (Sky Blue)
  'follow-up': 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  under_review: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  'under review': 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  info: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  in_progress: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  'in progress': 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  partial: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',

  // In Negotiation / Pending (Amber)
  'in negotiation': 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  pending: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  waitlisted: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  warning: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  'at risk': 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  unpaid: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',

  // To Contact / Draft / Neutral / Danger (Slate / Neutral)
  'to contact': 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]',
  draft: 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]',
  inactive: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
  overdue: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  rejected: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  cancelled: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  suspended: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
}

export function StatusBadge({
  status = 'Draft',
  label,
  showDot = false,
  showPlus = true,
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
        'inline-flex items-center gap-1 rounded-full font-medium border select-none transition-colors shadow-2xs',
        variantClass,
        sizeClasses,
        className
      )}
    >
      {showPlus && <Plus className="w-3 h-3 stroke-[2.5] opacity-75 shrink-0" />}
      {showDot && !showPlus && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      <span className="truncate">{resolvedLabel}</span>
    </span>
  )
}

export default StatusBadge
