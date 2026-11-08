import { Download } from 'lucide-react'

export function SummarySubheader({
  title = 'Summary',
  subtitle = 'Results for all indicators and live system metrics',
  tabs = [],
  activeTab,
  onTabChange,
  actionText = 'Exporter',
  actionIcon: ActionIcon = Download,
  onAction,
  secondaryAction,
}) {
  return (
    <div className="flex flex-col gap-2.5 pb-1 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-2xs sm:text-xs text-[#64748B] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {secondaryAction}
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DBEAFE] bg-white text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#2563EB] transition-all cursor-pointer shadow-2xs"
            >
              {ActionIcon && <ActionIcon className="w-3.5 h-3.5 text-[#2563EB]" />}
              <span>{actionText}</span>
            </button>
          )}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="flex items-center gap-5 border-b border-[#E2E8F0] overflow-x-auto text-xs font-semibold pt-0.5">
          {tabs.map((tab) => {
            const tabId = typeof tab === 'string' ? tab : tab.id
            const tabLabel = typeof tab === 'string' ? tab : tab.label
            const isActive = activeTab === tabId

            return (
              <button
                key={tabId}
                type="button"
                onClick={() => onTabChange?.(tabId)}
                className={`pb-2 transition-colors cursor-pointer whitespace-nowrap relative ${
                  isActive
                    ? 'text-[#2563EB] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#2563EB]'
                }`}
              >
                {tabLabel}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SummarySubheader
