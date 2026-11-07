import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/classNames'

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function EventCalendarView({ events = [], onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [todayDate] = useState(() => new Date())
  const [calendarMode, setCalendarMode] = useState('month') // 'month' | 'week'

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      if (calendarMode === 'month') {
        next.setMonth(next.getMonth() - 1)
      } else {
        next.setDate(next.getDate() - 7)
      }
      return next
    })
  }

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      if (calendarMode === 'month') {
        next.setMonth(next.getMonth() + 1)
      } else {
        next.setDate(next.getDate() + 7)
      }
      return next
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Month grid calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of month (0 = Sun, 1 = Mon ... 6 = Sat)
    const firstDay = new Date(year, month, 1)
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6 // Make Monday index 0

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const cells = []

    // Previous month filler days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      })
    }

    // Next month filler days to complete 5 or 6 rows of 7
    const remainder = cells.length % 7
    if (remainder > 0) {
      const needed = 7 - remainder
      for (let i = 1; i <= needed; i++) {
        cells.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
        })
      }
    }

    return cells
  }, [currentDate])

  // Week days calculation
  const weekData = useMemo(() => {
    const d = new Date(currentDate)
    let dayOfWeek = d.getDay() - 1
    if (dayOfWeek === -1) dayOfWeek = 6 // Mon = 0
    d.setDate(d.getDate() - dayOfWeek)

    const days = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(d)
      dayDate.setDate(d.getDate() + i)
      days.push(dayDate)
    }
    return days
  }, [currentDate])

  // Map events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map()
    events.forEach((ev) => {
      if (!ev.startAt) return
      const dateKey = ev.startAt.slice(0, 10)
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey).push(ev)
    })
    return map
  }, [events])

  const getDateKey = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const isToday = (date) => {
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    )
  }

  const periodLabel = useMemo(() => {
    if (calendarMode === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }
    const start = weekData[0]
    const end = weekData[6]
    return `Semaine du ${start.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'short' })} au ${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`
  }, [calendarMode, currentDate, weekData])

  return (
    <div className="rounded border border-slate-200 bg-white shadow-2xs">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="xs" onClick={handlePrev}>
            ◀
          </Button>
          <Button variant="secondary" size="xs" onClick={handleToday}>
            Aujourd'hui
          </Button>
          <Button variant="secondary" size="xs" onClick={handleNext}>
            ▶
          </Button>
          <span className="ml-2 font-semibold capitalize text-xs text-slate-800">
            {periodLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded bg-slate-100 p-0.5 text-2xs">
          <button
            type="button"
            onClick={() => setCalendarMode('month')}
            className={cn(
              'rounded px-2.5 py-1 font-medium transition-colors',
              calendarMode === 'month'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Mois
          </button>
          <button
            type="button"
            onClick={() => setCalendarMode('week')}
            className={cn(
              'rounded px-2.5 py-1 font-medium transition-colors',
              calendarMode === 'week'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Semaine
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-2xs font-semibold text-slate-500">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="py-2 border-r last:border-r-0 border-slate-200">
            {day}
          </div>
        ))}
      </div>

      {/* Month View Grid */}
      {calendarMode === 'month' && (
        <div className="grid grid-cols-7 auto-rows-fr">
          {monthData.map(({ date, isCurrentMonth }, idx) => {
            const key = getDateKey(date)
            const dayEvents = eventsByDate.get(key) || []
            const today = isToday(date)

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[90px] border-b border-r border-slate-200 p-1.5 transition-colors',
                  idx % 7 === 6 && 'border-r-0',
                  !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-700',
                  today && 'bg-blue-50/30'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex h-5 w-5 items-center justify-center rounded-full text-2xs font-medium',
                      today ? 'bg-slate-900 font-bold text-white' : 'text-slate-600'
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => onSelectEvent?.(ev)}
                      className="block w-full truncate rounded bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 text-left text-[11px] text-slate-800 transition-colors"
                      title={`${ev.title} (${ev.location || ''})`}
                    >
                      <span className="font-semibold text-slate-600 mr-1">
                        {ev.startAt?.slice(11, 16)}
                      </span>
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="block text-[10px] text-slate-400 italic">
                      +{dayEvents.length - 3} autres...
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Week View Grid */}
      {calendarMode === 'week' && (
        <div className="grid grid-cols-7 min-h-[300px]">
          {weekData.map((date, idx) => {
            const key = getDateKey(date)
            const dayEvents = eventsByDate.get(key) || []
            const today = isToday(date)

            return (
              <div
                key={idx}
                className={cn(
                  'border-r border-slate-200 p-2 last:border-r-0 space-y-2',
                  today ? 'bg-blue-50/20' : 'bg-white'
                )}
              >
                <div className="text-center pb-2 border-b border-slate-100">
                  <span
                    className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-2xs font-semibold',
                      today ? 'bg-slate-900 text-white' : 'text-slate-700'
                    )}
                  >
                    {date.getDate()} {date.toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {dayEvents.length === 0 ? (
                    <p className="text-center text-[10px] text-slate-300 italic pt-4">Rien</p>
                  ) : (
                    dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvent?.(ev)}
                        className="cursor-pointer rounded border border-slate-200 bg-slate-50 p-1.5 text-left text-xs hover:border-slate-400 transition-colors"
                      >
                        <div className="font-semibold text-slate-900 truncate">{ev.title}</div>
                        <div className="text-[10px] text-slate-500">
                          ⏱ {ev.startAt?.slice(11, 16)} - {ev.endAt?.slice(11, 16)}
                        </div>
                        {ev.location && (
                          <div className="text-[10px] text-slate-400 truncate">
                            📍 {ev.location}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EventCalendarView
