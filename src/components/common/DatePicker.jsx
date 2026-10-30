import { forwardRef } from 'react'
import { cn } from '@/utils/classNames'

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
  const inputId = id || (label ? `date-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
  const sizeClass = size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'

  const handleSetToday = () => {
    if (disabled) return
    const today = new Date().toISOString().split('T')[0]
    if (onChange) {
      onChange({ target: { value: today } })
    }
  }

  return (
    <div className="w-full text-left">
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label htmlFor={inputId} className="block text-2xs font-medium text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        {quickToday && !disabled && (
          <button
            type="button"
            onClick={handleSetToday}
            className="text-2xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
          >
            Aujourd'hui
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
          className={cn(
            'w-full rounded border bg-white px-2.5 text-slate-800 transition-colors',
            'focus:outline-hidden focus:ring-2 focus:ring-offset-0',
            sizeClass,
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-slate-200',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200',
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-2xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-2xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
})

export default DatePicker
