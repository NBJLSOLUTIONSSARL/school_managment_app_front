import { Fragment } from 'react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/common/Button'

export function DocTypePageHead({
  breadcrumbs = [],
  title,
  docstatus = 'Draft',
  primaryAction,
  onPrimaryAction,
  secondaryActions = [],
  onMenuAction,
}) {
  return (
    <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Fil d'Ariane & Titre */}
      <div className="flex items-center gap-3">
        <nav
          aria-label="Breadcrumb"
          className="hidden md:flex items-center gap-1.5 text-xs text-slate-500"
        >
          {breadcrumbs.map((crumb, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400">/</span>}
              <span className="hover:text-slate-800 cursor-pointer font-normal">{crumb}</span>
            </Fragment>
          ))}
        </nav>
        <span className="hidden md:inline text-slate-300">|</span>
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h1>
        <StatusBadge status={docstatus} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {secondaryActions.map((action, idx) => (
          <Button key={idx} variant="secondary" size="sm" onClick={action.onClick}>
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
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 focus:outline-hidden text-xs"
            title="Options supplémentaires"
          >
            •••
          </button>
        )}
      </div>
    </div>
  )
}

export default DocTypePageHead
