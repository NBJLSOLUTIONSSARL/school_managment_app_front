import { useState, useEffect, useCallback } from 'react'
import {
  CalendarCheck,
  CheckCircle2,
  Filter,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  attendanceService,
  ClassRollCallGrid,
  JustificationModal,
  PendingJustificationsModal,
  AttendanceStatsCard,
  AttendanceAlertsBanner,
  StaffClockWidget,
} from '@/features/attendance'
import { classService } from '@/features/academics/api/classService'
import { timetableService } from '@/features/timetables/api/timetableService'

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function AttendancePage() {
  const { hasRole, user } = useAuth()
  const isStaffOrAdmin = hasRole(['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'])
  const isTeacher = hasRole(['ROLE_TEACHER', 'teacher'])
  const isParent = hasRole(['ROLE_PARENT', 'parent'])
  const isStudent = hasRole(['ROLE_STUDENT', 'student'])

  // Tabs: 'ROLL_CALL', 'STATS', 'JUSTIFICATIONS', 'STAFF'
  const [activeTab, setActiveTab] = useState(
    isParent || isStudent ? 'JUSTIFICATIONS' : 'ROLL_CALL'
  )

  // Filters
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayDateString)
  const [slots, setSlots] = useState([])
  const [selectedSlotId, setSelectedSlotId] = useState('')

  // Roll call states
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Modals & data
  const [pendingJustifications, setPendingJustifications] = useState([])
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false)
  const [selectedRecordForJustify, setSelectedRecordForJustify] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [classStats, setClassStats] = useState(null)
  const [staffTodayList, setStaffTodayList] = useState([])

  // Student/Parent specific history
  const [myHistory, setMyHistory] = useState([])
  const [myStats, setMyStats] = useState(null)

  // 1. Initial lookup load (classes)
  const loadInitialData = useCallback(async () => {
    try {
      const clsRes = await classService.getClasses()
      if (clsRes.success && clsRes.data?.length > 0) {
        setClasses(clsRes.data)
        setSelectedClassId(String(clsRes.data[0].id))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        loadInitialData()
      }
    })
    return () => {
      active = false
    }
  }, [loadInitialData])

  // 2. Load timetable slots when class changes
  const loadClassSlots = useCallback(async (classId) => {
    if (!classId) return
    const res = await timetableService.getSlotsByClass(classId)
    if (res.success) {
      setSlots(res.data || [])
    }
  }, [])

  useEffect(() => {
    let active = true
    if (selectedClassId) {
      Promise.resolve().then(() => {
        if (active) {
          loadClassSlots(selectedClassId)
        }
      })
    }
    return () => {
      active = false
    }
  }, [selectedClassId, loadClassSlots])

  // 3. Load roll call data
  const fetchRollCall = useCallback(async () => {
    if (!selectedClassId) return
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    // Load class enrollments to get students
    const classDetail = await classService.getClassById(selectedClassId)
    if (classDetail.success && classDetail.data?.students) {
      setStudents(classDetail.data.students)
    }

    // Load recorded attendance
    const attRes = await attendanceService.getRollCall({
      classId: selectedClassId,
      date: selectedDate,
      timetableSlotId: selectedSlotId ? Number(selectedSlotId) : undefined,
    })

    if (attRes.success) {
      setRecords(attRes.data || [])
    } else {
      setError(attRes.error?.message || "Erreur lors du chargement de l'appel")
    }

    // Load class stats
    const statsRes = await attendanceService.getClassStats(selectedClassId, { date: selectedDate })
    if (statsRes.success) {
      setClassStats(statsRes.data)
    }

    setLoading(false)
  }, [selectedClassId, selectedDate, selectedSlotId])

  useEffect(() => {
    let active = true
    if (selectedClassId && activeTab === 'ROLL_CALL') {
      Promise.resolve().then(() => {
        if (active) {
          fetchRollCall()
        }
      })
    }
    return () => {
      active = false
    }
  }, [selectedClassId, selectedDate, selectedSlotId, activeTab, fetchRollCall])

  // 4. Load alerts & pending justifications
  const fetchAuxiliaryData = useCallback(async () => {
    if (isStaffOrAdmin) {
      const alertRes = await attendanceService.getAlerts({ resolved: false })
      if (alertRes.success) {
        setAlerts(alertRes.data || [])
      }

      const justRes = await attendanceService.getPendingJustifications()
      if (justRes.success) {
        setPendingJustifications(justRes.data || [])
      }

      const staffRes = await attendanceService.getStaffToday(selectedDate)
      if (staffRes.success) {
        setStaffTodayList(staffRes.data || [])
      }
    }

    // If student or parent, load their own history
    if (isStudent || isParent) {
      const targetStudentId = isStudent ? user?.id : null
      if (targetStudentId) {
        const hRes = await attendanceService.getStudentHistory(targetStudentId)
        if (hRes.success) {
          setMyHistory(hRes.data || [])
        }
        const sRes = await attendanceService.getStudentStats(targetStudentId)
        if (sRes.success) {
          setMyStats(sRes.data)
        }
      }
    }
  }, [isStaffOrAdmin, isStudent, isParent, user?.id, selectedDate])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        fetchAuxiliaryData()
      }
    })
    return () => {
      active = false
    }
  }, [fetchAuxiliaryData])

  // Save roll call
  const handleSaveRollCall = async (entries) => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    const payload = {
      classId: Number(selectedClassId),
      attendanceDate: selectedDate,
      timetableSlotId: selectedSlotId ? Number(selectedSlotId) : undefined,
      entries: entries.map((e) => ({
        studentId: e.studentId,
        status: e.status,
        minutesLate: e.minutesLate,
        note: e.note,
      })),
    }

    const res = await attendanceService.submitRollCall(payload)
    setSaving(false)

    if (res.success) {
      setSuccessMessage("Appel de classe enregistré avec succès.")
      fetchRollCall()
      fetchAuxiliaryData()
    } else {
      setError(res.error?.message || "Erreur lors de l'enregistrement de l'appel")
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Page Header (Frappe Desk) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
              Vie scolaire
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-2xs font-bold uppercase tracking-wider text-blue-600">
              Assiduité
            </span>
          </div>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <CalendarCheck className="h-5 w-5 text-blue-600" />
            Gestion des présences & absences
          </h1>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isStaffOrAdmin && pendingJustifications.length > 0 && (
            <button
              type="button"
              onClick={() => setIsPendingModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition shadow-2xs cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Justificatifs en attente ({pendingJustifications.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Unresolved alerts banner */}
      <AttendanceAlertsBanner alerts={alerts} onResolved={fetchAuxiliaryData} />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-medium dark:border-slate-800">
        {(isStaffOrAdmin || isTeacher) && (
          <button
            type="button"
            onClick={() => setActiveTab('ROLL_CALL')}
            className={`border-b-2 px-4 py-2 font-semibold transition cursor-pointer ${
              activeTab === 'ROLL_CALL'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Faire l'appel
          </button>
        )}

        {(isStaffOrAdmin || isTeacher) && (
          <button
            type="button"
            onClick={() => setActiveTab('STATS')}
            className={`border-b-2 px-4 py-2 font-semibold transition cursor-pointer ${
              activeTab === 'STATS'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Statistiques & Bilan
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('JUSTIFICATIONS')}
          className={`border-b-2 px-4 py-2 font-semibold transition cursor-pointer ${
            activeTab === 'JUSTIFICATIONS'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Justificatifs & Historique
        </button>

        {(isStaffOrAdmin || isTeacher) && (
          <button
            type="button"
            onClick={() => setActiveTab('STAFF')}
            className={`border-b-2 px-4 py-2 font-semibold transition cursor-pointer ${
              activeTab === 'STAFF'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Pointage du personnel
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: ROLL CALL */}
      {activeTab === 'ROLL_CALL' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-semibold uppercase tracking-wider text-2xs">Filtres :</span>
            </div>

            {/* Class select */}
            <div className="w-48">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
            </div>

            {/* Slot select */}
            <div className="w-56">
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="">Appel journalier global</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.dayOfWeek} {s.timeSlotLabel} • {s.subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roll call grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Chargement de la liste d'appel...
            </div>
          ) : (
            <ClassRollCallGrid
              students={students}
              records={records}
              onSave={handleSaveRollCall}
              saving={saving}
              readOnly={!isStaffOrAdmin && !isTeacher}
            />
          )}
        </div>
      )}

      {/* TAB 2: STATS */}
      {activeTab === 'STATS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <AttendanceStatsCard
                stats={classStats}
                title={`Bilan d'assiduité • ${classStats?.className || 'Classe'}`}
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Élèves à risque ({classStats?.atRiskStudentsCount ?? 0})
              </h4>
              <p className="text-2xs text-slate-500 mb-3">
                Élèves ayant cumulé 3 absences non justifiées ou plus.
              </p>
              <div className="text-xs font-semibold text-rose-600">
                {classStats?.atRiskStudentsCount > 0
                  ? 'Alerte administrative générée'
                  : 'Aucun élève en situation de décrochage'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JUSTIFICATIONS & HISTORY */}
      {activeTab === 'JUSTIFICATIONS' && (
        <div className="space-y-4">
          {(isStudent || isParent) && myStats && (
            <AttendanceStatsCard stats={myStats} title="Mon assiduité scolaire" />
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Historique des absences et justificatifs
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-2xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="px-3.5 py-2">Date</th>
                    <th className="px-3.5 py-2">Élève</th>
                    <th className="px-3.5 py-2">Cours / Créneau</th>
                    <th className="px-3.5 py-2">Statut</th>
                    <th className="px-3.5 py-2">Justificatif</th>
                    <th className="px-3.5 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(isStudent || isParent ? myHistory : records).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Aucun enregistrement d'absence.
                      </td>
                    </tr>
                  ) : (
                    (isStudent || isParent ? myHistory : records).map((r) => (
                      <tr key={r.id || `${r.studentId}-${r.attendanceDate}`}>
                        <td className="px-3.5 py-2.5 font-mono text-2xs font-bold text-slate-800 dark:text-slate-200">
                          {r.attendanceDate}
                        </td>
                        <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-white">
                          {r.studentName}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400">
                          {r.subjectName ? `${r.subjectName} (${r.timeSlotLabel})` : 'Appel journalier'}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-semibold ${
                              r.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : r.status === 'EXCUSED'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : r.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          {r.justificationStatus ? (
                            <span
                              className={`rounded px-1.5 py-0.5 text-2xs font-semibold ${
                                r.justificationStatus === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : r.justificationStatus === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {r.justificationStatus}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          {r.status === 'ABSENT' && !r.justificationStatus && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRecordForJustify(r)
                                setIsJustifyModalOpen(true)
                              }}
                              className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-2xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300 cursor-pointer"
                            >
                              Justifier
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STAFF CLOCK */}
      {activeTab === 'STAFF' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <StaffClockWidget onClocked={fetchAuxiliaryData} />
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Présences du personnel aujourd'hui ({staffTodayList.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-2xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="px-3.5 py-2">Personnel</th>
                    <th className="px-3.5 py-2">Poste</th>
                    <th className="px-3.5 py-2">Arrivée</th>
                    <th className="px-3.5 py-2">Départ</th>
                    <th className="px-3.5 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staffTodayList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Aucun pointage enregistré pour cette date.
                      </td>
                    </tr>
                  ) : (
                    staffTodayList.map((s) => (
                      <tr key={s.id}>
                        <td className="px-3.5 py-2 font-medium text-slate-900 dark:text-white">
                          {s.userName}
                        </td>
                        <td className="px-3.5 py-2 text-slate-500">
                          {s.position || 'Personnel'}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-2xs">
                          {s.checkIn ? new Date(s.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-2xs">
                          {s.checkOut ? new Date(s.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-3.5 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-2xs font-semibold ${
                              s.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PendingJustificationsModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        justifications={pendingJustifications}
        onReviewed={() => {
          fetchRollCall()
          fetchAuxiliaryData()
        }}
      />

      <JustificationModal
        isOpen={isJustifyModalOpen}
        onClose={() => {
          setIsJustifyModalOpen(false)
          setSelectedRecordForJustify(null)
        }}
        record={selectedRecordForJustify}
        onSubmitted={() => {
          fetchRollCall()
          fetchAuxiliaryData()
        }}
      />
    </div>
  )
}

export default AttendancePage
