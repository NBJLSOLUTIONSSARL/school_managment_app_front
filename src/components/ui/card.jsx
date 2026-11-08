import * as React from 'react'
import { cn } from '@/utils/classNames'

const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] shadow-2xs transition-all',
        className
      )}
      {...props}
    />
  )
})
Card.displayName = 'Card'

const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1 p-3.5 sm:p-4', className)}
      {...props}
    />
  )
})
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(function CardTitle({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'text-xs sm:text-sm font-bold leading-tight tracking-tight text-[#0F172A]',
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(function CardDescription({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('text-[11px] text-[#64748B] leading-normal', className)}
      {...props}
    />
  )
})
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('p-3.5 sm:p-4 pt-0', className)}
      {...props}
    />
  )
})
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-3.5 sm:p-4 pt-0', className)}
      {...props}
    />
  )
})
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
