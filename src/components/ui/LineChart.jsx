import { useState } from 'react'

export function LineChart({
  data = [],
  dataKey = 'rate',
  labelKey = 'month',
  maxY = 100,
  minY = 0,
  ySuffix = '%',
  lineColor = '#0F172A',
  height = 220,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!data || data.length === 0) return null

  const width = 600
  const paddingX = 40
  const paddingY = 30
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth
    const yValue = item[dataKey]
    const normalizedY = (yValue - minY) / (maxY - minY)
    const y = height - paddingY - normalizedY * chartHeight
    return { x, y, value: yValue, label: item[labelKey] }
  })

  const pathD = points.reduce((acc, point, index, arr) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const prev = arr[index - 1]
    const cp1x = prev.x + (point.x - prev.x) / 2
    const cp1y = prev.y
    const cp2x = prev.x + (point.x - prev.x) / 2
    const cp2y = point.y
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`

  const gridSteps = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id={`grad-${lineColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {gridSteps.map((step, idx) => {
          const yPos = height - paddingY - step * chartHeight
          const labelVal = Math.round(minY + step * (maxY - minY))
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={yPos}
                x2={width - paddingX}
                y2={yPos}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={yPos + 4}
                textAnchor="end"
                className="text-[11px] fill-[#94A3B8] font-medium"
              >
                {labelVal}{ySuffix}
              </text>
            </g>
          )
        })}

        <path d={areaD} fill={`url(#grad-${lineColor.replace('#', '')})`} />

        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {points.map((pt, idx) => {
          const isHovered = hoveredPoint === idx
          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />

              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill="#FFFFFF"
                stroke={lineColor}
                strokeWidth={isHovered ? 3 : 2.5}
                className="transition-all duration-150"
              />

              {isHovered && (
                <g>
                  <rect
                    x={pt.x - 28}
                    y={pt.y - 32}
                    width="56"
                    height="22"
                    rx="6"
                    fill="#16222F"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 17}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="text-[11px] font-bold"
                  >
                    {pt.value}{ySuffix}
                  </text>
                </g>
              )}

              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className={`text-[12px] font-medium transition-colors ${
                  isHovered ? 'fill-[#16222F] font-bold' : 'fill-[#78716C]'
                }`}
              >
                {pt.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default LineChart
