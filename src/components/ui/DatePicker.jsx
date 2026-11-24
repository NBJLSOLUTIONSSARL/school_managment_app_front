import { forwardRef, useId } from 'react'
import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'

export const DatePicker = forwardRef(function DatePicker(
  {
    label,
    error,
    helperText,
    required = false,
    type = 'date',
    size = 'sm',
    className = '',
    id,
    disabled = false,
    value,
    onChange,
    quickToday = false,
    ...props
  },
  ref
) {
  const { t } = useI18n()
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const describedBy = [error ? errorId : null, !error && helperText ? helperId : null]
    .filter(Boolean)
    .join(' ')

  const sizeClass = size === 'sm' ? 'h-8 text-xs px-2.5 rounded-md' : 'h-9 text-sm px-3 rounded-md'

  const handleSetToday = () => {
    if (disabled) return
    const today = new Date().toISOString().split('T')[0]
    if (onChange) {
      onChange({ target: { value: today } })
    }
  }

  return (
    <div className="w-full text-start">
      <div className="mb-1 flex items-center justify-between">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-800">
            {label}
            {required && (
              <span className="ms-0.5 text-rose-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        {quickToday && !disabled && (
          <button
            type="button"
            onClick={handleSetToday}
            className="cursor-pointer text-2xs font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          >
            {t('common.today')}
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          ref={ref}
          type={type}
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'w-full border bg-white text-slate-900 transition-colors',
            'focus:outline-hidden focus:ring-1 focus:ring-offset-0',
            sizeClass,
            error
              ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600'
              : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900',
            disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
            className
          )}
          {...props}
        />
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

export default DatePicker
