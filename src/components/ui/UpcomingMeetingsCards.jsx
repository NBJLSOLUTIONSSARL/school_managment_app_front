import { Sparkles } from 'lucide-react'

const DEFAULT_MEETINGS = [
  {
    id: 'meeting-1',
    title: 'Q4 Sales Strategy',
    timeAndGroup: '10:30, Sales Pod',
    badgeText: 'All',
    colorScheme: 'purple',
  },
  {
    id: 'meeting-2',
    title: 'Northwind Sprint Review',
    timeAndGroup: '10:30, Alas Team',
    badgeText: 'All',
    colorScheme: 'blue',
  },
  {
    id: 'meeting-3',
    title: 'Northwind Sprint Review',
    timeAndGroup: '13:00, Alas Team',
    badgeText: 'All',
    colorScheme: 'amber',
  },
  {
    id: 'meeting-4',
    title: 'Helix Labs Discovery',
    timeAndGroup: '15:30, Sarah Chen',
    badgeText: 'All',
    colorScheme: 'indigo',
  },
  {
    id: 'meeting-5',
    title: 'Helix Labs Discovery',
    timeAndGroup: '17:00, Company',
    badgeText: 'All',
    colorScheme: 'teal',
  },
]

const cardThemes = {
  purple: {
    container: 'bg-[#FAF5FF] border-[#E9D5FF]/80 hover:border-[#D8B4FE]',
    title: 'text-[#581C87]',
    subtitle: 'text-[#9333EA]',
    button: 'bg-white text-[#7E22CE] border-[#D8B4FE] hover:bg-[#F3E8FF]',
  },
  blue: {
    container: 'bg-[#F0F9FF] border-[#BAE6FD]/80 hover:border-[#7DD3FC]',
    title: 'text-[#0C4A6E]',
    subtitle: 'text-[#0284C7]',
    button: 'bg-white text-[#0369A1] border-[#7DD3FC] hover:bg-[#E0F2FE]',
  },
  amber: {
    container: 'bg-[#FFFBEB] border-[#FDE68A]/80 hover:border-[#FCD34D]',
    title: 'text-[#78350F]',
    subtitle: 'text-[#D97706]',
    button: 'bg-white text-[#B45309] border-[#FCD34D] hover:bg-[#FEF3C7]',
  },
  indigo: {
    container: 'bg-[#EEF2FF] border-[#C7D2FE]/80 hover:border-[#A5B4FC]',
    title: 'text-[#312E81]',
    subtitle: 'text-[#4F46E5]',
    button: 'bg-white text-[#4338CA] border-[#A5B4FC] hover:bg-[#E0E7FF]',
  },
  teal: {
    container: 'bg-[#F0FDFA] border-[#99F6E4]/80 hover:border-[#5EEAD4]',
    title: 'text-[#134E4A]',
    subtitle: 'text-[#0D9488]',
    button: 'bg-white text-[#0F766E] border-[#5EEAD4] hover:bg-[#CCFBF1]',
  },
}

export function UpcomingMeetingsCards({
  title = 'UPCOMING MEETINGS',
  meetings = DEFAULT_MEETINGS,
  onMeetingClick,
  onActionClick,
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

      {/* Meetings Stack */}
      <div className="space-y-3">
        {meetings.map((meeting, idx) => {
          const theme = cardThemes[meeting.colorScheme] || cardThemes.purple

          return (
            <div
              key={meeting.id || idx}
              onClick={() => onMeetingClick?.(meeting, idx)}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${theme.container}`}
            >
              {/* Left: Meeting Details */}
              <div className="truncate min-w-0">
                <div className={`text-xs sm:text-sm font-semibold truncate ${theme.title}`}>
                  {meeting.title}
                </div>
                <div className={`text-2xs font-medium mt-0.5 truncate ${theme.subtitle}`}>
                  {meeting.timeAndGroup}
                </div>
              </div>

              {/* Right: Pill Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onActionClick?.(meeting, idx)
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold border shadow-2xs transition-all cursor-pointer shrink-0 ${theme.button}`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{meeting.badgeText || 'All'}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UpcomingMeetingsCards
