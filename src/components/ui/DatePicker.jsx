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

  const sizeClass = size === 'sm' ? 'h-9 text-xs px-3 rounded-xl' : 'h-10 text-sm px-3.5 rounded-xl'

  const handleSetToday = () => {
    if (disabled) return
    const today = new Date().toISOString().split('T')[0]
    if (onChange) {
      onChange({ target: { value: today } })
    }
  }

  return (
    <div className="w-full text-start">
      <div className="mb-1.5 flex items-center justify-between">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#1E293B]">
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
            className="cursor-pointer text-xs font-semibold text-[#4361EE] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/30"
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
            'w-full border bg-white text-[#1E293B] transition-all',
            'focus:outline-hidden focus:ring-2 focus:ring-offset-0',
            sizeClass,
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-[#E2E8F0] hover:border-slate-300 focus:border-[#4361EE] focus:ring-[#4361EE]/20',
            disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
            className
          )}
          {...props}
        />
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

export default DatePicker
