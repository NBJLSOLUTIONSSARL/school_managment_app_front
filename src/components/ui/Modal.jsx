import { useEffect, useId, useRef } from 'react'
import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = '',
}) {
  const { t } = useI18n()
  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const titleId = useId()
  const subtitleId = useId()

  useEffect(() => {
    if (!isOpen) return undefined

    previouslyFocusedRef.current = document.activeElement

    const node = dialogRef.current
    if (node) {
      const firstFocusable = node.querySelector(FOCUSABLE_SELECTOR)
      ;(firstFocusable || node).focus()
    }

    return () => {
      const previous = previouslyFocusedRef.current
      if (previous && typeof previous.focus === 'function' && previous.isConnected) {
        previous.focus()
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape' && closeOnEsc) {
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key !== 'Tab') return

      const node = dialogRef.current
      if (!node) return

      const focusable = Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement
      )

      if (focusable.length === 0) {
        event.preventDefault()
        node.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEsc, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-[#F1F5F9] bg-white text-[#1E293B] shadow-2xl focus:outline-none animate-in fade-in zoom-in-95 duration-150',
          sizeStyles[size] || sizeStyles.md,
          className
        )}
      >
        <div className="flex items-start justify-between border-b border-[#F1F5F9] bg-white px-6 py-4">
          <div>
            {title && (
              <h3 id={titleId} className="text-base font-bold text-[#1E293B] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p id={subtitleId} className="mt-0.5 text-xs text-[#64748B]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm leading-none text-[#94A3B8] transition-colors hover:text-[#1E293B] hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/30 cursor-pointer"
            aria-label={t('common.close')}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-xs text-[#1E293B]">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
