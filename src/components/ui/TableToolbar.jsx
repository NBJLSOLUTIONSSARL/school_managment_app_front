import { useState } from 'react'
import {
  Table as TableIcon,
  Columns3,
  List as ListIcon,
  Search,
  SlidersHorizontal,
  Settings,
  Download,
  ChevronDown,
  Plus,
  User,
  MapPin,
  Filter,
  X,
} from 'lucide-react'

export function TableToolbar({
  activeView = 'table',
  onViewChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  onHideColumns,
  onOpenSettings,
  onExport,
  primaryActionLabel = 'New item',
  onPrimaryAction,
  filters = [],
  onFilterChange,
  showFilters = true,
  className = '',
}) {
  const [internalView, setInternalView] = useState(activeView)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const currentView = onViewChange ? activeView : internalView
  const handleViewClick = (v) => {
    if (onViewChange) onViewChange(v)
    else setInternalView(v)
  }

  return (
    <div className={`space-y-3 select-none ${className}`}>
      {/* Top View Switcher & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: View Mode Segmented Controls */}
        <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl border border-[#E5E7EB] shrink-0 self-start">
          <button
            type="button"
            onClick={() => handleViewClick('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'table'
                ? 'bg-white text-[#111827] shadow-xs border border-black/5'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/60'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 stroke-[2]" />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewClick('board')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'board'
                ? 'bg-white text-[#111827] shadow-xs border border-black/5'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/60'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5 stroke-[2]" />
            <span>Board</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewClick('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'list'
                ? 'bg-white text-[#111827] shadow-xs border border-black/5'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/60'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5 stroke-[2]" />
            <span>List</span>
          </button>
        </div>

        {/* Right: Actions (Search, Hide, Settings, Export, Primary Action) */}
        <div className="flex items-center flex-wrap gap-2 justify-end">
          {/* Search Input matching the image */}
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 shadow-2xs text-xs text-[#111827] w-36 sm:w-52 focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-black/5 transition-all">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 me-1.5" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="text-[#9CA3AF] hover:text-[#111827] p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Hide Columns Button */}
          <button
            type="button"
            onClick={onHideColumns}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Hide</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Settings</span>
          </button>

          {/* Import / Export Dropdown */}
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <span>Import / Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>

          {/* Primary Action Button (New company / item) */}
          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111827] hover:bg-black active:bg-[#1F2937] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>{primaryActionLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips matching the image */}
      {showFilters && (
        <div className="flex items-center flex-wrap gap-2 pt-0.5">
          {filters.length > 0 ? (
            filters.map((f, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl text-xs font-medium text-[#374151] shadow-2xs hover:bg-[#F9FAFB] transition cursor-pointer"
                onClick={f.onClick}
              >
                {f.icon ? (
                  <f.icon className="w-3.5 h-3.5 text-[#6B7280]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#6B7280]" />
                )}
                <span>{f.label}</span>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
              </div>
            ))
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl text-xs font-medium text-[#374151] shadow-2xs hover:bg-[#F9FAFB] transition cursor-pointer">
                <User className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Person to contact</span>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl text-xs font-medium text-[#374151] shadow-2xs hover:bg-[#F9FAFB] transition cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Location</span>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
              </div>
            </>
          )}

          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#111827] px-2 py-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add filter</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default TableToolbar
