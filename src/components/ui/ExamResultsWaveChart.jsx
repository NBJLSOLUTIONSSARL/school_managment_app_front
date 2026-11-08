import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function ExamResultsWaveChart({
  title = 'All Exam Results',
  series = [
    { name: 'Teacher', color: '#2563EB' },
    { name: 'Students', color: '#38BDF8' },
  ],
  data = null,
  periods = ['Monthly', 'Weekly', 'Yearly'],
  className = '',
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Labels for days
  const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const yTicks = ['100k', '75k', '50k', '25k', '0']

  // Wave points replicating the dual harmonic curves from the design
  const teacherPointsDefault = [0, 60, 32, 68, 42, 82, 58]
  const studentPointsDefault = [52, 16, 70, 24, 72, 32, 44]

  const teacherData = data?.teacher || teacherPointsDefault
  const studentData = data?.students || studentPointsDefault

  // Chart coordinates
  const width = 640
  const height = 240
  const paddingLeft = 45
  const paddingRight = 25
  const paddingTop = 20
  const paddingBottom = 35

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom
  const maxY = 100
  const minY = 0

  const getCoordinates = (pointsArr) => {
    return pointsArr.map((val, idx) => {
      const x = paddingLeft + (idx / (pointsArr.length - 1)) * chartWidth
      const normalizedY = (val - minY) / (maxY - minY)
      const y = height - paddingBottom - normalizedY * chartHeight
      return { x, y, val }
    })
  }

  const teacherCoords = getCoordinates(teacherData)
  const studentCoords = getCoordinates(studentData)

  // Generate cubic spline bezier path
  const createSplinePath = (coords) => {
    if (!coords.length) return ''
    return coords.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`
      const prev = arr[idx - 1]
      const cp1x = prev.x + (pt.x - prev.x) * 0.45
      const cp1y = prev.y
      const cp2x = prev.x + (pt.x - prev.x) * 0.55
      const cp2y = pt.y
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`
    }, '')
  }

  const teacherPath = createSplinePath(teacherCoords)
  const studentPath = createSplinePath(studentCoords)

  const color1 = series[0]?.color || '#2563EB'
  const color2 = series[1]?.color || '#38BDF8'

  return (
    <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs select-none ${className}`}>
      {/* Header with Title, Legend and Period Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: color1 }}
              />
              <span>{series[0]?.name || 'Teacher'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: color2 }}
              />
              <span>{series[1]?.name || 'Students'}</span>
            </div>
          </div>

          {/* Period Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB] transition cursor-pointer shadow-2xs"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
                {periods.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(p)
                      setDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition cursor-pointer ${
                      selectedPeriod === p ? 'bg-[#EFF6FF] text-[#2563EB] font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Wave Chart */}
      <div className="w-full relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px] h-auto overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
            const y = paddingTop + step * chartHeight
            const label = yTicks[idx]
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-[#64748B] font-normal"
                >
                  {label}
                </text>
              </g>
            )
          })}

          {/* X Axis Labels */}
          {xLabels.map((day, idx) => {
            const x = paddingLeft + (idx / (xLabels.length - 1)) * chartWidth
            return (
              <text
                key={day}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-[11px] fill-[#64748B] font-normal"
              >
                {day}
              </text>
            )
          })}

          {/* Wave 1: Teacher Curve (Primary Blue) */}
          <path
            d={teacherPath}
            fill="none"
            stroke={color1}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Wave 2: Students Curve (Sky Blue) */}
          <path
            d={studentPath}
            fill="none"
            stroke={color2}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive vertical hover guide and point dots */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={teacherCoords[hoveredIndex]?.x}
                y1={paddingTop}
                x2={teacherCoords[hoveredIndex]?.x}
                y2={height - paddingBottom}
                stroke="#93C5FD"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={teacherCoords[hoveredIndex]?.x}
                cy={teacherCoords[hoveredIndex]?.y}
                r="4.5"
                fill={color1}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle
                cx={studentCoords[hoveredIndex]?.x}
                cy={studentCoords[hoveredIndex]?.y}
                r="4.5"
                fill={color2}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Transparent Hover Hit Areas */}
          {xLabels.map((_, idx) => {
            const colWidth = chartWidth / (xLabels.length - 1)
            const x = paddingLeft + idx * colWidth - colWidth / 2
            return (
              <rect
                key={idx}
                x={Math.max(0, x)}
                y={paddingTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-2 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-md pointer-events-none transform -translate-x-1/2 transition-all"
            style={{
              left: `${(teacherCoords[hoveredIndex].x / width) * 100}%`,
            }}
          >
            <p className="font-semibold text-slate-300 border-b border-slate-700/60 pb-0.5 mb-1">
              {xLabels[hoveredIndex]}
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color1 }} />
              <span>Teacher: {teacherData[hoveredIndex]}k</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color2 }} />
              <span>Students: {studentData[hoveredIndex]}k</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamResultsWaveChart
