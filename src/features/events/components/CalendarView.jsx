import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays, Plus, List, Calendar } from 'lucide-react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EventFormModal } from './EventFormModal'
import { EventDetailsModal } from './EventDetailsModal'
import { eventService } from '../api/eventService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/classNames'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

const CURRENT_YEAR = new Date().getFullYear()

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
}

function startOfWeek(date, weekStartsOn = 1) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day < weekStartsOn ? -7 : 0) + day - weekStartsOn
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date, weekStartsOn = 1) {
  const d = startOfWeek(date, weekStartsOn)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

function addMonths(date, amount) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + amount)
  return d
}

function addWeeks(date, amount) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount * 7)
  return d
}

function formatMonthYear(date, locale = 'fr-FR') {
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

function formatWeekRange(start, end, locale = 'fr-FR') {
  return `${start.toLocaleDateString(locale, { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}`
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getDaysInMonth(date) {
  const start = startOfWeek(startOfMonth(date))
  const end = endOfWeek(endOfMonth(date))
  const days = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

function getDaysInWeek(date) {
  const start = startOfWeek(date)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export function CalendarView() {
  const { hasRole } = useAuth()
  const { t, language, dir } = useI18n()
  const { success, error: toastError } = useToast()

  const canManage = hasRole(['ROLE_ADMIN', 'admin'])

  // Display mode
  const [calendarMode, setCalendarMode] = useState('month') // 'month' | 'week'

  // Current viewed date
  const [currentDate, setCurrentDate] = useState(new Date())

  // Events data
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Date range for current view
  const [viewStart, setViewStart] = useState(null)
  const [viewEnd, setViewEnd] = useState(null)

  const loadEvents = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        const fromIso = viewStart ? viewStart.toISOString() : undefined
        const toIso = viewEnd ? viewEnd.toISOString() : undefined

        const res = await eventService.getEvents({
          from: fromIso,
          to: toIso,
          page: 1,
          size: 500,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setEvents(res.data.items || [])
        } else {
          setEvents([])
          if (!signal?.aborted) {
            toastError(res.error?.message || 'Impossible de charger les événements.')
          }
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [viewStart, viewEnd, toastError]
  )

  // Update view range when currentDate or calendarMode changes
  useEffect(() => {
    if (calendarMode === 'month') {
      setViewStart(startOfMonth(currentDate))
      setViewEnd(endOfMonth(currentDate))
    } else {
      setViewStart(startOfWeek(currentDate))
      setViewEnd(endOfWeek(currentDate))
    }
  }, [currentDate, calendarMode])

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadEvents({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadEvents])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await eventService.deleteEvent(deleteTarget.id)
      if (res.success) {
        success('Événement supprimé.')
        setDeleteTarget(null)
        loadEvents()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const days = useMemo(() => {
    if (calendarMode === 'month') {
      return getDaysInMonth(currentDate)
    }
    return getDaysInWeek(currentDate)
  }, [currentDate, calendarMode])

  const eventsByDay = useMemo(() => {
    const map = {}
    events.forEach((ev) => {
      const start = new Date(ev.startDate)
      const end = new Date(ev.endDate)
      const dayKey = start.toISOString().split('T')[0]
      if (!map[dayKey]) map[dayKey] = []
      map[dayKey].push(ev)
    })
    return map
  }, [events])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const navigate = (delta) => {
    if (calendarMode === 'month') {
      setCurrentDate(addMonths(currentDate, delta))
    } else {
      setCurrentDate(addWeeks(currentDate, delta))
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  return (
    <div dir={dir} lang={language} data-contract="calendar-view" className="min-h-screen flex flex-col bg-white select-none">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-2.5">
          <Link to="/events" className="inline-flex h-9 w-9 items-center justify-center rounded-tight border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer" title={t('common.back', 'Retour')}>
            <List className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.25" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-900">EduTrack</span>
        </div>
        <LanguageSwitcher size="xs" />
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-zinc-900">
                  {calendarMode === 'month'
                    ? formatMonthYear(currentDate, language)
                    : formatWeekRange(viewStart, viewEnd, language)}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  {t('events.calendarSubtitle', 'Vue calendrier des événements scolaires')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl bg-zinc-50 border border-zinc-200 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCalendarMode('month')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors cursor-pointer',
                      calendarMode === 'month'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('events.monthView', 'Mois')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMode('week')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors cursor-pointer',
                      calendarMode === 'week'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>{t('events.weekView', 'Semaine')}</span>
                  </button>
                </div>
                <Button variant="ghost" size="sm" onClick={goToToday} className="gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{t('common.today', 'Aujourd\'hui')}</span>
                </Button>
                {canManage && (
                  <Button size="sm" onClick={() => { setEditingItem(null); setIsFormOpen(true) }} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('events.newEvent', 'Nouvel événement')}</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => navigate(1)} className="gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex h-96 items-center justify-center rounded border border-zinc-200 bg-white">
                <Loader size="lg" />
              </div>
            ) : calendarMode === 'month' ? (
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, idx) => (
                    <div key={idx} className="px-2 py-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {days.map((day, idx) => {
                    const dayEvents = eventsByDay[day.toISOString().split('T')[0]] || []
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                    const isToday = isSameDay(day, today)

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'relative min-h-[100px] p-2 border-r border-zinc-100 last:border-r-0 transition-colors',
                          !isCurrentMonth && 'bg-zinc-50/50',
                          isToday && 'bg-blue-50/50 ring-2 ring-blue-200'
                        )}
                      >
                        <div className={cn('text-xs font-medium', isToday ? 'text-blue-700' : 'text-zinc-700')}>
                          {day.getDate()}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="mt-1 space-y-1 max-h-[70px] overflow-y-auto">
                            {dayEvents.slice(0, 3).map((ev) => (
                              <button
                                key={ev.id}
                                type="button"
                                onClick={() => setDetailItem(ev)}
                                className={cn(
                                  'w-full text-left px-1.5 py-1 rounded text-[10px] font-medium truncate transition-colors',
                                  ev.type === 'EXAM' ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' :
                                  ev.type === 'HOLIDAY' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                                  ev.type === 'MEETING' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                  'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                )}
                              >
                                {ev.title}
                              </button>
                            ))}
                            {dayEvents.length > 3 && (
                              <button
                                type="button"
                                onClick={() => setDetailItem(dayEvents[3])}
                                className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-700"
                              >
                                +{dayEvents.length - 3} {t('events.more', 'autres')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              {/* Week view */}
              (
                <div className="rounded-xl border border-zinc-200 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
                  {days.map((day, idx) => (
                    <div key={idx} className="px-2 py-2 text-center">
                      <div className={cn('text-xs font-semibold text-zinc-500 uppercase tracking-wider', isSameDay(day, today) && 'text-blue-700')}>
                        {day.toLocaleDateString(language, { weekday: 'short' })}
                      </div>
                      <div className={cn('text-sm font-bold mt-0.5', isSameDay(day, today) ? 'text-blue-700' : 'text-zinc-900')}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Time grid */}
                <div className="grid grid-cols-7">
                  {days.map((day, idx) => {
                    const dayEvents = eventsByDay[day.toISOString().split('T')[0]] || []
                    const isToday = isSameDay(day, today)

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'relative min-h-[400px] p-2 border-r border-zinc-100 last:border-r-0',
                          isToday && 'bg-blue-50/30'
                        )}
                      >
                        <div className="space-y-2">
                          {dayEvents.map((ev) => (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => setDetailItem(ev)}
                              className={cn(
                                'w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors',
                                ev.type === 'EXAM' ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-l-2 border-l-rose-600' :
                                ev.type === 'HOLIDAY' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-l-2 border-l-emerald-600' :
                                ev.type === 'MEETING' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-l-2 border-l-blue-600' :
                                'bg-amber-100 text-amber-800 hover:bg-amber-200 border-l-2 border-l-amber-600'
                              )}
                            >
                              <div className="font-semibold truncate">{ev.title}</div>
                              <div className="text-[10px] opacity-80">
                                {new Date(ev.startDate).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                {ev.endDate && ` – ${new Date(ev.endDate).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
            )}

            {events.length === 0 && !isLoading && (
              <EmptyState
                title={t('events.noEventsTitle', 'Aucun événement')}
                description={t('events.noEventsDesc', 'Aucun événement scolaire pour cette période.')}
                action={
                  canManage ? (
                    <Button variant="secondary" size="sm" onClick={() => { setEditingItem(null); setIsFormOpen(true) }}>
                      {t('events.createFirst', 'Créer le premier événement')}
                    </Button>
                  ) : undefined
                }
              />
            )}

            {/* Form Modal */}
            {isFormOpen && (
              <EventFormModal
                key={editingItem?.id || 'new'}
                isOpen={isFormOpen}
                event={editingItem}
                onClose={() => {
                  setIsFormOpen(false)
                  setEditingItem(null)
                }}
                onSuccess={() => loadEvents()}
              />
            )}

            {/* Details Modal */}
            {detailItem && (
              <EventDetailsModal
                isOpen={Boolean(detailItem)}
                event={detailItem}
                onClose={() => setDetailItem(null)}
                onOpenEdit={
                  canManage
                    ? (item) => {
                        setDetailItem(null)
                        setEditingItem(item)
                        setIsFormOpen(true)
                      }
                    : undefined
                }
              />
            )}

            {/* Delete Dialog */}
            {deleteTarget && (
              <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title={t('events.deleteConfirmTitle', 'Supprimer cet événement ?')}
                description={t('events.deleteConfirmDesc', 'Êtes-vous sûr de vouloir supprimer l\'événement "{title}" ?', { title: deleteTarget.title })}
                confirmText={isDeleting ? t('common.deleting', 'Suppression...') : t('common.delete', 'Supprimer définitivement')}
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteTarget(null)}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="w-full max-w-6xl mx-auto text-center py-4 px-4 text-xs text-zinc-400">
        © {CURRENT_YEAR} EduTrack Platform · Tous droits réservés.
      </footer>
    </div>
  )
}

export default CalendarView