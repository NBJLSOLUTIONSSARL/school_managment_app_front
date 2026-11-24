import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const DEFAULT_DAYS = [
  { day: 'Mon', value: 38 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 68 },
  { day: 'Thu', value: 72 },
  { day: 'Fri', value: 75, isFeatured: true },
  { day: 'Sat', value: 62 },
  { day: 'Sun', value: 45 },
]

export function TeamUtilizationBarChartCard({
  title = 'TEAM UTILIZATION',
  initialPeriod = 'Last Week',
  days = DEFAULT_DAYS,
  onPeriodChange,
  className = '',
}) {
  const [selectedDay, setSelectedDay] = useState('Fri')
  const [period, setPeriod] = useState(initialPeriod)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const periods = ['This Week', 'Last Week', 'Last Month', 'Last Quarter']

  const yTicks = [100, 75, 50, 25, 0]

  const handlePeriodSelect = (p) => {
    setPeriod(p)
    setIsDropdownOpen(false)
    onPeriodChange?.(p)
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-[#EDF0F8] p-5 sm:p-6 shadow-[0_2px_12px_-2px_rgba(91,95,199,0.04)] select-none flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 relative">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {title}
        </h3>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5B5FC7]"
          >
            <span>{period}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodSelect(p)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer ${
                    p === period ? 'text-[#5B5FC7] font-bold bg-[#5B5FC7]/5' : 'text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-6 pb-2">
        <div className="flex items-end justify-between h-48 sm:h-56 relative border-b border-slate-100">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none">
            {yTicks.map((val) => (
              <div key={val} className="flex items-center w-full">
                <span className="text-[10px] text-slate-400 font-medium w-6 text-right pe-2 select-none">
                  {val}
                </span>
                <div className="flex-1 border-b border-slate-100" />
              </div>
            ))}
          </div>

          {/* Vertical Bars Container */}
          <div className="relative flex-1 ms-7 flex items-end justify-around h-full z-10 px-1">
            {days.map((item) => {
              const isSelected = selectedDay === item.day
              const heightPercent = item.value

              return (
                <div
                  key={item.day}
                  onClick={() => setSelectedDay(item.day)}
                  className="flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  style={{ width: '12%' }}
                >
                  {/* Floating badge for selected or featured day */}
                  {isSelected && (
                    <div className="absolute -top-6 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                      {item.day}-{item.value}
                    </div>
                  )}

                  {/* The bar element */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-6 sm:w-8 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-t from-blue-600 to-sky-400 shadow-[0_4px_16px_rgba(59,130,246,0.35)]'
                        : 'bg-slate-100 hover:bg-slate-200 group-hover:scale-y-102'
                    }`}
                  />

                  {/* Day label on X-axis */}
                  <span
                    className={`text-[10px] sm:text-xs mt-2.5 font-medium transition-colors ${
                      isSelected ? 'text-blue-600 font-bold' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamUtilizationBarChartCard
