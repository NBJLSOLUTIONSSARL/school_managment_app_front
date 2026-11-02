import { Fragment } from 'react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/common/Button'
import { useI18n } from '@/hooks/useI18n'

export function DocTypePageHead({
  breadcrumbs = [],
  title,
  docstatus = 'Draft',
  primaryAction,
  onPrimaryAction,
  secondaryActions = [],
  onMenuAction,
}) {
  const { t } = useI18n()

  return (
    <div className="sticky top-0 z-30 flex min-h-14 w-full flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 sm:px-6 md:flex-nowrap md:py-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <nav
          aria-label={t('common.breadcrumb')}
          className="hidden items-center gap-1.5 text-xs text-slate-500 lg:flex"
        >
          {breadcrumbs.map((crumb, idx) => (
            <Fragment key={idx}>
              {idx > 0 && (
                <span className="text-slate-400" aria-hidden="true">
                  /
                </span>
              )}
              <span
                className="font-normal hover:text-slate-800"
                aria-current={idx === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb}
              </span>
            </Fragment>
          ))}
        </nav>
        <span className="hidden text-slate-300 lg:inline" aria-hidden="true">
          |
        </span>
        <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900">{title}</h1>
        <StatusBadge status={docstatus} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {secondaryActions.map((action, idx) => (
          <Button
            key={idx}
            variant="secondary"
            size="sm"
            onClick={action.onClick}
            className="hidden sm:inline-flex"
          >
            {action.label}
          </Button>
        ))}

        {primaryAction && (
          <Button variant="primary" size="sm" onClick={onPrimaryAction}>
            {primaryAction}
          </Button>
        )}

        {onMenuAction && (
          <button
            type="button"
            onClick={onMenuAction}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            title={t('common.moreOptions')}
            aria-label={t('common.moreOptions')}
          >
            <span aria-hidden="true">•••</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default DocTypePageHead
