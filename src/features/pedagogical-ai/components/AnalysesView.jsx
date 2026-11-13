import { useCallback, useEffect, useRef, useState } from 'react'
import { Eye, Check, X, Megaphone, ShieldAlert, ShieldCheck, Lock } from 'lucide-react'
import * as yup from 'yup'
import { useAuth } from '@/features/auth'
import DocTypePageHead from '@/components/ui/DocTypePageHead'
import {
  analysisError,
  generateAnalysis,
  listAnalyses,
  listGenerationLogs,
  publishAnalysis,
  rejectAnalysis,
  validateAnalysis,
} from '../api/aiAnalysesApi'
import { listConsents } from '../api/aiConsentsApi'

const rejectionSchema = yup.object({
  reason: yup
    .string()
    .trim()
    .required('Un motif de rejet est requis.')
    .min(5, 'Le motif doit contenir au moins 5 caractères.')
    .max(1000, 'Le motif ne peut pas dépasser 1000 caractères.'),
})

const STATUS_LABELS = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
}

const STATUS_VARIANTS = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  VALIDATED: 'border-amber-200 bg-amber-50 text-amber-700',
  PUBLISHED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
}

const PAGE_SIZES = [10, 20, 50]

function formatDate(value) {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ]?(\d{2}):(\d{2})?/.exec(value)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  const match2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match2) return `${match2[3]}/${match2[2]}/${match2[1]}`
  return value
}

export function AnalysesView() {
  const { request, hasPermission } = useAuth()
  const canRead = hasPermission('PERM_READ_ANALYSIS')
  const canGenerate = hasPermission('PERM_GENERATE_ANALYSIS')
  const canValidate = hasPermission('PERM_VALIDATE_ANALYSIS')
  const canPublish = hasPermission('PERM_PUBLISH_ANALYSIS')
  const canReadLog = hasPermission('PERM_READ_LOG')
  const canReadConsent = hasPermission('PERM_READ_CONSENT')

  const [studentId, setStudentId] = useState('')
  const [resolvedStudentId, setResolvedStudentId] = useState(null)
  const [termId, setTermId] = useState('')
  const [resolvedTermId, setResolvedTermId] = useState(null)

  const [analyses, setAnalyses] = useState([])
  const [pagination, setPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [generationLogs, setGenerationLogs] = useState([])
  const [logsPagination, setLogsPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })
  const [logsLoading, setLogsLoading] = useState(false)

  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const [consentStatus, setConsentStatus] = useState(null)

  const generation = useRef(0)

  const loadConsentStatus = useCallback(async (sId) => {
    if (!canReadConsent) return
    const numId = Number(sId)
    if (!Number.isSafeInteger(numId) || numId <= 0) {
      setConsentStatus(null)
      return
    }
    try {
      const res = await listConsents(request, numId, { page: 0, size: 10 })
      const hasActive = res.content.some((c) => c.granted === true && c.grantedAt != null)
      const hasRevoked = res.content.some((c) => c.granted === false)
      if (hasActive) {
        setConsentStatus('granted')
      } else if (hasRevoked) {
        setConsentStatus('revoked')
      } else {
        setConsentStatus('missing')
      }
    } catch {
      setConsentStatus(null)
    }
  }, [request, canReadConsent])

  const loadAnalyses = useCallback(async () => {
    if (!canRead) return
    const student = Number(resolvedStudentId)
    if (!Number.isSafeInteger(student) || student <= 0) return
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      const result = await listAnalyses(request, student, {
        page: pagination.page,
        size: pagination.size,
      })
      if (operation === generation.current) {
        setAnalyses(result.content)
        setPagination(result)
        setError('')
      }
    } catch (failure) {
      if (operation === generation.current) setError(analysisError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }, [request, canRead, resolvedStudentId, pagination.page, pagination.size])

  useEffect(() => {
    if (resolvedStudentId) {
      queueMicrotask(() => {
        loadAnalyses()
        loadConsentStatus(resolvedStudentId)
      })
    }
  }, [loadAnalyses, loadConsentStatus, resolvedStudentId])

  useEffect(() => {
    const handler = (e) => {
      const changedStudentId = e.detail?.studentId
      if (resolvedStudentId && (changedStudentId == null || Number(changedStudentId) === Number(resolvedStudentId))) {
        loadConsentStatus(resolvedStudentId)
        loadAnalyses()
      }
    }
    window.addEventListener('edutrack:consent-changed', handler)
    return () => window.removeEventListener('edutrack:consent-changed', handler)
  }, [resolvedStudentId, loadConsentStatus, loadAnalyses])

  const handleStudentChange = (event) => {
    setStudentId(event.target.value)
    setResolvedStudentId(null)
    setAnalyses([])
    setError('')
    setSuccess('')
    setSelectedAnalysis(null)
  }

  const handleLoadStudent = () => {
    const id = Number(studentId)
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('L’identifiant élève doit être un nombre positif.')
      return
    }
    setResolvedStudentId(id)
    setError('')
  }

  const handleTermChange = (event) => {
    setTermId(event.target.value)
    setResolvedTermId(null)
  }

  const handleLoadTerm = () => {
    const id = Number(termId)
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('L’identifiant de période doit être un nombre positif.')
      return
    }
    setResolvedTermId(id)
    setError('')
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const isConsentRestricted = consentStatus === 'revoked' || consentStatus === 'missing'
  const canGenerateAnalysis = canGenerate
    && resolvedStudentId != null
    && resolvedTermId != null
    && !isConsentRestricted

  const handleGenerate = async () => {
    if (!canGenerateAnalysis) return
    if (isConsentRestricted) {
      setError('Consentement parental requis : la génération est bloquée tant que le consentement est manquant ou révoqué.')
      return
    }
    const operation = ++generation.current
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await generateAnalysis(request, {
        studentId: resolvedStudentId,
        termId: resolvedTermId,
      })
      if (operation === generation.current) {
        setSuccess('Analyse générée avec succès. Une stratégie d’apprentissage a été créée par le backend.')
        setSelectedAnalysis(null)
        loadAnalyses()
      }
    } catch (failure) {
      if (operation === generation.current) setError(analysisError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }

  const openDetail = (analysis) => {
    setSelectedAnalysis(analysis)
    setGenerationLogs([])
    setLogsLoading(false)
    if (canReadLog) {
      loadLogs(analysis.id)
    }
  }

  const loadLogs = useCallback(async (id) => {
    if (!canReadLog) return
    setLogsLoading(true)
    try {
      const result = await listGenerationLogs(request, id, {
        page: logsPagination.page,
        size: logsPagination.size,
      })
      setGenerationLogs(result.content)
      setLogsPagination(result)
    } catch (failure) {
      setError(analysisError(failure))
    } finally {
      setLogsLoading(false)
    }
  }, [request, canReadLog, logsPagination.page, logsPagination.size])

  const handleValidate = async (id) => {
    if (!canValidate) return
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      await validateAnalysis(request, id)
      if (operation === generation.current) {
        setSuccess('Analyse validée.')
        setSelectedAnalysis(null)
        loadAnalyses()
      }
    } catch (failure) {
      if (operation === generation.current) setError(analysisError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }

  const openReject = (id) => {
    setShowRejectForm(true)
    setRejectReason('')
    setRejectError('')
    setSelectedAnalysis(null)
    const selected = analyses.find((a) => a.id === id)
    if (selected) setSelectedAnalysis(selected)
  }

  const handleReject = async (id) => {
    setRejectError('')
    try {
      rejectionSchema.validateSync({ reason: rejectReason }, { abortEarly: false })
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const reasonError = validationError.inner?.find((i) => i.path === 'reason')
        setRejectError(reasonError ? reasonError.message : validationError.message)
      }
      return
    }
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      await rejectAnalysis(request, id, rejectReason)
      if (operation === generation.current) {
        setSuccess('Analyse rejetée.')
        setShowRejectForm(false)
        setRejectReason('')
        setSelectedAnalysis(null)
        loadAnalyses()
      }
    } catch (failure) {
      if (operation === generation.current) setError(analysisError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }

  const handlePublish = async (id) => {
    if (!canPublish) return
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      await publishAnalysis(request, id)
      if (operation === generation.current) {
        setSuccess('Analyse publiée.')
        setSelectedAnalysis(null)
        loadAnalyses()
      }
    } catch (failure) {
      if (operation === generation.current) setError(analysisError(failure))
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }

  const canViewDetail = canRead
  const canValidateAction = (analysis) => canValidate && analysis.status === 'DRAFT'
  const canRejectAction = (analysis) => canValidate && analysis.status === 'DRAFT'
  const canPublishAction = (analysis) => canPublish && analysis.status === 'VALIDATED'

  if (!canRead) {
    return (
      <div className="min-h-svh bg-[#F7FAFF] font-sans text-xs text-frappe-dark flex flex-col">
        <DocTypePageHead
          breadcrumbs={['Pédagogie', 'Analyses']}
          title="Analyses pédagogiques"
          docstatus="Draft"
        />
        <div className="flex-1 p-8">
          <div className="rounded border border-rose-200 bg-rose-50 p-6 max-w-md">
            <h2 className="text-sm font-semibold text-rose-800">Accès restreint</h2>
            <p className="mt-1 text-xs text-rose-700">
              Vous ne disposez pas de la permission <code className="font-mono text-2xs">PERM_READ_ANALYSIS</code> requise pour consulter les analyses pédagogiques.
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
        breadcrumbs={['Pédagogie', 'Analyses']}
        title="Analyses pédagogiques"
        docstatus="Draft"
      />

      <div className="flex-1 overflow-hidden flex">
        <aside className="w-80 shrink-0 border-r border-frappe-border bg-frappe-surface flex flex-col">
          <div className="p-4 border-b border-frappe-border">
            <h3 className="text-2xs font-semibold uppercase tracking-wider text-frappe-muted">Contexte</h3>
            <div className="mt-3 space-y-3">
              <label htmlFor="analysis-student-id" className="block text-2xs font-medium text-frappe-dark">Identifiant élève</label>
              <input
                id="analysis-student-id"
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
                {loading ? 'Chargement…' : 'Charger'}
              </button>
              {resolvedStudentId && (
                <div className="pt-3 border-t border-frappe-border">
                  <p className="text-2xs font-medium text-frappe-dark">Élève #{resolvedStudentId}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-b border-frappe-border">
            <h3 className="text-2xs font-semibold uppercase tracking-wider text-frappe-muted">Période pédagogique</h3>
            <div className="mt-3 space-y-3">
              <label htmlFor="analysis-term-id" className="block text-2xs font-medium text-frappe-dark">Identifiant période</label>
              <input
                id="analysis-term-id"
                type="text"
                value={termId}
                onChange={handleTermChange}
                placeholder="Ex: 1"
                className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleLoadTerm}
                disabled={loading || !termId.trim()}
                className="h-8 w-full items-center justify-center rounded border border-frappe-border bg-white px-3 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Charger
              </button>
              {resolvedTermId && (
                <div className="pt-3 border-t border-frappe-border">
                  <p className="text-2xs font-medium text-frappe-dark">Période #{resolvedTermId}</p>
                </div>
              )}
            </div>
          </div>

          {canGenerate && (
            <div className="p-4 border-t border-frappe-border">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-frappe-muted">Génération</h3>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canGenerateAnalysis || loading}
                  className="h-8 w-full items-center justify-center rounded border border-[#0F172A] bg-[#0F172A] px-3 text-xs font-medium text-white shadow-[0_8px_20px_rgba(16,89,220,0.17)] hover:bg-[#1E293B] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Génération…' : 'Générer l’analyse'}
                </button>
                {isConsentRestricted && (
                  <div className="rounded border border-amber-200 bg-amber-50 p-2 text-2xs text-amber-800 flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {consentStatus === 'revoked'
                        ? 'Génération bloquée : consentement parental révoqué.'
                        : 'Génération bloquée : consentement parental manquant.'}
                    </span>
                  </div>
                )}
                <p className="text-2xs text-frappe-muted">
                  Nécessite PERM_GENERATE_ANALYSIS, un consentement parental valide, des observations existantes et un fournisseur IA configuré.
                </p>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="rounded border border-rose-200 bg-rose-50 p-3 mb-4">
              <p className="text-2xs text-rose-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3 mb-4">
              <p className="text-2xs text-emerald-700">{success}</p>
            </div>
          )}

          {!resolvedStudentId && (
            <div className="rounded border border-frappe-border bg-white p-6 max-w-md">
              <h2 className="text-sm font-semibold text-frappe-dark">Sélectionner un élève</h2>
              <p className="mt-1 text-2xs text-frappe-muted">
                Saisissez l’identifiant de l’élève pour consulter ses analyses pédagogiques.
              </p>
            </div>
          )}

          {resolvedStudentId && (
            <div className="space-y-4">
              {consentStatus === 'granted' && (
                <div className="rounded border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-2xs font-medium text-emerald-800">
                      Consentement parental actif pour l’analyse IA
                    </span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Actif
                  </span>
                </div>
              )}
              {consentStatus === 'revoked' && (
                <div className="rounded border border-amber-300 bg-amber-50 px-3.5 py-2.5 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900">Consentement parental révoqué</p>
                    <p className="text-2xs text-amber-800 mt-0.5">
                      Le consentement parental pour cet élève a été révoqué. La génération de nouvelles analyses et la consultation détaillée sont restreintes.
                    </p>
                  </div>
                </div>
              )}
              {consentStatus === 'missing' && (
                <div className="rounded border border-slate-200 bg-slate-50 px-3.5 py-2.5 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Consentement parental manquant</p>
                    <p className="text-2xs text-slate-600 mt-0.5">
                      Aucun consentement parental actif n'a été enregistré pour cet élève. L'accord préalable d'un représentant légal est requis.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-frappe-dark">Analyses de l’élève #{resolvedStudentId}</h2>
                  <p className="mt-0.5 text-2xs text-frappe-muted">
                    {analyses.length} analyse{analyses.length > 1 ? 's' : ''}
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

              <div className="rounded border border-frappe-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-frappe-hover border-b border-frappe-border text-2xs font-semibold text-frappe-muted uppercase">
                      <th className="px-3 py-2.5">Élève</th>
                      <th className="px-3 py-2.5">Période</th>
                      <th className="px-3 py-2.5">Statut</th>
                      <th className="px-3 py-2.5">Modèle</th>
                      <th className="px-3 py-2.5">Généré le</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-frappe-border">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                          Chargement des analyses…
                        </td>
                      </tr>
                    )}
                    {!loading && analyses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                          Aucune analyse pour cet élève et cette période.
                        </td>
                      </tr>
                    )}
                    {!loading && analyses.map((analysis) => (
                      <tr key={analysis.id} className="hover:bg-frappe-hover/50">
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">
                          {analysis.studentName || (
                            <span className="font-medium">Élève #{analysis.studentId}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">
                          Période #{analysis.termId}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${STATUS_VARIANTS[analysis.status]}`}>
                            {STATUS_LABELS[analysis.status]}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">
                          {analysis.model}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-frappe-dark">
                          {formatDate(analysis.generatedAt)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            {canViewDetail && (
                              <button
                                type="button"
                                onClick={() => openDetail(analysis)}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-frappe-border bg-white text-frappe-dark hover:bg-frappe-hover cursor-pointer"
                                title="Voir le détail"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                            )}
                            {canValidateAction(analysis) && (
                              <button
                                type="button"
                                onClick={() => handleValidate(analysis.id)}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 cursor-pointer"
                                title="Valider"
                              >
                                <Check className="w-3.5 h-3.5 text-amber-700" />
                              </button>
                            )}
                            {canRejectAction(analysis) && (
                              <button
                                type="button"
                                onClick={() => openReject(analysis.id)}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Rejeter"
                                aria-label="✖"
                              >
                                <X className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            )}
                            {canPublish && (
                              <button
                                type="button"
                                onClick={() => handlePublish(analysis.id)}
                                disabled={!canPublishAction(analysis) || loading}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                title="Publier"
                              >
                                <Megaphone className="w-3.5 h-3.5 text-emerald-700" />
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

          {selectedAnalysis && (
            <div className="mt-4 rounded border border-frappe-border bg-white p-4 sm:p-6 max-w-3xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-frappe-dark">Détail de l’analyse #{selectedAnalysis.id}</h3>
                  <p className="mt-0.5 text-2xs text-frappe-muted">
                    Générée le {formatDate(selectedAnalysis.generatedAt)} • Modèle {selectedAnalysis.model}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAnalysis(null)}
                  className="h-7 w-7 rounded border border-frappe-border bg-white text-frappe-dark hover:bg-frappe-hover"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>

              <div className="rounded border border-frappe-border bg-frappe-hover p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${STATUS_VARIANTS[selectedAnalysis.status]}`}>
                    {STATUS_LABELS[selectedAnalysis.status]}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-2xs text-frappe-muted">Élève</p>
                    <p className="text-xs font-medium">#{selectedAnalysis.studentId}</p>
                  </div>
                  <div>
                    <p className="text-2xs text-frappe-muted">Période</p>
                    <p className="text-xs font-medium">#{selectedAnalysis.termId}</p>
                  </div>
                  <div>
                    <p className="text-2xs text-frappe-muted">Généré le</p>
                    <p className="text-xs font-medium">{formatDate(selectedAnalysis.generatedAt)}</p>
                  </div>
                  {selectedAnalysis.validatedAt && (
                    <div>
                      <p className="text-2xs text-frappe-muted">Validé le</p>
                      <p className="text-xs font-medium">{formatDate(selectedAnalysis.validatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {isConsentRestricted ? (
                <div className="rounded border border-amber-300 bg-amber-50 p-5 text-center">
                  <Lock className="w-5 h-5 text-amber-700 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-amber-900">Diagnostic protégé verrouillé</p>
                  <p className="text-2xs text-amber-800 mt-1 max-w-sm mx-auto">
                    {consentStatus === 'revoked'
                      ? 'Le consentement parental pour cet élève est révoqué. Les informations pédagogiques détaillées sont masquées conformément aux règles de protection des données.'
                      : 'Aucun consentement parental actif n\'a été enregistré pour cet élève. Les informations pédagogiques détaillées sont masquées jusqu\'à l\'obtention du consentement.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xs font-semibold text-frappe-muted uppercase mb-1">Résumé</p>
                    <div className="rounded border border-frappe-border bg-white p-2 text-xs">
                      {selectedAnalysis.summary}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xs font-semibold text-frappe-muted uppercase mb-1">Forces</p>
                    <div className="rounded border border-frappe-border bg-white p-2 text-xs">
                      {selectedAnalysis.strengths}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-2xs font-semibold text-frappe-muted uppercase mb-1">Difficultés</p>
                    <div className="rounded border border-frappe-border bg-white p-2 text-xs">
                      {selectedAnalysis.difficulties}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-2xs font-semibold text-frappe-muted uppercase mb-1">Tendances</p>
                    <div className="rounded border border-frappe-border bg-white p-2 text-xs">
                      {selectedAnalysis.trends}
                    </div>
                  </div>
                </div>
              )}

              {canReadLog && (
                <div className="mt-4 rounded border border-frappe-border bg-white p-3">
                  <h3 className="text-sm font-semibold text-frappe-dark mb-2">Journaux de génération</h3>
                  {logsLoading && (
                    <p className="text-2xs text-frappe-muted">Chargement des journaux…</p>
                  )}
                  {!logsLoading && generationLogs.length === 0 && (
                    <p className="text-2xs text-frappe-muted">Aucun journal de génération.</p>
                  )}
                  {!logsLoading && generationLogs.length > 0 && (
                    <ul className="text-xs text-frappe-dark">
                      {generationLogs.map((log, idx) => (
                        <li key={idx} className="mb-1">
                          <span className="text-frappe-muted">{log.timestamp || ''}</span>{' '}
                          {log.message || ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {showRejectForm && selectedAnalysis && canRejectAction(selectedAnalysis) && (
            <div className="mt-4 rounded border border-frappe-border bg-white p-4 sm:p-6 max-w-md">
              <h3 className="text-sm font-semibold text-frappe-dark mb-3">Rejeter l’analyse #{selectedAnalysis.id}</h3>
              {rejectError && (
                <p className="mt-1 text-2xs text-rose-600">{rejectError}</p>
              )}
              <div className="mt-3">
                <label htmlFor="reject-reason" className="block text-2xs font-medium text-frappe-muted mb-1">Motif du rejet</label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="h-24 w-full rounded border border-frappe-border bg-white px-2.5 py-2 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
                />
                <p className="mt-1 text-2xs text-frappe-muted">Min 5 caractères, max 1000.</p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowRejectForm(false); setRejectReason('') }}
                  className="h-8 rounded border border-frappe-border bg-white px-3.5 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(selectedAnalysis.id)}
                  disabled={loading}
                  className="h-8 rounded border border-rose-200 bg-rose-50 px-3.5 text-xs font-medium text-rose-700 shadow-2xs hover:bg-rose-100 disabled:opacity-60"
                >
                  {loading ? 'Rejet en cours…' : 'Rejeter'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export const AnalysesPage = AnalysesView
export default AnalysesView
