import { useCallback, useEffect, useRef, useState } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import * as yup from 'yup'
import { useAuth } from '@/features/auth'
import DocTypePageHead from '@/components/ui/DocTypePageHead'
import {
  createObservation,
  deleteObservation,
  listObservations,
  observationError,
  updateObservation,
} from '../api/observationsApi'

const observationSchema = yup.object({
  studentId: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || originalValue == null ? undefined : value))
    .typeError('L’identifiant élève est requis.')
    .positive('L’identifiant élève doit être positif.')
    .required('L’identifiant élève est requis.'),
  subjectId: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || originalValue == null ? undefined : value))
    .typeError('L’identifiant matière est invalide.')
    .positive('L’identifiant matière doit être positif.')
    .nullable()
    .notRequired(),
  category: yup
    .string()
    .required('La catégorie est requise.')
    .max(100, 'La catégorie ne peut pas dépasser 100 caractères.'),
  level: yup
    .string()
    .required('Le niveau est requis.')
    .oneOf(['POSITIVE', 'NEUTRAL', 'CONCERNING'], 'Niveau invalide.'),
  content: yup
    .string()
    .required('Le contenu est requis.')
    .max(5000, 'Le contenu ne peut pas dépasser 5000 caractères.'),
  date: yup
    .string()
    .required('La date est requise.')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format AAAA-MM-JJ.'),
})

const LEVEL_LABELS = {
  POSITIVE: 'Positif',
  NEUTRAL: 'Neutre',
  CONCERNING: 'Inquiétant',
}

const LEVEL_VARIANTS = {
  POSITIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  NEUTRAL: 'bg-slate-100 text-slate-700 border-slate-200',
  CONCERNING: 'bg-amber-50 text-amber-700 border-amber-200',
}

const SOURCE_LABELS = {
  TEACHER: 'Enseignant',
  PARENT: 'Parent',
}

const PAGE_SIZES = [10, 20, 50]

function formatDate(value) {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

function isPastOrPresent(value) {
  if (!value) return false
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return false
  const [, y, m, d] = match
  const input = new Date(Number(y), Number(m) - 1, Number(d))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return input <= today
}

export function ObservationsView() {
  const { request, hasPermission } = useAuth()
  const canRead = hasPermission('PERM_READ_OBSERVATION')
  const canWrite = hasPermission('PERM_WRITE_OBSERVATION')

  const [studentId, setStudentId] = useState('')
  const [resolvedStudentId, setResolvedStudentId] = useState(null)

  const [observations, setObservations] = useState([])
  const [pagination, setPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })
  const [filters, setFilters] = useState({ category: '', level: '', source: '', from: '', to: '' })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formMode, setFormMode] = useState(null)
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    category: '',
    level: '',
    content: '',
    date: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const generation = useRef(0)

  const loadObservations = useCallback(async () => {
    if (!canRead) return
    const id = Number(resolvedStudentId)
    if (!Number.isSafeInteger(id) || id <= 0) return
    const operation = ++generation.current
    try {
      const result = await listObservations(request, id, {
        category: filters.category || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        level: filters.level || undefined,
        source: filters.source || undefined,
        page: pagination.page,
        size: pagination.size,
      })
      if (operation === generation.current) {
        setObservations(result.content)
        setPagination(result)
        setError('')
      }
    } catch (failure) {
      if (operation === generation.current) setError(observationError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }, [request, canRead, resolvedStudentId, filters, pagination.page, pagination.size])

  useEffect(() => {
    if (resolvedStudentId) {
      queueMicrotask(() => {
        setLoading(true)
        loadObservations()
      })
    }
  }, [loadObservations, resolvedStudentId])

  const handleStudentChange = (event) => {
    setStudentId(event.target.value)
    setResolvedStudentId(null)
    setObservations([])
    setError('')
    setSuccess('')
  }

  const handleLoadStudent = () => {
    const id = Number(studentId)
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('L’identifiant élève doit être un nombre positif.')
      return
    }
    setResolvedStudentId(id)
    setError('')
    setLoading(true)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 0 }))
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const openCreate = () => {
    if (!canWrite) return
    setFormMode('create')
    setFormData({
      studentId: resolvedStudentId ? String(resolvedStudentId) : '',
      subjectId: '',
      category: '',
      level: '',
      content: '',
      date: '',
    })
    setFormErrors({})
  }

  const openEdit = (observation) => {
    if (!canWrite) return
    setFormMode('edit')
    setFormData({
      studentId: String(observation.studentId),
      subjectId: observation.subjectId ?? '',
      category: observation.category,
      level: observation.level,
      content: observation.content,
      date: observation.date,
    })
    setFormErrors({})
  }

  const closeForm = () => {
    setFormMode(null)
    setFormErrors({})
  }

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormErrors({})
    setError('')
    setSuccess('')

    let validated
    try {
      validated = await observationSchema.validate(formData, { abortEarly: false })
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const next = {}
        for (const issue of validationError.inner) {
          if (issue.path) next[issue.path] = issue.message
        }
        setFormErrors(next)
      }
      return
    }

    if (!isPastOrPresent(validated.date)) {
      setFormErrors({ date: 'La date doit être passée ou présente.' })
      return
    }

    const operation = ++generation.current
    setSubmitting(true)
    try {
      const payload = {
        studentId: Number(validated.studentId),
        category: validated.category,
        level: validated.level,
        content: validated.content,
        date: validated.date,
      }
      if (validated.subjectId) payload.subjectId = Number(validated.subjectId)

      if (formMode === 'create') {
        await createObservation(request, payload)
      } else {
        await updateObservation(request, Number(validated.studentId), payload)
      }

      if (operation === generation.current) {
        setSuccess(formMode === 'create' ? 'Observation créée.' : 'Observation modifiée.')
        closeForm()
        loadObservations()
      }
    } catch (failure) {
      if (operation === generation.current) setError(observationError(failure))
    } finally {
      if (operation === generation.current) setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!canWrite) return
    if (!window.confirm('Supprimer cette observation ?')) return
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      await deleteObservation(request, id)
      if (operation === generation.current) {
        setSuccess('Observation supprimée.')
        loadObservations()
      }
    } catch (failure) {
      if (operation === generation.current) setError(observationError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }

  useEffect(() => {
    function onKey(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        if (formMode && !submitting) {
          const form = document.getElementById('observation-form')
          if (form) form.requestSubmit()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [formMode, submitting])

  if (!canRead) {
    return (
      <div className="min-h-svh bg-[#F7FAFF] font-sans text-xs text-frappe-dark flex flex-col">
        <DocTypePageHead
          breadcrumbs={['Pédagogie', 'Observations']}
          title="Observations pédagogiques"
          docstatus="Draft"
        />
        <div className="flex-1 p-8">
          <div className="rounded border border-rose-200 bg-rose-50 p-6 max-w-md">
            <h2 className="text-sm font-semibold text-rose-800">Accès restreint</h2>
            <p className="mt-1 text-xs text-rose-700">
              Vous ne disposez pas de la permission <code className="font-mono text-2xs">PERM_READ_OBSERVATION</code> requise pour consulter les observations pédagogiques.
            </p>
            <p className="mt-3 text-2xs text-rose-600">
              Contactez l’équipe habilitée pour faire attribuer cette permission à votre rôle.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#F7FAFF] font-sans text-xs text-frappe-dark flex flex-col">
      <DocTypePageHead
        breadcrumbs={['Pédagogie', 'Observations']}
        title="Observations pédagogiques"
        docstatus="Draft"
        primaryAction={canWrite ? 'Nouvelle observation' : null}
        onPrimaryAction={openCreate}
        secondaryActions={[]}
      />

      <div className="flex-1 overflow-hidden flex">
        <aside className="w-64 shrink-0 border-r border-frappe-border bg-frappe-surface flex flex-col">
          <div className="p-4 border-b border-frappe-border">
            <h3 className="text-2xs font-semibold uppercase tracking-wider text-frappe-muted">Contexte élève</h3>
            <div className="mt-3 space-y-3">
              <label htmlFor="student-id-input" className="block text-2xs font-medium text-frappe-dark">Identifiant élève</label>
              <input
                id="student-id-input"
                type="text"
                value={studentId}
                onChange={handleStudentChange}
                placeholder="Ex: 12"
                className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleLoadStudent}
                disabled={loading || !studentId.trim()}
                className="h-8 w-full items-center justify-center rounded border border-frappe-border bg-white px-3 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement…' : 'Charger les observations'}
              </button>
              {resolvedStudentId && (
                <div className="pt-3 border-t border-frappe-border">
                  <p className="text-2xs font-medium text-frappe-dark">Élève #{resolvedStudentId}</p>
                  <p className="mt-1 text-2xs text-frappe-muted">
                    {canWrite ? 'Créer et modifier des observations.' : 'Lecture seule (écriture non autorisée).'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {!resolvedStudentId && (
            <div className="rounded border border-frappe-border bg-white p-6 max-w-md">
              <h2 className="text-sm font-semibold text-frappe-dark">Sélectionner un élève</h2>
              <p className="mt-1 text-2xs text-frappe-muted">
                Saisissez l’identifiant de l’élève pour consulter ses observations pédagogiques.
              </p>
              <p className="mt-3 text-2xs text-frappe-muted">
                Aucun appel de listage d’élèves n’est effectué côté client : l’autorisation est vérifiée par le backend à chaque requête.
              </p>
            </div>
          )}

          {resolvedStudentId && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-frappe-dark">Observations de l’élève #{resolvedStudentId}</h2>
                  <p className="mt-0.5 text-2xs text-frappe-muted">
                    {observations.length} observation{observations.length > 1 ? 's' : ''} trouvée{observations.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2">
                  <select
                    value={String(pagination.size)}
                    onChange={(e) => setPagination({ ...pagination, size: Number(e.target.value), page: 0 })}
                    className="h-8 rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A]"
                  >
                    {PAGE_SIZES.map((s) => (
                      <option key={s} value={s}>{s} / page</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-2xs font-medium text-frappe-muted mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    placeholder="Toutes"
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-frappe-muted mb-1">Niveau</label>
                  <select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A]"
                  >
                    <option value="">Tous</option>
                    <option value="POSITIVE">Positif</option>
                    <option value="NEUTRAL">Neutre</option>
                    <option value="CONCERNING">Inquiétant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-medium text-frappe-muted mb-1">Source</label>
                  <select
                    value={filters.source}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A]"
                  >
                    <option value="">Toutes</option>
                    <option value="TEACHER">Enseignant</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleFilterChange('from', '')
                      handleFilterChange('to', '')
                    }}
                    className="h-8 w-8 rounded border border-frappe-border bg-white text-frappe-muted hover:text-frappe-dark disabled:opacity-50"
                    disabled={!filters.from && !filters.to}
                    title="Réinitialiser les dates"
                  >
                    ↺
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-medium text-frappe-muted mb-1">Du</label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-frappe-muted mb-1">Au</label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A]"
                  />
                </div>
              </div>

              <div className="rounded border border-frappe-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-frappe-hover border-b border-frappe-border text-2xs font-semibold text-frappe-muted uppercase">
                      <th className="px-3 py-2.5">Catégorie</th>
                      <th className="px-3 py-2.5">Niveau</th>
                      <th className="px-3 py-2.5">Source</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Contenu</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-frappe-border">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                          Chargement des observations…
                        </td>
                      </tr>
                    )}
                    {!loading && observations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                          Aucune observation pour cet élève et ces filtres.
                        </td>
                      </tr>
                    )}
                    {!loading && observations.map((obs) => (
                      <tr key={obs.id} className="hover:bg-frappe-hover/50">
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">{obs.category}</td>
                        <td className="px-3 py-2.5 text-xs">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${LEVEL_VARIANTS[obs.level]}`}>
                            {LEVEL_LABELS[obs.level]}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">{SOURCE_LABELS[obs.source]}</td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">{formatDate(obs.date)}</td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark truncate max-w-[200px]" title={obs.content}>
                          {obs.content}
                        </td>
                        <td className="px-3 py-2.5 text-right text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            {canWrite && (
                              <button
                                type="button"
                                onClick={() => openEdit(obs)}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-frappe-border bg-white text-frappe-dark hover:bg-frappe-hover cursor-pointer"
                                title="Modifier"
                                aria-label="✎"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                            )}
                            {canWrite && (
                              <button
                                type="button"
                                onClick={() => handleDelete(obs.id)}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Supprimer"
                                aria-label="🗑️"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalElements > 0 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-2xs text-frappe-muted">
                    {pagination.page * pagination.size + 1} – {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} sur {pagination.totalElements}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(0, pagination.page - 1))}
                      disabled={pagination.page === 0}
                      className="h-7 w-7 rounded border border-frappe-border bg-white text-xs text-frappe-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.page + 1))}
                      disabled={pagination.page >= pagination.totalPages - 1}
                      className="h-7 w-7 rounded border border-frappe-border bg-white text-xs text-frappe-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded border border-rose-200 bg-rose-50 p-3">
              <p className="text-2xs text-rose-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-2xs text-emerald-700">{success}</p>
            </div>
          )}

          {formMode && canWrite && (
            <div className="mt-4 rounded border border-frappe-border bg-white p-4 sm:p-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-frappe-dark mb-3">
                {formMode === 'create' ? 'Nouvelle observation' : 'Modifier l’observation'}
              </h3>
              <form
                id="observation-form"
                onSubmit={handleSubmit}
                noValidate
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                <div className="col-span-1 sm:col-span-2">
                  <label htmlFor="form-student-id" className="block text-2xs font-medium text-frappe-muted mb-1">Élève</label>
                  <input
                    id="form-student-id"
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleFormChange('studentId', e.target.value)}
                    disabled={formMode === 'edit'}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs disabled:bg-frappe-hover focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
                  />
                  {formErrors.studentId && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.studentId}</p>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <label className="block text-2xs font-medium text-frappe-muted mb-1">Matière (optionnel)</label>
                  <input
                    type="text"
                    value={formData.subjectId}
                    onChange={(e) => handleFormChange('subjectId', e.target.value)}
                    placeholder="ID matière"
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
                  />
                  {formErrors.subjectId && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.subjectId}</p>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <label htmlFor="form-category" className="block text-2xs font-medium text-frappe-muted mb-1">Catégorie</label>
                  <input
                    id="form-category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
                  />
                  {formErrors.category && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.category}</p>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <label htmlFor="form-level" className="block text-2xs font-medium text-frappe-muted mb-1">Niveau</label>
                  <select
                    id="form-level"
                    value={formData.level}
                    onChange={(e) => handleFormChange('level', e.target.value)}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A]"
                  >
                    <option value="">—</option>
                    <option value="POSITIVE">Positif</option>
                    <option value="NEUTRAL">Neutre</option>
                    <option value="CONCERNING">Inquiétant</option>
                  </select>
                  {formErrors.level && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.level}</p>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <label htmlFor="form-date" className="block text-2xs font-medium text-frappe-muted mb-1">Date</label>
                  <input
                    id="form-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A]"
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.date}</p>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="form-content" className="block text-2xs font-medium text-frappe-muted mb-1">Contenu</label>
                  <textarea
                    id="form-content"
                    value={formData.content}
                    onChange={(e) => handleFormChange('content', e.target.value)}
                    rows={4}
                    className="h-24 w-full rounded border border-frappe-border bg-white px-2.5 py-2 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
                  />
                  <p className="mt-1 text-2xs text-frappe-muted">Max 5000 caractères</p>
                  {formErrors.content && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.content}</p>
                  )}
                </div>

                <div className="col-span-full flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    className="h-8 rounded border border-frappe-border bg-white px-3.5 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover disabled:opacity-60"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-8 rounded bg-[#0F172A] px-3.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(16,89,220,0.17)] hover:bg-[#1E293B] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Enregistrement…' : `Enregistrer (Ctrl+S)`}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export const ObservationsPage = ObservationsView
export default ObservationsView
