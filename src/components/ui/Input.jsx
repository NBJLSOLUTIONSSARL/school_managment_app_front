import { forwardRef, useId } from 'react'
import { cn } from '@/utils/classNames'

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    required = false,
    leftIcon,
    rightIcon,
    prefix,
    suffix,
    size = 'sm',
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const describedBy = [error ? errorId : null, !error && helperText ? helperId : null]
    .filter(Boolean)
    .join(' ')

  const sizeClass = size === 'sm' ? 'h-9 text-xs px-3 rounded-tight' : 'h-10 text-body px-3.5 rounded-card'

  return (
    <div className="w-full text-start">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-label font-semibold text-[var(--ink)]">
          {label}
          {required && (
            <span className="ms-0.5 text-rose" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="inline-flex h-9 items-center rounded-s-tight border border-e-0 border-[var(--border-subtle)] bg-[var(--muted)] px-3 text-label text-[var(--ink-muted)]">
            {prefix}
          </span>
        )}

        {leftIcon && (
          <div className="pointer-events-none absolute start-3 flex items-center text-[var(--ink-muted)]/50">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'w-full border bg-[var(--surface)] text-[var(--ink)] transition-all placeholder:text-[var(--ink-muted)]/50',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            sizeClass,
            leftIcon && 'ps-9',
            rightIcon && 'pe-9',
            prefix && 'rounded-s-none',
            suffix && 'rounded-e-none',
            error
              ? 'border-[var(--rose)]/50 hover:border-[var(--rose)] focus:border-[var(--rose)] focus:ring-[var(--rose)]/20'
              : 'border-[var(--border-subtle)] hover:border-[var(--blue-muted)] focus:border-[var(--blue-core)] focus:ring-[var(--blue-core)]/20',
            disabled && 'cursor-not-allowed border-[var(--border-subtle)] bg-[var(--muted)] text-[var(--ink-muted)]',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute end-3 flex items-center text-[var(--ink-muted)]/50">{rightIcon}</div>
        )}

        {suffix && (
          <span className="inline-flex h-9 items-center rounded-e-tight border border-s-0 border-[var(--border-subtle)] bg-[var(--muted)] px-3 text-label text-[var(--ink-muted)]">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-label font-medium text-[var(--rose)]">
          {typeof error === 'object' && error !== null ? error.message || String(error) : error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-caption text-[var(--ink-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export default Input