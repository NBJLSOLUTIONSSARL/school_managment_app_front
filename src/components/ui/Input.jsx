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

  const sizeClass = size === 'sm' ? 'h-8 text-xs px-2.5 rounded-md' : 'h-9 text-sm px-3 rounded-md'

  return (
    <div className="w-full text-start">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-slate-800">
          {label}
          {required && (
            <span className="ms-0.5 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="inline-flex h-8 items-center rounded-s-md border border-e-0 border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-500">
            {prefix}
          </span>
        )}

        {leftIcon && (
          <div className="pointer-events-none absolute start-2.5 flex items-center text-slate-400">
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
            'w-full border bg-white text-slate-900 transition-colors placeholder:text-slate-400',
            'focus:outline-hidden focus:ring-1 focus:ring-offset-0',
            sizeClass,
            leftIcon && 'ps-8',
            rightIcon && 'pe-8',
            prefix && 'rounded-s-none',
            suffix && 'rounded-e-none',
            error
              ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600'
              : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900',
            disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute end-2.5 flex items-center text-slate-400">{rightIcon}</div>
        )}

        {suffix && (
          <span className="inline-flex h-8 items-center rounded-e-md border border-s-0 border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-500">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-2xs font-medium text-rose-600">
          {typeof error === 'object' && error !== null ? error.message || String(error) : error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-2xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export default Input
