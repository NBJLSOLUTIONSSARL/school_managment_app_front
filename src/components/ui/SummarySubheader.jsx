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
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-2xs text-slate-500 mt-0.5">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              {ActionIcon && <ActionIcon className="w-3.5 h-3.5 text-slate-500" />}
              <span>{actionText}</span>
            </button>
          )}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="flex items-center gap-5 border-b border-slate-200 overflow-x-auto text-xs font-medium pt-0.5">
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
                    ? 'text-slate-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
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
