import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Check, Clock, X, CheckCircle2 } from 'lucide-react'

function getInitialEntries(students = [], records = []) {
  const initial = {}
  students.forEach((student) => {
    const rec = records.find((r) => r.studentId === student.id)
    initial[student.id] = {
      studentId: student.id,
      status: rec?.status || 'PRESENT',
      minutesLate: rec?.minutesLate || 0,
      note: rec?.note || '',
      arrivalTime: rec?.arrivalTime || '',
    }
  })
  return initial
}

export function ClassRollCallGrid({
  students = [],
  records = [],
  onSave,
  saving = false,
  readOnly = false,
}) {
  const [entries, setEntries] = useState(() => getInitialEntries(students, records))

  // Initialize or synchronize entries from records/students
  useEffect(() => {
    let active = true
    if (records.length > 0) {
      Promise.resolve().then(() => {
        if (active) {
          setEntries(getInitialEntries(students, records))
        }
      })
    }
    return () => {
      active = false
    }
  }, [students, records])

  const setStatus = (studentId, status) => {
    if (readOnly) return
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        minutesLate: status === 'LATE' ? (prev[studentId]?.minutesLate || 10) : 0,
      },
    }))
  }

  const setMinutesLate = (studentId, minutesLate) => {
    if (readOnly) return
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        minutesLate: Number(minutesLate) || 0,
      },
    }))
  }

  const setNote = (studentId, note) => {
    if (readOnly) return
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }))
  }

  const handleMarkAllPresent = () => {
    if (readOnly) return
    setEntries((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          status: 'PRESENT',
          minutesLate: 0,
        }
      })
      return updated
    })
  }

  const handleSave = () => {
    if (!onSave || readOnly) return
    const payload = Object.values(entries)
    onSave(payload)
  }

  const counts = Object.values(entries).reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1
      return acc
    },
    { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 }
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      {/* Top summary & actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-2xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Check className="h-3 w-3" /> {counts.PRESENT} Présents
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-2xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
            <X className="h-3 w-3" /> {counts.ABSENT} Absents
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-2xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <Clock className="h-3 w-3" /> {counts.LATE} En retard
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-2xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3" /> {counts.EXCUSED} Excusés
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-2xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Tous présents
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? 'Enregistrement...' : "Enregistrer l'appel"}
            </button>
          </div>
        )}
      </div>

      {/* Roster table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-2xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <th className="px-3.5 py-2">Élève</th>
              <th className="px-3.5 py-2">Matricule</th>
              <th className="px-3.5 py-2 text-center">Statut d'assiduité</th>
              <th className="px-3.5 py-2">Retard (min)</th>
              <th className="px-3.5 py-2">Observation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Aucun élève trouvé dans cette classe.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const entry = entries[student.id] || { status: 'PRESENT', minutesLate: 0, note: '' }
                const name = student.user
                  ? `${student.user.firstName} ${student.user.lastName}`
                  : `Élève #${student.id}`

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {student.user?.firstName?.[0] || 'E'}
                        </div>
                        <span>{name}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-2xs text-slate-500">
                      {student.studentNumber}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => setStatus(student.id, 'PRESENT')}
                          className={`rounded px-2.5 py-1 text-2xs font-semibold transition cursor-pointer ${
                            entry.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-emerald-700 dark:text-slate-400'
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => setStatus(student.id, 'LATE')}
                          className={`rounded px-2.5 py-1 text-2xs font-semibold transition cursor-pointer ${
                            entry.status === 'LATE'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-amber-700 dark:text-slate-400'
                          }`}
                        >
                          Retard
                        </button>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => setStatus(student.id, 'ABSENT')}
                          className={`rounded px-2.5 py-1 text-2xs font-semibold transition cursor-pointer ${
                            entry.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-rose-700 dark:text-slate-400'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => setStatus(student.id, 'EXCUSED')}
                          className={`rounded px-2.5 py-1 text-2xs font-semibold transition cursor-pointer ${
                            entry.status === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-blue-700 dark:text-slate-400'
                          }`}
                        >
                          Excusé
                        </button>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      {entry.status === 'LATE' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="180"
                            disabled={readOnly}
                            value={entry.minutesLate || 10}
                            onChange={(e) => setMinutesLate(student.id, e.target.value)}
                            className="w-14 rounded border border-amber-300 bg-amber-50/50 px-1.5 py-0.5 text-center text-2xs font-mono font-bold text-amber-900 focus:outline-none dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
                          />
                          <span className="text-2xs text-slate-400">min</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <input
                        type="text"
                        disabled={readOnly}
                        value={entry.note || ''}
                        onChange={(e) => setNote(student.id, e.target.value)}
                        placeholder="Ex: Certificat médical, motif..."
                        className="w-full rounded border border-transparent bg-transparent px-2 py-0.5 text-2xs placeholder:text-slate-400 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none dark:hover:border-slate-700 dark:focus:bg-slate-800"
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

ClassRollCallGrid.propTypes = {
  students: PropTypes.array,
  records: PropTypes.array,
  onSave: PropTypes.func,
  saving: PropTypes.bool,
  readOnly: PropTypes.bool,
}

export default ClassRollCallGrid
