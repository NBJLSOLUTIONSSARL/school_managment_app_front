import { useState, useCallback, useEffect, useRef } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  CornerDownRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowLeftRight,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useI18n } from '@/hooks/useI18n'
import {
  compareAnalyses,
  computeLocalComparison,
  listAnalyses,
  analysisError,
} from '../api/aiAnalysesApi'
import { listConsents } from '../api/aiConsentsApi'

export function PeriodComparisonView({
  initialStudentId = '',
  initialTerm1Id = '',
  initialTerm2Id = '',
  onBackToSingle,
}) {
  const { request, hasPermission } = useAuth()
  const { t, isRTL } = useI18n()

  const canRead = hasPermission('PERM_READ_ANALYSIS')
  const canReadConsent = hasPermission('PERM_READ_CONSENT')

  const [studentId, setStudentId] = useState(
    initialStudentId ? String(initialStudentId) : ''
  )
  const [term1Id, setTerm1Id] = useState(
    initialTerm1Id ? String(initialTerm1Id) : ''
  )
  const [term2Id, setTerm2Id] = useState(
    initialTerm2Id ? String(initialTerm2Id) : ''
  )

  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [consentStatus, setConsentStatus] = useState(null)
  const isConsentRestricted =
    consentStatus === 'revoked' || consentStatus === 'missing'

  const [actions, setActions] = useState([])
  const generation = useRef(0)

  const loadConsentStatus = useCallback(
    async (sId) => {
      if (!canReadConsent) return
      const numId = Number(sId)
      if (!Number.isSafeInteger(numId) || numId <= 0) {
        setConsentStatus(null)
        return
      }
      try {
        const res = await listConsents(request, numId, { page: 0, size: 10 })
        const hasActive = res.content.some(
          (c) => c.granted === true && c.grantedAt != null
        )
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
    },
    [request, canReadConsent]
  )

  const handleCompare = useCallback(async () => {
    const sId = Number(studentId)
    const t1Id = Number(term1Id)
    const t2Id = Number(term2Id)

    if (!Number.isSafeInteger(sId) || sId <= 0) {
      setError(t('pedagogicalAi.invalidStudent', 'L’identifiant élève doit être un nombre positif.'))
      return
    }
    if (!Number.isSafeInteger(t1Id) || t1Id <= 0) {
      setError(t('pedagogicalAi.invalidTerm1', 'L’identifiant de la période 1 doit être un nombre positif.'))
      return
    }
    if (!Number.isSafeInteger(t2Id) || t2Id <= 0) {
      setError(t('pedagogicalAi.invalidTerm2', 'L’identifiant de la période 2 doit être un nombre positif.'))
      return
    }
    if (t1Id === t2Id) {
      setError(t('pedagogicalAi.sameTerms', 'Veuillez sélectionner deux périodes distinctes pour comparer.'))
      return
    }

    const op = ++generation.current
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await loadConsentStatus(sId)

      let compResult
      try {
        compResult = await compareAnalyses(request, {
          studentId: sId,
          term1Id: t1Id,
          term2Id: t2Id,
        })
      } catch (backendErr) {
        // Fallback: If backend comparison endpoint is not implemented, fetch analyses of the student and synthesize side-by-side
        if (backendErr?.status === 404 || backendErr?.status === 501) {
          const listRes = await listAnalyses(request, sId, { page: 0, size: 50 })
          const a1 = listRes.content.find((a) => a.termId === t1Id)
          const a2 = listRes.content.find((a) => a.termId === t2Id)
          if (!a1 && !a2) {
            throw new Error(
              t(
                'pedagogicalAi.neitherAnalysisFound',
                `Aucune analyse trouvée pour les périodes #${t1Id} et #${t2Id}.`
              )
            )
          }
          compResult = computeLocalComparison(
            a1 || { termId: t1Id, studentId: sId, summary: 'Non disponible' },
            a2 || { termId: t2Id, studentId: sId, summary: 'Non disponible' }
          )
        } else {
          throw backendErr
        }
      }

      if (op === generation.current && compResult) {
        setComparison(compResult)
        setActions(compResult.followUpActions || [])
        setError('')
      }
    } catch (err) {
      if (op === generation.current) {
        setError(analysisError(err))
      }
    } finally {
      if (op === generation.current) {
        setLoading(false)
      }
    }
  }, [studentId, term1Id, term2Id, request, loadConsentStatus, t])

  useEffect(() => {
    if (initialStudentId && initialTerm1Id && initialTerm2Id) {
      queueMicrotask(() => {
        handleCompare()
      })
    }
  }, [initialStudentId, initialTerm1Id, initialTerm2Id, handleCompare])

  const toggleActionStatus = (actionId) => {
    setActions((prev) =>
      prev.map((action) => {
        if (action.id === actionId) {
          const nextDone = !action.done
          return {
            ...action,
            done: nextDone,
            status: nextDone ? 'DONE' : 'PENDING',
          }
        }
        return action
      })
    )
    setSuccess(
      t('pedagogicalAi.actionUpdated', 'Statut de l’action de suivi mis à jour.')
    )
  }

  const renderDeltaBadge = (delta) => {
    if (delta == null) return null
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          +{delta} pts • {t('pedagogicalAi.deltaPositive', 'Progression positive')}
        </span>
      )
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          {delta} pts • {t('pedagogicalAi.deltaNegative', 'En baisse')}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Minus className="w-3.5 h-3.5 text-slate-500" />
        0.0 pts • {t('pedagogicalAi.deltaStable', 'Stable')}
      </span>
    )
  }

  if (!canRead) {
    return (
      <div className="p-6">
        <div className="rounded border border-rose-200 bg-rose-50 p-6 max-w-md">
          <h2 className="text-sm font-semibold text-rose-800">
            {t('common.accessRestricted', 'Accès restreint')}
          </h2>
          <p className="mt-1 text-xs text-rose-700">
            {t(
              'pedagogicalAi.noReadPerm',
              'Vous ne disposez pas de la permission requise pour consulter les comparaisons périodiques.'
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`space-y-4 font-sans text-xs text-frappe-dark ${isRTL ? 'text-right' : 'text-left'}`}
    >
      {/* Top selector card */}
      <div className="rounded border border-frappe-border bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-frappe-border">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-slate-700 shrink-0" />
            <h2 className="text-sm font-semibold text-frappe-dark">
              {t('pedagogicalAi.comparisonView', 'Comparaison de périodes')}
            </h2>
          </div>
          {onBackToSingle && (
            <button
              type="button"
              onClick={onBackToSingle}
              className="text-2xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              ← {t('common.back', 'Retour')}
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label
              htmlFor="compare-student-id"
              className="block text-2xs font-medium text-frappe-muted mb-1"
            >
              {t('pedagogicalAi.studentId', 'Identifiant élève')}
            </label>
            <input
              id="compare-student-id"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Ex: 12"
              className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="compare-term1-id"
              className="block text-2xs font-medium text-frappe-muted mb-1"
            >
              {t('pedagogicalAi.term1', 'Période 1')}
            </label>
            <input
              id="compare-term1-id"
              type="text"
              value={term1Id}
              onChange={(e) => setTerm1Id(e.target.value)}
              placeholder="Ex: 1"
              className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="compare-term2-id"
              className="block text-2xs font-medium text-frappe-muted mb-1"
            >
              {t('pedagogicalAi.term2', 'Période 2')}
            </label>
            <input
              id="compare-term2-id"
              type="text"
              value={term2Id}
              onChange={(e) => setTerm2Id(e.target.value)}
              placeholder="Ex: 2"
              className="h-8 w-full rounded border border-frappe-border bg-white px-2.5 text-xs text-frappe-dark shadow-2xs focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/10"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleCompare}
              disabled={loading || !studentId.trim() || !term1Id.trim() || !term2Id.trim()}
              className="h-8 w-full items-center justify-center rounded border border-[#0F172A] bg-[#0F172A] px-3 text-xs font-medium text-white shadow-2xs hover:bg-[#1E293B] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? t('common.loading', 'Chargement…')
                : t('pedagogicalAi.compareAction', 'Comparer les périodes')}
            </button>
          </div>
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

      {/* Consent Status Banners */}
      {consentStatus === 'granted' && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-2xs font-medium text-emerald-800">
              {t('pedagogicalAi.consentGranted', 'Consentement parental actif pour l’analyse IA')}
            </span>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            {t('common.active', 'Actif')}
          </span>
        </div>
      )}
      {consentStatus === 'revoked' && (
        <div className="rounded border border-amber-300 bg-amber-50 px-3.5 py-2 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-900">
              {t('pedagogicalAi.consentRevoked', 'Consentement parental révoqué')}
            </p>
            <p className="text-2xs text-amber-800 mt-0.5">
              {t(
                'pedagogicalAi.consentRevokedDesc',
                'Le consentement parental pour cet élève est révoqué. La comparaison détaillée est restreinte.'
              )}
            </p>
          </div>
        </div>
      )}
      {consentStatus === 'missing' && (
        <div className="rounded border border-slate-200 bg-slate-50 px-3.5 py-2 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {t('pedagogicalAi.consentMissing', 'Consentement parental manquant')}
            </p>
            <p className="text-2xs text-slate-600 mt-0.5">
              {t(
                'pedagogicalAi.consentMissingDesc',
                'Aucun consentement parental actif n’a été enregistré pour cet élève.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!comparison && !loading && !error && (
        <div className="rounded border border-frappe-border bg-white p-8 text-center max-w-lg mx-auto shadow-2xs">
          <ArrowLeftRight className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-frappe-dark">
            {t('pedagogicalAi.noComparisonTitle', 'Prêt pour la comparaison périodique')}
          </h3>
          <p className="mt-1 text-2xs text-frappe-muted">
            {t(
              'pedagogicalAi.noComparison',
              'Sélectionnez un élève et deux périodes pour afficher la comparaison side-by-side, le delta de moyenne et les actions reportées.'
            )}
          </p>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-4">
          {/* Executive Delta Banner */}
          <div className="rounded border border-frappe-border bg-white p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-2xs uppercase tracking-wider font-semibold text-frappe-muted">
                  {t('pedagogicalAi.student', 'Élève')} #{comparison.studentId}
                  {comparison.studentName ? ` • ${comparison.studentName}` : ''}
                </span>
                <h3 className="text-sm font-bold text-frappe-dark mt-0.5">
                  {t('pedagogicalAi.deltaTitle', 'Synthèse de progression : Période')} #{comparison.term1Id} → #{comparison.term2Id}
                </h3>
              </div>
              <div>
                {comparison.deltaAverage != null ? (
                  renderDeltaBadge(comparison.deltaAverage)
                ) : (
                  <span className="text-2xs text-frappe-muted">
                    {t('pedagogicalAi.averagesNotAvailable', 'Moyennes non calculées')}
                  </span>
                )}
              </div>
            </div>

            {/* Averages row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-frappe-border text-xs">
              <div className="rounded bg-frappe-hover/60 p-2.5 border border-frappe-border">
                <span className="text-2xs text-frappe-muted block">
                  {t('pedagogicalAi.term1Avg', 'Moyenne')} P#{comparison.term1Id}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {comparison.term1Average != null
                    ? `${comparison.term1Average} / 20`
                    : '—'}
                </span>
              </div>
              <div className="rounded bg-frappe-hover/60 p-2.5 border border-frappe-border">
                <span className="text-2xs text-frappe-muted block">
                  {t('pedagogicalAi.term2Avg', 'Moyenne')} P#{comparison.term2Id}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {comparison.term2Average != null
                    ? `${comparison.term2Average} / 20`
                    : '—'}
                </span>
              </div>
              <div className="rounded bg-frappe-hover/60 p-2.5 border border-frappe-border col-span-2 sm:col-span-1">
                <span className="text-2xs text-frappe-muted block">
                  {t('pedagogicalAi.delta', 'Évolution de la moyenne')}
                </span>
                <span
                  className={`text-sm font-bold ${
                    comparison.deltaAverage > 0
                      ? 'text-emerald-700'
                      : comparison.deltaAverage < 0
                        ? 'text-rose-700'
                        : 'text-slate-700'
                  }`}
                >
                  {comparison.deltaAverage != null
                    ? `${comparison.deltaAverage > 0 ? '+' : ''}${comparison.deltaAverage} pts`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Locked Sensitive Content if Consent Restricted */}
          {isConsentRestricted ? (
            <div className="rounded border border-amber-300 bg-amber-50 p-6 text-center">
              <Lock className="w-5 h-5 text-amber-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-amber-900">
                {t('pedagogicalAi.lockedContent', 'Détails pédagogiques verrouillés')}
              </p>
              <p className="text-2xs text-amber-800 mt-1 max-w-sm mx-auto">
                {t(
                  'pedagogicalAi.lockedContentDesc',
                  'Le consentement parental pour cet élève est révoqué ou manquant. La comparaison détaillée des forces, difficultés et recommandations est masquée.'
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Side-by-Side Term Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Term 1 Column */}
                <div className="rounded border border-frappe-border bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-frappe-border">
                    <h4 className="text-xs font-bold text-frappe-dark">
                      {t('pedagogicalAi.term1', 'Période 1')} (P#{comparison.term1Id})
                    </h4>
                    {comparison.term1?.status && (
                      <span className="px-2 py-0.5 rounded text-2xs font-medium border border-slate-200 bg-slate-100 text-slate-700">
                        {comparison.term1.status}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-2xs font-semibold uppercase text-frappe-muted block mb-1">
                      {t('pedagogicalAi.summary', 'Résumé')}
                    </span>
                    <p className="text-xs text-slate-700 bg-frappe-hover/50 p-2.5 rounded border border-frappe-border">
                      {comparison.term1?.summary || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs font-semibold uppercase text-frappe-muted block mb-1">
                      {t('pedagogicalAi.strengths', 'Points forts')}
                    </span>
                    <p className="text-xs text-slate-700 bg-frappe-hover/50 p-2.5 rounded border border-frappe-border">
                      {comparison.term1?.strengths || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs font-semibold uppercase text-frappe-muted block mb-1">
                      {t('pedagogicalAi.difficulties', 'Difficultés')}
                    </span>
                    <p className="text-xs text-slate-700 bg-frappe-hover/50 p-2.5 rounded border border-frappe-border">
                      {comparison.term1?.difficulties || '—'}
                    </p>
                  </div>
                </div>

                {/* Term 2 Column */}
                <div className="rounded border border-frappe-border bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-frappe-border">
                    <h4 className="text-xs font-bold text-frappe-dark">
                      {t('pedagogicalAi.term2', 'Période 2')} (P#{comparison.term2Id})
                    </h4>
                    {comparison.term2?.status && (
                      <span className="px-2 py-0.5 rounded text-2xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700">
                        {comparison.term2.status}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-2xs font-semibold uppercase text-frappe-muted block mb-1">
                      {t('pedagogicalAi.summary', 'Résumé')}
                    </span>
                    <p className="text-xs text-slate-700 bg-frappe-hover/50 p-2.5 rounded border border-frappe-border">
                      {comparison.term2?.summary || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs font-semibold uppercase text-frappe-muted block mb-1">
                      {t('pedagogicalAi.strengths', 'Points forts')}
                    </span>
                    <p className="text-xs text-slate-700 bg-frappe-hover/50 p-2.5 rounded border border-frappe-border">
                      {comparison.term2?.strengths || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs font-semibold uppercase text-frappe-muted block mb-1">
                      {t('pedagogicalAi.difficulties', 'Difficultés')}
                    </span>
                    <p className="text-xs text-slate-700 bg-frappe-hover/50 p-2.5 rounded border border-frappe-border">
                      {comparison.term2?.difficulties || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Evolving Recommendations Section */}
              <div className="rounded border border-frappe-border bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-slate-700 shrink-0" />
                  <h4 className="text-xs font-bold text-frappe-dark">
                    {t('pedagogicalAi.evolvingRecommendations', 'Recommandations évolutives')}
                  </h4>
                </div>
                {comparison.evolvingRecommendations &&
                comparison.evolvingRecommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {comparison.evolvingRecommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="rounded border border-frappe-border bg-slate-50 p-3 text-xs text-slate-800 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{typeof rec === 'string' ? rec : rec.text || JSON.stringify(rec)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-2xs text-frappe-muted italic">
                    {t(
                      'pedagogicalAi.noEvolvingRecs',
                      'Aucune recommandation évolutive particulière enregistrée pour cet intervalle.'
                    )}
                  </p>
                )}
              </div>

              {/* Follow-Up Actions with Carried-Forward Indicators & Status Tracking */}
              <div className="rounded border border-frappe-border bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                    <h4 className="text-xs font-bold text-frappe-dark">
                      {t('pedagogicalAi.followUpActions', 'Actions de suivi & Continuité')}
                    </h4>
                  </div>
                  <span className="text-2xs text-frappe-muted">
                    {actions.length} action{actions.length > 1 ? 's' : ''}
                  </span>
                </div>

                {actions.length === 0 ? (
                  <p className="text-2xs text-frappe-muted italic py-3 text-center">
                    {t(
                      'pedagogicalAi.noFollowUpActions',
                      'Aucune action de suivi liée à cette comparaison.'
                    )}
                  </p>
                ) : (
                  <div className="rounded border border-frappe-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-frappe-hover border-b border-frappe-border text-2xs font-semibold text-frappe-muted uppercase">
                          <th className="px-3 py-2 w-12 text-center">
                            {t('pedagogicalAi.track', 'Fait')}
                          </th>
                          <th className="px-3 py-2">
                            {t('pedagogicalAi.actionDesc', 'Description de l’action')}
                          </th>
                          <th className="px-3 py-2">
                            {t('pedagogicalAi.provenance', 'Continuité')}
                          </th>
                          <th className="px-3 py-2">
                            {t('pedagogicalAi.status', 'Statut')}
                          </th>
                          <th className="px-3 py-2">
                            {t('pedagogicalAi.due', 'Échéance')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-frappe-border">
                        {actions.map((act) => (
                          <tr
                            key={act.id}
                            className={`hover:bg-frappe-hover/50 ${
                              act.done ? 'bg-slate-50/60' : ''
                            }`}
                          >
                            <td className="px-3 py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={act.done}
                                onChange={() => toggleActionStatus(act.id)}
                                className="h-4 w-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                                aria-label={`Basculer action ${act.id}`}
                              />
                            </td>
                            <td className="px-3 py-2.5 text-xs text-frappe-dark">
                              <span
                                className={
                                  act.done ? 'line-through text-slate-400' : 'font-medium'
                                }
                              >
                                {act.description}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-xs">
                              {act.carriedForward ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <CornerDownRight className="w-3 h-3 text-amber-600 shrink-0" />
                                  {t('pedagogicalAi.carriedForward', 'Reportée de la P1')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {t('pedagogicalAi.notCarriedForward', 'Initiale')}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-xs">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium border ${
                                  act.done
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-slate-100 text-slate-700'
                                }`}
                              >
                                {act.done ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {t('pedagogicalAi.actionDone', 'Terminée')}
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    {t('pedagogicalAi.actionPending', 'À faire')}
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-slate-600">
                              {act.dueDate || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default PeriodComparisonView
