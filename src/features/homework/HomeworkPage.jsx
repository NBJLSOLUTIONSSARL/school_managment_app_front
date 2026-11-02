import { useCallback, useEffect, useMemo, useState } from 'react'
import { DocTypePageHead } from '@/components/erpnext/DocTypePageHead'
import { AsyncLinkField } from '@/components/erpnext/AsyncLinkField'
import { PaginatedTable } from '@/components/common/PaginatedTable'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { homeworkService } from '@/services/homeworkService'
import { directoryService } from '@/services/directoryService'
import { formatDate } from '@/utils/formatDate'
import { studentDisplayName, paginateLocal } from '@/utils/academic'

const MODE_LABELS = {
  homework: 'Par devoir',
  student: 'Par élève',
  submission: 'Par soumission',
}

export function HomeworkPage() {
  const { hasRole } = useAuth()
  const { success, error: toastError, warning } = useToast()

  const canGrade = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])
  const canSearchByHomework = hasRole([
    'admin',
    'ROLE_ADMIN',
    'teacher',
    'ROLE_TEACHER',
    'staff',
    'ROLE_STAFF',
  ])
  const canViewSubmission = hasRole([
    'admin',
    'ROLE_ADMIN',
    'teacher',
    'ROLE_TEACHER',
    'student',
    'ROLE_STUDENT',
    'staff',
    'ROLE_STAFF',
  ])
  const canSubmit = hasRole([
    'admin',
    'ROLE_ADMIN',
    'teacher',
    'ROLE_TEACHER',
    'student',
    'ROLE_STUDENT',
  ])

  const [mode, setMode] = useState(canSearchByHomework ? 'homework' : 'student')
  const [homeworkId, setHomeworkId] = useState('')
  const [studentSelection, setStudentSelection] = useState(null)
  const [submissionId, setSubmissionId] = useState('')

  const [submissions, setSubmissions] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [gradedFilter, setGradedFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [teachers, setTeachers] = useState([])

  const [gradeTarget, setGradeTarget] = useState(null)
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '', teacherId: '' })
  const [gradeErrors, setGradeErrors] = useState({})
  const [isGrading, setIsGrading] = useState(false)

  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitForm, setSubmitForm] = useState({
    homeworkId: '',
    student: null,
    title: '',
    file: null,
  })
  const [submitErrors, setSubmitErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [detailsTarget, setDetailsTarget] = useState(null)

  const searchStudentOptions = useCallback(async (query) => {
    const result = await directoryService.searchStudents(query, { size: 20 })
    if (!result.success) return []

    return result.data.map((student) => ({
      value: String(student.id),
      label: studentDisplayName(student),
      subtitle: student.studentNumber || student.user?.email || '',
    }))
  }, [])

  useEffect(() => {
    if (!canGrade) return undefined

    let active = true

    directoryService.getAllTeachers().then((result) => {
      if (!active) return
      if (result.success) {
        setTeachers(Array.isArray(result.data) ? result.data : [])
      }
    })

    return () => {
      active = false
    }
  }, [canGrade])

  const modeOptions = [
    ...(canSearchByHomework ? [{ value: 'homework', label: MODE_LABELS.homework }] : []),
    { value: 'student', label: MODE_LABELS.student },
    ...(canViewSubmission ? [{ value: 'submission', label: MODE_LABELS.submission }] : []),
  ]

  const teacherOptions = useMemo(
    () =>
      teachers.map((teacher) => ({
        value: String(teacher.id),
        label: [teacher.user?.firstName, teacher.user?.lastName].filter(Boolean).join(' ') ||
          teacher.user?.email ||
          `Enseignant #${teacher.id}`,
      })),
    [teachers]
  )

  const runLookup = useCallback(async () => {
    if (isLoading) return

    let result
    let validationMessage = ''

    if (mode === 'homework') {
      const id = homeworkId.trim()
      if (!id) {
        validationMessage = 'Saisissez l’identifiant du devoir.'
      } else {
        setIsLoading(true)
        result = await homeworkService.getSubmissionsByHomework(id)
      }
    } else if (mode === 'student') {
      if (!studentSelection?.value) {
        validationMessage = 'Sélectionnez un élève.'
      } else {
        setIsLoading(true)
        result = await homeworkService.getSubmissionsByStudent(studentSelection.value)
      }
    } else {
      const id = submissionId.trim()
      if (!id) {
        validationMessage = 'Saisissez l’identifiant de la soumission.'
      } else {
        setIsLoading(true)
        result = await homeworkService.getSubmissionById(id)
      }
    }

    if (validationMessage) {
      setSearchError({ message: validationMessage })
      return
    }

    setHasSearched(true)
    setSearchError(null)
    setPage(1)

    if (!result) {
      setIsLoading(false)
      return
    }

    setIsLoading(false)

    if (result.success) {
      const data =
        mode === 'submission'
          ? result.data
            ? [result.data]
            : []
          : Array.isArray(result.data)
            ? result.data
            : []
      setSubmissions(data)
    } else {
      setSubmissions([])
      setSearchError(result.error)
      toastError(result.error?.message || 'Impossible de charger les soumissions.')
    }
  }, [homeworkId, isLoading, mode, studentSelection, submissionId, toastError])

  const handleModeChange = (event) => {
    setMode(event.target.value)
    setSubmissions([])
    setHasSearched(false)
    setSearchError(null)
    setPage(1)
    setSearchTerm('')
    setGradedFilter('all')
  }

  const filteredSubmissions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return submissions.filter((submission) => {
      const matchesSearch =
        !query ||
        [
          submission.title,
          submission.studentName,
          submission.studentNumber,
          submission.homeworkId,
          submission.id,
        ]
          .filter((value) => value !== null && value !== undefined)
          .some((value) => String(value).toLowerCase().includes(query))

      const isGraded = submission.score !== null && submission.score !== undefined
      const matchesGraded =
        gradedFilter === 'all' ||
        (gradedFilter === 'graded' && isGraded) ||
        (gradedFilter === 'ungraded' && !isGraded)

      return matchesSearch && matchesGraded
    })
  }, [submissions, searchTerm, gradedFilter])

  const paginated = useMemo(
    () => paginateLocal(filteredSubmissions, page, pageSize),
    [filteredSubmissions, page, pageSize]
  )

  const stats = useMemo(() => {
    const graded = submissions.filter(
      (submission) => submission.score !== null && submission.score !== undefined
    ).length
    return {
      total: submissions.length,
      graded,
      ungraded: submissions.length - graded,
    }
  }, [submissions])

  const openFile = (submission) => {
    if (!submission?.fileUrl) {
      warning('Aucun fichier n’est associé à cette soumission.')
      return
    }
    window.open(submission.fileUrl, '_blank', 'noopener,noreferrer')
  }

  const openGradeModal = (submission) => {
    setGradeTarget(submission)
    setGradeForm({
      score: submission.score ?? '',
      feedback: submission.feedback ?? '',
      teacherId: submission.gradedByTeacherId ? String(submission.gradedByTeacherId) : '',
    })
    setGradeErrors({})
  }

  const handleGradeSubmit = async () => {
    if (!gradeTarget || isGrading) return

    const errors = {}
    const rawScore = String(gradeForm.score).trim().replace(',', '.')
    const numericScore = Number(rawScore)

    if (rawScore === '') {
      errors.score = 'La note est obligatoire.'
    } else if (Number.isNaN(numericScore)) {
      errors.score = 'Saisissez une note numérique valide.'
    } else if (numericScore < 0) {
      errors.score = 'La note ne peut pas être négative.'
    }

    if (gradeForm.feedback.trim().length > 2000) {
      errors.feedback = 'Le retour ne doit pas dépasser 2000 caractères.'
    }

    if (Object.keys(errors).length > 0) {
      setGradeErrors(errors)
      return
    }

    setIsGrading(true)
    const result = await homeworkService.gradeSubmission(gradeTarget.id, {
      score: numericScore,
      feedback: gradeForm.feedback.trim() || null,
      teacherId: gradeForm.teacherId ? Number(gradeForm.teacherId) : null,
    })
    setIsGrading(false)

    if (result.success) {
      setSubmissions((previous) =>
        previous.map((item) => (item.id === result.data.id ? result.data : item))
      )
      setGradeTarget(null)
      success(result.message || 'Soumission notée avec succès.', 'Devoirs')
    } else {
      toastError(result.error?.message || 'Impossible de noter cette soumission.')
      if (result.error?.fieldErrors && Object.keys(result.error.fieldErrors).length > 0) {
        setGradeErrors(result.error.fieldErrors)
      }
    }
  }

  const openSubmitModal = () => {
    setSubmitForm({
      homeworkId: mode === 'homework' ? homeworkId : '',
      student: mode === 'student' ? studentSelection : null,
      title: '',
      file: null,
    })
    setSubmitErrors({})
    setSubmitOpen(true)
  }

  const handleSubmitHomework = async () => {
    if (isSubmitting) return

    const errors = {}
    const homeworkValue = submitForm.homeworkId.trim()

    if (!homeworkValue) {
      errors.homeworkId = 'L’identifiant du devoir est obligatoire.'
    }
    if (!submitForm.student?.value) {
      errors.student = 'Sélectionnez l’élève qui soumet le devoir.'
    }
    if (!submitForm.file) {
      errors.file = 'Un fichier est obligatoire.'
    }
    if (submitForm.title.trim().length > 200) {
      errors.title = 'Le titre ne doit pas dépasser 200 caractères.'
    }

    if (Object.keys(errors).length > 0) {
      setSubmitErrors(errors)
      return
    }

    setIsSubmitting(true)
    const result = await homeworkService.submitHomework(homeworkValue, {
      file: submitForm.file,
      title: submitForm.title.trim() || undefined,
      studentId: submitForm.student.value,
    })
    setIsSubmitting(false)

    if (result.success) {
      setSubmissions((previous) => {
        const exists = previous.some((item) => item.id === result.data.id)
        if (exists) {
          return previous.map((item) => (item.id === result.data.id ? result.data : item))
        }
        return [result.data, ...previous]
      })
      setHasSearched(true)
      setSubmitOpen(false)
      success(result.message || 'Devoir soumis avec succès.', 'Devoirs')
    } else {
      toastError(result.error?.message || 'Impossible de soumettre ce devoir.')
      if (result.error?.fieldErrors && Object.keys(result.error.fieldErrors).length > 0) {
        setSubmitErrors(result.error.fieldErrors)
      }
    }
  }

  const columns = [
    {
      key: 'studentName',
      label: 'Élève',
      render: (value, row) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-2xs text-slate-400">
            {row.studentNumber || `Élève #${row.studentId}`}
          </div>
        </div>
      ),
    },
    {
      key: 'homeworkId',
      label: 'Devoir',
      width: '170px',
      render: (value, row) => (
        <div>
          <div className="font-mono text-2xs text-slate-700">Devoir #{value}</div>
          <div className="truncate text-2xs text-slate-400" title={row.title}>
            {row.title || 'Sans titre'}
          </div>
        </div>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Soumis le',
      width: '150px',
      render: (value) => (
        <span className="text-2xs text-slate-600">
          {formatDate(value, { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'score',
      label: 'Note',
      width: '100px',
      align: 'center',
      render: (value) => (
        <span className="font-mono text-xs text-slate-800">
          {value === null || value === undefined ? '-' : value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '110px',
      render: (_, row) =>
        row.score === null || row.score === undefined ? (
          <StatusBadge status="Pending" label="À noter" showDot />
        ) : (
          <StatusBadge status="Submitted" label="Noté" showDot />
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '230px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDetailsTarget(row)}
            disabled={!canViewSubmission}
          >
            Détails
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => openFile(row)}
            disabled={!row.fileUrl}
          >
            Fichier
          </Button>
          {canGrade && (
            <Button variant="ghost" size="xs" onClick={() => openGradeModal(row)}>
              {row.score === null || row.score === undefined ? 'Noter' : 'Modifier'}
            </Button>
          )}
        </div>
      ),
    },
  ]

  const canSearchCurrentMode =
    (mode === 'homework' && canSearchByHomework) ||
    (mode === 'student') ||
    (mode === 'submission' && canViewSubmission)

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={['Desk', 'Devoirs']}
        title="Soumissions de devoirs"
        docstatus="Active"
        primaryAction={canSubmit ? '+ Soumettre un devoir' : undefined}
        onPrimaryAction={openSubmitModal}
        secondaryActions={
          hasSearched
            ? [{ label: 'Actualiser', onClick: runLookup }]
            : []
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="rounded border border-blue-200 bg-blue-50 px-4 py-3 text-2xs leading-relaxed text-blue-800">
          <span className="font-semibold">Périmètre API :</span> le backend expose uniquement les
          soumissions de devoirs et leur notation. Il ne fournit ni liste des devoirs, ni création,
          ni échéance, ni classe associée. Cette page ne simule donc pas ces fonctionnalités.
        </div>

        <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="w-full sm:w-52">
              <Select
                label="Mode de recherche"
                value={mode}
                onChange={handleModeChange}
                options={modeOptions}
                placeholder=""
              />
            </div>

            {mode === 'homework' && (
              <div className="w-full sm:w-64">
                <Input
                  label="Identifiant du devoir"
                  type="number"
                  min="1"
                  value={homeworkId}
                  onChange={(event) => setHomeworkId(event.target.value)}
                  placeholder="Ex: 12"
                />
              </div>
            )}

            {mode === 'student' && (
              <div className="w-full sm:w-80">
                <AsyncLinkField
                  label="Élève"
                  value={studentSelection}
                  onChange={setStudentSelection}
                  search={searchStudentOptions}
                  placeholder="Rechercher un élève..."
                  doctype="Élève"
                />
              </div>
            )}

            {mode === 'submission' && (
              <div className="w-full sm:w-64">
                <Input
                  label="Identifiant de la soumission"
                  type="number"
                  min="1"
                  value={submissionId}
                  onChange={(event) => setSubmissionId(event.target.value)}
                  placeholder="Ex: 84"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={runLookup}
                isLoading={isLoading}
                disabled={!canSearchCurrentMode}
              >
                Rechercher
              </Button>
            </div>
          </div>

          {searchError && (
            <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-2xs text-rose-700">
              {searchError.message}
            </div>
          )}
        </div>

        {hasSearched && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
              <div className="text-2xs uppercase tracking-wider text-slate-500">Soumissions</div>
              <div className="mt-1 text-base font-semibold text-slate-900">{stats.total}</div>
            </div>
            <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
              <div className="text-2xs uppercase tracking-wider text-slate-500">Notées</div>
              <div className="mt-1 text-base font-semibold text-emerald-700">{stats.graded}</div>
            </div>
            <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
              <div className="text-2xs uppercase tracking-wider text-slate-500">À noter</div>
              <div className="mt-1 text-base font-semibold text-amber-700">{stats.ungraded}</div>
            </div>
          </div>
        )}

        {hasSearched ? (
          <PaginatedTable
            toolbar={
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:max-w-xl">
                  <Input
                    label="Filtrer"
                    placeholder="Élève, titre, devoir..."
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setPage(1)
                    }}
                  />
                  <Select
                    label="Notation"
                    value={gradedFilter}
                    onChange={(event) => {
                      setGradedFilter(event.target.value)
                      setPage(1)
                    }}
                    options={[
                      { value: 'all', label: 'Toutes les soumissions' },
                      { value: 'graded', label: 'Notées' },
                      { value: 'ungraded', label: 'À noter' },
                    ]}
                    placeholder=""
                  />
                </div>
                <div className="text-2xs text-slate-500">
                  {filteredSubmissions.length} résultat(s)
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
            isLoading={isLoading}
            emptyTitle="Aucune soumission"
            emptyDescription={
              mode === 'homework'
                ? 'Aucune soumission n’existe pour ce devoir, ou l’identifiant est inconnu.'
                : 'Aucune soumission ne correspond à cette recherche.'
            }
          />
        ) : (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
            <EmptyState
              title="Recherchez des soumissions"
              description="Choisissez un mode de recherche puis renseignez un identifiant de devoir, un élève ou une soumission."
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(gradeTarget)}
        onClose={isGrading ? undefined : () => setGradeTarget(null)}
        title="Noter la soumission"
        size="md"
        closeOnBackdrop={!isGrading}
        closeOnEsc={!isGrading}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGradeTarget(null)}
              disabled={isGrading}
            >
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleGradeSubmit} isLoading={isGrading}>
              Enregistrer la note
            </Button>
          </>
        }
      >
        {gradeTarget && (
          <div className="space-y-3">
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-2xs text-slate-600">
              <div>
                <span className="font-medium text-slate-800">Élève :</span>{' '}
                {gradeTarget.studentName || '-'} ({gradeTarget.studentNumber || `#${gradeTarget.studentId}`})
              </div>
              <div>
                <span className="font-medium text-slate-800">Devoir :</span> #{gradeTarget.homeworkId} ·{' '}
                {gradeTarget.title || 'Sans titre'}
              </div>
            </div>

            <Input
              label="Note"
              type="number"
              min="0"
              step="0.25"
              value={gradeForm.score}
              onChange={(event) => {
                setGradeForm((previous) => ({ ...previous, score: event.target.value }))
                setGradeErrors((previous) => ({ ...previous, score: undefined }))
              }}
              error={gradeErrors.score}
              helperText="Le backend accepte toute note positive, sans barème maximal."
              required
            />

            <div>
              <label
                htmlFor="homework-feedback"
                className="mb-1 block text-2xs font-medium text-slate-700"
              >
                Retour / appréciation
              </label>
              <textarea
                id="homework-feedback"
                rows={4}
                maxLength={2000}
                value={gradeForm.feedback}
                onChange={(event) => {
                  setGradeForm((previous) => ({ ...previous, feedback: event.target.value }))
                  setGradeErrors((previous) => ({ ...previous, feedback: undefined }))
                }}
                className={`w-full rounded border bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-offset-0 ${
                  gradeErrors.feedback
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                }`}
                placeholder="Commentaire facultatif (2000 caractères max.)"
              />
              <div className="mt-1 flex items-center justify-between text-2xs">
                <span className={gradeErrors.feedback ? 'text-rose-600' : 'text-slate-500'}>
                  {gradeErrors.feedback || 'Retour facultatif'}
                </span>
                <span className="text-slate-400">{gradeForm.feedback.length}/2000</span>
              </div>
            </div>

            <Select
              label="Enseignant correcteur (facultatif)"
              value={gradeForm.teacherId}
              onChange={(event) =>
                setGradeForm((previous) => ({ ...previous, teacherId: event.target.value }))
              }
              options={teacherOptions}
              placeholder="Non renseigné"
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={submitOpen}
        onClose={isSubmitting ? undefined : () => setSubmitOpen(false)}
        title="Soumettre un devoir"
        size="md"
        closeOnBackdrop={!isSubmitting}
        closeOnEsc={!isSubmitting}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSubmitOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitHomework}
              isLoading={isSubmitting}
            >
              Soumettre
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Identifiant du devoir"
            type="number"
            min="1"
            value={submitForm.homeworkId}
            onChange={(event) => {
              setSubmitForm((previous) => ({ ...previous, homeworkId: event.target.value }))
              setSubmitErrors((previous) => ({ ...previous, homeworkId: undefined }))
            }}
            error={submitErrors.homeworkId}
            required
          />

          <AsyncLinkField
            label="Élève"
            value={submitForm.student}
            onChange={(value) => {
              setSubmitForm((previous) => ({ ...previous, student: value }))
              setSubmitErrors((previous) => ({ ...previous, student: undefined }))
            }}
            search={searchStudentOptions}
            placeholder="Rechercher l’élève..."
            doctype="Élève"
            error={submitErrors.student}
            required
          />

          <Input
            label="Titre de la soumission (facultatif)"
            value={submitForm.title}
            onChange={(event) =>
              setSubmitForm((previous) => ({ ...previous, title: event.target.value }))
            }
            error={submitErrors.title}
            maxLength={200}
            placeholder="Ex: Exercice 3 - Pythagore"
          />

          <div>
            <label htmlFor="homework-file" className="mb-1 block text-2xs font-medium text-slate-700">
              Fichier <span className="text-rose-500">*</span>
            </label>
            <input
              id="homework-file"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0] || null
                setSubmitForm((previous) => ({ ...previous, file }))
                setSubmitErrors((previous) => ({ ...previous, file: undefined }))
              }}
              className={`block w-full rounded border bg-white px-2.5 py-1.5 text-2xs text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-2xs file:font-medium file:text-slate-700 hover:file:bg-slate-200 ${
                submitErrors.file ? 'border-rose-300' : 'border-slate-300'
              }`}
            />
            {submitErrors.file ? (
              <p className="mt-1 text-2xs font-medium text-rose-600">{submitErrors.file}</p>
            ) : (
              <p className="mt-1 text-2xs text-slate-500">
                Le fichier est envoyé en multipart au backend. Aucune taille maximale n’est
                documentée côté API.
              </p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        title="Détail de la soumission"
        size="md"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setDetailsTarget(null)}>
            Fermer
          </Button>
        }
      >
        {detailsTarget && (
          <div className="space-y-2 text-xs">
            {[
              ['Soumission', `#${detailsTarget.id}`],
              ['Élève', `${detailsTarget.studentName || '-'} (${detailsTarget.studentNumber || detailsTarget.studentId})`],
              ['Devoir', `#${detailsTarget.homeworkId}`],
              ['Titre', detailsTarget.title || '-'],
              [
                'Soumis le',
                formatDate(detailsTarget.submittedAt, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
              ],
              ['Note', detailsTarget.score ?? '-'],
              ['Retour', detailsTarget.feedback || '-'],
              ['Corrigé par', detailsTarget.gradedByTeacherName || '-'],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3 border-b border-slate-100 py-1.5">
                <span className="text-2xs text-slate-400">{label}</span>
                <span className="col-span-2 text-slate-700 break-words">{value}</span>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openFile(detailsTarget)}
                disabled={!detailsTarget.fileUrl}
              >
                Ouvrir le fichier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HomeworkPage
