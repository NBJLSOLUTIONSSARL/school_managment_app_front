import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Download,
  Printer,
  Plus,
  RefreshCw,
  Users,
  Building2,
  School,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  timetableService,
  WeeklyTimetableGrid,
  TimetableSlotModal,
  TeacherAvailabilityModal,
  TimetableExceptionsModal,
} from '@/features/timetables'
import { classService } from '@/features/academics/api/classService'
import { teacherService } from '@/features/teachers/api/teacherService'
import { axiosClient } from '@/lib/axios'
import { extractApiData } from '@/utils/apiHelpers'

export function TimetablePage() {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'])

  // View mode: 'CLASS', 'TEACHER', 'ROOM'
  const [viewMode, setViewMode] = useState('CLASS')

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedTermId, setSelectedTermId] = useState('')

  // Data lists for dropdowns
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [rooms, setRooms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [terms, setTerms] = useState([])

  // Slots
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  // Modals
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)
  const [initialSlotTimes, setInitialSlotTimes] = useState({
    day: 'Lundi',
    start: '08:00',
    end: '09:00',
  })

  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)
  const [exceptionsModalOpen, setExceptionsModalOpen] = useState(false)

  // Load dropdown lists on mount
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [classesRes, teachersRes, roomsRes, subjectsRes, yearsRes] = await Promise.all([
          classService.getClasses({ size: 100 }),
          teacherService.getTeachers(),
          timetableService.getClassrooms(),
          axiosClient.get('/v1/subjects').then(extractApiData).catch(() => []),
          axiosClient.get('/v1/academic-years').then(extractApiData).catch(() => []),
        ])

        const classList = classesRes.data?.content || classesRes.data || []
        setClasses(classList)
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id)
        }

        const teacherList = teachersRes.data || []
        setTeachers(teacherList)
        if (teacherList.length > 0) {
          setSelectedTeacherId(teacherList[0].id)
        }

        const roomList = roomsRes.data || []
        setRooms(roomList)
        if (roomList.length > 0) {
          setSelectedRoomId(roomList[0].id)
        }

        setSubjects(Array.isArray(subjectsRes) ? subjectsRes : subjectsRes?.content || [])

        const yearList = Array.isArray(yearsRes) ? yearsRes : yearsRes?.content || []
        const activeYear = yearList.find((y) => y.active) || yearList[0]
        if (activeYear?.terms?.length > 0) {
          setTerms(activeYear.terms)
          const activeTerm = activeYear.terms.find((t) => t.active) || activeYear.terms[0]
          setSelectedTermId(activeTerm?.id || '')
        }
      } catch (err) {
        console.error('Failed to load timetable filters:', err)
      }
    }
    loadDropdowns()
  }, [])

  // Load timetable slots based on selected mode
  const fetchSlots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (viewMode === 'CLASS') {
        if (!selectedClassId) {
          setSlots([])
          setLoading(false)
          return
        }
        res = await timetableService.getSlotsByClass(selectedClassId, selectedTermId)
      } else if (viewMode === 'TEACHER') {
        if (!selectedTeacherId) {
          setSlots([])
          setLoading(false)
          return
        }
        res = await timetableService.getSlotsByTeacher(selectedTeacherId, selectedTermId)
      } else if (viewMode === 'ROOM') {
        if (!selectedRoomId) {
          setSlots([])
          setLoading(false)
          return
        }
        res = await timetableService.getSlotsByRoom(selectedRoomId, selectedTermId)
      }

      if (res?.success) {
        setSlots(res.data || [])
      } else {
        setError(res?.error?.message || 'Impossible de charger l’emploi du temps')
      }
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des créneaux')
    } finally {
      setLoading(false)
    }
  }, [viewMode, selectedClassId, selectedTeacherId, selectedRoomId, selectedTermId])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        fetchSlots()
      }
    })
    return () => {
      active = false
    }
  }, [fetchSlots])

  // PDF Export
  const handleExportPdf = async () => {
    setExportingPdf(true)
    await timetableService.downloadTimetablePdf({
      classId: viewMode === 'CLASS' ? selectedClassId : undefined,
      teacherId: viewMode === 'TEACHER' ? selectedTeacherId : undefined,
      roomId: viewMode === 'ROOM' ? selectedRoomId : undefined,
      termId: selectedTermId || undefined,
    })
    setExportingPdf(false)
  }

  // Handle cell click (quick add)
  const handleCellClick = (day, start, end) => {
    if (!canEdit) return
    setActiveSlot(null)
    setInitialSlotTimes({ day, start, end })
    setSlotModalOpen(true)
  }

  // Handle slot click (edit / details)
  const handleSlotClick = (slot) => {
    if (!canEdit) return
    setActiveSlot(slot)
    setSlotModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Emplois du temps
              </h1>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                Planification hebdomadaire des cours, salles et enseignants
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
            title="Imprimer la vue courante"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
            title="Exporter l'emploi du temps en PDF officiel"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>{exportingPdf ? 'Export...' : 'PDF'}</span>
          </button>

          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => setAvailabilityModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              >
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden md:inline">Disponibilités</span>
              </button>

              <button
                type="button"
                onClick={() => setExceptionsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden md:inline">Exceptions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSlot(null)
                  setInitialSlotTimes({ day: 'Lundi', start: '08:00', end: '09:00' })
                  setSlotModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Nouveau cours</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter / View Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
        {/* View Mode Selector */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('CLASS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'CLASS'
                ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <School className="h-3.5 w-3.5" />
            Par Classe
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TEACHER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'TEACHER'
                ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Par Enseignant
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ROOM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'ROOM'
                ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Par Salle
          </button>
        </div>

        {/* Dynamic selector based on view mode */}
        <div className="flex flex-wrap items-center gap-3">
          {viewMode === 'CLASS' && (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase text-slate-500">Classe :</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'TEACHER' && (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase text-slate-500">Enseignant :</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none"
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
          )}

          {viewMode === 'ROOM' && (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase text-slate-500">Salle :</span>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type || 'Standard'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {terms.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase text-slate-500">Période :</span>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="">Toutes les périodes</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Weekly Grid */}
      {loading ? (
        <div className="h-96 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">
          Chargement de l’emploi du temps...
        </div>
      ) : (
        <WeeklyTimetableGrid
          slots={slots}
          onSlotClick={handleSlotClick}
          onCellClick={handleCellClick}
          canEdit={canEdit}
        />
      )}

      {/* Slot Modal */}
      <TimetableSlotModal
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        slot={activeSlot}
        initialDay={initialSlotTimes.day}
        initialStart={initialSlotTimes.start}
        initialEnd={initialSlotTimes.end}
        classes={classes}
        teachers={teachers}
        classrooms={rooms}
        subjects={subjects}
        currentClassId={viewMode === 'CLASS' ? selectedClassId : null}
        currentTermId={selectedTermId}
        onSaved={fetchSlots}
        onDeleted={fetchSlots}
      />

      {/* Teacher Availability Modal */}
      <TeacherAvailabilityModal
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
        teachers={teachers}
      />

      {/* Exceptions Modal */}
      <TimetableExceptionsModal
        isOpen={exceptionsModalOpen}
        onClose={() => setExceptionsModalOpen(false)}
        classes={classes}
        teachers={teachers}
        classrooms={rooms}
        currentClassId={selectedClassId}
        onExceptionSaved={fetchSlots}
      />
    </div>
  )
}

export default TimetablePage
