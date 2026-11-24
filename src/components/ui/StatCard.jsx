import { Sparkline } from './Sparkline'
import { CircularProgress } from './CircularProgress'

export function StatCard({
  title,
  value,
  subtitle,
  unit,
  progress,
  progressColor = '#5B5FC7',
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
      className={`figma-card bg-white border border-[#EDF0F8] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] hover:shadow-[0_8px_24px_-2px_rgba(91,95,199,0.08)] transition-all flex flex-col justify-between relative overflow-hidden select-none ${
        onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FC7]/20' : ''
      } ${className}`}
    >
      <div>
        {/* Top: Icon + Title */}
        <div className="flex items-center gap-2.5 mb-2.5">
          {Icon ? (
            <div className="w-8 h-8 rounded-xl bg-[#5B5FC7]/10 border border-[#5B5FC7]/15 flex items-center justify-center text-[#5B5FC7] shrink-0">
              <Icon className="w-4 h-4" strokeWidth={1.75} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
          )}
          <p className="text-xs font-semibold text-slate-500 truncate">{title}</p>
        </div>

        {/* Middle: Big Stat Value + Unit/Suffix */}
        <div className="flex items-baseline gap-1.5 flex-wrap my-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </span>
          {(unit || subtitle) && (
            <span className="text-xs font-normal text-slate-400">
              {unit || subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Trend Badge + Sparkline */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
        {resolvedTrend ? (
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
              isPositive
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                : 'text-rose-700 bg-rose-50 border border-rose-100'
            }`}
          >
            <span>{resolvedTrend}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Sparkline wave */}
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
