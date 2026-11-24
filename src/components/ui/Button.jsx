import { forwardRef, isValidElement } from 'react'
import { cn } from '@/utils/classNames'

const variantStyles = {
  primary:
    'bg-[#5B5FC7] text-white hover:bg-[#484BB5] active:bg-[#3E41A1] focus:ring-[#5B5FC7]/20 shadow-[0_2px_8px_rgba(91,95,199,0.25)] font-semibold',
  secondary:
    'bg-white text-slate-700 border border-[#EDF0F8] hover:bg-[#F8F9FD] hover:text-slate-900 active:bg-slate-100 focus:ring-[#5B5FC7]/15 shadow-2xs font-medium',
  subtle:
    'bg-[#5B5FC7]/10 text-[#5B5FC7] hover:bg-[#5B5FC7]/15 active:bg-[#5B5FC7]/20 focus:ring-[#5B5FC7]/20 font-semibold',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500/20 shadow-2xs font-medium',
  dangerSubtle:
    'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 focus:ring-rose-200 font-medium',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500/20 shadow-2xs font-medium',
  ghost:
    'bg-transparent text-slate-600 hover:bg-[#F8F9FD] hover:text-slate-900 focus:ring-[#5B5FC7]/15 font-medium',
  outline:
    'bg-transparent text-slate-700 border border-[#EDF0F8] hover:bg-[#F8F9FD] hover:text-slate-900 focus:ring-[#5B5FC7]/15 font-medium',
}

const sizeStyles = {
  xs: 'h-6 px-2.5 text-2xs gap-1 rounded-md',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-xs gap-2 rounded-xl',
  lg: 'h-10 px-4 text-sm gap-2 rounded-xl',
}

/**
 * Reusable Button component with quiet craft neutrals and single slate accent.
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
        'inline-flex items-center justify-center font-sans tracking-tight transition-colors duration-150 select-none',
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
