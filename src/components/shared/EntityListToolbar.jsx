import { useState } from 'react'
import { Plus, Filter, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/utils/classNames'

export function EntityListToolbar({
  // Add New
  onAddNew,
  addNewLabel = 'Nouveau',
  canAddNew = true,
  addNewIcon: AddNewIcon = Plus,

  // Search
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',

  // Filters
  filtersContent,
  hasActiveFilters = false,
  activeFiltersCount = 0,
  onClearFilters,
  filterButtonLabel = 'Filtres',

  className = '',
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4',
        className
      )}
    >
      {/* Left side: Add New button + Filter button */}
      <div className="flex items-center gap-2 flex-wrap">
        {canAddNew && onAddNew && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAddNew}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-xs h-9 px-3.5 text-xs inline-flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <AddNewIcon className="w-4 h-4 shrink-0" />
            <span>{addNewLabel}</span>
          </Button>
        )}

        {filtersContent && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'h-9 px-3 text-xs rounded-lg border font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none',
                  hasActiveFilters
                    ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] hover:bg-[#DBEAFE]'
                    : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                )}
              >
                <Filter
                  className={cn(
                    'w-3.5 h-3.5 shrink-0',
                    hasActiveFilters ? 'text-[#2563EB]' : 'text-[#64748B]'
                  )}
                />
                <span>{filterButtonLabel}</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-[#2563EB] text-white">
                    {activeFiltersCount > 0 ? activeFiltersCount : '•'}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-72 sm:w-80 p-4 bg-white border border-[#E2E8F0] shadow-lg rounded-xl z-50 text-xs"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                  <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{filterButtonLabel}</span>
                </div>
                {hasActiveFilters && onClearFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearFilters()
                      setIsFilterOpen(false)
                    }}
                    className="text-2xs text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-medium cursor-pointer"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>

              <div className="space-y-3">{filtersContent}</div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={() => setIsFilterOpen(false)}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-3 py-1.5 rounded-lg"
                >
                  Fermer
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Right side: Search input */}
      {onSearchChange && (
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded transition-colors cursor-pointer"
              title="Effacer la recherche"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
