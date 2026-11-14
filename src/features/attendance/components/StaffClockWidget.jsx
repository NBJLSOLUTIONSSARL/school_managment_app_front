import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Clock, LogIn, LogOut, Check } from 'lucide-react'
import { attendanceService } from '../api/attendanceService'

export function StaffClockWidget({ onClocked }) {
  const [todayRecord, setTodayRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clocking, setClocking] = useState(false)
  const [note, setNote] = useState('')

  const loadMyAttendance = useCallback(async () => {
    setLoading(true)
    const res = await attendanceService.getMyStaffAttendance()
    if (res.success && res.data?.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10)
      const found = res.data.find((r) => r.attendanceDate === todayStr)
      setTodayRecord(found || null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        loadMyAttendance()
      }
    })
    return () => {
      active = false
    }
  }, [loadMyAttendance])

  const handleCheckIn = async () => {
    setClocking(true)
    const res = await attendanceService.staffCheckIn({ note: note.trim() || undefined })
    setClocking(false)
    if (res.success) {
      setTodayRecord(res.data)
      setNote('')
      onClocked?.()
    }
  }

  const handleCheckOut = async () => {
    setClocking(true)
    const res = await attendanceService.staffCheckOut()
    setClocking(false)
    if (res.success) {
      setTodayRecord(res.data)
      onClocked?.()
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Pointage du personnel
          </h4>
        </div>
        {todayRecord?.status && (
          <span
            className={`rounded-md px-2 py-0.5 text-2xs font-semibold ${
              todayRecord.status === 'PRESENT'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {todayRecord.status === 'PRESENT' ? 'À l’heure' : 'Arrivée tardive'}
          </span>
        )}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="py-2 text-center text-xs text-slate-400">Chargement...</div>
        ) : !todayRecord?.checkIn ? (
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              Vous n'avez pas encore pointé votre arrivée aujourd'hui.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Observation (optionnelle)..."
                className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={clocking}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                Pointer l'entrée
              </button>
            </div>
          </div>
        ) : !todayRecord?.checkOut ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
              <span>Arrivée enregistrée :</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={clocking}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Pointer la sortie
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Arrivée :</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Départ :</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-2xs text-emerald-600 font-medium">
              <Check className="h-3 w-3" /> Journée complète validée
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

StaffClockWidget.propTypes = {
  onClocked: PropTypes.func,
}

export default StaffClockWidget
