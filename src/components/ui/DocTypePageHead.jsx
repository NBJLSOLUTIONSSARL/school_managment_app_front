import { Fragment, isValidElement } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/hooks/useI18n'

export function DocTypePageHead({
  breadcrumbs = [],
  title,
  docstatus,
  count,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  primaryAction,
  onPrimaryAction,
  secondaryActions = [],
  onMenuAction,
}) {
  const { t } = useI18n()

  // Safely extract primary action contract (supports both string/element and { label, onClick, variant } object)
  const isPrimaryObject =
    typeof primaryAction === 'object' && primaryAction !== null && !isValidElement(primaryAction)
  const primaryLabel = isPrimaryObject ? primaryAction.label : primaryAction
  const primaryClick = isPrimaryObject
    ? primaryAction.onClick || onPrimaryAction
    : onPrimaryAction
  const primaryVariant = isPrimaryObject ? primaryAction.variant || 'primary' : 'primary'

  // Safely normalize secondary actions (supports both array of { label, onClick, variant } and strings)
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

  return (
    <div className="sticky top-0 z-30 flex min-h-12 w-full flex-wrap items-center justify-between gap-2.5 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-3.5 py-2 sm:px-5 md:flex-nowrap md:py-0 shadow-2xs">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {breadcrumbs.length > 0 && (
          <>
            <nav
              aria-label={t('common.breadcrumb')}
              className="hidden items-center gap-1.5 text-xs text-[#64748B] lg:flex"
            >
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                const label =
                  typeof crumb === 'object' && crumb !== null ? crumb.label : crumb
                const key =
                  typeof crumb === 'object' && crumb !== null && crumb.key ? crumb.key : idx

                return (
                  <Fragment key={key}>
                    {idx > 0 && (
                      <span className="text-[#94A3B8]" aria-hidden="true">
                        /
                      </span>
                    )}
                    <span
                      className="font-medium hover:text-[#0F172A] transition-colors"
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {label}
                    </span>
                  </Fragment>
                )
              })}
            </nav>
            <span className="hidden text-[#CBD5E1] lg:inline" aria-hidden="true">
              |
            </span>
          </>
        )}

        <h1 className="truncate text-base sm:text-lg font-bold tracking-tight text-[#0F172A]">
          {title}
        </h1>

        {count !== undefined && count !== null && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]">
            {count}
          </span>
        )}

        {docstatus && <StatusBadge status={docstatus} />}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchTerm ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || t('common.search', 'Rechercher...')}
              className="h-8 w-44 lg:w-56 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/15 shadow-2xs"
            />
          </div>
        )}

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

        {primaryLabel && (
          <Button
            variant={primaryVariant}
            size="sm"
            onClick={primaryClick}
            disabled={isPrimaryObject ? primaryAction.disabled : false}
            isLoading={isPrimaryObject ? primaryAction.isLoading : false}
          >
            {primaryLabel}
          </Button>
        )}

        {onMenuAction && (
          <button
            type="button"
            onClick={onMenuAction}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F172A]/20 transition-all cursor-pointer shadow-2xs"
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
