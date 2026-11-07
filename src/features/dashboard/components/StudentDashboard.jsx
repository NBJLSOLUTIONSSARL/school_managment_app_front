import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  AlertCircle,
  Award,
  Sparkles,
  Download,
  Calendar,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudentData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getStudentStats(user?.id)
      setStats(data)
    } catch (err) {
      setError(err.message || 'Impossible de charger vos données scolaires.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let ignore = false
    statsService
      .getStudentStats(user?.id)
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Impossible de charger vos données scolaires.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [user?.id])

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Élève'

  const exams = stats?.upcomingExams || []
  const events = stats?.events || []
  const submissions = stats?.submissions || []
  const latestReportCard = stats?.latestReportCard

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Banner */}
      <HeroBanner
        title={`Bienvenue, ${displayName} !`}
        description="Consultez vos bulletins scolaires, vos évaluations programmées et vos devoirs rendus en temps réel."
        buttonText="Voir mes devoirs"
        onButtonClick={() => navigate('/homework')}
        icon={Sparkles}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchStudentData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 4 StatCards with Live Backend Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Award}
          title="Moyenne Générale"
          value={
            loading
              ? '...'
              : stats?.generalAverage !== null && stats?.generalAverage !== undefined
                ? `${Number(stats.generalAverage).toFixed(2)}/20`
                : 'En attente'
          }
          subtitle={stats?.termTitle || 'Semestre en cours'}
          progress={stats?.generalAverage ? Math.round((Number(stats.generalAverage) / 20) * 100) : 0}
          progressColor="#4361EE"
          onClick={() => navigate('/report-cards')}
        />
        <StatCard
          icon={FileText}
          title="Devoirs Soumis"
          value={loading ? '...' : (stats?.submissionsCount ?? 0).toString()}
          subtitle="Soumissions enregistrées"
          progress={100}
          progressColor="#10B981"
          onClick={() => navigate('/homework')}
        />
        <StatCard
          icon={GraduationCap}
          title="Évaluations à Venir"
          value={loading ? '...' : exams.length.toString()}
          subtitle="Examens planifiés"
          progress={100}
          progressColor="#F59E0B"
          onClick={() => navigate('/exams')}
        />
        <StatCard
          icon={CheckCircle2}
          title="Matricule Étudiant"
          value={loading ? '...' : (stats?.studentNumber || '—')}
          subtitle={`Statut : ${stats?.status || 'Actif'}`}
          progress={100}
          progressColor="#06B6D4"
          onClick={() => navigate('/profile')}
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Report Card Overview */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Dernier Bulletin Scolaire Officiel
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/report-cards')}
                className="text-xs font-semibold text-[#4361EE] hover:underline"
              >
                Tous les bulletins
              </button>
            </div>

            {!latestReportCard ? (
              <EmptyState
                title="Aucun bulletin scolaire officiel"
                description="Le secrétariat ou votre professeur principal n'a pas encore validé de bulletin pour cette période."
              />
            ) : (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {latestReportCard.term || 'Trimestre 1'}
                    </span>
                    <span className="text-xs text-slate-500">
                      · {latestReportCard.academicYear || '2026-2027'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>
                      Moyenne : <strong className="text-slate-900">{Number(latestReportCard.average || 0).toFixed(2)}/20</strong>
                    </span>
                    {latestReportCard.rank && (
                      <span>
                        Rang : <strong className="text-slate-900">{latestReportCard.rank}{latestReportCard.rank === 1 ? 'er' : 'e'}</strong>
                      </span>
                    )}
                    {latestReportCard.mention && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {latestReportCard.mention}
                      </span>
                    )}
                    {latestReportCard.decision && (
                      <span className="text-slate-500">
                        ({latestReportCard.decision})
                      </span>
                    )}
                  </div>
                </div>
                {latestReportCard.pdfUrl && (
                  <a
                    href={latestReportCard.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4361EE] text-white text-xs font-semibold hover:bg-[#3451D1] transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger PDF</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Submissions & Homework History */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Mes Soumissions de Devoirs
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/homework')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Soumettre un devoir
              </button>
            </div>

            {submissions.length === 0 ? (
              <EmptyState
                title="Aucune soumission enregistrée"
                description="Vous n'avez pas encore soumis de devoir sur la plateforme."
              />
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">
                        Devoir #{sub.homeworkId || sub.id}
                      </h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Soumis le : {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('fr-FR') : '—'}
                        {sub.score !== undefined && sub.score !== null ? ` · Note : ${sub.score}/20` : ' · En attente de correction'}
                      </p>
                      {sub.feedback && (
                        <p className="text-[11px] text-slate-700 italic mt-1">
                          « {sub.feedback} »
                        </p>
                      )}
                    </div>
                    <StatusBadge status={sub.score !== undefined && sub.score !== null ? 'Completed' : 'Pending'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Calendar + Real Upcoming Exams */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />

          {/* Real Upcoming Exams Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Évaluations Planifiées
              </h2>
              <button
                type="button"
                onClick={() => navigate('/exams')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                Voir tout
              </button>
            </div>

            {exams.length === 0 ? (
              <EmptyState
                title="Aucun examen planifié"
                description="Aucun examen n'est actuellement programmé."
              />
            ) : (
              <div className="space-y-3">
                {exams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {ex.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {ex.date || 'Date à définir'} · Coef. {ex.coefficient || 1}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#4361EE] bg-[#EEF2FF] px-2 py-0.5 rounded shrink-0">
                      /{ex.maxScore || 20}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real School Events Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Événements de l'École
              </h2>
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                Calendrier
              </button>
            </div>

            {events.length === 0 ? (
              <EmptyState
                title="Aucun événement"
                description="Le calendrier scolaire ne contient aucun événement à venir."
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
    </div>
  )
}

export default StudentDashboard
