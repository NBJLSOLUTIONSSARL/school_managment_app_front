import { forwardRef, isValidElement } from 'react'
import { cn } from '@/utils/classNames'

const variantStyles = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] focus:ring-[#2563EB]/30 shadow-xs font-semibold',
  secondary:
    'bg-white text-[#2563EB] border border-[#DBEAFE] hover:bg-[#EFF6FF] hover:border-[#2563EB] focus:ring-[#2563EB]/20 shadow-2xs font-medium',
  subtle:
    'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] focus:ring-[#2563EB]/20 font-semibold',
  danger:
    'bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-rose-500 shadow-xs font-semibold',
  dangerSubtle:
    'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] focus:ring-rose-400 font-medium',
  success:
    'bg-[#10B981] text-white hover:bg-[#059669] focus:ring-emerald-500 shadow-xs font-semibold',
  ghost:
    'bg-transparent text-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] focus:ring-[#2563EB]/20 font-medium',
  outline:
    'bg-transparent text-[#2563EB] border border-[#2563EB] hover:bg-[#EFF6FF] focus:ring-[#2563EB]/20 font-medium',
}

const sizeStyles = {
  xs: 'h-6 px-2 text-2xs gap-1 rounded-lg',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-xl',
  md: 'h-9 px-4 text-xs gap-2 rounded-xl',
  lg: 'h-10 px-5 text-sm gap-2 rounded-xl',
}

/**
 * Reusable Button component with Blue Palette tokens.
 */
export const Button = forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'sm',
    type = 'button',
    isLoading = false,
    loadingText,
    disabled = false,
    leftIcon,
    rightIcon,
    className = '',
    onClick,
    ...props
  },
  ref
) {
  const isChildrenObject =
    typeof children === 'object' && children !== null && !isValidElement(children) && 'label' in children
  const resolvedChildren = isChildrenObject ? children.label : children
  const resolvedOnClick =
    onClick || (isChildrenObject && typeof children.onClick === 'function' ? children.onClick : undefined)

  const isDisabled = disabled || isLoading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      onClick={resolvedOnClick}
      className={cn(
        'inline-flex items-center justify-center font-sans tracking-tight transition-all select-none',
        'focus:outline-hidden focus:ring-2 focus:ring-offset-1',
        variantStyles[variant] || variantStyles.secondary,
        sizeStyles[size] || sizeStyles.sm,
        isDisabled && 'cursor-not-allowed opacity-50 shadow-none pointer-events-none',
        !isDisabled && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          {loadingText ? <span>{loadingText}</span> : resolvedChildren}
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {resolvedChildren}
          {rightIcon && (
            <span className="shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  )
})

export default Button
