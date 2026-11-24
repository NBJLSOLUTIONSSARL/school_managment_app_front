import * as React from 'react'
import { cn } from '@/utils/classNames'

const badgeVariants = {
  default: 'border-transparent bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200',
  destructive: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  outline: 'border-slate-200 text-slate-700 bg-transparent',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  blue: 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
}

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-slate-900 select-none shadow-2xs',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
export default Badge
