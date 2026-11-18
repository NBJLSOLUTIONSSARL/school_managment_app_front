import * as React from 'react'
import { cn } from '@/utils/classNames'

const badgeVariants = {
  default: 'border-transparent bg-[var(--blue-core)] text-white hover:bg-[var(--blue-hover)]',
  secondary: 'border-transparent bg-[var(--blue-wash)] text-[var(--blue-core)] hover:bg-[var(--light-blue)]',
  destructive: 'border-[var(--rose)]/30 bg-[var(--rose-wash)] text-[var(--rose)] hover:bg-[var(--rose-wash)]/80',
  outline: 'border-[var(--blue-muted)] text-[var(--blue-core)] hover:bg-[var(--blue-wash)]',
  success: 'border-[var(--emerald)]/30 bg-[var(--emerald-wash)] text-[var(--emerald)] hover:bg-[var(--emerald-wash)]/80',
  blue: 'border-[var(--blue-muted)] bg-[var(--blue-wash)] text-[var(--blue-core)] hover:bg-[var(--light-blue)]',
  warning: 'border-[var(--amber)]/30 bg-[var(--amber-wash)] text-[var(--amber)] hover:bg-[var(--amber-wash)]/80',
}

function Badge({ className, variant = 'default', size = 'sm', ...props }) {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-caption',
    sm: 'px-2 py-0.5 text-label',
    md: 'px-2.5 py-0.5 text-body',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--blue-core)]/20 focus:ring-offset-1 focus:ring-offset-[var(--surface)] select-none',
        badgeVariants[variant] || badgeVariants.default,
        sizeStyles[size] || sizeStyles.sm,
        className
      )}
      {...props}
    />
  )
}

export { Badge }