import { Sparkles, Search } from 'lucide-react'

export function WhiteThemeDashboardHeader({
  name = 'Alex',
  greeting = 'Good morning',
  subtitle = "Today's workspace updates.",
  onAskAi,
  onSearch,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${className}`}
    >
      {/* Left: Greeting and Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span>{greeting}, {name}</span>
          <span className="inline-block animate-wave text-2xl sm:text-3xl" role="img" aria-label="Waving hand">
            👋
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          {subtitle}
        </p>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2.5">
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>
        )}

        <button
          type="button"
          onClick={onAskAi}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#5B5FC7] via-[#6366F1] to-[#8B5CF6] hover:from-[#484BB5] hover:to-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  )
}

export default WhiteThemeDashboardHeader
