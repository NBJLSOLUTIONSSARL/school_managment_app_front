import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Trash2, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { timetableService } from '../api/timetableService'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export function TeacherAvailabilityModal({ isOpen, onClose, teachers = [] }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '')
  const [availabilities, setAvailabilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // New unavailability form
  const [dayOfWeek, setDayOfWeek] = useState('Mercredi')
  const [startTime, setStartTime] = useState('14:00')
  const [endTime, setEndTime] = useState('18:00')
  const [reason, setReason] = useState('')

  const loadAvailabilities = useCallback(async (teacherId) => {
    if (!teacherId) return
    setLoading(true)
    setError(null)
    const res = await timetableService.getTeacherAvailabilities(teacherId)
    if (res.success) {
      setAvailabilities(res.data || [])
    } else {
      setError(res.error?.message || 'Erreur lors du chargement des disponibilités')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    if (isOpen && selectedTeacherId) {
      Promise.resolve().then(() => {
        if (active) loadAvailabilities(selectedTeacherId)
      })
    }
    return () => {
      active = false
    }
  }, [isOpen, selectedTeacherId, loadAvailabilities])

  if (!isOpen) return null

  const handleAddUnavailability = async (e) => {
    e.preventDefault()
    if (!selectedTeacherId) return
    setError(null)
    setSuccessMsg(null)

    const payload = {
      teacherId: Number(selectedTeacherId),
      dayOfWeek,
      startTime,
      endTime,
      available: false,
      reason: reason.trim() || undefined,
    }

    const res = await timetableService.createTeacherAvailability(payload)
    if (res.success) {
      setSuccessMsg('Indisponibilité enregistrée')
      setReason('')
      loadAvailabilities(selectedTeacherId)
    } else {
      setError(res.error?.message || 'Erreur lors de l’enregistrement')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette règle de disponibilité ?')) return
    const res = await timetableService.deleteTeacherAvailability(id)
    if (res.success) {
      loadAvailabilities(selectedTeacherId)
    } else {
      setError(res.error?.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Gestion des disponibilités enseignants
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Sélectionner un enseignant
          </label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
          >
            {teachers.map((t) => {
              const name = t.user ? `${t.user.firstName} ${t.user.lastName}` : `Enseignant #${t.id}`
              return (
                <option key={t.id} value={t.id}>
                  {name} {t.specialization ? `(${t.specialization})` : ''}
                </option>
              )
            })}
          </select>
        </div>

        {/* Existing unavailabilities list */}
        <div className="mt-5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Créneaux d’indisponibilité actuels
          </h4>

          {loading ? (
            <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
              Chargement...
            </div>
          ) : availabilities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
              Aucune indisponibilité enregistrée pour cet enseignant (disponible à temps plein).
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800 overflow-hidden">
              {availabilities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {a.dayOfWeek}
                    </span>{' '}
                    <span className="font-mono text-2xs text-slate-600 dark:text-slate-400">
                      {a.startTime} – {a.endTime}
                    </span>
                    {a.reason && (
                      <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Motif : {a.reason}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Supprimer cette indisponibilité"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new unavailability form */}
        <form onSubmit={handleAddUnavailability} className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Déclarer une nouvelle indisponibilité
          </h4>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-2xs text-slate-500 mb-1">Jour</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-2xs text-slate-500 mb-1">Début</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="14:00"
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-mono focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-2xs text-slate-500 mb-1">Fin</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="18:00"
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-mono focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-2xs text-slate-500 mb-1">Motif (facultatif)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Recherche, formation continue, obligations externes..."
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter l’indisponibilité
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

TeacherAvailabilityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  teachers: PropTypes.array,
}

export default TeacherAvailabilityModal
