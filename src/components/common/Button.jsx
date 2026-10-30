import { forwardRef } from 'react'
import { cn } from '@/utils/classNames'

const variantStyles = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-2xs',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400 shadow-2xs',
  subtle: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-2xs',
  dangerSubtle:
    'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 focus:ring-rose-400',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-2xs',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
  outline:
    'bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
}

const sizeStyles = {
  xs: 'h-6 px-2 text-2xs gap-1',
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-xs gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
}

/**
 * Reusable Frappe Desk Button component.
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
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded transition-colors select-none',
        'focus:outline-hidden focus:ring-2 focus:ring-offset-1',
        variantStyles[variant] || variantStyles.secondary,
        sizeStyles[size] || sizeStyles.sm,
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
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
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
})

export default Button
