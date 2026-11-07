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

  const sizeClass = size === 'sm' ? 'h-9 text-xs px-3 rounded-xl' : 'h-10 text-sm px-3.5 rounded-xl'

  return (
    <div className="w-full text-start">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
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
          <span className="inline-flex h-9 items-center rounded-s-xl border border-e-0 border-[#E2E8F0] bg-slate-50 px-3 text-xs text-[#64748B]">
            {prefix}
          </span>
        )}

        {leftIcon && (
          <div className="pointer-events-none absolute start-3 flex items-center text-[#94A3B8]">
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
            'w-full border bg-white text-[#1E293B] transition-all placeholder:text-[#94A3B8]',
            'focus:outline-hidden focus:ring-2 focus:ring-offset-0',
            sizeClass,
            leftIcon && 'ps-9',
            rightIcon && 'pe-9',
            prefix && 'rounded-s-none',
            suffix && 'rounded-e-none',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-[#E2E8F0] hover:border-slate-300 focus:border-[#4361EE] focus:ring-[#4361EE]/20',
            disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute end-3 flex items-center text-[#94A3B8]">{rightIcon}</div>
        )}

        {suffix && (
          <span className="inline-flex h-9 items-center rounded-e-xl border border-s-0 border-[#E2E8F0] bg-slate-50 px-3 text-xs text-[#64748B]">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-rose-600">
          {typeof error === 'object' && error !== null ? error.message || String(error) : error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-xs text-[#64748B]">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export default Input
