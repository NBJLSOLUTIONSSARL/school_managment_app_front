import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Loader'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { examService } from '@/features/exams/api/examService'
import { directoryService } from '@/features/students'
import { teacherDisplayName } from '@/utils/academic'
import { formatDate } from '@/utils/formatDate'

const emptyForm = {
  title: '',
  type: '',
  date: '',
  maxScore: '20',
  coefficient: '1',
  teacherId: '',
}

export function ExamForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canManage = hasRole([
    'admin',
    'ROLE_ADMIN',
    'teacher',
    'ROLE_TEACHER',
    'staff',
    'ROLE_STAFF',
  ])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])

  const [exam, setExam] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [teachers, setTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true

    directoryService.getAllTeachers().then((result) => {
      if (!active) return
      if (result.success) {
        setTeachers(Array.isArray(result.data) ? result.data : [])
      } else {
        toastError(result.error?.message || 'Impossible de charger les enseignants.')
      }
    })

    return () => {
      active = false
    }
  }, [toastError])

  useEffect(() => {
    let active = true

    if (isNew) {
      return undefined
    }

    examService.getExamById(id).then((result) => {
      if (!active) return
      setIsLoading(false)

      if (result.success) {
        setExam(result.data)
        setForm({
          title: result.data?.title || '',
          type: result.data?.type || '',
          date: result.data?.date || '',
          maxScore: String(result.data?.maxScore ?? 20),
          coefficient: String(result.data?.coefficient ?? 1),
          teacherId: String(result.data?.teacherId ?? ''),
        })
        setNotFound(false)
        setFieldErrors({})
      } else {
        setNotFound(true)
        toastError(result.error?.message || 'Impossible de charger cet examen.')
      }
    })

    return () => {
      active = false
    }
  }, [id, isNew, toastError])

  const teacherOptions = useMemo(
    () =>
      teachers.map((teacher) => ({
        value: String(teacher.id),
        label: teacherDisplayName(teacher),
        subtitle: teacher.specialization || teacher.user?.email,
      })),
    [teachers]
  )

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((previous) => {
        const next = { ...previous }
        delete next[field]
        return next
      })
    }
  }

  const validate = useCallback(() => {
    const errors = {}
    if (!form.title.trim()) errors.title = 'Le titre de l’examen est obligatoire.'
    if (form.title.trim().length > 200) errors.title = 'Le titre ne doit pas dépasser 200 caractères.'
    if (!form.type.trim()) errors.type = 'Le type d’examen est obligatoire.'
    if (form.type.trim().length > 50) errors.type = 'Le type ne doit pas dépasser 50 caractères.'
    if (!form.date) errors.date = 'La date de l’examen est obligatoire.'
    if (!form.maxScore || Number(form.maxScore) <= 0) {
      errors.maxScore = 'La note maximale doit être strictement positive.'
    }
    if (!form.coefficient || Number(form.coefficient) <= 0) {
      errors.coefficient = 'Le coefficient doit être strictement positif.'
    }
    if (isNew && !form.teacherId) errors.teacherId = 'L’enseignant responsable est obligatoire.'
    return errors
  }, [form, isNew])

  const handleSave = useCallback(
    async (event) => {
      event?.preventDefault?.()

      if (isSaving) return
      if (!canManage) {
        toastError('Votre rôle ne permet pas de modifier les examens.')
        return
      }
      if (exam?.locked) {
        toastError('L’examen est verrouillé. Déverrouillez-le avant toute modification.')
        return
      }

      const errors = validate()
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }

      setIsSaving(true)
      setFieldErrors({})

      const payload = {
        title: form.title.trim(),
        type: form.type.trim(),
        date: form.date,
        maxScore: Number(form.maxScore),
        coefficient: Number(form.coefficient),
      }

      const result = isNew
        ? await examService.createExam({ ...payload, teacherId: Number(form.teacherId) })
        : await examService.updateExam(id, payload)

      setIsSaving(false)

      if (result.success) {
        success(
          isNew ? 'Examen créé avec succès.' : 'Examen mis à jour avec succès.',
          'Examens'
        )
        if (isNew) {
          navigate(`/exams/${result.data.id}`)
        } else {
          setExam(result.data)
        }
      } else {
        toastError(result.error?.message || 'Impossible d’enregistrer l’examen.')
        if (result.error?.fieldErrors && Object.keys(result.error.fieldErrors).length > 0) {
          setFieldErrors(result.error.fieldErrors)
        }
      }
    },
    [
      canManage,
      exam?.locked,
      form,
      id,
      isNew,
      isSaving,
      navigate,
      success,
      toastError,
      validate,
    ]
  )

  useEffect(() => {
    if (!canManage || exam?.locked) return undefined

    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canManage, exam?.locked, handleSave])

  const handleLockToggle = async () => {
    if (!exam || isLocking) return
    setIsLocking(true)
    const result = await examService.setExamLock(exam.id, !exam.locked)
    setIsLocking(false)

    if (result.success) {
      setExam(result.data)
      success(result.message || 'Statut de verrouillage mis à jour.')
    } else {
      toastError(result.error?.message || 'Impossible de modifier le verrouillage.')
    }
  }

  const handleDelete = async () => {
    if (!exam) return
    setIsDeleting(true)
    const result = await examService.deleteExam(exam.id)
    setIsDeleting(false)

    if (result.success) {
      success('Examen supprimé avec succès.')
      navigate('/exams')
    } else {
      toastError(result.error?.message || 'Impossible de supprimer cet examen.')
    }
  }

  const title = isNew ? 'Nouvel examen' : exam?.title || `Examen #${id}`
  const breadcrumbs = ['Desk', 'Examens', isNew ? 'Nouvel examen' : `EXM-${id}`]

  const secondaryActions = [
    { label: 'Retour à la liste', onClick: () => navigate('/exams') },
    ...(!isNew
      ? [
          {
            label: 'Saisir les notes',
            onClick: () => navigate(`/grades?examId=${id}`),
          },
        ]
      : []),
    ...(!isNew && canManage
      ? [
          {
            label: isLocking
              ? 'Mise à jour...'
              : exam?.locked
                ? 'Déverrouiller'
                : 'Verrouiller',
            onClick: handleLockToggle,
          },
        ]
      : []),
  ]

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50">
        <DocTypePageHead breadcrumbs={breadcrumbs} title={title} docstatus="Draft" />
        <PageLoader message="Chargement de l’examen..." />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50">
        <DocTypePageHead
          breadcrumbs={breadcrumbs}
          title={title}
          docstatus="Cancelled"
          secondaryActions={[{ label: 'Retour à la liste', onClick: () => navigate('/exams') }]}
        />
        <div className="flex-1 max-w-7xl w-full mx-auto p-6">
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
            <EmptyState
              title="Examen introuvable"
              description={`Aucun examen ne correspond à l’identifiant #${id}.`}
              action={{ label: 'Retour à la liste', onClick: () => navigate('/exams') }}
            />
          </div>
        </div>
      </div>
    )
  }

  const isLocked = Boolean(exam?.locked)

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={breadcrumbs}
        title={title}
        docstatus={isNew ? 'Draft' : isLocked ? 'Locked' : 'Open'}
        primaryAction={canManage && !isLocked ? 'Enregistrer' : undefined}
        onPrimaryAction={handleSave}
        secondaryActions={secondaryActions}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 space-y-4">
          <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs space-y-3 text-xs">
            <h3 className="text-2xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Métadonnées
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Statut</span>
              <StatusBadge status={isNew ? 'Draft' : isLocked ? 'Locked' : 'Open'} showDot />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Identifiant</span>
              <span className="font-mono text-2xs text-slate-700">{isNew ? '-' : `#${id}`}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Enseignant</span>
              <span className="text-right text-2xs font-medium text-slate-700">
                {isNew
                  ? teacherOptions.find((option) => option.value === form.teacherId)?.label || '-'
                  : exam?.teacherName || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Date</span>
              <span className="text-2xs text-slate-700">{formatDate(form.date)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Barème</span>
              <span className="font-mono text-2xs text-slate-700">
                {form.maxScore || '-'} pts · coef. {form.coefficient || '-'}
              </span>
            </div>
          </div>

          {!isNew && exam && (
            <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs space-y-3 text-xs">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                Évaluation
              </h3>
              <p className="text-2xs text-slate-500 leading-relaxed">
                Les notes sont saisies par examen. Le backend refuse toute modification lorsque
                l’examen est verrouillé.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/grades?examId=${exam.id}`)}
              >
                Ouvrir la saisie des notes
              </Button>
              {canDelete && !isLocked && (
                <Button
                  variant="dangerSubtle"
                  size="sm"
                  className="w-full"
                  onClick={() => setDeleteOpen(true)}
                >
                  Supprimer l’examen
                </Button>
              )}
            </div>
          )}
        </aside>

        <main className="md:col-span-3 space-y-6">
          <form
            onSubmit={handleSave}
            className="rounded border border-slate-200 bg-white p-5 shadow-2xs space-y-5"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Informations générales</h2>
                <p className="text-2xs text-slate-500">
                  Les champs marqués d’un astérisque sont validés par le backend.
                </p>
              </div>
              {isLocked && (
                <span className="rounded bg-amber-50 px-2 py-1 text-2xs font-medium text-amber-700 border border-amber-200">
                  Lecture seule
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Titre de l’examen"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  error={fieldErrors.title}
                  placeholder="Ex: Examen final de mathématiques"
                  maxLength={200}
                  disabled={isLocked || !canManage}
                  required
                />
              </div>

              <Input
                label="Type d’examen"
                value={form.type}
                onChange={(event) => updateField('type', event.target.value)}
                error={fieldErrors.type}
                placeholder="Ex: Contrôle continu"
                helperText="Valeur libre transmise au backend (50 caractères max.)"
                maxLength={50}
                disabled={isLocked || !canManage}
                required
              />

              <DatePicker
                label="Date de l’examen"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                error={fieldErrors.date}
                disabled={isLocked || !canManage}
                required
              />

              <Input
                label="Note maximale"
                type="number"
                min="0.01"
                step="0.5"
                value={form.maxScore}
                onChange={(event) => updateField('maxScore', event.target.value)}
                error={fieldErrors.maxScore}
                suffix="pts"
                disabled={isLocked || !canManage}
                required
              />

              <Input
                label="Coefficient"
                type="number"
                min="0.01"
                step="0.5"
                value={form.coefficient}
                onChange={(event) => updateField('coefficient', event.target.value)}
                error={fieldErrors.coefficient}
                disabled={isLocked || !canManage}
                required
              />

              {isNew ? (
                <div className="sm:col-span-2">
                  <Select
                    label="Enseignant responsable"
                    value={form.teacherId}
                    onChange={(event) => updateField('teacherId', event.target.value)}
                    options={teacherOptions}
                    error={fieldErrors.teacherId}
                    placeholder="Sélectionner un enseignant..."
                    disabled={!canManage}
                    required
                  />
                </div>
              ) : (
                <div className="sm:col-span-2 rounded border border-slate-200 bg-slate-50/60 p-3">
                  <div className="text-2xs font-medium text-slate-500">Enseignant responsable</div>
                  <div className="mt-1 text-xs font-medium text-slate-800">
                    {exam?.teacherName || '-'}
                  </div>
                  <div className="mt-0.5 text-2xs text-slate-400">
                    Le backend ne permet pas de réaffecter l’enseignant lors d’une modification.
                  </div>
                </div>
              )}
            </div>

            {canManage && !isLocked && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-2xs text-slate-400">
                  Raccourci :{' '}
                  <kbd className="rounded border border-slate-300 bg-white px-1 font-mono">
                    Ctrl+S
                  </kbd>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/exams')}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                    {isNew ? 'Créer l’examen' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </main>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Supprimer l’examen"
        description={`Supprimer définitivement « ${exam?.title || ''} » ? Les notes associées seront également supprimées par le backend.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}

export const ExamFormPage = ExamForm
export default ExamForm
