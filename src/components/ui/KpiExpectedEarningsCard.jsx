export function KpiExpectedEarningsCard({
  currency = '$',
  value = '69.24k',
  trend = '↑ 2.2%',
  title = 'Expected Earnings',
  breakdown = [
    { label: 'Shoes', value: '$7,660' },
    { label: 'Gaming', value: '$2,820' },
    { label: 'Others', value: '$45,257' },
  ],
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

      {/* Breakdown Items List */}
      <div className="space-y-3 mt-8 pt-1">
        {breakdown.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-zinc-400 font-normal">{item.label}</span>
            <span className="text-white font-medium tracking-tight">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KpiExpectedEarningsCard
