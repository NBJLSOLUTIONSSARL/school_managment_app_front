import {
  Compass,
  Flame,
  Sun,
  Boxes,
  Globe,
} from 'lucide-react'

const DEFAULT_COMPANIES = [
  {
    id: 'northwind',
    name: 'Northwind Logistics',
    icon: Compass,
    iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    primaryContact: 'Sarah Chen',
    revenue: '$184K',
    projects: '04',
    health: 96,
    healthColor: 'bg-emerald-500',
    tier: 'Enterprise',
    tierColor: 'text-amber-600 font-semibold',
  },
  {
    id: 'helix',
    name: 'Helix Labs',
    icon: Flame,
    iconColor: 'bg-rose-50 text-rose-600 border border-rose-200/60',
    primaryContact: 'Daniel Park',
    revenue: '$92K',
    projects: '02',
    health: 74,
    healthColor: 'bg-amber-500',
    tier: 'Growth',
    tierColor: 'text-emerald-600 font-semibold',
  },
  {
    id: 'orion',
    name: 'Orion Labs',
    icon: Sun,
    iconColor: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    primaryContact: 'Priya Natarajan',
    revenue: '$248K',
    projects: '05',
    health: 52,
    healthColor: 'bg-rose-500',
    tier: 'Enterprise',
    tierColor: 'text-amber-600 font-semibold',
  },
  {
    id: 'synthesis',
    name: 'Synthesis',
    icon: Boxes,
    iconColor: 'bg-purple-50 text-purple-600 border border-purple-200/60',
    primaryContact: 'Marcus Lee',
    revenue: '$61K',
    projects: '01',
    health: 88,
    healthColor: 'bg-teal-500',
    tier: 'Mid-Market',
    tierColor: 'text-purple-600 font-semibold',
  },
  {
    id: 'atlas',
    name: 'Atlas Group',
    icon: Globe,
    iconColor: 'bg-pink-50 text-pink-600 border border-pink-200/60',
    primaryContact: 'Yuna Park',
    revenue: '$132K',
    projects: '03',
    health: 81,
    healthColor: 'bg-amber-500',
    tier: 'Enterprise',
    tierColor: 'text-amber-600 font-semibold',
  },
]

export function CompanyDetailsTableCard({
  title = 'COMPANY DETAILS',
  companies = DEFAULT_COMPANIES,
  onRowClick,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#EDF0F8] p-5 sm:p-6 shadow-[0_2px_12px_-2px_rgba(91,95,199,0.04)] select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {title}
        </h3>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 ps-1">Company</th>
              <th className="pb-3 px-3">Primary Contact</th>
              <th className="pb-3 px-3">Revenue</th>
              <th className="pb-3 px-3">Projects</th>
              <th className="pb-3 px-3 min-w-[140px]">Health</th>
              <th className="pb-3 pe-1 text-right">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {companies.map((company, idx) => {
              const Icon = company.icon || Globe

              return (
                <tr
                  key={company.id || company.name || idx}
                  onClick={() => onRowClick?.(company, idx)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Company Name with Icon */}
                  <td className="py-3.5 ps-1 pe-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${company.iconColor}`}
                      >
                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#5B5FC7] transition-colors truncate">
                        {company.name}
                      </span>
                    </div>
                  </td>

                  {/* Primary Contact */}
                  <td className="py-3.5 px-3 text-xs font-medium text-slate-600">
                    {company.primaryContact}
                  </td>

                  {/* Revenue */}
                  <td className="py-3.5 px-3 text-xs font-bold text-slate-900 tabular-nums">
                    {company.revenue}
                  </td>

                  {/* Projects */}
                  <td className="py-3.5 px-3 text-xs font-semibold text-slate-600 font-mono">
                    {company.projects}
                  </td>

                  {/* Health with solid bar and score */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          style={{ width: `${company.health}%` }}
                          className={`h-full rounded-full ${company.healthColor}`}
                        />
                      </div>
                      <span className="text-2xs font-bold text-slate-700 tabular-nums w-5 text-right">
                        {company.health}
                      </span>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className={`py-3.5 pe-1 text-right text-xs ${company.tierColor}`}>
                    {company.tier}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CompanyDetailsTableCard
