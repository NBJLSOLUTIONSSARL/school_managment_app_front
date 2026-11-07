import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  Award,
  Calendar,
  Building2,
  Users,
  Lock,
  Unlock,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeacherData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getTeacherStats(user?.id)
      setStats(data)
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données enseignant.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let ignore = false
    statsService
      .getTeacherStats(user?.id)
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Erreur lors du chargement des données enseignant.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [user?.id])

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Professeur'

  const exams = stats?.upcomingExams || []
  const events = stats?.events || []

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Banner */}
      <HeroBanner
        title={`Bonjour, ${displayName}`}
        description={`Espace enseignant : gérez vos évaluations, saisissez les notes de vos élèves et consultez le calendrier académique.`}
        buttonText="Saisir les notes"
        onButtonClick={() => navigate('/grades')}
        icon={BookOpen}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchTeacherData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 4 StatCards with Live Backend Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Building2}
          title="Département"
          value={loading ? '...' : (stats?.departmentName || 'Département')}
          subtitle={stats?.contractType || 'Contrat'}
          progress={100}
          progressColor="#4361EE"
          onClick={() => navigate('/departments')}
        />
        <StatCard
          icon={BookOpen}
          title="Spécialité"
          value={loading ? '...' : (stats?.specialization || 'Enseignement')}
          subtitle="Domaine d'expertise"
          progress={100}
          progressColor="#10B981"
        />
        <StatCard
          icon={Award}
          title="Examens & Évaluations"
          value={loading ? '...' : (stats?.totalExams ?? 0).toString()}
          subtitle="Sessions enregistrées"
          progress={100}
          progressColor="#F59E0B"
          onClick={() => navigate('/exams')}
        />
        <StatCard
          icon={Users}
          title="Élèves Inscrits"
          value={loading ? '...' : (stats?.totalStudents ?? 0).toString()}
          subtitle="Effectif de l'école"
          progress={100}
          progressColor="#8B5CF6"
          onClick={() => navigate('/students')}
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Live Evaluations & Exams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Évaluations et Examens
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/exams/new')}
                  className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
                >
                  + Nouvel examen
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/grades')}
                  className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer"
                >
                  Saisie des notes
                </button>
              </div>
            </div>

            {exams.length === 0 ? (
              <EmptyState
                title="Aucun examen programmé"
                description="Vous n'avez pas encore d'évaluations en cours. Créez un nouvel examen pour saisir les notes."
              />
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center shrink-0">
                        {exam.locked ? (
                          <Lock className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Unlock className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1E293B] truncate">
                          {exam.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                          Date : {exam.date || 'À déterminer'} · Barème : /{exam.maxScore || 20} (Coef. {exam.coefficient || 1})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={exam.locked ? 'Archived' : 'Active'} />
                      <button
                        type="button"
                        onClick={() => navigate('/grades')}
                        className="text-xs font-semibold text-[#4361EE] hover:underline px-2 py-1"
                      >
                        Notes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Span 1): MiniCalendar + Real School Events */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />

          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Événements & Calendrier
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
                title="Aucun événement scolaire"
                description="Le calendrier ne contient aucun événement à venir."
              />
            ) : (
              <div className="space-y-3.5">
                {events.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1E293B] truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] truncate">
                          {item.startAt
                            ? new Date(item.startAt).toLocaleDateString('fr-FR', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Date non définie'}
                          {item.location ? ` · ${item.location}` : ''}
                        </p>
                      </div>
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

export default TeacherDashboard
