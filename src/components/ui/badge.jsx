import * as React from 'react'
import { cn } from '@/utils/classNames'

const badgeVariants = {
  default: 'border-transparent bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
  secondary: 'border-transparent bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]',
  destructive: 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]',
  outline: 'border-[#DBEAFE] text-[#2563EB]',
  success: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]',
  blue: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]',
  warning: 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]',
}

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:ring-offset-1 select-none',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
