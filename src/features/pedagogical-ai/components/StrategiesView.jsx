import { useCallback, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import { useAuth } from '@/features/auth'
import DocTypePageHead from '@/components/ui/DocTypePageHead'
import {
  createLearningStrategy,
  getLearningStrategy,
  listFollowUpActions,
  strategyError,
  updateLearningStrategy,
} from '../api/learningStrategiesApi'

const strategySchema = yup.object({
  goals: yup
    .string()
    .trim()
    .required('Les objectifs sont requis.')
    .min(5, 'Les objectifs doivent contenir au moins 5 caractères.')
    .max(10000, 'Les objectifs ne peuvent pas dépasser 10 000 caractères.'),
  recommendations: yup
    .string()
    .trim()
    .required('Les recommandations sont requises.')
    .min(5, 'Les recommandations doivent contenir au moins 5 caractères.')
    .max(10000, 'Les recommandations ne peuvent pas dépasser 10 000 caractères.'),
  parentAdvice: yup
    .string()
    .trim()
    .required('Les conseils aux parents sont requis.')
    .min(5, 'Les conseils aux parents doivent contenir au moins 5 caractères.')
    .max(10000, 'Les conseils aux parents ne peuvent pas dépasser 10 000 caractères.'),
  studentAdvice: yup
    .string()
    .trim()
    .required('Les conseils à l’élève sont requis.')
    .min(5, 'Les conseils à l’élève doivent contenir au moins 5 caractères.')
    .max(10000, 'Les conseils à l’élève ne peuvent pas dépasser 10 000 caractères.'),
})

function formatDate(value) {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

export function StrategiesView() {
  const { request, hasPermission } = useAuth()
  const canRead = hasPermission('PERM_READ_ANALYSIS')
  const canWrite = hasPermission('PERM_WRITE_STRATEGY')

  const [strategyInputId, setStrategyInputId] = useState('')
  const [resolvedStrategyId, setResolvedStrategyId] = useState(null)

  const [strategy, setStrategy] = useState(null)
  const [formData, setFormData] = useState({
    goals: '',
    recommendations: '',
    parentAdvice: '',
    studentAdvice: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const [actions, setActions] = useState([])
  const [actionsPagination, setActionsPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })
  const [actionFilters, setActionFilters] = useState({ done: '', from: '', to: '' })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionsLoading, setActionsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newAnalysisId, setNewAnalysisId] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const generation = useRef(0)

  const loadActions = useCallback(async (strategyId) => {
    if (!canRead) return
    const numericId = Number(strategyId)
    if (!Number.isSafeInteger(numericId) || numericId <= 0) return
    setActionsLoading(true)
    try {
      const doneFilter = actionFilters.done === 'true' ? true : actionFilters.done === 'false' ? false : undefined
      const result = await listFollowUpActions(request, numericId, {
        done: doneFilter,
        from: actionFilters.from || undefined,
        to: actionFilters.to || undefined,
        page: actionsPagination.page,
        size: actionsPagination.size,
      })
      setActions(result.content)
      setActionsPagination(result)
    } catch (failure) {
      setError(strategyError(failure))
    } finally {
      setActionsLoading(false)
    }
  }, [request, canRead, actionFilters, actionsPagination.page, actionsPagination.size])

  const loadStrategy = useCallback(async (id) => {
    if (!canRead) return
    const numericId = Number(id)
    if (!Number.isSafeInteger(numericId) || numericId <= 0) return
    const operation = ++generation.current
    setLoading(true)
    setError('')
    try {
      const result = await getLearningStrategy(request, numericId)
      if (operation === generation.current) {
        setStrategy(result)
        setFormData({
          goals: result.goals || '',
          recommendations: result.recommendations || '',
          parentAdvice: result.parentAdvice || '',
          studentAdvice: result.studentAdvice || '',
        })
        setFormErrors({})
        setError('')
        loadActions(numericId)
      }
    } catch (failure) {
      if (operation === generation.current) {
        setStrategy(null)
        setActions([])
        setError(strategyError(failure))
      }
    } finally {
      if (operation === generation.current) setLoading(false)
    }
  }, [request, canRead, loadActions])

  useEffect(() => {
    if (resolvedStrategyId) {
      queueMicrotask(() => {
        loadStrategy(resolvedStrategyId)
      })
    }
  }, [loadStrategy, resolvedStrategyId])

  const handleIdChange = (e) => {
    setStrategyInputId(e.target.value)
  }

  const handleLoadStrategy = () => {
    const id = Number(strategyInputId)
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('L’identifiant de stratégie doit être un nombre positif.')
      return
    }
    setError('')
    setSuccess('')
    setIsCreatingNew(false)
    setResolvedStrategyId(id)
  }

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!canWrite) return

    setFormErrors({})
    try {
      strategySchema.validateSync(formData, { abortEarly: false })
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const errors = {}
        validationError.inner?.forEach((err) => {
          if (err.path && !errors[err.path]) {
            errors[err.path] = err.message
          }
        })
        setFormErrors(errors)
      }
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (isCreatingNew) {
        const analysisIdNum = Number(newAnalysisId)
        if (!Number.isSafeInteger(analysisIdNum) || analysisIdNum <= 0) {
          setError('Un identifiant d’analyse valide est requis pour créer une stratégie.')
          setSaving(false)
          return
        }
        const created = await createLearningStrategy(request, {
          analysisId: analysisIdNum,
          goals: formData.goals,
          recommendations: formData.recommendations,
          parentAdvice: formData.parentAdvice,
          studentAdvice: formData.studentAdvice,
        })
        setSuccess('Stratégie d’apprentissage créée avec succès.')
        setStrategy(created)
        setResolvedStrategyId(created.id)
        setIsCreatingNew(false)
      } else if (strategy) {
        const updated = await updateLearningStrategy(request, strategy.id, {
          analysisId: strategy.analysisId,
          goals: formData.goals,
          recommendations: formData.recommendations,
          parentAdvice: formData.parentAdvice,
          studentAdvice: formData.studentAdvice,
        })
        setSuccess('Stratégie d’apprentissage mise à jour avec succès.')
        setStrategy(updated)
      }
    } catch (failure) {
      setError(strategyError(failure))
    } finally {
      setSaving(false)
    }
  }

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (canWrite && !saving && (strategy || isCreatingNew)) {
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (!canRead) {
    return (
      <div className="min-h-svh bg-[#F7FAFF] font-sans text-xs text-frappe-dark flex flex-col">
        <DocTypePageHead
          breadcrumbs={['Pédagogie', 'Analyses', 'Stratégies']}
          title="Stratégies d’apprentissage"
          docstatus="Draft"
        />
        <div className="flex-1 p-8">
          <div className="rounded border border-rose-200 bg-rose-50 p-6 max-w-md">
            <h2 className="text-sm font-semibold text-rose-800">Accès restreint</h2>
            <p className="mt-1 text-xs text-rose-700">
              Vous ne disposez pas de la permission <code className="font-mono text-2xs">PERM_READ_ANALYSIS</code> requise pour consulter les stratégies d’apprentissage.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#F7FAFF] font-sans text-xs text-frappe-dark flex flex-col">
      <DocTypePageHead
        breadcrumbs={['Pédagogie', 'Analyses', 'Stratégies']}
        title="Stratégie d’apprentissage"
        docstatus="Draft"
      />

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-80 shrink-0 border-r border-frappe-border bg-frappe-surface flex flex-col">
          <div className="p-4 border-b border-frappe-border">
            <h3 className="text-2xs font-semibold uppercase tracking-wider text-frappe-muted">Recherche de stratégie</h3>
            <div className="mt-3 space-y-3">
              <label htmlFor="strategy-id-input" className="block text-2xs font-medium text-frappe-dark">
                Identifiant de stratégie
              </label>
              <input
                id="strategy-id-input"
                type="text"
                value={strategyInputId}
                onChange={handleIdChange}
                placeholder="Ex: 1"
                className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10"
              />
              <button
                type="button"
                onClick={handleLoadStrategy}
                disabled={loading || !strategyInputId.trim()}
                className="h-8 w-full items-center justify-center rounded border border-frappe-border bg-white px-3 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement…' : 'Charger'}
              </button>
            </div>
          </div>

          {canWrite && (
            <div className="p-4 border-b border-frappe-border">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-frappe-muted">Création manuelle</h3>
              <p className="mt-1 text-2xs text-frappe-muted">
                Normalement générée automatiquement avec l’analyse IA.
              </p>
              <div className="mt-3 space-y-3">
                <label htmlFor="new-analysis-id-input" className="block text-2xs font-medium text-frappe-dark">
                  Identifiant analyse liée
                </label>
                <input
                  id="new-analysis-id-input"
                  type="text"
                  value={newAnalysisId}
                  onChange={(e) => setNewAnalysisId(e.target.value)}
                  placeholder="Ex: 42"
                  className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    const id = Number(newAnalysisId)
                    if (!Number.isSafeInteger(id) || id <= 0) {
                      setError('L’identifiant d’analyse doit être un nombre positif.')
                      return
                    }
                    setIsCreatingNew(true)
                    setStrategy(null)
                    setResolvedStrategyId(null)
                    setFormData({ goals: '', recommendations: '', parentAdvice: '', studentAdvice: '' })
                    setFormErrors({})
                    setError('')
                    setSuccess('')
                  }}
                  disabled={!newAnalysisId.trim()}
                  className="h-8 w-full items-center justify-center rounded border border-frappe-border bg-white px-3 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Nouvelle stratégie
                </button>
              </div>
            </div>
          )}

          {strategy && (
            <div className="p-4 border-b border-frappe-border space-y-3 text-xs">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-frappe-muted">Informations</h3>
              <div className="rounded border border-frappe-border bg-white p-3 space-y-2">
                <div>
                  <span className="text-2xs text-frappe-muted">Stratégie :</span>
                  <span className="ml-1 font-semibold text-frappe-dark">#{strategy.id}</span>
                </div>
                <div>
                  <span className="text-2xs text-frappe-muted">Analyse liée :</span>
                  <span className="ml-1 font-semibold text-frappe-dark">#{strategy.analysisId}</span>
                </div>
                <div className="pt-2 border-t border-frappe-border text-2xs text-frappe-muted">
                  Modification réservée aux analyses en brouillon avec PERM_WRITE_STRATEGY.
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
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

          {!strategy && !isCreatingNew && (
            <div className="rounded border border-frappe-border bg-white p-6 max-w-md">
              <h2 className="text-sm font-semibold text-frappe-dark">Sélectionner une stratégie</h2>
              <p className="mt-1 text-2xs text-frappe-muted">
                Saisissez l’identifiant d’une stratégie pour afficher son contenu et ses actions de suivi.
              </p>
            </div>
          )}

          {(strategy || isCreatingNew) && (
            <div className="space-y-6">
              {/* Form Section */}
              <section className="rounded border border-frappe-border bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-frappe-border pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-frappe-dark">
                      {isCreatingNew ? `Nouvelle stratégie (Analyse #${newAnalysisId})` : `Stratégie #${strategy.id}`}
                    </h2>
                    <p className="text-2xs text-frappe-muted">
                      Objectifs, recommandations et conseils personnalisés
                    </p>
                  </div>
                  {canWrite && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded border border-[#1958D6] bg-[#1059DC] px-4 py-1.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(16,89,220,0.17)] hover:bg-[#084ac3] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Enregistrement…' : 'Enregistrer (Ctrl+S)'}
                    </button>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Goals */}
                  <div>
                    <label htmlFor="strategy-goals" className="block text-2xs font-semibold text-frappe-dark mb-1">
                      Objectifs pédagogiques (max 10 000 caractères) *
                    </label>
                    <textarea
                      id="strategy-goals"
                      rows={3}
                      disabled={!canWrite || saving}
                      value={formData.goals}
                      onChange={(e) => handleFieldChange('goals', e.target.value)}
                      placeholder="Ex: Renforcer la régularité du travail personnel et la participation orale."
                      className="w-full rounded border border-frappe-border bg-white p-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {formErrors.goals && <p className="mt-1 text-2xs text-rose-600">{formErrors.goals}</p>}
                  </div>

                  {/* Recommendations */}
                  <div>
                    <label htmlFor="strategy-recommendations" className="block text-2xs font-semibold text-frappe-dark mb-1">
                      Recommandations pour l’équipe pédagogique *
                    </label>
                    <textarea
                      id="strategy-recommendations"
                      rows={3}
                      disabled={!canWrite || saving}
                      value={formData.recommendations}
                      onChange={(e) => handleFieldChange('recommendations', e.target.value)}
                      placeholder="Ex: Mettre en place un plan de travail hebdomadaire avec points de contrôle."
                      className="w-full rounded border border-frappe-border bg-white p-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {formErrors.recommendations && (
                      <p className="mt-1 text-2xs text-rose-600">{formErrors.recommendations}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Parent Advice */}
                    <div>
                      <label htmlFor="strategy-parent-advice" className="block text-2xs font-semibold text-frappe-dark mb-1">
                        Conseils aux parents *
                      </label>
                      <textarea
                        id="strategy-parent-advice"
                        rows={3}
                        disabled={!canWrite || saving}
                        value={formData.parentAdvice}
                        onChange={(e) => handleFieldChange('parentAdvice', e.target.value)}
                        placeholder="Ex: Valoriser les progrès, installer un espace de travail calme."
                        className="w-full rounded border border-frappe-border bg-white p-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                      {formErrors.parentAdvice && (
                        <p className="mt-1 text-2xs text-rose-600">{formErrors.parentAdvice}</p>
                      )}
                    </div>

                    {/* Student Advice */}
                    <div>
                      <label htmlFor="strategy-student-advice" className="block text-2xs font-semibold text-frappe-dark mb-1">
                        Conseils à l’élève *
                      </label>
                      <textarea
                        id="strategy-student-advice"
                        rows={3}
                        disabled={!canWrite || saving}
                        value={formData.studentAdvice}
                        onChange={(e) => handleFieldChange('studentAdvice', e.target.value)}
                        placeholder="Ex: Noter ses devoirs dans l’agenda, demander de l’aide en classe."
                        className="w-full rounded border border-frappe-border bg-white p-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6] focus:ring-1 focus:ring-[#1958D6]/10 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                      {formErrors.studentAdvice && (
                        <p className="mt-1 text-2xs text-rose-600">{formErrors.studentAdvice}</p>
                      )}
                    </div>
                  </div>
                </form>
              </section>

              {/* Follow-up Actions Section (available when strategy exists) */}
              {strategy && (
                <section className="rounded border border-frappe-border bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-frappe-border pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-frappe-dark">Actions de suivi</h3>
                      <p className="text-2xs text-frappe-muted">
                        Actions planifiées et statut de réalisation
                      </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="Filtrer par statut"
                        value={actionFilters.done}
                        onChange={(e) => setActionFilters((prev) => ({ ...prev, done: e.target.value }))}
                        className="h-8 rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#1958D6]"
                      >
                        <option value="">Tous les statuts</option>
                        <option value="false">En cours</option>
                        <option value="true">Réalisée</option>
                      </select>

                      <input
                        aria-label="Date de début"
                        type="date"
                        value={actionFilters.from}
                        onChange={(e) => setActionFilters((prev) => ({ ...prev, from: e.target.value }))}
                        className="h-8 rounded border border-frappe-border bg-white px-2 text-xs text-frappe-dark shadow-2xs"
                      />
                      <input
                        aria-label="Date de fin"
                        type="date"
                        value={actionFilters.to}
                        onChange={(e) => setActionFilters((prev) => ({ ...prev, to: e.target.value }))}
                        className="h-8 rounded border border-frappe-border bg-white px-2 text-xs text-frappe-dark shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Actions Table */}
                  <div className="rounded border border-frappe-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-frappe-hover border-b border-frappe-border text-2xs font-semibold text-frappe-muted uppercase">
                          <th className="px-3 py-2.5">Description</th>
                          <th className="px-3 py-2.5">Échéance</th>
                          <th className="px-3 py-2.5">Réalisée</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-frappe-border">
                        {actionsLoading && (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                              Chargement des actions…
                            </td>
                          </tr>
                        )}
                        {!actionsLoading && actions.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-2xs text-frappe-muted">
                              Aucune action de suivi pour cette stratégie.
                            </td>
                          </tr>
                        )}
                        {!actionsLoading && actions.map((action) => (
                          <tr key={action.id} className="hover:bg-frappe-hover/50">
                            <td className="px-3 py-2.5 text-xs text-frappe-dark font-medium">
                              {action.description}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-frappe-dark">
                              {formatDate(action.dueDate)}
                            </td>
                            <td className="px-3 py-2.5 text-xs">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${
                                  action.done
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-slate-100 text-slate-700'
                                }`}
                              >
                                {action.done ? 'Oui' : 'Non'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {actionsPagination.totalElements > 0 && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-2xs text-frappe-muted">
                        {actionsPagination.page * actionsPagination.size + 1} –{' '}
                        {Math.min((actionsPagination.page + 1) * actionsPagination.size, actionsPagination.totalElements)} sur{' '}
                        {actionsPagination.totalElements}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setActionsPagination((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                          disabled={actionsPagination.page === 0}
                          className="h-7 w-7 rounded border border-frappe-border bg-white text-xs text-frappe-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActionsPagination((prev) => ({
                              ...prev,
                              page: Math.min(prev.totalPages - 1, prev.page + 1),
                            }))
                          }
                          disabled={actionsPagination.page >= actionsPagination.totalPages - 1}
                          className="h-7 w-7 rounded border border-frappe-border bg-white text-xs text-frappe-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export const StrategiesPage = StrategiesView
export default StrategiesView
