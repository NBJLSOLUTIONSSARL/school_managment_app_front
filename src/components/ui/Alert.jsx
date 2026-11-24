import { isValidElement } from 'react'

export function Alert({ variant = 'info', message, children, className = '' }) {
  if (!message && !children) return null

  const resolvedMessage =
    typeof message === 'object' && message !== null && !isValidElement(message)
      ? message.message || message.error || JSON.stringify(message)
      : message

  const variantStyles = {
    error: 'bg-[var(--rose-wash)] text-[var(--rose)] border-[var(--rose)]/30',
    success: 'bg-[var(--emerald-wash)] text-[var(--emerald)] border-[var(--emerald)]/30',
    warning: 'bg-[var(--amber-wash)] text-[var(--amber)] border-[var(--amber)]/30',
    info: 'bg-[var(--blue-wash)] text-[var(--ink)] border-[var(--blue-muted)]/30',
  }

  return (
    <div
      role="alert"
      className={`p-4 rounded-card border text-body font-medium leading-relaxed ${variantStyles[variant] || variantStyles.info} ${className}`}
    >
      {resolvedMessage || children}
    </div>
  )
}