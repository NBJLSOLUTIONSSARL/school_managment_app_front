import * as React from 'react'
import { cn } from '@/utils/classNames'

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {},
})

export function Popover({ children, open: controlledOpen, onOpenChange }) {
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
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ asChild, children, className, onClick, ...props }) {
  const { open, setOpen } = React.useContext(PopoverContext)

  const handleClick = (e) => {
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
      'aria-haspopup': 'dialog',
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="dialog"
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

export function PopoverContent({
  children,
  className,
  align = 'start', // 'start' | 'end' | 'center'
  sideOffset = 6,
  ...props
}) {
  const { open } = React.useContext(PopoverContext)

  if (!open) return null

  const alignmentClass =
    align === 'end'
      ? 'right-0'
      : align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'left-0'

  return (
    <div
      role="dialog"
      style={{ marginTop: `${sideOffset}px` }}
      className={cn(
        'absolute z-50 min-w-[240px] rounded-xl border border-[#E2E8F0] bg-white p-4 text-[#0F172A] shadow-lg outline-hidden animate-in fade-in-0 zoom-in-95',
        alignmentClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
