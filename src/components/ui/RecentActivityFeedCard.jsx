import { MoreVertical, UserCheck, CreditCard, GraduationCap } from 'lucide-react'

export function RecentActivityFeedCard({
  title = 'Recent Updates',
  items = null,
  onOptionsClick,
  onItemClick,
  className = '',
}) {
  const defaultItems = [
    {
      id: '1',
      title: 'New Teacher',
      subtitle: 'Dossier d’affectation validé en salle des profs',
      time: 'Just now',
      icon: UserCheck,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      id: '2',
      title: 'Fees Structure',
      subtitle: 'Barème des droits de scolarité mis à jour',
      time: 'Today',
      icon: CreditCard,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      id: '3',
      title: 'New Course',
      subtitle: 'Programme pédagogique ajouté au cursus',
      time: '24 Sep 2023',
      icon: GraduationCap,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
  ]

  const list = items && items.length > 0 ? items : defaultItems

  return (
    <div className={`figma-card bg-white rounded-2xl p-5 sm:p-6 border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={onOptionsClick}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7]"
          aria-label="Options"
        >
          <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {list.map((item) => {
          const Icon = item.icon || UserCheck
          return (
            <div
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-colors ${
                onItemClick ? 'hover:bg-[#F8F9FD] cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-[#EDF0F8] ${
                    item.iconBg || 'bg-[#5B5FC7]/10'
                  } ${item.iconColor || 'text-[#5B5FC7]'}`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-slate-900 truncate">{item.title}</h4>
                  <p className="text-2xs text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-2xs text-slate-400 font-medium shrink-0 tabular-nums">
                {item.time}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecentActivityFeedCard
