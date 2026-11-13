import { Fragment, isValidElement } from 'react'
import { LayoutGrid, Sparkles, Building2, ChevronRight } from 'lucide-react'
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
  const _primaryVariant = isPrimaryObject ? primaryAction.variant || 'primary' : 'primary'

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
      className={`flex min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] bg-white px-4 py-3 sm:px-6 select-none ${className}`}
    >
      {/* Left: Entity Icon, Title, Dot, Count */}
      <div className="flex min-w-0 items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Entity Icon Badge matching the image */}
        <div className="w-8 h-8 rounded-xl bg-gray-100/90 border border-gray-200/60 flex items-center justify-center text-gray-700 shrink-0 shadow-2xs">
          {Icon ? <Icon className="w-4 h-4 stroke-[2]" /> : <Building2 className="w-4 h-4 stroke-[2]" />}
        </div>

        {breadcrumbs.length > 0 && (
          <nav
            aria-label={t('common.breadcrumb', 'Breadcrumb')}
            className="hidden items-center gap-1 text-xs text-[#6B7280] lg:flex me-1"
          >
            {breadcrumbs.map((crumb, idx) => {
              const label = typeof crumb === 'object' && crumb !== null ? crumb.label : crumb
              const key = typeof crumb === 'object' && crumb !== null && crumb.key ? crumb.key : idx
              return (
                <Fragment key={key}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[#9CA3AF]" />}
                  <span className="font-medium hover:text-[#111827] transition-colors">{label}</span>
                </Fragment>
              )
            })}
            <span className="mx-1 text-[#D1D5DB]" aria-hidden="true">
              /
            </span>
          </nav>
        )}

        <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#111827] truncate">
          {title}
        </h1>

        {formattedCount && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280] truncate">
            <span className="text-[#9CA3AF]">•</span>
            <span>{formattedCount}</span>
          </div>
        )}

        {docstatus && <StatusBadge status={docstatus} />}
      </div>

      {/* Right: Avatar Stack, All Apps, Primary Action */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {onSearchChange && (
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchTerm ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || t('common.search', 'Rechercher...')}
              className="h-8 w-44 lg:w-56 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs text-[#111827] placeholder-[#9CA3AF] focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-black/5 shadow-2xs"
            />
          </div>
        )}

        {/* Team Avatar Stack matching the image */}
        {showAvatarStack && <AvatarStack avatars={avatars} extraCount={9} size="sm" />}

        {/* Primary Action Button matching the image (+ Enrich data / Nouvel item) */}
        {primaryLabel && (
          <button
            type="button"
            onClick={primaryClick}
            disabled={isPrimaryObject ? primaryAction.disabled : false}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111827] hover:bg-black active:bg-[#1F2937] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white stroke-[2]" />
            <span>{primaryLabel}</span>
          </button>
        )}

        {/* All Apps button matching the image (shown when enabled or custom action passed) */}
        {(allAppsAction || allAppsAction !== undefined) && (
          <button
            type="button"
            onClick={allAppsAction?.onClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#6B7280]" />
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-xs text-[#6B7280] hover:bg-slate-50 hover:text-[#111827] transition-all cursor-pointer shadow-2xs"
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
