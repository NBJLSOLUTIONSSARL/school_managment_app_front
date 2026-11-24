import { FileText } from 'lucide-react'

export function FigmaOrderTimeCard({
  title = 'Order Time',
  dateRange = 'From 1-6 Dec, 2026',
  onViewReport,
  className = '',
}) {
  // 3 segments: Afternoon (40%), Evening (32%), Morning (28%)
  const segments = [
    { name: 'Afternoon', percent: 40, color: '#5B5FC7', time: '1pm - 4pm', count: '1,890 orders' },
    { name: 'Evening', percent: 32, color: '#38BDF8', time: '5pm - 8pm', count: '1,512 orders' },
    { name: 'Morning', percent: 28, color: '#A5B4FC', time: '8am - 12pm', count: '1,324 orders' },
  ]

  // SVG Donut settings
  const size = 180
  const center = size / 2
  const strokeWidth = 26
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  // Calculate offsets for segments
  let accumulatedPercent = 0
  const renderedSegments = segments.map((seg) => {
    const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
    accumulatedPercent += seg.percent
    return { ...seg, strokeDasharray, strokeDashoffset }
  })

  return (
    <div
      className={`figma-card bg-white p-5 sm:p-6 rounded-2xl border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] flex flex-col justify-between relative overflow-hidden select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-2xs text-slate-400 font-medium mt-0.5">{dateRange}</p>
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

      {/* Donut and Floating Callout Tooltip Container */}
      <div className="relative flex items-center justify-center my-3 min-h-[190px]">
        {/* Floating Dark Callout Card */}
        <div className="absolute top-2 end-0 sm:end-2 z-10 bg-[#1E1B4B] text-white p-3 rounded-xl shadow-[0_12px_30px_-4px_rgba(30,27,75,0.45)] border border-indigo-900/60 w-36 pointer-events-none animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-200">Afternoon</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FC7]" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">1pm - 4pm</p>
          <p className="text-xs font-bold text-white tracking-tight mt-1">1,890 orders</p>
        </div>

        {/* SVG Donut */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform overflow-visible"
        >
          {/* Subtle Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F8F9FD"
            strokeWidth={strokeWidth}
          />

          {/* Rendered Colored Arcs */}
          {renderedSegments.map((seg) => (
            <circle
              key={seg.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between gap-2 text-2xs font-medium text-slate-500 pt-3 border-t border-slate-100 flex-wrap">
        {segments.map((seg) => (
          <div key={seg.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="truncate">{seg.name}</span>
            <span className="font-semibold text-slate-700">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FigmaOrderTimeCard
