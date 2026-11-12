import { Sparkline } from './Sparkline'
import { CircularProgress } from './CircularProgress'

export function StatCard({
  title,
  value,
  subtitle,
  unit,
  progress,
  progressColor = '#2563EB',
  progressLabel,
  icon: Icon,
  badgeText,
  badgeType = 'positive',
  trend,
  trendType = 'positive',
  trendValue,
  sparklineData,
  className = '',
  onClick,
  variant, // supports backwards-compatibility for variants
}) {
  // Determine trend text and direction
  const resolvedTrend = trendValue || badgeText || trend || (variant === 'blue' || variant === 'purple' || variant === 'green' ? '↗ 3.5%' : variant === 'darkBlue' ? '↘ 1.2%' : null)
  const isPositive =
    trendType === 'positive' ||
    trendType === 'up' ||
    badgeType === 'positive' ||
    badgeType === 'up' ||
    (typeof resolvedTrend === 'string' && resolvedTrend.includes('↗')) ||
    (typeof resolvedTrend === 'string' && !resolvedTrend.includes('↘') && !resolvedTrend.includes('-'))

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
      className={`bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between relative overflow-hidden select-none ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      } ${className}`}
    >
      <div>
        {/* Top: Icon + Title */}
        <div className="flex items-center gap-2.5 mb-2">
          {Icon ? (
            <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#4B5563] shrink-0">
              <Icon className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#4B5563] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
            </div>
          )}
          <p className="text-xs font-medium text-[#4B5563] truncate">{title}</p>
        </div>

        {/* Middle: Big Stat Value + Unit/Suffix */}
        <div className="flex items-baseline gap-1.5 flex-wrap my-1">
          <span className="text-2xl sm:text-2.5xl font-bold tracking-tight text-[#111827]">
            {value}
          </span>
          {(unit || subtitle) && (
            <span className="text-xs font-normal text-[#6B7280]">
              {unit || subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Trend Badge + Sparkline */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2">
        {resolvedTrend ? (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              isPositive ? 'text-[#059669]' : 'text-[#DC2626]'
            }`}
          >
            <span>{resolvedTrend}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Sparkline wave matching the image */}
        {progress !== undefined ? (
          <CircularProgress
            value={progress}
            color={progressColor}
            label={progressLabel}
            size={32}
            strokeWidth={3}
          />
        ) : (
          <Sparkline
            data={sparklineData}
            trend={isPositive ? 'up' : 'down'}
            width={84}
            height={26}
          />
        )}
      </div>
    </div>
  )
}

export default StatCard
