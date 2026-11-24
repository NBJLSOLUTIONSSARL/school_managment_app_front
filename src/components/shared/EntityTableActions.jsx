import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function EntityTableActions({ actions = [], row, align = 'end' }) {
  const visibleActions = actions.filter((action) => action && !action.hidden)

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-[#64748B] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          aria-label="Actions"
          title="Actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-40">
        {visibleActions.map((action, idx) => {
          if (action.isSeparator) {
            return <DropdownMenuSeparator key={`sep-${idx}`} />
          }

          const Icon = action.icon
          const isDanger = action.variant === 'danger' || action.destructive

          return (
            <DropdownMenuItem
              key={action.key || action.label || idx}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick?.(row, e)
              }}
              disabled={action.disabled}
              destructive={isDanger}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${isDanger ? 'text-rose-600' : 'text-[#64748B]'}`} />}
              <span className="truncate">{action.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
