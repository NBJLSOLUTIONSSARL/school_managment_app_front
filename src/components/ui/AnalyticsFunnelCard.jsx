import { useState } from 'react'
import { Calendar, HelpCircle } from 'lucide-react'

export function AnalyticsFunnelCard({
  title = 'Matrice analytique des effectifs',
  subtitle = 'Vue d’ensemble des indicateurs de la structure',
  dateRangeText = 'Année 2026 - 2027',
  series = [
    { name: 'Inscriptions', color: '#5B5FC7' },
    { name: 'Évaluations', color: '#38BDF8' },
    { name: 'Présence', color: '#CBD5E1' },
  ],
  className = '',
}) {
  const [selectedRange] = useState(dateRangeText)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

  // Multi-spline curve sample data
  const seriesData = [
    [240, 260, 250, 310, 380, 420, 400, 460, 490, 520, 580, 640],
    [160, 190, 180, 220, 270, 290, 280, 330, 350, 380, 410, 450],
    [90, 110, 100, 130, 160, 180, 170, 210, 220, 240, 260, 290],
  ]

  const width = 640
  const height = 220
  const paddingX = 45
  const paddingY = 30
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2
  const maxY = 700
  const minY = 0

  const getPoints = (dataArr) => {
    return dataArr.map((val, idx) => {
      const x = paddingX + (idx / (dataArr.length - 1)) * chartWidth
      const normalizedY = (val - minY) / (maxY - minY)
      const y = height - paddingY - normalizedY * chartHeight
      return { x, y, val }
    })
  }

  const getSplinePath = (pts) => {
    return pts.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`
      const prev = arr[idx - 1]
      const cp1x = prev.x + (pt.x - prev.x) / 2
      const cp1y = prev.y
      const cp2x = prev.x + (pt.x - prev.x) / 2
      const cp2y = pt.y
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`
    }, '')
  }

  const yTicks = [0, 200, 400, 600]

  return (
    <div className={`figma-card bg-white rounded-2xl border border-[#EDF0F8] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <span>{title}</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </h3>
          {subtitle && <p className="text-2xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-2xs font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{selectedRange}</span>
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3.5 text-2xs font-medium text-slate-600 mb-2.5">
        {series.map((s, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.name}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px] h-auto overflow-visible select-none"
        >
          {/* Horizontal Grid lines */}
          {yTicks.map((tick) => {
            const normalizedY = (tick - minY) / (maxY - minY)
            const yPos = height - paddingY - normalizedY * chartHeight
            return (
              <g key={tick}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={width - paddingX}
                  y2={yPos}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingX - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Lines */}
          {seriesData.map((dataArr, sIdx) => {
            const pts = getPoints(dataArr)
            const path = getSplinePath(pts)
            const strokeColor = series[sIdx]?.color || '#0f172a'

            return (
              <g key={sIdx}>
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={sIdx === 0 ? 2 : 1.5}
                  strokeLinecap="round"
                />
              </g>
            )
          })}

          {/* Month labels on X axis */}
          {months.map((m, idx) => {
            const x = paddingX + (idx / (months.length - 1)) * chartWidth
            const isHovered = hoveredIndex === idx
            return (
              <g
                key={m}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {m}
                </text>
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="#0f172a"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default AnalyticsFunnelCard
