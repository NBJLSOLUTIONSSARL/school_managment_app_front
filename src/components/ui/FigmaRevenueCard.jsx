import { useState } from 'react'
import { ArrowUpRight, ChevronDown, Calendar, FileText } from 'lucide-react'

export function FigmaRevenueCard({
  title = 'Revenue',
  value = 'IDR 7.852.000',
  change = '+ 2.1% vs last week',
  dateRange = 'Select from 1-12 Dec, 2026',
  onViewReport,
  className = '',
}) {
  const [hoveredBar, setHoveredBar] = useState(null)

  // 12 days data matching the Figma community bar chart pairs
  const barData = [
    { day: '01', current: 38, previous: 20 },
    { day: '02', current: 55, previous: 32 },
    { day: '03', current: 42, previous: 28 },
    { day: '04', current: 75, previous: 45 },
    { day: '05', current: 60, previous: 38 },
    { day: '06', current: 88, previous: 50 },
    { day: '07', current: 70, previous: 42 },
    { day: '08', current: 52, previous: 30 },
    { day: '09', current: 65, previous: 36 },
    { day: '10', current: 48, previous: 28 },
    { day: '11', current: 72, previous: 44 },
    { day: '12', current: 82, previous: 52 },
  ]

  const maxVal = 100
  const chartHeight = 150

  return (
    <div
      className={`figma-card bg-white p-5 sm:p-6 rounded-2xl border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {value}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{change}</span>
            </span>
            <span className="text-2xs text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5FC7] hover:text-[#484BB5] transition-colors cursor-pointer self-start sm:self-auto hover:underline"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Report</span>
        </button>
      </div>

      {/* Dual Bar Chart */}
      <div className="mt-2 relative">
        {/* Chart area */}
        <div className="h-40 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 px-1 border-b border-slate-100">
          {barData.map((item, idx) => {
            const currentHeight = (item.current / maxVal) * chartHeight
            const previousHeight = (item.previous / maxVal) * chartHeight
            const isHovered = hoveredBar === idx

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-7 z-20 bg-slate-900 text-white text-[10px] font-medium py-0.5 px-2 rounded shadow-md whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                    {item.current}% vs {item.previous}%
                  </div>
                )}

                {/* Bars Container */}
                <div className="flex items-end gap-1 w-full justify-center">
                  {/* Current period: Indigo bar */}
                  <div
                    style={{ height: `${currentHeight}px` }}
                    className={`w-1.5 sm:w-2.5 rounded-t-sm transition-all duration-300 ${
                      isHovered ? 'bg-[#484BB5] w-2 sm:w-3' : 'bg-[#5B5FC7]'
                    }`}
                  />
                  {/* Previous period: Light slate bar */}
                  <div
                    style={{ height: `${previousHeight}px` }}
                    className="w-1.5 sm:w-2.5 rounded-t-sm bg-[#E2E8F0] transition-all duration-300"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between px-1 pt-2 text-[10px] text-slate-400 font-medium">
          {barData.map((item) => (
            <span key={item.day} className="text-center flex-1">
              {item.day}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-2xs font-medium text-slate-500 mt-4 pt-3 border-t border-slate-100">
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

export default FigmaRevenueCard
