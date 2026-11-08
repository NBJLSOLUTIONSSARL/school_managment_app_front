import { MoreVertical, UserCheck, CreditCard, GraduationCap } from 'lucide-react'

export function RecentActivityFeedCard({
  title = 'All Exam Results',
  items = null,
  onOptionsClick,
  onItemClick,
  className = '',
}) {
  const defaultItems = [
    {
      id: '1',
      title: 'New Teacher',
      subtitle: 'It is a long established readable..',
      time: 'Just now',
      icon: UserCheck,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: '2',
      title: 'Fees Structure',
      subtitle: 'It is a long established readable..',
      time: 'Today',
      icon: CreditCard,
      iconBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#1D4ED8]',
    },
    {
      id: '3',
      title: 'New Course',
      subtitle: 'It is a long established readable..',
      time: '24 Sep 2023',
      icon: GraduationCap,
      iconBg: 'bg-[#F0F9FF]',
      iconColor: 'text-[#0284C7]',
    },
  ]

  const list = items && items.length > 0 ? items : defaultItems

  return (
    <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={onOptionsClick}
          className="text-[#64748B] hover:text-[#2563EB] p-1 rounded-lg hover:bg-[#EFF6FF] transition cursor-pointer"
          aria-label="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {list.map((item) => {
          const Icon = item.icon || UserCheck
          return (
            <div
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className={`flex items-center justify-between gap-3 p-1.5 rounded-xl transition ${
                onItemClick ? 'hover:bg-[#EFF6FF]/40 cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.iconBg || 'bg-[#EFF6FF]'
                  } ${item.iconColor || 'text-[#2563EB]'}`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0F172A] truncate">{item.title}</h4>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-[#64748B] font-normal shrink-0">
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
