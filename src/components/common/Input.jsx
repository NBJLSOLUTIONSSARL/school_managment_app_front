import { forwardRef } from 'react'
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
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  const sizeClass = size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-2xs font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="inline-flex items-center px-2.5 h-8 border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-xs rounded-l">
            {prefix}
          </span>
        )}

        {leftIcon && (
          <div className="absolute left-2.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full rounded border bg-white px-2.5 text-slate-800 transition-colors placeholder:text-slate-400',
            'focus:outline-hidden focus:ring-2 focus:ring-offset-0',
            sizeClass,
            leftIcon && 'pl-8',
            rightIcon && 'pr-8',
            prefix && 'rounded-l-none',
            suffix && 'rounded-r-none',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-slate-200',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-2.5 flex items-center text-slate-400">{rightIcon}</div>
        )}

        {suffix && (
          <span className="inline-flex items-center px-2.5 h-8 border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-xs rounded-r">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-2xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-2xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Input
