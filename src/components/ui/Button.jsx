import { forwardRef, isValidElement } from 'react'
import { cn } from '@/utils/classNames'

const variantStyles = {
  primary:
    'bg-[var(--blue-core)] text-white hover:bg-[var(--blue-hover)] active:bg-[var(--blue-core)] focus:ring-[var(--blue-core)]/30 shadow-hair font-semibold',
  secondary:
    'bg-[var(--surface)] text-[var(--blue-core)] border border-[var(--border-subtle)] hover:bg-[var(--blue-wash)] hover:border-[var(--blue-core)] focus:ring-[var(--blue-core)]/20 shadow-2xs font-medium',
  subtle:
    'bg-[var(--blue-wash)] text-[var(--blue-core)] hover:bg-[var(--light-blue)] focus:ring-[var(--blue-core)]/20 font-semibold',
  danger:
    'bg-[var(--rose)] text-white hover:bg-[var(--rose)]/90 focus:ring-[var(--rose)]/30 shadow-hair font-semibold',
  dangerSubtle:
    'bg-[var(--rose-wash)] text-[var(--rose)] border border-[var(--rose)]/30 hover:bg-[var(--rose-wash)]/80 focus:ring-[var(--rose)]/20 font-medium',
  success:
    'bg-[var(--emerald)] text-white hover:bg-[var(--emerald)]/90 focus:ring-[var(--emerald)]/30 shadow-hair font-semibold',
  ghost:
    'bg-transparent text-[var(--blue-core)] hover:bg-[var(--blue-wash)] hover:text-[var(--blue-hover)] focus:ring-[var(--blue-core)]/20 font-medium',
  outline:
    'bg-transparent text-[var(--blue-core)] border border-[var(--blue-core)] hover:bg-[var(--blue-wash)] focus:ring-[var(--blue-core)]/20 font-medium',
}

const sizeStyles = {
  xs: 'h-8 px-2.5 text-label gap-1 rounded-tight',
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-tight',
  md: 'h-10 px-4 text-body gap-2 rounded-card',
  lg: 'h-11 px-5 text-body gap-2 rounded-card',
}

/**
 * Reusable Button component with EduTrack Design Tokens.
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
        'inline-flex items-center justify-center font-ui tracking-tight transition-all select-none',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)]',
        variantStyles[variant] || variantStyles.secondary,
        sizeStyles[size] || sizeStyles.sm,
        isDisabled && 'cursor-not-allowed opacity-50 shadow-none pointer-events-none',
        !isDisabled && 'cursor-pointer active-press',
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