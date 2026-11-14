import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AlertCircle, Clock, Trash2, X } from 'lucide-react'
import { timetableService } from '../api/timetableService'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const COLOR_OPTIONS = [
  { key: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { key: 'peach', label: 'Pêche / Ambre', class: 'bg-amber-500' },
  { key: 'mint', label: 'Menthe / Émeraude', class: 'bg-emerald-500' },
  { key: 'lavender', label: 'Lavande', class: 'bg-indigo-500' },
  { key: 'purple', label: 'Pourpre', class: 'bg-purple-500' },
  { key: 'indigo', label: 'Indigo / Ciel', class: 'bg-sky-500' },
]

export function TimetableSlotModal({
  isOpen,
  onClose,
  onSaved,
  onDeleted,
  slot = null,
  initialDay = 'Lundi',
  initialStart = '08:00',
  initialEnd = '09:00',
  classes = [],
  teachers = [],
  classrooms = [],
  subjects = [],
  currentClassId = null,
  currentTermId = null,
}) {
  const [classId, setClassId] = useState(currentClassId || '')
  const [dayOfWeek, setDayOfWeek] = useState(initialDay)
  const [startTime, setStartTime] = useState(initialStart)
  const [endTime, setEndTime] = useState(initialEnd)
  const [subject, setSubject] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [colorKey, setColorKey] = useState('blue')

  const [loading, setLoading] = useState(false)
  const [conflictError, setConflictError] = useState(null)

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (!active) return
      if (slot) {
        setClassId(slot.classId || currentClassId || '')
        setDayOfWeek(slot.dayOfWeek || 'Lundi')
        setStartTime(slot.startTime || '08:00')
        setEndTime(slot.endTime || '09:00')
        setSubject(slot.subject || '')
        setSubjectId(slot.subjectId || '')
        setTeacherId(slot.teacherId || '')
        setClassroomId(slot.classroomId || '')
        setColorKey(slot.colorKey || 'blue')
      } else {
        setClassId(currentClassId || '')
        setDayOfWeek(initialDay || 'Lundi')
        setStartTime(initialStart || '08:00')
        setEndTime(initialEnd || '09:00')
        setSubject('')
        setSubjectId('')
        setTeacherId('')
        setClassroomId('')
        setColorKey('blue')
      }
      setConflictError(null)
    })
    return () => {
      active = false
    }
  }, [slot, initialDay, initialStart, initialEnd, currentClassId])

  if (!isOpen) return null

  const handleSubjectChange = (e) => {
    const sId = e.target.value
    setSubjectId(sId)
    if (sId) {
      const selected = subjects.find((s) => String(s.id) === String(sId))
      if (selected) {
        setSubject(selected.name)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setConflictError(null)

    const payload = {
      classId: classId ? Number(classId) : undefined,
      dayOfWeek,
      startTime,
      endTime,
      subject: subject.trim(),
      subjectId: subjectId ? Number(subjectId) : undefined,
      teacherId: teacherId ? Number(teacherId) : undefined,
      classroomId: classroomId ? Number(classroomId) : undefined,
      colorKey,
      termId: currentTermId ? Number(currentTermId) : undefined,
    }

    try {
      let res
      if (slot?.id) {
        res = await timetableService.updateSlot(slot.timetableId || 1, slot.id, payload)
      } else {
        res = await timetableService.createSlot(payload)
      }

      if (res.success) {
        onSaved?.(res.data)
        onClose()
      } else {
        const err = res.error
        setConflictError(err?.message || err?.detail || 'Conflit de planification détecté')
      }
    } catch (err) {
      setConflictError(err?.message || 'Erreur lors de l’enregistrement du créneau')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!slot?.id) return
    if (!window.confirm('Voulez-vous vraiment supprimer ce cours ?')) return

    setLoading(true)
    try {
      const res = await timetableService.deleteSlot(slot.timetableId || 1, slot.id)
      if (res.success) {
        onDeleted?.(slot.id)
        onClose()
      } else {
        setConflictError(res.error?.message || 'Erreur lors de la suppression')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {slot ? 'Modifier le créneau' : 'Ajouter un cours'}
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

        {conflictError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{conflictError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Classe
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Jour
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Début (HH:mm)
              </label>
              <input
                type="text"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="08:00"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Fin (HH:mm)
              </label>
              <input
                type="text"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="09:00"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Matière
              </label>
              {subjects.length > 0 ? (
                <select
                  value={subjectId}
                  onChange={handleSubjectChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="">Sélectionner une matière</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Mathématiques"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              )}
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Enseignant
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="">Sélectionner un enseignant</option>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Salle
              </label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="">Sélectionner une salle</option>
                {classrooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type || 'Standard'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Couleur
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setColorKey(c.key)}
                    className={`h-6 w-6 rounded-full ${c.class} transition-all cursor-pointer ${
                      colorKey === c.key ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {slot?.id ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? 'Vérification...' : slot ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

TimetableSlotModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
  onDeleted: PropTypes.func,
  slot: PropTypes.object,
  initialDay: PropTypes.string,
  initialStart: PropTypes.string,
  initialEnd: PropTypes.string,
  classes: PropTypes.array,
  teachers: PropTypes.array,
  classrooms: PropTypes.array,
  subjects: PropTypes.array,
  currentClassId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentTermId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default TimetableSlotModal
