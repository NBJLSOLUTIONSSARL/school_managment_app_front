import { Fragment, isValidElement } from 'react'
import { LayoutGrid, Building2, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { AvatarStack } from '@/components/ui/AvatarStack'
import { useI18n } from '@/hooks/useI18n'

export function DocTypePageHead({
  icon: Icon = Building2,
  breadcrumbs = [],
  title,
  docstatus,
  count,
  countLabel,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  primaryAction,
  onPrimaryAction,
  secondaryActions = [],
  onMenuAction,
  showAvatarStack = true,
  avatars,
  allAppsAction,
  className = '',
}) {
  const { t } = useI18n()

  // Safely extract primary action contract
  const isPrimaryObject =
    typeof primaryAction === 'object' && primaryAction !== null && !isValidElement(primaryAction)
  const primaryLabel = isPrimaryObject ? primaryAction.label : primaryAction
  const primaryClick = isPrimaryObject
    ? primaryAction.onClick || onPrimaryAction
    : onPrimaryAction

  // Safely normalize secondary actions
  const normalizedSecondaryActions = Array.isArray(secondaryActions)
    ? secondaryActions.filter(Boolean).map((action) => {
        if (typeof action === 'object' && action !== null && !isValidElement(action)) {
          return {
            label: action.label ?? '',
            onClick: action.onClick,
            variant: action.variant || 'secondary',
            icon: action.icon,
          }
        }
        return {
          label: action,
          onClick: undefined,
          variant: 'secondary',
        }
      })
    : []

  const formattedCount =
    count !== undefined && count !== null
      ? `${count} ${countLabel || (typeof title === 'string' ? title.toLowerCase() : '')}`
      : null

  return (
    <div
      className={`flex min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6 select-none ${className}`}
    >
      {/* Left: Entity Icon, Title, Dot, Count */}
      <div className="flex min-w-0 items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Quiet Entity Icon Badge */}
        <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
          {Icon ? <Icon className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
        </div>

        {breadcrumbs.length > 0 && (
          <nav
            aria-label={t('common.breadcrumb', 'Breadcrumb')}
            className="hidden items-center gap-1 text-xs text-slate-500 lg:flex me-1"
          >
            {breadcrumbs.map((crumb, idx) => {
              const label = typeof crumb === 'object' && crumb !== null ? crumb.label : crumb
              const key = typeof crumb === 'object' && crumb !== null && crumb.key ? crumb.key : idx
              return (
                <Fragment key={key}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" strokeWidth={1.5} />}
                  <span className="font-medium hover:text-slate-900 transition-colors">{label}</span>
                </Fragment>
              )
            })}
            <span className="mx-1 text-slate-300" aria-hidden="true">
              /
            </span>
          </nav>
        )}

        <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 truncate">
          {title}
        </h1>

        {formattedCount && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate tabular-nums">
            <span className="text-slate-300">•</span>
            <span>{formattedCount}</span>
          </div>
        )}

        {docstatus && <StatusBadge status={docstatus} />}
      </div>

      {/* Right: Avatar Stack, All Apps, Primary Action */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
        {onSearchChange && (
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchTerm ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || t('common.search', 'Rechercher...')}
              className="h-8 w-44 lg:w-56 rounded-md border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 shadow-2xs"
            />
          </div>
        )}

        {/* Team Avatar Stack */}
        {showAvatarStack && <AvatarStack avatars={avatars} extraCount={9} size="sm" />}

        {/* Primary Action Button — Clean, deliberate, no sparkles */}
        {primaryLabel && (
          <button
            type="button"
            onClick={primaryClick}
            disabled={isPrimaryObject ? primaryAction.disabled : false}
            className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-md text-xs font-medium shadow-2xs transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          >
            <span>{primaryLabel}</span>
          </button>
        )}

        {/* All Apps button */}
        {(allAppsAction || allAppsAction !== undefined) && (
          <button
            type="button"
            onClick={allAppsAction?.onClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
            <span>All Apps</span>
          </button>
        )}

        {/* Secondary Actions */}
        {normalizedSecondaryActions.map((action, idx) => (
          <Button
            key={idx}
            variant={action.variant}
            size="sm"
            onClick={action.onClick}
            className="hidden sm:inline-flex"
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        ))}

        {onMenuAction && (
          <button
            type="button"
            onClick={onMenuAction}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
            title={t('common.moreOptions', 'Plus')}
            aria-label={t('common.moreOptions', 'Plus')}
          >
            <span aria-hidden="true">•••</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default DocTypePageHead
