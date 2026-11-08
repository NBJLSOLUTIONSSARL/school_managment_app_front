import { CircularProgress } from './CircularProgress'

export function StatCard({
  title,
  value,
  subtitle,
  progress,
  progressColor = '#2563EB',
  progressLabel,
  icon: Icon,
  badgeText,
  badgeType = 'positive',
  trend,
  trendType = 'positive',
  iconBg = 'bg-[#EFF6FF]',
  iconColor = 'text-[#2563EB]',
  submetrics,
  subMetrics,
  className = '',
  onClick,
  variant, // 'blue' | 'darkBlue' | 'mediumBlue' | 'skyBlue' | 'purple' | 'orange' | 'green'
}) {
  // If a variant is specified, render the modern card style aligned with the Blue Palette
  if (variant) {
    const variantStyles = {
      // Blue palette primary variants
      blue: {
        bg: 'bg-[#EFF6FF]',
        border: 'border-[#DBEAFE]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#2563EB]',
      },
      darkBlue: {
        bg: 'bg-[#F0F7FF]',
        border: 'border-[#BFDBFE]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#1D4ED8]',
      },
      mediumBlue: {
        bg: 'bg-[#F8FAFC]',
        border: 'border-[#E2E8F0]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#3B82F6]',
      },
      skyBlue: {
        bg: 'bg-[#F0F9FF]',
        border: 'border-[#BAE6FD]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#0284C7]',
      },
      // Compatible pastel mappings
      purple: {
        bg: 'bg-[#EFF6FF]',
        border: 'border-[#DBEAFE]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#2563EB]',
      },
      cyan: {
        bg: 'bg-[#F0F9FF]',
        border: 'border-[#BAE6FD]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#0284C7]',
      },
      orange: {
        bg: 'bg-[#F8FAFC]',
        border: 'border-[#E2E8F0]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#3B82F6]',
      },
      peach: {
        bg: 'bg-[#F8FAFC]',
        border: 'border-[#E2E8F0]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#3B82F6]',
      },
      green: {
        bg: 'bg-[#F0F7FF]',
        border: 'border-[#BFDBFE]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#1D4ED8]',
      },
      mint: {
        bg: 'bg-[#F0F7FF]',
        border: 'border-[#BFDBFE]',
        label: 'text-[#64748B]',
        value: 'text-[#0F172A]',
        iconColor: 'text-[#1D4ED8]',
      },
    }

    const current = variantStyles[variant] || variantStyles.blue

    return (
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick(e)
                }
              }
            : undefined
        }
        className={`${current.bg} border ${current.border} p-5 rounded-2xl flex items-center justify-between transition-all select-none shadow-2xs ${
          onClick ? 'cursor-pointer hover:shadow-xs hover:border-[#2563EB] hover:scale-[1.01]' : ''
        } ${className}`}
      >
        <div className="min-w-0 pr-3">
          <p className={`text-xs font-medium ${current.label} mb-1 truncate`}>{title}</p>
          <div className={`text-2xl sm:text-2.5xl font-bold tracking-tight ${current.value} truncate`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-[#64748B] mt-1 truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="shrink-0 flex items-center justify-center">
            <Icon className={`w-8 h-8 sm:w-9 sm:h-9 ${current.iconColor} stroke-[1.75]`} />
          </div>
        )}
      </div>
    )
  }

  // Classic fallback layout
  const resolvedBadge = badgeText || trend
  const resolvedBadgeType = badgeText ? badgeType : trendType
  const resolvedSubmetrics = submetrics || subMetrics || []

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      className={`bg-white p-3.5 sm:p-4 rounded-xl border border-[#E2E8F0] shadow-2xs hover:shadow-xs hover:border-[#2563EB]/40 transition-all flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2.5 mb-2">
          {Icon ? (
            <div
              className={`w-7 h-7 rounded-lg border border-[#DBEAFE] flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          ) : (
            <div className="w-7 h-7" />
          )}
          {progress !== undefined && (
            <CircularProgress
              value={progress}
              color={progressColor}
              label={progressLabel}
              size={32}
              strokeWidth={3}
            />
          )}
        </div>

        <p className="text-2xs font-semibold text-[#64748B] tracking-tight truncate mb-0.5">
          {title}
        </p>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#0F172A]">
            {value}
          </span>
          {resolvedBadge && (
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 border ${
                resolvedBadgeType === 'positive' || resolvedBadgeType === 'up'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
                  : resolvedBadgeType === 'negative' || resolvedBadgeType === 'down'
                    ? 'text-rose-700 bg-rose-50 border-rose-200/70'
                    : 'text-[#2563EB] bg-[#EFF6FF] border-[#DBEAFE]'
              }`}
            >
              {resolvedBadge}
            </span>
          )}
        </div>
      </div>

      {(resolvedSubmetrics.length > 0 || subtitle) && (
        <div className="mt-3 pt-2.5 border-t border-[#F1F5F9]">
          {resolvedSubmetrics.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 text-2xs">
              {resolvedSubmetrics.map((sub, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[10px] text-[#94A3B8] font-medium truncate">{sub.label}</span>
                  <span className="font-semibold text-[#0F172A] truncate">{sub.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-2xs text-[#94A3B8] truncate">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default StatCard
