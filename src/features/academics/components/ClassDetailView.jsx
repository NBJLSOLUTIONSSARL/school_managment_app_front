import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Users,
  BookOpen,
  UserPlus,
  BookPlus,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { Modal } from '@/components/ui/Modal'
import { classService } from '../api/classService'
import { subjectService } from '../api/subjectService'
import { studentService } from '@/features/students/api/studentService'
import { teacherService } from '@/features/teachers/api/teacherService'

export function ClassDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [classData, setClassData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('students') // 'students' | 'subjects'

  // Enroll Student Modal
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [availableStudents, setAvailableStudents] = useState([])
  const [enrollStudentId, setEnrollStudentId] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  // Assign Subject-Teacher Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [subjectsList, setSubjectsList] = useState([])
  const [teachersList, setTeachersList] = useState([])
  const [assignSubjectId, setAssignSubjectId] = useState('')
  const [assignTeacherId, setAssignTeacherId] = useState('')
  const [assigning, setAssigning] = useState(false)

  const loadClass = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    const res = await classService.getClassById(id)
    if (res.success) {
      setClassData(res.data)
    } else {
      setError(res.error?.message || 'Erreur lors du chargement de la classe')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) loadClass()
    })
    return () => {
      active = false
    }
  }, [loadClass])

  // Open Enroll Modal & load students
  const handleOpenEnroll = async () => {
    setEnrollStudentId('')
    setEnrollModalOpen(true)
    const res = await studentService.getStudents({ size: 100 })
    if (res.success) {
      setAvailableStudents(res.data?.items || [])
    }
  }

  const handleEnrollSubmit = async (e) => {
    e.preventDefault()
    if (!enrollStudentId || !classData) return
    setEnrolling(true)
    const payload = {
      studentId: Number(enrollStudentId),
      academicYearId: classData.academicYearId,
      status: 'ACTIVE',
    }
    const res = await classService.enrollStudent(classData.id, payload)
    setEnrolling(false)
    if (res.success) {
      setEnrollModalOpen(false)
      loadClass()
    } else {
      alert(res.error?.message || "Impossible d'inscrire l'élève (vérifier capacité ou inscription existante)")
    }
  }

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm("Retirer cet élève de la classe (marqué comme TRANSFÉRÉ) ?")) return
    const res = await classService.unenrollStudent(classData.id, enrollmentId, { status: 'TRANSFERRED' })
    if (res.success) {
      loadClass()
    } else {
      alert(res.error?.message || "Erreur lors du désistement de l'élève")
    }
  }

  // Open Assign Subject-Teacher Modal
  const handleOpenAssign = async () => {
    setAssignSubjectId('')
    setAssignTeacherId('')
    setAssignModalOpen(true)
    const [subRes, teachRes] = await Promise.all([
      subjectService.getSubjects({ size: 100 }),
      teacherService.getTeachers({ size: 100 }),
    ])
    if (subRes.success) setSubjectsList(subRes.data?.items || [])
    if (teachRes.success) setTeachersList(teachRes.data?.items || [])
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assignSubjectId || !classData) return
    setAssigning(true)
    const payload = {
      subjectId: Number(assignSubjectId),
      teacherId: assignTeacherId ? Number(assignTeacherId) : null,
    }
    const res = await classService.assignSubjectTeacher(classData.id, payload)
    setAssigning(false)
    if (res.success) {
      setAssignModalOpen(false)
      loadClass()
    } else {
      alert(res.error?.message || "Impossible d'assigner la matière (peut-être déjà attribuée)")
    }
  }

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm("Supprimer l'attribution de cette matière pour la classe ?")) return
    const res = await classService.removeSubjectTeacher(classData.id, assignmentId)
    if (res.success) {
      loadClass()
    } else {
      alert(res.error?.message || "Erreur lors de la suppression de l'attribution")
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Chargement de la classe...
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="p-8 text-center text-xs text-rose-600">
        {error || 'Classe introuvable'}
      </div>
    )
  }

  const enrolled = classData.enrolledStudentsCount || 0
  const cap = classData.capacity || 30
  const pct = Math.round((enrolled / cap) * 100)
  const isFull = enrolled >= cap

  return (
    <div className="space-y-4">
      {/* Frappe Desk Page Head */}
      <DocTypePageHead
        doctype="Classe"
        docName={classData.name}
        breadcrumbs={[
          { label: 'Accueil', href: '/dashboard' },
          { label: 'Classes', href: '/classes' },
          { label: classData.name },
        ]}
        status={classData.status === 'ARCHIVED' ? 'Archived' : 'Active'}
        secondaryActions={[
          {
            label: 'Retour à la liste',
            onClick: () => navigate('/classes'),
          },
        ]}
        primaryAction={{
          label: 'Inscrire un élève',
          icon: UserPlus,
          disabled: isFull,
          onClick: handleOpenEnroll,
        }}
      />

      {/* Main 4-column Desk Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Left Sidebar (aside, 1 col) */}
        <aside className="space-y-3 rounded border border-slate-200 bg-white p-3 text-xs md:col-span-1">
          <h3 className="border-b border-slate-100 pb-2 font-semibold text-slate-900">
            Fiche Classe
          </h3>

          <div className="space-y-2.5">
            <div>
              <span className="text-3xs font-medium uppercase tracking-wider text-slate-400">
                Année Scolaire
              </span>
              <p className="flex items-center gap-1.5 font-medium text-slate-800">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {classData.academicYearName || '—'}
              </p>
            </div>

            <div>
              <span className="text-3xs font-medium uppercase tracking-wider text-slate-400">
                Niveau & Section
              </span>
              <p className="flex items-center gap-1.5 font-medium text-slate-800">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                {classData.gradeLevelName || '—'}
                {classData.sectionName ? ` • ${classData.sectionName}` : ''}
              </p>
            </div>

            <div>
              <span className="text-3xs font-medium uppercase tracking-wider text-slate-400">
                Salle de classe
              </span>
              <p className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {classData.room || 'Non assignée'}
              </p>
            </div>

            <div>
              <span className="text-3xs font-medium uppercase tracking-wider text-slate-400">
                Professeur Principal
              </span>
              <p className="flex items-center gap-1.5 text-slate-700">
                <Award className="h-3.5 w-3.5 text-slate-400" />
                {classData.headTeacherName || 'Non désigné'}
              </p>
            </div>

            {/* Capacity Meter */}
            <div className="border-t border-slate-100 pt-2.5">
              <div className="mb-1 flex items-center justify-between text-2xs">
                <span className="font-medium text-slate-600">Jauge de Capacité</span>
                <span className={`font-mono font-bold ${isFull ? 'text-rose-600' : 'text-slate-800'}`}>
                  {enrolled} / {cap} ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all ${
                    isFull ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              {isFull && (
                <p className="mt-1 text-3xs font-semibold text-rose-600">
                  Capacité maximale atteinte. Aucune inscription supplémentaire possible.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area (main, 3 cols) */}
        <main className="space-y-3 rounded border border-slate-200 bg-white p-4 md:col-span-3 text-xs">
          {/* Tab buttons */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'students'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Élèves Inscrits ({classData.students?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'subjects'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Matières & Enseignants ({classData.subjectTeachers?.length || 0})
              </button>
            </div>

            {activeTab === 'subjects' && (
              <Button size="2xs" onClick={handleOpenAssign}>
                <BookPlus className="mr-1 h-3 w-3" />
                Attribuer une matière
              </Button>
            )}
          </div>

          {/* TAB 1: Enrolled Students */}
          {activeTab === 'students' && (
            <div className="overflow-hidden rounded border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Matricule</th>
                    <th className="px-3 py-2">Élève</th>
                    <th className="px-3 py-2">Date d'inscription</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-2xs">
                  {!classData.students || classData.students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Aucun élève inscrit dans cette classe pour le moment.
                      </td>
                    </tr>
                  ) : (
                    classData.students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono font-medium text-slate-700">
                          {st.studentNumber || '-'}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {st.studentName}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {st.enrollmentDate || '—'}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge
                            status={st.status}
                            customLabel={
                              st.status === 'ACTIVE'
                                ? 'Inscrit'
                                : st.status === 'TRANSFERRED'
                                  ? 'Transféré'
                                  : st.status
                            }
                            showDot
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          {st.status === 'ACTIVE' && (
                            <Button
                              size="2xs"
                              variant="ghost"
                              onClick={() => handleUnenroll(st.id)}
                              title="Désinscrire / Transférer"
                            >
                              <Trash2 className="h-3 w-3 text-rose-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Subjects & Teachers */}
          {activeTab === 'subjects' && (
            <div className="overflow-hidden rounded border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Matière</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Coeff.</th>
                    <th className="px-3 py-2">Heures / sem.</th>
                    <th className="px-3 py-2">Enseignant</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-2xs">
                  {!classData.subjectTeachers || classData.subjectTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Aucune matière attribuée à cette classe.
                      </td>
                    </tr>
                  ) : (
                    classData.subjectTeachers.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-900">{st.subjectName}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{st.subjectCode || '-'}</td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{st.coefficient}</td>
                        <td className="px-3 py-2 text-slate-600">{st.weeklyHours}h</td>
                        <td className="px-3 py-2 text-slate-800">
                          {st.teacherName || <span className="italic text-slate-400">Non assigné</span>}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="2xs"
                            variant="ghost"
                            onClick={() => handleRemoveAssignment(st.id)}
                            title="Supprimer l'attribution"
                          >
                            <Trash2 className="h-3 w-3 text-rose-500" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title={`Inscrire un élève dans ${classData.name}`}
        size="md"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-3 text-xs">
          <div>
            <label className="mb-1 block text-2xs font-medium text-slate-700">
              Choisir un élève *
            </label>
            <select
              required
              value={enrollStudentId}
              onChange={(e) => setEnrollStudentId(e.target.value)}
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none"
            >
              <option value="">Sélectionner un élève</option>
              {availableStudents.map((st) => {
                const u = st.user || {}
                return (
                  <option key={st.id} value={st.id}>
                    {u.firstName} {u.lastName} ({st.studentNumber || `ID#${st.id}`})
                  </option>
                )
              })}
            </select>
          </div>

          <p className="text-3xs text-slate-500">
            Note : L'inscription vérifie automatiquement la capacité maximale de la classe ({cap} places) et qu'aucune autre inscription active n'existe pour cet élève cette année.
          </p>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="xs" onClick={() => setEnrollModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="xs" disabled={enrolling || isFull}>
              {enrolling ? 'Inscription...' : 'Valider l’inscription'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Subject & Teacher Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Attribuer une matière & enseignant"
        size="md"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
          <div>
            <label className="mb-1 block text-2xs font-medium text-slate-700">
              Matière *
            </label>
            <select
              required
              value={assignSubjectId}
              onChange={(e) => setAssignSubjectId(e.target.value)}
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none"
            >
              <option value="">Sélectionner une matière</option>
              {subjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Coeff {s.coefficient}, {s.weeklyHours}h/sem)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-2xs font-medium text-slate-700">
              Enseignant responsable (optionnel)
            </label>
            <select
              value={assignTeacherId}
              onChange={(e) => setAssignTeacherId(e.target.value)}
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none"
            >
              <option value="">Non assigné (à pourvoir)</option>
              {teachersList.map((tch) => {
                const u = tch.user || {}
                return (
                  <option key={tch.id} value={tch.id}>
                    {u.firstName} {u.lastName} ({tch.employeeNumber || `ID#${tch.id}`})
                  </option>
                )
              })}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="xs" onClick={() => setAssignModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="xs" disabled={assigning}>
              {assigning ? 'Attribution...' : 'Attribuer la matière'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
