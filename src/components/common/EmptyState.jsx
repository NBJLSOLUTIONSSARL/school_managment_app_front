import { cn } from '@/utils/classNames'
import { Button } from './Button'

export function EmptyState({
  title = 'Aucun élément',
  description = 'Il n’y a aucune donnée à afficher pour le moment.',
  icon,
  action,
  children,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto select-none',
        className
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon || (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        )}
      </div>

      <h4 className="text-xs font-semibold text-slate-800 tracking-tight">{title}</h4>
      {description && <p className="mt-1 text-2xs text-slate-500 leading-relaxed">{description}</p>}

      {action && (
        <div className="mt-4">
          <Button variant={action.variant || 'primary'} size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export default EmptyState
