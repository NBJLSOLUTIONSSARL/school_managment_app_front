import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, User, ChevronRight, Ban, CheckCircle } from 'lucide-react'
import { timetableService } from '../api/timetableService'
import { cn } from '@/utils/classNames'

function getTodayFormatted() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function getCurrentTimeStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function TodayScheduleWidget({ title = "Emploi du temps d'aujourd'hui" }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function loadTodaySlots() {
      setLoading(true)
      const res = await timetableService.getTodaySlots()
      if (mounted) {
        if (res.success) {
          setSlots(res.data || [])
        } else {
          setError(res.error?.message || 'Impossible de charger l’emploi du temps')
        }
        setLoading(false)
      }
    }
    loadTodaySlots()
    return () => {
      mounted = false
    }
  }, [])

  const currentTimeStr = getCurrentTimeStr()
  const todayFormatted = getTodayFormatted()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400">
              {todayFormatted}
            </p>
          </div>
        </div>
        <Link
          to="/timetables"
          className="flex items-center gap-1 text-2xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Semaine complète
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-4 text-center text-xs text-slate-400">
            {error}
          </div>
        ) : slots.length === 0 ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto h-7 w-7 text-emerald-400/80 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Aucun cours prévu aujourd’hui
            </p>
            <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">
              Profitez de cette journée ou consultez la semaine complète.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {slots.map((slot) => {
              const isPast = slot.endTime && slot.endTime < currentTimeStr
              const isNow =
                slot.startTime &&
                slot.endTime &&
                slot.startTime <= currentTimeStr &&
                slot.endTime >= currentTimeStr
              const isCancelled = slot.subject?.startsWith('[ANNULÉ]')

              return (
                <div
                  key={slot.id}
                  className={cn(
                    'flex items-center justify-between py-2.5 transition-colors',
                    isNow ? 'bg-blue-50/60 dark:bg-blue-950/30 -mx-2 px-2 rounded-xl' : '',
                    isPast ? 'opacity-55' : ''
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-center font-mono dark:bg-slate-800">
                      <span className="text-2xs font-bold text-slate-800 dark:text-slate-200">
                        {slot.startTime}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {slot.endTime}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                          {slot.subject}
                        </p>
                        {isNow && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            En cours
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-0.5 text-2xs text-rose-600 font-medium">
                            <Ban className="h-3 w-3" />
                            Annulé
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-3 text-2xs text-slate-500 dark:text-slate-400">
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
                      </div>
                    </div>
                  </div>

                  {slot.className && (
                    <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-2xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {slot.className}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

TodayScheduleWidget.propTypes = {
  title: PropTypes.string,
}

export default TodayScheduleWidget
