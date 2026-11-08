import { cn } from '@/utils/classNames'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-[#F1F5F9]', className)}
      {...props}
    />
  )
}

export { Skeleton }
