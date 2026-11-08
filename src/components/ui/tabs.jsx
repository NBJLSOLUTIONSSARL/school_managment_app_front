import * as React from 'react'
import { cn } from '@/utils/classNames'

const TabsContext = React.createContext({
  value: undefined,
  onValueChange: () => {},
})

function Tabs({ value: controlledValue, defaultValue, onValueChange, className, children, ...props }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const handleValueChange = React.useCallback(
    (val) => {
      if (!isControlled) {
        setInternalValue(val)
      }
      onValueChange?.(val)
    },
    [isControlled, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(function TabsList({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-xl bg-[#EFF6FF] p-1 text-[#64748B] border border-[#DBEAFE]',
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef(function TabsTrigger(
  { className, value, disabled = false, children, ...props },
  ref
) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext)
  const isActive = activeValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ring-offset-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-[#2563EB] text-white shadow-2xs'
          : 'text-[#64748B] hover:text-[#2563EB] hover:bg-white/70',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef(function TabsContent(
  { className, value, children, ...props },
  ref
) {
  const { value: activeValue } = React.useContext(TabsContext)
  if (activeValue !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('mt-2 ring-offset-white focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
