import * as React from 'react'
import { cn } from '@/utils/classNames'

const Avatar = React.forwardRef(function Avatar({ className, size = 'md', ...props }, ref) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
    xl: 'h-13 w-13',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--border-subtle)]',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    />
  )
})
Avatar.displayName = 'Avatar'

const AvatarImage = React.forwardRef(function AvatarImage(
  { className, src, alt = '', onError, ...props },
  ref
) {
  const [imgErrorSrc, setImgErrorSrc] = React.useState(null)
  const isError = !src || imgErrorSrc === src

  if (isError) return null

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={(e) => {
        setImgErrorSrc(src)
        if (onError) onError(e)
      }}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
})
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef(function AvatarFallback(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-[var(--blue-wash)] text-label font-bold text-[var(--blue-core)] select-none',
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }