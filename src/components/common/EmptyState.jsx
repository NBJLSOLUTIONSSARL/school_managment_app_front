import { cn } from '@/utils/classNames'
import { useI18n } from '@/hooks/useI18n'
import { Button } from './Button'

export function EmptyState({
  title,
  description,
  icon,
  action,
  children,
  className = '',
}) {
  const { t } = useI18n()
  const resolvedTitle = title ?? t('common.emptyTitle')
  const resolvedDescription = description ?? t('common.emptyDescription')

  return (
    <div
      className={cn(
        'mx-auto flex max-w-sm select-none flex-col items-center justify-center p-8 text-center',
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
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        )}
      </div>

      <h3 className="text-xs font-semibold tracking-tight text-slate-800">{resolvedTitle}</h3>
      {resolvedDescription && (
        <p className="mt-1 text-2xs leading-relaxed text-slate-500">{resolvedDescription}</p>
      )}

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
