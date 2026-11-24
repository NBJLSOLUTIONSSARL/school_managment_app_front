import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function MiniCalendar({ onSelectDate, className = '' }) {
  const [today] = useState(() => {
    const d = new Date()
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() }
  })
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay() // 0 is Sun, 1 is Mon
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days = []
  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false })
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true })
  }
  // Next month leading days to complete full grid (multiple of 7)
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false })
  }

  const handleDayClick = (d) => {
    if (d.isCurrentMonth) {
      setSelectedDay(d.day)
      if (onSelectDate) onSelectDate(new Date(year, month, d.day))
    }
  }

  const dayHeaders = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  return (
    <div className={`bg-white p-4 rounded-lg border border-slate-200 shadow-2xs select-none ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-slate-900">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {dayHeaders.map((d) => (
          <span key={d} className="text-2xs font-semibold text-slate-400 py-0.5">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, index) => {
          const isSelected = d.isCurrentMonth && d.day === selectedDay
          const isToday = d.isCurrentMonth && d.day === today.day && month === today.month && year === today.year

          return (
            <button
              type="button"
              key={index}
              onClick={() => handleDayClick(d)}
              disabled={!d.isCurrentMonth}
              className={`h-7 w-7 mx-auto flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                !d.isCurrentMonth
                  ? 'text-slate-300 cursor-default'
                  : isSelected
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : isToday
                  ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {d.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MiniCalendar
