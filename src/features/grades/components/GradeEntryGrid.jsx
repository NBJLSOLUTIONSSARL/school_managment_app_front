import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loader } from '@/components/ui/Loader'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { examService } from '@/features/exams'
import { directoryService } from '@/features/students'
import { formatDate } from '@/utils/formatDate'
import { paginateLocal, studentDisplayName } from '@/utils/academic'

const STUDENT_PAGE_SIZE = 100
const MAX_STUDENT_PAGES = 50

export function GradeEntryGrid() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const examIdParam = searchParams.get('examId') || ''
  const { success, error: toastError, warning, info } = useToast()
  const { hasRole } = useAuth()

  const canGrade = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])

  const [exams, setExams] = useState([])
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [exam, setExam] = useState(null)
  const [isLoadingContext, setIsLoadingContext] = useState(Boolean(examIdParam))
  const [loadError, setLoadError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [students, setStudents] = useState([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [studentsError, setStudentsError] = useState(null)

  const [gradesByStudent, setGradesByStudent] = useState({})
  const [edits, setEdits] = useState({})
  const [rowErrors, setRowErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadStudents = useCallback(async () => {
    const collected = []
    let currentPage = 1
    let totalPages = 1

    while (currentPage <= totalPages && currentPage <= MAX_STUDENT_PAGES) {
      const result = await directoryService.getStudents({
        page: currentPage,
        size: STUDENT_PAGE_SIZE,
      })

      if (!result.success) {
        setStudentsError(result.error)
        setIsLoadingStudents(false)
        toastError(result.error?.message || 'Impossible de charger la liste des élèves.')
        return
      }

      collected.push(...result.data.items)
      totalPages = result.data.totalPages
      currentPage += 1
    }

    setStudents(collected)
    setIsLoadingStudents(false)
  }, [toastError])

  const handleReloadStudents = () => {
    setIsLoadingStudents(true)
    setStudentsError(null)
    loadStudents()
  }

  useEffect(() => {
    let active = true

    examService.getAllExams().then((result) => {
      if (!active) return
      setIsLoadingExams(false)

      if (result.success) {
        setExams(Array.isArray(result.data) ? result.data : [])
      } else {
        toastError(result.error?.message || 'Impossible de charger les examens.')
      }
    })

    return () => {
      active = false
    }
  }, [toastError])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async loader updates state after awaiting
    loadStudents()
  }, [loadStudents])

  useEffect(() => {
    let active = true

    if (!examIdParam) {
      return undefined
    }

    Promise.all([
      examService.getExamById(examIdParam),
      examService.getGradesByExam(examIdParam),
    ]).then(([examResult, gradesResult]) => {
      if (!active) return
      setIsLoadingContext(false)

      if (examResult.success && gradesResult.success) {
        setExam(examResult.data)
        const map = {}
        for (const grade of gradesResult.data || []) {
          map[String(grade.studentId)] = grade
        }
        setGradesByStudent(map)
      } else {
        const failure = !examResult.success ? examResult : gradesResult
        setLoadError(failure.error)
        toastError(failure.error?.message || 'Impossible de charger les notes de cet examen.')
      }
    })

    return () => {
      active = false
    }
  }, [examIdParam, reloadToken, toastError])

  const hasUnsavedChanges = Object.keys(edits).length > 0

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined

    function handleBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const examOptions = useMemo(
    () =>
      exams.map((item) => ({
        value: String(item.id),
        label: `${item.title} · ${formatDate(item.date)}`,
      })),
    [exams]
  )

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return students

    return students.filter((student) => {
      const name = studentDisplayName(student, '').toLowerCase()
      const number = String(student.studentNumber || '').toLowerCase()
      return name.includes(query) || number.includes(query)
    })
  }, [students, searchTerm])

  const paginated = useMemo(
    () => paginateLocal(filteredStudents, page, pageSize),
    [filteredStudents, page, pageSize]
  )

  const gradedCount = Object.keys(gradesByStudent).length
  const isLocked = Boolean(exam?.locked)

  const getRowScore = (studentId) => {
    const edit = edits[String(studentId)]
    if (edit) return edit.score
    return gradesByStudent[String(studentId)]?.score ?? ''
  }

  const getRowComment = (studentId) => {
    const edit = edits[String(studentId)]
    if (edit) return edit.comment
    return gradesByStudent[String(studentId)]?.comment ?? ''
  }

  const updateGradeField = (student, field, value) => {
    const key = String(student.id)
    const original = gradesByStudent[key]

    setEdits((previous) => {
      const current = previous[key] || {
        score: original?.score ?? '',
        comment: original?.comment ?? '',
      }

      return {
        ...previous,
        [key]: { ...current, [field]: value },
      }
    })

    setRowErrors((previous) => {
      if (!previous[key]) return previous
      const next = { ...previous }
      const nextRow = { ...next[key] }
      delete nextRow[field]
      if (Object.keys(nextRow).length === 0) {
        delete next[key]
      } else {
        next[key] = nextRow
      }
      return next
    })
  }

  const handleResetEdits = () => {
    if (!hasUnsavedChanges) return
    setEdits({})
    setRowErrors({})
    info('Modifications locales réinitialisées.')
  }

  const handleSave = useCallback(async () => {
    if (isSaving || !exam || !canGrade) return
    if (exam.locked) {
      toastError('L’examen est verrouillé. Aucune note ne peut être enregistrée.')
      return
    }

    const errors = {}
    const payload = []

    for (const [studentId, edit] of Object.entries(edits)) {
      const original = gradesByStudent[studentId]
      const rawScore = String(edit.score ?? '').trim()
      const rawComment = String(edit.comment ?? '').trim()
      const rowError = {}

      if (rawScore === '') {
        if (original) {
          rowError.score =
            'La suppression d’une note existante n’est pas prise en charge par l’API.'
        }
      } else {
        const numeric = Number(rawScore.replace(',', '.'))
        if (Number.isNaN(numeric)) {
          rowError.score = 'Saisissez une note numérique valide.'
        } else if (numeric < 0) {
          rowError.score = 'La note ne peut pas être négative.'
        } else if (numeric > Number(exam.maxScore)) {
          rowError.score = `La note ne peut pas dépasser ${exam.maxScore}.`
        }
      }

      if (rawComment.length > 1000) {
        rowError.comment = 'Le commentaire ne doit pas dépasser 1000 caractères.'
      }

      if (Object.keys(rowError).length > 0) {
        errors[studentId] = rowError
        continue
      }

      if (rawScore === '' && !original) {
        continue
      }

      payload.push({
        studentId: Number(studentId),
        score: Number(rawScore.replace(',', '.')),
        comment: rawComment || null,
      })
    }

    if (Object.keys(errors).length > 0) {
      setRowErrors(errors)
      toastError('Certaines notes sont invalides. Corrigez les lignes signalées.')
      return
    }

    if (payload.length === 0) {
      setEdits({})
      info('Aucune note à enregistrer.')
      return
    }

    setIsSaving(true)
    setRowErrors({})

    const result = await examService.batchGrade(exam.id, payload)
    setIsSaving(false)

    if (result.success) {
      setGradesByStudent((previous) => {
        const next = { ...previous }
        for (const grade of result.data || []) {
          next[String(grade.studentId)] = grade
        }
        return next
      })
      setEdits({})
      success(result.message || 'Notes enregistrées avec succès.', 'Saisie des notes')
    } else {
      toastError(result.error?.message || 'Impossible d’enregistrer les notes.')
    }
  }, [
    canGrade,
    edits,
    exam,
    gradesByStudent,
    info,
    isSaving,
    success,
    toastError,
  ])

  useEffect(() => {
    if (!canGrade || isLocked || !exam) return undefined

    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGrade, isLocked, exam, handleSave])

  const handleExamChange = (event) => {
    const nextId = event.target.value
    if (hasUnsavedChanges && !window.confirm('Des modifications non enregistrées seront perdues. Continuer ?')) {
      return
    }

    setExam(null)
    setGradesByStudent({})
    setEdits({})
    setRowErrors({})
    setLoadError(null)
    setPage(1)
    setSearchTerm('')
    setIsLoadingContext(Boolean(nextId))

    if (nextId) {
      setSearchParams({ examId: nextId })
    } else {
      setSearchParams({})
    }
  }

  const handleRefresh = () => {
    if (hasUnsavedChanges) {
      warning('Enregistrez ou réinitialisez les modifications avant d’actualiser.')
      return
    }
    setLoadError(null)
    setIsLoadingContext(Boolean(examIdParam))
    setReloadToken((previous) => previous + 1)
  }

  const columns = [
    {
      key: 'student',
      label: 'Élève',
      render: (_, row) => (
        <div>
          <div className="font-medium text-slate-900">{studentDisplayName(row)}</div>
          <div className="text-2xs text-slate-400">
            {row.studentNumber || 'Sans matricule'}
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      label: 'Note',
      width: '150px',
      render: (_, row) => (
        <Input
          type="number"
          min="0"
          max={exam?.maxScore}
          step="0.25"
          value={getRowScore(row.id)}
          onChange={(event) => updateGradeField(row, 'score', event.target.value)}
          error={rowErrors[String(row.id)]?.score}
          suffix={`/ ${exam?.maxScore ?? '-'}`}
          disabled={isLocked || !canGrade}
          aria-label={`Note de ${studentDisplayName(row)}`}
        />
      ),
    },
    {
      key: 'comment',
      label: 'Commentaire',
      render: (_, row) => (
        <Input
          value={getRowComment(row.id)}
          onChange={(event) => updateGradeField(row, 'comment', event.target.value)}
          error={rowErrors[String(row.id)]?.comment}
          placeholder="Appréciation facultative..."
          maxLength={1000}
          disabled={isLocked || !canGrade}
          aria-label={`Commentaire de ${studentDisplayName(row)}`}
        />
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '110px',
      render: (_, row) => {
        const isDirty = Object.prototype.hasOwnProperty.call(edits, String(row.id))
        const hasGrade =
          Boolean(gradesByStudent[String(row.id)]) ||
          String(getRowScore(row.id) ?? '').trim() !== ''

        if (isDirty) {
          return <StatusBadge status="Pending" label="Modifiée" showDot />
        }
        if (hasGrade) {
          return <StatusBadge status="Submitted" label="Notée" showDot />
        }
        return <StatusBadge status="Draft" label="Non notée" showDot />
      },
    },
  ]

  const pageTitle = exam ? `Notes — ${exam.title}` : 'Saisie des notes'
  const breadcrumbs = ['Desk', 'Notes', exam ? `EXM-${exam.id}` : 'Saisie']

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={breadcrumbs}
        title={pageTitle}
        docstatus={exam ? (isLocked ? 'Locked' : 'Open') : 'Draft'}
        primaryAction={
          exam && canGrade && !isLocked && hasUnsavedChanges
            ? `Enregistrer (${Object.keys(edits).length})`
            : undefined
        }
        onPrimaryAction={handleSave}
        secondaryActions={[
          { label: 'Retour aux examens', onClick: () => navigate('/exams') },
          { label: 'Actualiser', onClick: handleRefresh },
          ...(exam
            ? [
                {
                  label: 'Détails de l’examen',
                  onClick: () => navigate(`/exams/${exam.id}`),
                },
              ]
            : []),
        ]}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Select
                label="Examen"
                value={examIdParam}
                onChange={handleExamChange}
                options={examOptions}
                placeholder={isLoadingExams ? 'Chargement des examens...' : 'Sélectionner un examen...'}
                disabled={isLoadingExams || examOptions.length === 0}
              />
            </div>
            <div className="text-2xs text-slate-500 sm:text-right">
              {exam
                ? `${formatDate(exam.date)} · ${exam.type} · barème ${exam.maxScore}`
                : 'Choisissez un examen pour saisir les notes.'}
            </div>
          </div>
        </div>

        {!examIdParam ? (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
            <EmptyState
              title="Aucun examen sélectionné"
              description="Sélectionnez un examen dans la liste pour afficher les élèves et saisir leurs notes."
              action={
                exams.length > 0
                  ? {
                      label: 'Choisir le premier examen',
                      onClick: () => setSearchParams({ examId: String(exams[0].id) }),
                    }
                  : undefined
              }
            />
          </div>
        ) : isLoadingContext ? (
          <div className="rounded border border-slate-200 bg-white shadow-2xs">
            <Loader text="Chargement de l’examen et des notes..." />
          </div>
        ) : loadError ? (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
            <EmptyState
              title="Notes indisponibles"
              description={loadError.message}
              action={{ label: 'Réessayer', onClick: handleRefresh }}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                <div className="text-2xs uppercase tracking-wider text-slate-500">Élèves</div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {students.length}
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                <div className="text-2xs uppercase tracking-wider text-slate-500">Notes saisies</div>
                <div className="mt-1 text-base font-semibold text-slate-900">{gradedCount}</div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                <div className="text-2xs uppercase tracking-wider text-slate-500">Modifiées</div>
                <div className="mt-1 text-base font-semibold text-amber-700">
                  {Object.keys(edits).length}
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                <div className="text-2xs uppercase tracking-wider text-slate-500">Statut</div>
                <div className="mt-1">
                  <StatusBadge status={isLocked ? 'Locked' : 'Open'} showDot />
                </div>
              </div>
            </div>

            {isLocked && (
              <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-2xs text-amber-800">
                Cet examen est verrouillé. Les notes sont en lecture seule tant que l’examen n’est
                pas déverrouillé.
              </div>
            )}

            {!canGrade && (
              <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-2xs text-slate-600">
                Votre rôle permet de consulter les notes, mais pas de les modifier. Seuls les
                administrateurs et enseignants peuvent enregistrer une saisie.
              </div>
            )}

            {studentsError && (
              <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-2xs text-rose-700">
                {studentsError.message}{' '}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={handleReloadStudents}
                >
                  Réessayer
                </button>
              </div>
            )}

            <PaginatedTable
              toolbar={
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="w-full sm:max-w-xs">
                    <Input
                      label="Rechercher un élève"
                      placeholder="Nom ou matricule..."
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <Button variant="secondary" size="sm" onClick={handleResetEdits}>
                        Réinitialiser
                      </Button>
                    )}
                    {canGrade && !isLocked && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isSaving}
                        disabled={!hasUnsavedChanges}
                      >
                        Enregistrer les notes
                      </Button>
                    )}
                  </div>
                </div>
              }
              columns={columns}
              data={paginated.items}
              page={paginated.page}
              pageSize={pageSize}
              totalItems={paginated.totalItems}
              totalPages={paginated.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
              isLoading={isLoadingStudents}
              emptyTitle="Aucun élève"
              emptyDescription={
                searchTerm
                  ? 'Aucun élève ne correspond à la recherche.'
                  : 'Aucun élève n’est disponible pour la saisie.'
              }
            />

            {canGrade && !isLocked && (
              <p className="text-2xs text-slate-400">
                Raccourci :{' '}
                <kbd className="rounded border border-slate-300 bg-white px-1 font-mono">
                  Ctrl+S
                </kbd>{' '}
                pour enregistrer les notes modifiées.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export const GradeEntryPage = GradeEntryGrid
export default GradeEntryGrid
