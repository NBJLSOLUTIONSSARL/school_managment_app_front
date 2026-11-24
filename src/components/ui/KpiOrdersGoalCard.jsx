export function KpiOrdersGoalCard({
  value = '1,836',
  trend = '↓ 2.2%',
  title = 'Orders This Month',
  goalText = '1,048 to Goal',
  progressPercent = 64,
  onClick,
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      className={`group relative flex flex-col justify-between p-6 rounded-[28px] bg-[#232426] text-white border border-white/[0.04] shadow-lg shadow-black/20 select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:border-white/[0.1] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div>
        {/* Top Metric Header */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-4xl font-bold tracking-tight text-white leading-none">
            {value}
          </span>

          {trend && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#36191E] text-[#F87171] border border-[#4E222A] shrink-0 mt-0.5">
              {trend}
            </span>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-sm font-normal text-zinc-400 mt-2 tracking-normal">
          {title}
        </p>
      </div>

      {/* Decorative Subtle Wireframe Concentric Loops */}
      <div className="relative my-2 h-14 flex items-center justify-center overflow-hidden pointer-events-none opacity-40">
        <svg
          className="w-full h-full text-white/30"
          viewBox="0 0 240 60"
          fill="none"
          preserveAspectRatio="none"
        >
          <ellipse
            cx="120"
            cy="18"
            rx="92"
            ry="14"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.8"
          />
          <ellipse
            cx="120"
            cy="32"
            rx="84"
            ry="13"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.5"
          />
          <ellipse
            cx="120"
            cy="46"
            rx="76"
            ry="12"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Bottom Goal & Glowing Segmented Progress Bar */}
      <div>
        <p className="text-sm font-medium text-zinc-300 mb-2.5">{goalText}</p>
        <div className="relative h-3 w-full rounded-full bg-white/[0.07] overflow-hidden p-0.5 flex items-center">
          {/* Subtle segmented ticks in track */}
          <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-15">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="w-[1px] h-1.5 bg-white rounded-full" />
            ))}
          </div>

          {/* Filled glowing gradient progress */}
          <div
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            className="relative h-full rounded-full bg-gradient-to-r from-[#B93662] via-[#E11D48] to-[#EEA44B] shadow-[0_0_12px_rgba(244,63,94,0.55)] transition-all duration-500"
          />
        </div>
      </div>
    </div>
  )
}

export default KpiOrdersGoalCard
