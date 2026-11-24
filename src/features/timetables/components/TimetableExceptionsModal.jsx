import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { AlertCircle, Ban, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { timetableService } from '../api/timetableService'

function getInitialExceptionDate() {
  return new Date().toISOString().slice(0, 10)
}

export function TimetableExceptionsModal({
  isOpen,
  onClose,
  classes = [],
  teachers = [],
  classrooms = [],
  currentClassId = null,
  onExceptionSaved,
}) {
  const [selectedClassId, setSelectedClassId] = useState(currentClassId || classes[0]?.id || '')
  const [exceptions, setExceptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form states
  const [exceptionDate, setExceptionDate] = useState(getInitialExceptionDate)
  const [type, setType] = useState('SUBSTITUTION')
  const [replacementTeacherId, setReplacementTeacherId] = useState('')
  const [replacementClassroomId, setReplacementClassroomId] = useState('')
  const [reason, setReason] = useState('')

  const loadExceptions = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    const res = await timetableService.getExceptions({ classId })
    if (res.success) {
      setExceptions(res.data || [])
    } else {
      setError(res.error?.message || 'Erreur lors du chargement des exceptions')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    if (isOpen && selectedClassId) {
      Promise.resolve().then(() => {
        if (active) {
          loadExceptions(selectedClassId)
        }
      })
    }
    return () => {
      active = false
    }
  }, [isOpen, selectedClassId, loadExceptions])

  if (!isOpen) return null

  const handleCreateException = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      classId: selectedClassId ? Number(selectedClassId) : undefined,
      exceptionDate,
      type,
      replacementTeacherId: replacementTeacherId ? Number(replacementTeacherId) : undefined,
      replacementClassroomId: replacementClassroomId ? Number(replacementClassroomId) : undefined,
      reason: reason.trim() || undefined,
    }

    const res = await timetableService.createException(payload)
    if (res.success) {
      setReason('')
      setReplacementTeacherId('')
      setReplacementClassroomId('')
      loadExceptions(selectedClassId)
      onExceptionSaved?.()
    } else {
      setError(res.error?.message || 'Erreur lors de l’enregistrement de l’exception')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette exception ?')) return
    const res = await timetableService.deleteException(id)
    if (res.success) {
      loadExceptions(selectedClassId)
      onExceptionSaved?.()
    } else {
      setError(res.error?.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Exceptions & Remplacements ponctuels
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

        <div className="mt-4">
          <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Classe concernée
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exceptions list */}
        <div className="mt-5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Exceptions programmées
          </h4>

          {loading ? (
            <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
              Chargement...
            </div>
          ) : exceptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
              Aucune exception ou remplacement pour cette classe.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800 overflow-hidden">
              {exceptions.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xs font-bold text-slate-900 dark:text-white">
                        {exc.exceptionDate}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-semibold ${
                          exc.type === 'CANCELLATION'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {exc.type === 'CANCELLATION' ? (
                          <>
                            <Ban className="h-2.5 w-2.5" /> Annulation
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-2.5 w-2.5" /> Remplacement
                          </>
                        )}
                      </span>
                    </div>

                    {exc.replacementTeacherName && (
                      <p className="text-2xs text-slate-600 dark:text-slate-400 mt-1">
                        Professeur remplaçant : {exc.replacementTeacherName}
                      </p>
                    )}
                    {exc.reason && (
                      <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Motif : {exc.reason}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(exc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Supprimer cette exception"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add exception form */}
        <form onSubmit={handleCreateException} className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Déclarer une nouvelle exception
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-2xs text-slate-500 mb-1">Date</label>
              <input
                type="date"
                required
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-2xs text-slate-500 mb-1">Type d’exception</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="SUBSTITUTION">Remplacement d'enseignant</option>
                <option value="CANCELLATION">Annulation de cours</option>
                <option value="ROOM_CHANGE">Changement de salle</option>
              </select>
            </div>
          </div>

          {type === 'SUBSTITUTION' && (
            <div className="mt-2">
              <label className="block text-2xs text-slate-500 mb-1">
                Enseignant remplaçant
              </label>
              <select
                value={replacementTeacherId}
                onChange={(e) => setReplacementTeacherId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="">Sélectionner le remplaçant</option>
                {teachers.map((t) => {
                  const name = t.user ? `${t.user.firstName} ${t.user.lastName}` : `Enseignant #${t.id}`
                  return (
                    <option key={t.id} value={t.id}>
                      {name}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {type === 'ROOM_CHANGE' && (
            <div className="mt-2">
              <label className="block text-2xs text-slate-500 mb-1">
                Nouvelle salle
              </label>
              <select
                value={replacementClassroomId}
                onChange={(e) => setReplacementClassroomId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="">Sélectionner la salle</option>
                {classrooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.roomNumber || `Salle #${r.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-2">
            <label className="block text-2xs text-slate-500 mb-1">Motif</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Maladie, sortie scolaire, formation..."
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Enregistrer l’exception
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

TimetableExceptionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.array,
  teachers: PropTypes.array,
  classrooms: PropTypes.array,
  currentClassId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onExceptionSaved: PropTypes.func,
}

export default TimetableExceptionsModal
