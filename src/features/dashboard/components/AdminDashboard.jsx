import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  School,
  GraduationCap,
  Users,
  Calendar,
  Bell,
  AlertCircle,
  Coins,
  FileCheck,
  Building2,
} from 'lucide-react'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { statsService } from '../api/statsService'

export function AdminDashboard() {
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getAdminStats()
      setStats(data)
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des statistiques.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    statsService
      .getAdminStats()
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Erreur lors du chargement des statistiques.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  const greetingName = user?.lastName
    ? `Directeur ${user.lastName}`
    : user?.firstName || user?.email || 'Directeur'

  const applications = stats?.applicationsList || []
  const events = stats?.recentEvents || []

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Banner */}
      <HeroBanner
        title={`Bonjour, ${greetingName}`}
        description={`Espace de direction et d'administration de l'établissement. Données en temps réel synchronisées avec le serveur.`}
        buttonText={t('nav.students')}
        onButtonClick={() => navigate('/students')}
        icon={School}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Main Grid: Overview StatCards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Vue d'ensemble de l'établissement
          </h2>
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
          >
            Voir tout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            icon={GraduationCap}
            title="Élèves Inscrits"
            value={loading ? '...' : (stats?.totalStudents ?? 0).toString()}
            subtitle="Effectif officiel"
            progress={100}
            progressColor="#4361EE"
            onClick={() => navigate('/students')}
          />
          <StatCard
            icon={Users}
            title="Corps Enseignant"
            value={loading ? '...' : (stats?.totalTeachers ?? 0).toString()}
            subtitle="Professeurs actifs"
            progress={100}
            progressColor="#10B981"
            onClick={() => navigate('/teachers')}
          />
          <StatCard
            icon={Users}
            title="Personnel"
            value={loading ? '...' : (stats?.totalStaff ?? 0).toString()}
            subtitle="Membres du staff"
            progress={100}
            progressColor="#6366F1"
            onClick={() => navigate('/staff')}
          />
          <StatCard
            icon={Building2}
            title="Départements"
            value={loading ? '...' : (stats?.totalDepartments ?? 0).toString()}
            subtitle="Unités académiques"
            progress={100}
            progressColor="#F59E0B"
            onClick={() => navigate('/departments')}
          />
          <StatCard
            icon={FileCheck}
            title="Candidatures"
            value={loading ? '...' : (stats?.totalApplications ?? 0).toString()}
            subtitle="Dossiers d'admission"
            progress={100}
            progressColor="#8B5CF6"
          />
          <StatCard
            icon={Coins}
            title="Facturation"
            value={loading ? '...' : `${(stats?.totalInvoiced ?? 0).toLocaleString('fr-FR')} €`}
            subtitle={`Recouvrement : ${stats?.paymentRate ?? 0}%`}
            progress={stats?.paymentRate ?? 0}
            progressColor={stats?.paymentRate > 75 ? '#10B981' : '#F59E0B'}
          />
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Financial Summary & Candidatures */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Overview Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Situation Financière Globale
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#4361EE] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full">
                Exercice en cours
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Total Émis
                </span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {(stats?.totalInvoiced ?? 0).toLocaleString('fr-FR')} €
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
                  Total Encaissé
                </span>
                <p className="text-lg font-bold text-emerald-700 mt-0.5">
                  {(stats?.totalPaid ?? 0).toLocaleString('fr-FR')} €
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-rose-600 uppercase tracking-wider">
                  Reste à Recouvrer
                </span>
                <p className="text-lg font-bold text-rose-700 mt-0.5">
                  {(stats?.totalUnpaid ?? 0).toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
          </div>

          {/* Recent Applications Table */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Dossiers d'Admission Récents
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {applications.length} dossier{applications.length > 1 ? 's' : ''}
              </span>
            </div>

            {applications.length === 0 ? (
              <EmptyState
                title="Aucun dossier d'admission"
                description="Tous les dossiers d'admission ont été traités ou aucune candidature n'est en attente."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Candidat</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Niveau Souhaité</th>
                      <th className="pb-3 font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 pr-4 font-semibold text-[#1E293B]">
                          {`${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Candidat'}
                        </td>
                        <td className="py-3.5 pr-4 text-[#64748B]">
                          {app.email || '—'}
                        </td>
                        <td className="py-3.5 pr-4 text-[#64748B]">
                          {app.applyingForGrade || 'Non spécifié'}
                        </td>
                        <td className="py-3.5 pr-4">
                          <StatusBadge status={app.status || 'Pending'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Span 1): Mini Calendar + Real Upcoming Events */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />

          {/* Upcoming Events Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Événements à Venir
              </h2>
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                Voir l'agenda
              </button>
            </div>

            {events.length === 0 ? (
              <EmptyState
                title="Aucun événement programmé"
                description="Le calendrier scolaire ne contient aucun événement à venir."
              />
            ) : (
              <div className="space-y-3.5">
                {events.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1E293B] truncate">
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                          {evt.startAt
                            ? new Date(evt.startAt).toLocaleDateString('fr-FR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Date non définie'}
                          {evt.location ? ` · ${evt.location}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/events')}
                      className="text-[#94A3B8] hover:text-[#4361EE] p-1.5 rounded-full transition cursor-pointer shrink-0"
                      aria-label="Voir l'événement"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
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

export default AdminDashboard
