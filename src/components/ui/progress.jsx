import * as React from 'react'
import { cn } from '@/utils/classNames'

const Progress = React.forwardRef(function Progress(
  { className, value = 0, max = 100, indicatorClassName, ...props },
  ref
) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), max)
  const percentage = Math.round((safeValue / max) * 100)

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full flex-1 bg-slate-900 transition-transform duration-200 ease-out',
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
})
Progress.displayName = 'Progress'

export { Progress }
