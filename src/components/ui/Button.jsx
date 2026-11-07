import { forwardRef, isValidElement } from 'react'
import { cn } from '@/utils/classNames'

const variantStyles = {
  primary:
    'bg-[#4361EE] text-white hover:bg-[#3451D1] active:bg-[#2B44B8] focus:ring-[#4361EE]/40 shadow-xs font-semibold',
  secondary:
    'bg-white text-[#1E293B] border border-[#E2E8F0] hover:bg-slate-50 focus:ring-[#4361EE]/20 shadow-2xs font-medium',
  subtle:
    'bg-[#EEF2FF] text-[#4361EE] hover:bg-[#E0E7FF] focus:ring-[#4361EE]/20 font-semibold',
  danger:
    'bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-rose-500 shadow-xs font-semibold',
  dangerSubtle:
    'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] focus:ring-rose-400 font-medium',
  success:
    'bg-[#10B981] text-white hover:bg-[#059669] focus:ring-emerald-500 shadow-xs font-semibold',
  ghost:
    'bg-transparent text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B] focus:ring-slate-300 font-medium',
  outline:
    'bg-transparent text-[#1E293B] border border-[#E2E8F0] hover:bg-slate-50 focus:ring-[#4361EE]/20 font-medium',
}

const sizeStyles = {
  xs: 'h-6 px-2 text-2xs gap-1 rounded-lg',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-xl',
  md: 'h-9 px-4 text-xs gap-2 rounded-xl',
  lg: 'h-10 px-5 text-sm gap-2 rounded-xl',
}

/**
 * Reusable Frappe Desk / EduTrack Button component.
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
      aria-busy={isLoading || undefined}
      onClick={resolvedOnClick}
      className={cn(
        'inline-flex items-center justify-center transition-all select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.98]',
        variantStyles[variant] || variantStyles.secondary,
        sizeStyles[size] || sizeStyles.sm,
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none active:scale-100',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || resolvedChildren}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {resolvedChildren}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
})

export default Button
