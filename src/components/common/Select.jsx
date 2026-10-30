import { forwardRef } from 'react'
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
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
  const sizeClass = size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={selectId} className="block text-2xs font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded border bg-white pl-2.5 pr-8 text-slate-800 transition-colors',
            'focus:outline-hidden focus:ring-2 focus:ring-offset-0',
            sizeClass,
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-slate-200',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200',
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

        {/* Custom chevron icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1 text-2xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-2xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Select
