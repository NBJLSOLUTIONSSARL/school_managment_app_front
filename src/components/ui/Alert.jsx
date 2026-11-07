import { isValidElement } from 'react'

export function Alert({ variant = 'info', message, children, className = '' }) {
  if (!message && !children) return null

  const resolvedMessage =
    typeof message === 'object' && message !== null && !isValidElement(message)
      ? message.message || message.error || JSON.stringify(message)
      : message

  const variantStyles = {
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-[#EEF2FF] text-[#1E293B] border-[#C7D2FE]',
  }

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border text-xs font-medium leading-relaxed ${variantStyles[variant] || variantStyles.info} ${className}`}
    >
      {resolvedMessage || children}
    </div>
  )
}
