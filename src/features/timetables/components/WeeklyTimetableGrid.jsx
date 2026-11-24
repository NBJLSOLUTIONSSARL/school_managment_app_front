import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Clock, MapPin, User, Ban, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/classNames'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const TIME_SLOTS = [
  { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
  { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
  { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
  { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
  { label: '12:00 - 14:00', start: '12:00', end: '14:00', isBreak: true },
  { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
  { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
  { label: '16:00 - 17:00', start: '16:00', end: '17:00' },
  { label: '17:00 - 18:00', start: '17:00', end: '18:00' },
]

const COLOR_MAP = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200',
  mint: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
  peach: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
  lavender: 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200',
  purple: 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-200',
  indigo: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200',
  gray: 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400',
}

export function WeeklyTimetableGrid({
  slots = [],
  includeSaturday = false,
  onSlotClick,
  onCellClick,
  canEdit = false,
}) {
  const activeDays = useMemo(() => {
    return includeSaturday ? DAYS : DAYS.slice(0, 5)
  }, [includeSaturday])

  const slotGrid = useMemo(() => {
    const map = {}
    slots.forEach((slot) => {
      const key = `${slot.dayOfWeek?.toLowerCase()}_${slot.startTime?.slice(0, 5)}`
      if (!map[key]) map[key] = []
      map[key].push(slot)
    })
    return map
  }, [slots])

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 print:border-none print:shadow-none">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
            <th className="w-28 p-3 text-center text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center justify-center gap-1.5">
                <Clock className="h-3 w-3" />
                Horaire
              </span>
            </th>
            {activeDays.map((day) => (
              <th
                key={day}
                className="p-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {TIME_SLOTS.map((time) => {
            if (time.isBreak) {
              return (
                <tr
                  key={time.start}
                  className="bg-slate-50/70 dark:bg-slate-800/30 text-center"
                >
                  <td className="p-2 text-2xs font-medium text-slate-400 dark:text-slate-500">
                    {time.label}
                  </td>
                  <td
                    colSpan={activeDays.length}
                    className="p-2 text-2xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500"
                  >
                    Pause Méridienne / Déjeuner
                  </td>
                </tr>
              )
            }

            return (
              <tr key={time.start} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                <td className="p-2.5 text-center font-mono text-2xs font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                  {time.start} - {time.end}
                </td>
                {activeDays.map((day) => {
                  const key = `${day.toLowerCase()}_${time.start}`
                  const matchingSlots = slotGrid[key] || []

                  return (
                    <td
                      key={day}
                      onClick={() => {
                        if (matchingSlots.length === 0 && canEdit && onCellClick) {
                          onCellClick(day, time.start, time.end)
                        }
                      }}
                      className={cn(
                        'min-h-[70px] p-1.5 border-r border-slate-100 dark:border-slate-800 align-top transition-colors',
                        matchingSlots.length === 0 && canEdit
                          ? 'hover:bg-blue-50/30 cursor-pointer group'
                          : ''
                      )}
                    >
                      {matchingSlots.length === 0 ? (
                        <div className="h-full min-h-[56px] flex items-center justify-center">
                          {canEdit && (
                            <span className="text-2xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                              + Ajouter
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {matchingSlots.map((slot) => {
                            const isCancelled = slot.subject?.startsWith('[ANNULÉ]')
                            const colorClass = COLOR_MAP[slot.colorKey] || COLOR_MAP.blue

                            return (
                              <div
                                key={slot.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onSlotClick?.(slot)
                                }}
                                className={cn(
                                  'group relative rounded-lg border p-2 text-left shadow-2xs transition hover:shadow-xs',
                                  isCancelled ? COLOR_MAP.gray : colorClass,
                                  onSlotClick ? 'cursor-pointer hover:scale-[1.01]' : ''
                                )}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <p className="font-semibold text-xs leading-tight line-clamp-1">
                                    {slot.subject}
                                  </p>
                                  {isCancelled && (
                                    <span
                                      title="Cours annulé"
                                      className="inline-flex items-center text-rose-500"
                                    >
                                      <Ban className="h-3 w-3" />
                                    </span>
                                  )}
                                  {slot.teacherName?.includes('Remplaçant') && (
                                    <span
                                      title="Remplacement en cours"
                                      className="inline-flex items-center text-amber-500"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex flex-col gap-0.5 text-2xs opacity-85">
                                  {slot.teacherName && (
                                    <span className="flex items-center gap-1 truncate">
                                      <User className="h-2.5 w-2.5 shrink-0" />
                                      {slot.teacherName}
                                    </span>
                                  )}
                                  {slot.classroomName && (
                                    <span className="flex items-center gap-1 truncate font-medium">
                                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                                      {slot.classroomName}
                                    </span>
                                  )}
                                  {slot.className && (
                                    <span className="truncate text-slate-500 dark:text-slate-400 font-mono">
                                      {slot.className}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

WeeklyTimetableGrid.propTypes = {
  slots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      dayOfWeek: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      teacherName: PropTypes.string,
      classroomName: PropTypes.string,
      className: PropTypes.string,
      colorKey: PropTypes.string,
    })
  ),
  includeSaturday: PropTypes.bool,
  onSlotClick: PropTypes.func,
  onCellClick: PropTypes.func,
  canEdit: PropTypes.bool,
}

export default WeeklyTimetableGrid
