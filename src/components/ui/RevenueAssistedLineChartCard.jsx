import { useState } from 'react'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const FULL_MONTH_NAMES = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
}

// Data values for 12 months (0-100 scale) matching the wave shapes in the design
const DEFAULT_REVENUE_DATA = [55, 45, 68, 65, 52, 60, 50, 62, 54, 70, 64, 58]
const DEFAULT_AI_DATA = [30, 32, 40, 20, 28, 38, 30, 42, 35, 48, 44, 40]

// Helper to generate a smooth cubic bezier SVG path from a series of (x, y) points
function getSmoothPath(points) {
  if (!points || points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6

    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  return d
}

export function RevenueAssistedLineChartCard({
  title = 'REVENUE & AI-ASSISTED REVENUE',
  revenueData = DEFAULT_REVENUE_DATA,
  aiData = DEFAULT_AI_DATA,
  months = MONTHS,
  pinnedMonthIndex = 3, // April
  className = '',
}) {
  const [activeMonthIdx, setActiveMonthIdx] = useState(pinnedMonthIndex)

  // Chart coordinate space
  const svgWidth = 640
  const svgHeight = 200
  const padLeft = 40
  const padRight = 20
  const padTop = 20
  const padBottom = 30

  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom

  // Map 0-100 values to SVG Y coordinate (inverted)
  const getY = (val) => padTop + plotHeight - (val / 100) * plotHeight
  const getX = (idx) => padLeft + (idx / (months.length - 1)) * plotWidth

  const revenuePoints = revenueData.map((val, idx) => ({
    x: getX(idx),
    y: getY(val),
    val,
  }))

  const aiPoints = aiData.map((val, idx) => ({
    x: getX(idx),
    y: getY(val),
    val,
  }))

  const revenuePath = getSmoothPath(revenuePoints)
  const aiPath = getSmoothPath(aiPoints)

  // Closed area paths for soft color gradients under curves
  const lastX = getX(months.length - 1)
  const firstX = getX(0)
  const baseY = getY(0)

  const revenueAreaPath = `${revenuePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`
  const aiAreaPath = `${aiPath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`

  // Grid tick marks
  const yTicks = [100, 90, 60, 30, 0]

  const activePointRev = revenuePoints[activeMonthIdx] || revenuePoints[3]
  const activePointAi = aiPoints[activeMonthIdx] || aiPoints[3]
  const activeMonthName = FULL_MONTH_NAMES[months[activeMonthIdx]] || months[activeMonthIdx] || 'April'

  return (
    <div
      className={`bg-white rounded-2xl border border-[#EDF0F8] p-5 sm:p-6 shadow-[0_2px_12px_-2px_rgba(91,95,199,0.04)] select-none flex flex-col justify-between ${className}`}
    >
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {title}
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
            <span>AI</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart with April Callout Tooltip */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            {/* Revenue Purple Gradient */}
            <linearGradient id="whiteThemeRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>

            {/* AI Cyan Gradient */}
            <linearGradient id="whiteThemeAiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines and Y-axis text labels */}
          {yTicks.map((val) => {
            const y = getY(val)
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Area Fills */}
          <path d={revenueAreaPath} fill="url(#whiteThemeRevGrad)" />
          <path d={aiAreaPath} fill="url(#whiteThemeAiGrad)" />

          {/* Curves */}
          <path
            d={revenuePath}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={aiPath}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Vertical Guideline for the active month */}
          {activePointRev && (
            <line
              x1={activePointRev.x}
              y1={padTop}
              x2={activePointRev.x}
              y2={baseY}
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Highlight circles on both lines at the active month */}
          {activePointRev && (
            <circle
              cx={activePointRev.x}
              cy={activePointRev.y}
              r="4.5"
              fill="#FFFFFF"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              className="drop-shadow-sm"
            />
          )}

          {activePointAi && (
            <circle
              cx={activePointAi.x}
              cy={activePointAi.y}
              r="4.5"
              fill="#FFFFFF"
              stroke="#06B6D4"
              strokeWidth="2.5"
              className="drop-shadow-sm"
            />
          )}

          {/* X-axis labels & Invisible click/hover areas */}
          {months.map((month, idx) => {
            const x = getX(idx)
            const isSelected = idx === activeMonthIdx
            return (
              <g key={month}>
                <text
                  x={x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className={`text-[10px] cursor-pointer transition-colors ${
                    isSelected ? 'fill-slate-900 font-bold' : 'fill-slate-400 font-medium hover:fill-slate-700'
                  }`}
                  onClick={() => setActiveMonthIdx(idx)}
                >
                  {month}
                </text>
                {/* Hit area for easy mouse interaction */}
                <rect
                  x={x - plotWidth / (months.length * 2)}
                  y={padTop}
                  width={plotWidth / months.length}
                  height={plotHeight + 20}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMonthIdx(idx)}
                  onClick={() => setActiveMonthIdx(idx)}
                />
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip Card matching the design callout */}
        {activePointRev && (
          <div
            style={{
              left: `${(activePointRev.x / svgWidth) * 100}%`,
              top: '18%',
            }}
            className="absolute -translate-x-1/2 pointer-events-none z-10 bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-800 transition-all duration-150 whitespace-nowrap min-w-[70px]"
          >
            <div className="font-semibold text-slate-300 text-[10px] pb-1 border-b border-slate-700/80 mb-1 text-center">
              {activeMonthName}
            </div>
            <div className="flex items-center justify-between gap-3 text-2xs font-medium">
              <span className="flex items-center gap-1.5 text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                V:
              </span>
              <span className="font-bold tabular-nums text-white">
                {activePointRev.val}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-2xs font-medium mt-0.5">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                AI:
              </span>
              <span className="font-bold tabular-nums text-white">
                {activePointAi.val}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RevenueAssistedLineChartCard
