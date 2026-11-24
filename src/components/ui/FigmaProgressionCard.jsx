import { ArrowDownRight, FileText } from 'lucide-react'

export function FigmaProgressionCard({
  title = 'Order',
  value = '2.568',
  change = '- 2.1% vs last week',
  dateRange = 'Sales from 1-6 Dec, 2026',
  onViewReport,
  className = '',
}) {
  // 6 coordinate points for smooth wavy spline line
  const points = [
    { x: 10, y: 70 },
    { x: 75, y: 80 },
    { x: 140, y: 55 },
    { x: 205, y: 65 },
    { x: 270, y: 80 },
    { x: 335, y: 40 },
  ]

  // Cubic spline bezier path
  const createSplinePath = (coords) => {
    if (!coords.length) return ''
    return coords.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`
      const prev = arr[idx - 1]
      const cp1x = prev.x + (pt.x - prev.x) * 0.5
      const cp1y = prev.y
      const cp2x = prev.x + (pt.x - prev.x) * 0.5
      const cp2y = pt.y
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`
    }, '')
  }

  const linePath = createSplinePath(points)
  const areaPath = `${linePath} L 335 110 L 10 110 Z`

  return (
    <div
      className={`figma-card bg-white p-5 sm:p-6 rounded-2xl border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {value}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
              <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{change}</span>
            </span>
            <span className="text-2xs text-slate-400 font-medium">{dateRange}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5FC7] hover:text-[#484BB5] transition-colors cursor-pointer hover:underline"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Report</span>
        </button>
      </div>

      {/* SVG Spline Chart */}
      <div className="my-2 relative w-full h-32 flex items-center justify-center">
        <svg
          viewBox="0 0 350 120"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="figmaSplineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B5FC7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#5B5FC7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#figmaSplineGrad)" />

          {/* Spline line */}
          <path
            d={linePath}
            fill="none"
            stroke="#5B5FC7"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* End coordinate pulse dot */}
          <circle cx="335" cy="40" r="4" fill="#5B5FC7" />
          <circle cx="335" cy="40" r="7" fill="#5B5FC7" fillOpacity="0.25" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-2xs font-medium text-slate-500 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5B5FC7]" />
          <span>Last 6 days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
          <span>Last Week</span>
        </div>
      </div>
    </div>
  )
}

export default FigmaProgressionCard
