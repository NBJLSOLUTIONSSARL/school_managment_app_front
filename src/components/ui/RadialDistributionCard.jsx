import { MoreVertical } from 'lucide-react'

export function RadialDistributionCard({
  title = 'Students',
  totalLabel = 'Total',
  totalValue = '15000',
  outerColor = '#2563EB',
  outerPercent = 75,
  outerLabel = 'Male',
  innerColor = '#38BDF8',
  innerPercent = 55,
  innerLabel = 'Female',
  onOptionsClick,
  className = '',
}) {
  // SVG dimensions
  const size = 200
  const center = size / 2

  // Outer ring parameters
  const outerRadius = 78
  const outerStroke = 12
  const outerCircumference = 2 * Math.PI * outerRadius
  const outerOffset = outerCircumference - (Math.min(100, Math.max(0, outerPercent)) / 100) * outerCircumference

  // Inner ring parameters
  const innerRadius = 58
  const innerStroke = 12
  const innerCircumference = 2 * Math.PI * innerRadius
  const innerOffset = innerCircumference - (Math.min(100, Math.max(0, innerPercent)) / 100) * innerCircumference

  return (
    <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs flex flex-col justify-between select-none ${className}`}>
      {/* Header with Title and More Action */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={onOptionsClick}
          className="text-[#64748B] hover:text-[#2563EB] p-1 rounded-lg hover:bg-[#EFF6FF] transition cursor-pointer"
          aria-label="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Center Dual Radial Progress Graphic */}
      <div className="relative flex items-center justify-center my-auto py-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible -rotate-90 transform"
        >
          {/* Outer Track */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="#EFF6FF"
            strokeWidth={outerStroke}
          />
          {/* Outer Progress Ring (Male / Primary Blue) */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke={outerColor}
            strokeWidth={outerStroke}
            strokeDasharray={outerCircumference}
            strokeDashoffset={outerOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Inner Track */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="#F0F9FF"
            strokeWidth={innerStroke}
          />
          {/* Inner Progress Ring (Female / Sky Blue) */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke={innerColor}
            strokeWidth={innerStroke}
            strokeDasharray={innerCircumference}
            strokeDashoffset={innerOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text inside Dual Rings */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium text-[#64748B]">{totalLabel}</span>
          <span className="text-2xl font-bold tracking-tight text-[#0F172A] mt-0.5">
            {totalValue}
          </span>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: outerColor }}
          />
          <span>{outerLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: innerColor }}
          />
          <span>{innerLabel}</span>
        </div>
      </div>
    </div>
  )
}

export default RadialDistributionCard
