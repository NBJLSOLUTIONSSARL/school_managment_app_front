import { useId } from 'react'

export function Sparkline({
  data,
  trend = 'up',
  color,
  width = 90,
  height = 28,
  strokeWidth = 2,
  className = '',
}) {
  const _gradientId = useId()
  const isPositive = trend === 'up' || trend === 'positive'
  const strokeColor = color || (isPositive ? '#10B981' : '#EF4444')

  // If concrete data points are provided, compute bezier curve
  if (Array.isArray(data) && data.length > 1) {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padding = 3
    const usableHeight = height - padding * 2
    const usableWidth = width - padding * 2

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * usableWidth
      const y = padding + usableHeight - ((val - min) / range) * usableHeight
      return { x, y }
    })

    // Construct SVG smooth cubic bezier path
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const mx = (p0.x + p1.x) / 2
      d += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`
    }

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`overflow-visible shrink-0 ${className}`}
        aria-hidden="true"
      >
        <path
          d={d}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Exact decorative wavy curves matching the uploaded image
  // Positive wave: rising gentle peaks and troughs ending high
  // Negative wave: erratic decline ending low
  const positivePath =
    'M2,18 C12,18 16,8 24,12 C32,16 38,24 46,14 C54,4 60,18 68,10 C76,2 82,14 88,6'
  const negativePath =
    'M2,8 C12,8 18,22 26,14 C34,6 40,18 48,24 C56,30 62,12 70,22 C78,32 82,18 88,24'

  const path = isPositive ? positivePath : negativePath

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 90 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Sparkline
