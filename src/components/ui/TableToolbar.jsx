import { useState } from 'react'
import {
  Table as TableIcon,
  Columns3,
  List as ListIcon,
  Search,
  SlidersHorizontal,
  Settings,
  ChevronDown,
  Plus,
  User,
  MapPin,
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
  _onFilterChange,
  showFilters = true,
  className = '',
}) {
  const [internalView, setInternalView] = useState(activeView)

  const currentView = onViewChange ? activeView : internalView
  const handleViewClick = (v) => {
    if (onViewChange) onViewChange(v)
    else setInternalView(v)
  }

  return (
    <div className={`space-y-2.5 select-none ${className}`}>
      {/* Top View Switcher & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: View Mode Segmented Controls */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md border border-slate-200 shrink-0 self-start">
          <button
            type="button"
            onClick={() => handleViewClick('table')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'table'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 stroke-[2]" />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewClick('board')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'board'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5 stroke-[2]" />
            <span>Board</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewClick('list')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'list'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5 stroke-[2]" />
            <span>List</span>
          </button>
        </div>

        {/* Right: Actions (Search, Hide, Settings, Export, Primary Action) */}
        <div className="flex items-center flex-wrap gap-2 justify-end">
          {/* Search Input */}
          <div className="flex items-center bg-slate-50/70 border border-slate-200 rounded-md px-2.5 py-1 shadow-2xs text-xs text-slate-900 w-36 sm:w-52 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 me-1.5" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Hide Columns Button */}
          <button
            type="button"
            onClick={onHideColumns}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Colonnes</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Paramètres</span>
          </button>

          {/* Import / Export Dropdown */}
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <span>Import / Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Primary Action Button */}
          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <span>{primaryActionLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips */}
      {showFilters && (
        <div className="flex items-center flex-wrap gap-2 pt-0.5">
          {filters.length > 0 ? (
            filters.map((f, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={f.onClick}
              >
                {f.icon ? (
                  <f.icon className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{f.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            ))
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact référent</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Bâtiment / Site</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </>
          )}

          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Filtre</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default TableToolbar
