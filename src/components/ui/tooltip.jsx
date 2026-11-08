import * as React from 'react'
import { cn } from '@/utils/classNames'

const TooltipContext = React.createContext({
  isOpen: false,
  setIsOpen: () => {},
})

function TooltipProvider({ children }) {
  return <>{children}</>
}

function Tooltip({ children, delayDuration = 100 }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const timerRef = React.useRef(null)

  const handleOpen = () => {
    timerRef.current = setTimeout(() => setIsOpen(true), delayDuration)
  }

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsOpen(false)
  }

  return (
    <TooltipContext.Provider value={{ isOpen, handleOpen, handleClose }}>
      <div
        className="relative inline-flex"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef(function TooltipTrigger(
  { asChild = false, className, children, ...props },
  ref
) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      ...props,
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn('inline-flex items-center justify-center cursor-pointer', className)}
      {...props}
    >
      {children}
    </button>
  )
})
TooltipTrigger.displayName = 'TooltipTrigger'

const TooltipContent = React.forwardRef(function TooltipContent(
  { className, side = 'top', children, ...props },
  ref
) {
  const { isOpen } = React.useContext(TooltipContext)
  if (!isOpen) return null

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        'absolute z-50 overflow-hidden rounded-lg bg-[#0F172A] px-2.5 py-1 text-[11px] font-medium text-white shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none whitespace-nowrap',
        sideClasses[side] || sideClasses.top,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
