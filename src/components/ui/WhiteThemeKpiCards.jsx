import {
  TrendingUp,
  Briefcase,
  CheckSquare,
  Calendar,
  Heart,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

const DEFAULT_KPI_CARDS = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: '$842,310',
    change: '+12.4%',
    isPositive: true,
    badgeVariant: 'green',
    icon: TrendingUp,
    colorScheme: 'emerald',
  },
  {
    id: 'projects',
    label: 'Active Projects',
    value: '47',
    change: '+6',
    isPositive: true,
    badgeVariant: 'blue',
    icon: Briefcase,
    colorScheme: 'blue',
  },
  {
    id: 'tasks',
    label: 'Open Tasks',
    value: '312',
    change: '-18',
    isPositive: false,
    badgeVariant: 'red',
    icon: CheckSquare,
    colorScheme: 'amber',
  },
  {
    id: 'meetings',
    label: 'Meetings',
    value: '28',
    change: 'This Week',
    badgeVariant: 'purple',
    icon: Calendar,
    colorScheme: 'purple',
  },
  {
    id: 'health',
    label: 'Client Health',
    value: '94%',
    change: '+2.1%',
    isPositive: true,
    badgeVariant: 'green',
    icon: Heart,
    colorScheme: 'teal',
  },
  {
    id: 'ai-productivity',
    label: 'Ai Productivity',
    value: '8.7x',
    change: 'Vs Baseline',
    badgeVariant: 'indigo',
    icon: Sparkles,
    colorScheme: 'indigo',
  },
]

const colorSchemes = {
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
  },
  teal: {
    iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  },
}

const badgeStyles = {
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  red: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
}

export function WhiteThemeKpiCards({
  cards = DEFAULT_KPI_CARDS,
  onCardClick,
  className = '',
}) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 select-none ${className}`}
    >
      {cards.map((card, idx) => {
        const Icon = card.icon || TrendingUp
        const color = colorSchemes[card.colorScheme] || colorSchemes.emerald
        const badge = badgeStyles[card.badgeVariant] || badgeStyles.green

        return (
          <div
            key={card.id || card.label || idx}
            onClick={() => onCardClick?.(card, idx)}
            className="group bg-white rounded-2xl border border-[#EDF0F8] p-4 sm:p-4.5 shadow-[0_2px_12px_-2px_rgba(91,95,199,0.04)] hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            {/* Top row: Icon in squircle and Badge */}
            <div className="flex items-center justify-between gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${color.iconBg}`}
              >
                <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
              </div>

              {card.change && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${badge}`}
                >
                  {card.isPositive === true && (
                    <ArrowUp className="w-2.5 h-2.5" strokeWidth={2.5} />
                  )}
                  {card.isPositive === false && (
                    <ArrowDown className="w-2.5 h-2.5" strokeWidth={2.5} />
                  )}
                  <span>{card.change}</span>
                </span>
              )}
            </div>

            {/* Bottom: Big Value and Clean Label */}
            <div className="mt-3.5">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {card.value}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                {card.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WhiteThemeKpiCards
