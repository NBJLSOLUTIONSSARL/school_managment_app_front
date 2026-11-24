export function KpiDailySalesCard({
  currency = '$',
  value = '2,420',
  trend = '↑ 2.2%',
  title = 'Average Daily Sales',
  bars = [22, 44, 28, 54, 34, 48, 62, 40, 76, 88],
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
          <div className="flex items-baseline">
            {currency && (
              <span className="text-2xl font-light text-white/90 mr-1 select-none">
                {currency}
              </span>
            )}
            <span className="text-4xl font-bold tracking-tight text-white leading-none">
              {value}
            </span>
          </div>

          {trend && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#143425] text-[#34D399] border border-[#1e4d36] shrink-0 mt-0.5">
              {trend}
            </span>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-sm font-normal text-zinc-400 mt-2 tracking-normal">
          {title}
        </p>
      </div>

      {/* Mini Vertical Pill Bar Chart */}
      <div className="h-24 mt-8 flex items-end justify-between gap-2 px-1">
        {bars.map((heightPercent, index) => {
          const isLast = index === bars.length - 1
          return (
            <div
              key={index}
              className="relative flex-1 flex flex-col items-center justify-end h-full group/bar"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[10px] rounded-full transition-all duration-300 ${
                  isLast
                    ? 'bg-gradient-to-t from-[#B93662] via-[#E11D48] to-[#EEA44B] shadow-[0_0_12px_rgba(238,164,75,0.45)]'
                    : 'bg-white/[0.08] group-hover/bar:bg-white/[0.18]'
                }`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default KpiDailySalesCard
