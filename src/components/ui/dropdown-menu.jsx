import * as React from 'react'
import { cn } from '@/utils/classNames'

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const containerRef = React.useRef(null)

  React.useEffect(() => {
    if (!open) return

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ asChild, children, className, onClick, ...props }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e) => {
    e.stopPropagation()
    onClick?.(e)
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        handleClick(e)
      },
      'aria-expanded': open,
      'aria-haspopup': 'menu',
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  className,
  align = 'end', // 'start' | 'end' | 'center'
  sideOffset = 4,
  ...props
}) {
  const { open } = React.useContext(DropdownMenuContext)

  if (!open) return null

  const alignmentClass =
    align === 'end'
      ? 'right-0'
      : align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'left-0'

  return (
    <div
      role="menu"
      style={{ marginTop: `${sideOffset}px` }}
      className={cn(
        'absolute z-50 min-w-[160px] rounded-xl border border-[#E2E8F0] bg-white p-1 text-[#0F172A] shadow-md outline-hidden animate-in fade-in-0 zoom-in-95',
        alignmentClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
  disabled = false,
  destructive = false,
  ...props
}) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e) => {
    e.stopPropagation()
    if (disabled) return
    setOpen(false)
    onClick?.(e)
  }

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e)
        }
      }}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs outline-hidden transition-colors',
        destructive
          ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700'
          : 'text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] focus:bg-[#F8FAFC] focus:text-[#2563EB]',
        disabled && 'pointer-events-none opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn('-mx-1 my-1 h-px bg-[#E2E8F0]', className)} {...props} />
}

export function DropdownMenuLabel({ children, className, ...props }) {
  return (
    <div className={cn('px-2.5 py-1 text-[11px] font-semibold text-[#64748B]', className)} {...props}>
      {children}
    </div>
  )
}
