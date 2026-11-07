import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Award,
  ArrowRight,
  AlertCircle,
  Calendar,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Eye,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function ParentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchParentData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getParentStats(user?.id)
      setStats(data)
    } catch (err) {
      setError(err.message || 'Impossible de récupérer la scolarité de vos enfants.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let ignore = false
    statsService
      .getParentStats(user?.id)
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Impossible de récupérer la scolarité de vos enfants.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [user?.id])

  const parentName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Parent'

  const children = stats?.children || []
  const currentChild = children[selectedChildIndex] || children[0]
  const events = stats?.events || []

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Banner */}
      <HeroBanner
        title={`Bonjour, ${parentName} !`}
        description="Espace Famille : suivez les résultats scolaires, les bulletins officiels et le suivi pédagogique de vos enfants en temps réel."
        buttonText="Consulter les bulletins"
        onButtonClick={() => navigate('/report-cards')}
        icon={Users}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchParentData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {children.length === 0 && !loading ? (
        <EmptyState
          title="Aucun élève rattaché"
          description="Votre compte tuteur n'est actuellement associé à aucun dossier élève. Veuillez contacter le secrétariat pour la liaison du compte."
        />
      ) : (
        <>
          {/* Child Selector Tabs */}
          {children.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Enfant suivi :
              </span>
              {children.map((child, idx) => (
                <button
                  type="button"
                  key={child.id || idx}
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedChildIndex === idx
                      ? 'bg-[#4361EE] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>
                    {child.firstName} {child.lastName}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedChildIndex === idx
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {child.studentNumber || 'Élève'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {currentChild && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                icon={Award}
                title="Moyenne Générale"
                value={
                  loading
                    ? '...'
                    : currentChild.average !== null && currentChild.average !== undefined
                      ? `${Number(currentChild.average).toFixed(2)}/20`
                      : 'En cours'
                }
                subtitle={currentChild.term || 'Trimestre actuel'}
                progress={currentChild.average ? Math.round((Number(currentChild.average) / 20) * 100) : 0}
                progressColor="#4361EE"
                onClick={() => navigate('/report-cards')}
              />
              <StatCard
                icon={GraduationCap}
                title="Matricule Élève"
                value={loading ? '...' : (currentChild.studentNumber || '—')}
                subtitle={`Statut : ${currentChild.status || 'Actif'}`}
                progress={100}
                progressColor="#10B981"
              />
              <StatCard
                icon={Sparkles}
                title="Appréciation / Mention"
                value={loading ? '...' : (currentChild.mention || 'En cours')}
                subtitle="Dernier conseil"
                progress={100}
                progressColor="#F59E0B"
                onClick={() => navigate('/report-cards')}
              />
              <StatCard
                icon={ShieldCheck}
                title="Consentement IA"
                value="Gérer"
                subtitle="Consentement parental"
                progress={100}
                progressColor="#6366F1"
                onClick={() => navigate('/consents')}
              />
            </div>
          )}

          {/* Main Grid: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Bulletin officiel de l'enfant */}
              {currentChild && (
                <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#4361EE]" />
                      <h2 className="text-base font-bold text-[#1E293B]">
                        Scolarité de {currentChild.firstName} {currentChild.lastName}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/report-cards')}
                      className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Bulletins officiels</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {currentChild.firstName} {currentChild.lastName} ({currentChild.studentNumber})
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Période : {currentChild.term || 'Trimestre en cours'}
                        {currentChild.average !== null && currentChild.average !== undefined
                          ? ` · Moyenne enregistrée : ${Number(currentChild.average).toFixed(2)}/20`
                          : ' · Évaluations en cours de saisie par les professeurs'}
                      </p>
                      {currentChild.mention && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {currentChild.mention}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/report-cards')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4361EE] text-white text-xs font-semibold hover:bg-[#3451D1] transition shrink-0"
                    >
                      <span>Voir le bulletin</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Module de Suivi Pédagogique et Accompagnement */}
              <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Suivi Pédagogique & IA
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/observations')}
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 rounded-xl text-left transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center shrink-0">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Observations</h4>
                      <p className="text-[11px] text-[#64748B]">
                        Consulter et ajouter des remarques
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/consents')}
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 rounded-xl text-left transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Consentements</h4>
                      <p className="text-[11px] text-[#64748B]">
                        Gérer les autorisations IA
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: MiniCalendar + Events */}
            <div className="space-y-6">
              <MiniCalendar onSelectDate={() => {}} />

              <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Événements Scolaires
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
                  >
                    Voir tout
                  </button>
                </div>

                {events.length === 0 ? (
                  <EmptyState
                    title="Aucun événement"
                    description="Aucun événement scolaire n'est prévu prochainement."
                  />
                ) : (
                  <div className="space-y-3">
                    {events.map((evt) => (
                      <div
                        key={evt.id}
                        className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#1E293B] truncate">
                            {evt.title}
                          </h4>
                          <p className="text-[11px] text-[#64748B] truncate">
                            {evt.startAt
                              ? new Date(evt.startAt).toLocaleDateString('fr-FR', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Date non définie'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ParentDashboard
