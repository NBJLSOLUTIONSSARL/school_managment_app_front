import { useCallback, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import { useAuth } from '../auth/AuthContext'
import DocTypePageHead from '../components/DocTypePageHead'
import {
  recordConsent,
  consentError,
  listConsents,
  revokeConsent,
} from '../api/aiConsentsApi'

const consentSchema = yup.object({
  studentId: yup
    .number()
    .transform((value) => (value === '' || value === null || value === undefined ? value : Number(value)))
    .typeError("L'identifiant élève est requis.")
    .positive("L'identifiant élève doit être positif.")
    .required("L'élève est requis."),
  granted: yup
    .boolean()
    .required("Le choix d'accord est requis."),
})

const PAGE_SIZES = [10, 20, 50]

function formatDate(value) {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (match) return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return dateMatch ? `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}` : value
}

export default function ConsentsPage() {
  const { request, hasPermission } = useAuth()
  const canRead = hasPermission('PERM_READ_CONSENT')
  const canWrite = hasPermission('PERM_WRITE_CONSENT')

  const [studentId, setStudentId] = useState('')
  const [resolvedStudentId, setResolvedStudentId] = useState(null)

  const [consents, setConsents] = useState([])
  const [pagination, setPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formMode, setFormMode] = useState(null)
  const [formData, setFormData] = useState({
    studentId: '',
    granted: false,
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const generation = useRef(0)

  const loadConsents = useCallback(async () => {
    if (!canRead) return
    const id = Number(resolvedStudentId)
    if (!Number.isSafeInteger(id) || id <= 0) return
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      const result = await listConsents(request, id, {
        page: pagination.page,
        size: pagination.size,
      })
      if (operation === generation.current) {
        setConsents(result.content)
        setPagination(result)
      }
    } catch (failure) {
      if (operation === generation.current) setError(consentError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }, [request, canRead, resolvedStudentId, pagination.page, pagination.size])

  useEffect(() => {
    if (resolvedStudentId) {
      queueMicrotask(() => loadConsents())
    }
  }, [loadConsents, resolvedStudentId])

  const handleStudentChange = (event) => {
    setStudentId(event.target.value)
    setResolvedStudentId(null)
    setConsents([])
    setError('')
    setSuccess('')
  }

  const handleLoadStudent = () => {
    const id = Number(studentId)
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("L'identifiant élève doit être un nombre positif.")
      return
    }
    setResolvedStudentId(id)
    setError('')
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const openForm = () => {
    if (!canWrite) return
    setFormMode('record')
    setFormData({
      studentId: resolvedStudentId ? String(resolvedStudentId) : '',
      granted: false,
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
      validated = await consentSchema.validate(formData, { abortEarly: false })
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

    const operation = ++generation.current
    setSubmitting(true)
    try {
      await recordConsent(request, {
        studentId: Number(validated.studentId),
        granted: validated.granted,
      })

      if (operation === generation.current) {
        setSuccess(validated.granted ? 'Consentement accordé.' : 'Consentement révoqué.')
        closeForm()
        loadConsents()
      }
    } catch (failure) {
      if (operation === generation.current) setError(consentError(failure))
    } finally {
      if (operation === generation.current) setSubmitting(false)
    }
  }

  const handleRevoke = async (id) => {
    if (!canWrite) return
    if (!window.confirm('Révoquer ce consentement IA ?')) return
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      await revokeConsent(request, id)
      if (operation === generation.current) {
        setSuccess('Consentement révoqué.')
        loadConsents()
      }
    } catch (failure) {
      if (operation === generation.current) setError(consentError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }

  useEffect(() => {
    function onKey(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        if (formMode && !submitting) {
          const form = document.getElementById('consent-form')
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
          breadcrumbs={['Pédagogie', 'Consentements IA']}
          title="Consentements IA"
          docstatus="Draft"
        />
        <div className="flex-1 p-8">
          <div className="rounded border border-rose-200 bg-rose-50 p-6 max-w-md">
            <h2 className="text-sm font-semibold text-rose-800">Accès restreint</h2>
            <p className="mt-1 text-xs text-rose-700">
              Vous ne disposez pas de la permission <code className="font-mono text-2xs">PERM_READ_CONSENT</code> requise pour consulter les consentements IA.
            </p>
            <p className="mt-3 text-2xs text-rose-600">
              Contactez l'équipe habilitée pour faire attribuer cette permission à votre rôle.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#F7FAFF] font-sans text-xs text-frappe-dark flex flex-col">
      <DocTypePageHead
        breadcrumbs={['Pédagogie', 'Consentements IA']}
        title="Consentements IA"
        docstatus="Draft"
        primaryAction={canWrite ? 'Gérer le consentement' : null}
        onPrimaryAction={openForm}
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
                className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleLoadStudent}
                disabled={loading || !studentId.trim()}
                className="h-8 w-full items-center justify-center rounded border border-frappe-border bg-white px-3 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement…' : 'Charger les consentements'}
              </button>
              {resolvedStudentId && (
                <div className="pt-3 border-t border-frappe-border">
                  <p className="text-2xs font-medium text-frappe-dark">Élève #{resolvedStudentId}</p>
                  <p className="mt-1 text-2xs text-frappe-muted">
                    {canWrite ? 'Accorder ou révoquer le consentement.' : 'Lecture seule (écriture non autorisée).'}
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
                Saisissez l'identifiant de l'élève pour gérer son consentement IA.
              </p>
              <p className="mt-3 text-2xs text-frappe-muted">
                Aucun appel de listage d'élèves n'est effectué côté client : l'autorisation est vérifiée par le backend à chaque requête.
              </p>
            </div>
          )}

          {resolvedStudentId && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-frappe-dark">Consentements de l'élève #{resolvedStudentId}</h2>
                  <p className="mt-0.5 text-2xs text-frappe-muted">
                    {consents.length} consentement{consents.length > 1 ? 's' : ''} trouvé{consents.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2">
                  <select
                    value={String(pagination.size)}
                    onChange={(e) => setPagination({ ...pagination, size: Number(e.target.value), page: 0 })}
                    className="h-8 rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6]"
                  >
                    {PAGE_SIZES.map((s) => (
                      <option key={s} value={s}>{s} / page</option>
                    ))}
                  </select>
                </div>
              </div>

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

              <div className="rounded border border-frappe-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-frappe-hover border-b border-frappe-border text-2xs font-semibold text-frappe-muted uppercase">
                      <th className="px-3 py-2.5">Élève</th>
                      <th className="px-3 py-2.5">Tuteur</th>
                      <th className="px-3 py-2.5">Accordé</th>
                      <th className="px-3 py-2.5">Date d'accord</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-frappe-border">
                    {loading && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                          Chargement des consentements…
                        </td>
                      </tr>
                    )}
                    {!loading && consents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                          Aucun consentement enregistré pour cet élève.
                        </td>
                      </tr>
                    )}
                    {!loading && consents.map((consent) => (
                      <tr key={consent.id} className="hover:bg-frappe-hover/50">
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">#{consent.studentId}</td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">Tuteur #{consent.guardianId}</td>
                        <td className="px-3 py-2.5 text-xs">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${
                            consent.granted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {consent.granted ? 'Oui' : 'Non'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">{formatDate(consent.grantedAt)}</td>
                        <td className="px-3 py-2.5 text-right text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            {canWrite && consent.granted && (
                              <button
                                type="button"
                                onClick={() => handleRevoke(consent.id)}
                                className="h-7 w-7 rounded border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                                title="Révoquer le consentement"
                              >
                                🗑️
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

          {formMode && canWrite && (
            <div className="mt-4 rounded border border-frappe-border bg-white p-4 sm:p-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-frappe-dark mb-3">Gérer le consentement IA</h3>
              <form
                id="consent-form"
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
                    disabled
                    className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs disabled:bg-frappe-hover focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10"
                  />
                  {formErrors.studentId && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.studentId}</p>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <input
                      id="form-granted"
                      type="checkbox"
                      checked={formData.granted}
                      onChange={(e) => handleFormChange('granted', e.target.checked)}
                      className="h-4 w-4 rounded border border-frappe-border bg-white text-[#0062e9] focus:ring-1 focus:ring-[#0062e9] shadow-2xs"
                    />
                    <label htmlFor="form-granted" className="text-xs text-frappe-dark">
                      J'autorise l'analyse pédagogique IA des données de cet élève
                    </label>
                  </div>
                  {formErrors.granted && (
                    <p className="mt-1 text-2xs text-rose-600">{formErrors.granted}</p>
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
                    className="h-8 rounded bg-[#1059DC] px-3.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(16,89,220,0.17)] hover:bg-[#084AC3] disabled:opacity-60 disabled:cursor-not-allowed"
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
