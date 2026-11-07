import { forwardRef, useId } from 'react'
import { cn } from '@/utils/classNames'

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    required = false,
    placeholder = 'Sélectionner...',
    size = 'sm',
    className = '',
    id,
    disabled = false,
    children,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const selectId = id || generatedId
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`
  const describedBy = [error ? errorId : null, !error && helperText ? helperId : null]
    .filter(Boolean)
    .join(' ')

  const sizeClass = size === 'sm' ? 'h-9 text-xs ps-3 pe-8 rounded-xl' : 'h-10 text-sm ps-3.5 pe-8 rounded-xl'

  return (
    <div className="w-full text-start">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
          {label}
          {required && (
            <span className="ms-0.5 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'w-full appearance-none border bg-white text-[#1E293B] transition-all cursor-pointer',
            'focus:outline-hidden focus:ring-2 focus:ring-offset-0',
            sizeClass,
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-[#E2E8F0] hover:border-slate-300 focus:border-[#4361EE] focus:ring-[#4361EE]/20',
            disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-2 text-slate-500">
          <svg
            className="h-3.5 w-3.5 rtl:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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

export default Select
