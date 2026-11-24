import {
  RotateCcw,
  Smartphone,
  Cpu,
  LayoutGrid,
  CreditCard,
} from 'lucide-react'

const DEFAULT_PROJECTS = [
  {
    id: 'atlas-rebrand',
    name: 'Atlas Rebrand',
    client: 'Nordwind',
    percentage: 82,
    status: 'On Track',
    statusVariant: 'success',
    colorScheme: 'blue',
    icon: RotateCcw,
  },
  {
    id: 'vertex-mobile-app',
    name: 'Vertex Mobile App',
    client: 'Helix Labs',
    percentage: 54,
    status: 'At Risk',
    statusVariant: 'warning',
    colorScheme: 'pink',
    icon: Smartphone,
  },
  {
    id: 'quantum-migration',
    name: 'Quantum Migration',
    client: 'Helix Labs',
    percentage: 38,
    status: 'Critical',
    statusVariant: 'danger',
    colorScheme: 'emerald',
    icon: Cpu,
  },
  {
    id: 'solaris-dashboard',
    name: 'Solaris Dashboard',
    client: 'Nebula Tech',
    percentage: 96,
    status: 'On Track',
    statusVariant: 'success',
    colorScheme: 'orange',
    icon: LayoutGrid,
  },
  {
    id: 'lunar-payment',
    name: 'Lunar Payment Gateway',
    client: 'CosmoSoft',
    percentage: 67,
    status: 'At Risk',
    statusVariant: 'warning',
    colorScheme: 'purple',
    icon: CreditCard,
  },
]

const projectColors = {
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    barFilled: 'bg-blue-500',
  },
  pink: {
    iconBg: 'bg-pink-50 text-pink-600 border border-pink-200/60',
    barFilled: 'bg-pink-500',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    barFilled: 'bg-emerald-500',
  },
  orange: {
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    barFilled: 'bg-amber-500',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60',
    barFilled: 'bg-purple-500',
  },
}

const statusBadges = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
}

export function ProjectHealthSegmentedCard({
  title = 'PROJECT HEALTH',
  projects = DEFAULT_PROJECTS,
  totalSegments = 24,
  onProjectClick,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#EDF0F8] p-5 sm:p-6 shadow-[0_2px_12px_-2px_rgba(91,95,199,0.04)] select-none flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {title}
        </h3>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project, idx) => {
          const Icon = project.icon || RotateCcw
          const colors = projectColors[project.colorScheme] || projectColors.blue
          const badge = statusBadges[project.statusVariant] || statusBadges.success

          // Calculate how many segments are filled
          const filledCount = Math.round((project.percentage / 100) * totalSegments)

          return (
            <div
              key={project.id || project.name || idx}
              onClick={() => onProjectClick?.(project, idx)}
              className="flex items-center justify-between gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              {/* Left: Icon & Project Info */}
              <div className="flex items-center gap-3 min-w-[140px] sm:min-w-[180px] shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${colors.iconBg}`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="truncate">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {project.name}
                  </div>
                  <div className="text-2xs text-slate-400 font-medium truncate">
                    {project.client}
                  </div>
                </div>
              </div>

              {/* Center: Segmented Progress Bar */}
              <div className="hidden sm:flex flex-1 items-center justify-center px-2">
                <div className="flex items-center gap-[3px] w-full max-w-xs">
                  {Array.from({ length: totalSegments }).map((_, segIdx) => {
                    const isFilled = segIdx < filledCount
                    return (
                      <span
                        key={segIdx}
                        className={`flex-1 h-5 rounded-full transition-colors ${
                          isFilled ? colors.barFilled : 'bg-slate-100'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Right: Percentage & Status Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-slate-700 tabular-nums w-9 text-right">
                  {project.percentage}%
                </span>
                <span
                  className={`text-2xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${badge}`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectHealthSegmentedCard
