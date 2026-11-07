import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck,
  Users,
  Coins,
  Clock,
  AlertCircle,
  FilePlus,
  UserPlus,
  Calendar,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStaffData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getStaffStats()
      setStats(data)
    } catch (err) {
      setError(err.message || 'Impossible de charger les données du secrétariat.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    statsService
      .getStaffStats()
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Impossible de charger les données du secrétariat.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Secrétariat'

  const applications = stats?.recentApplications || []
  const recentStudents = stats?.recentStudents || []
  const events = stats?.recentEvents || []

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Banner */}
      <HeroBanner
        title={`Bienvenue, ${displayName} !`}
        description="Espace Secrétariat & Administration : suivi des admissions, des inscriptions élèves et des factures scolaires."
        buttonText="Gérer les élèves"
        onButtonClick={() => navigate('/students')}
        icon={FileCheck}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchStaffData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 4 StatCards with Live Backend Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={FileCheck}
          title="Dossiers d'Admission"
          value={loading ? '...' : (stats?.totalApplications ?? 0).toString()}
          subtitle={`${stats?.pendingApplications ?? 0} en attente`}
          progress={100}
          progressColor="#4361EE"
        />
        <StatCard
          icon={Clock}
          title="Admissions Validées"
          value={loading ? '...' : (stats?.acceptedApplications ?? 0).toString()}
          subtitle="Dossiers acceptés"
          progress={100}
          progressColor="#10B981"
        />
        <StatCard
          icon={Users}
          title="Élèves Inscrits"
          value={loading ? '...' : (stats?.totalStudents ?? 0).toString()}
          subtitle="Effectif officiel"
          progress={100}
          progressColor="#6366F1"
          onClick={() => navigate('/students')}
        />
        <StatCard
          icon={Coins}
          title="Factures Scolaires"
          value={loading ? '...' : `${stats?.unpaidInvoicesCount ?? 0} impayée${(stats?.unpaidInvoicesCount ?? 0) > 1 ? 's' : ''}`}
          subtitle={`Restant : ${(stats?.totalUnpaidAmount ?? 0).toLocaleString('fr-FR')} €`}
          progress={stats?.paidInvoicesCount ? Math.round((stats.paidInvoicesCount / (stats.paidInvoicesCount + (stats.unpaidInvoicesCount || 1))) * 100) : 0}
          progressColor="#F59E0B"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#4361EE] hover:bg-blue-50/40 transition flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#4361EE] flex items-center justify-center shrink-0 group-hover:bg-[#4361EE] group-hover:text-white transition">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Inscrire un élève</div>
            <div className="text-[11px] text-slate-500">Gestion des dossiers</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/guardians')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#4361EE] hover:bg-blue-50/40 transition flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Parents & Tuteurs</div>
            <div className="text-[11px] text-slate-500">Coordonnées familles</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/leave-requests')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#4361EE] hover:bg-blue-50/40 transition flex items-center gap-3 text-left cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-700 group-hover:text-white transition">
            <FilePlus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Mes Congés</div>
            <div className="text-[11px] text-slate-500">Demandes d'absence</div>
          </div>
        </button>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Dossiers d'Admission Récents
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {applications.length} candidature{applications.length > 1 ? 's' : ''}
              </span>
            </div>

            {applications.length === 0 ? (
              <EmptyState
                title="Aucune candidature en attente"
                description="Tous les dossiers d'admission ont été examinés."
              />
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9] flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">
                        {`${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Candidat'}
                      </h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {app.email || '—'} · Niveau : {app.applyingForGrade || 'Non spécifié'}
                      </p>
                    </div>
                    <StatusBadge status={app.status || 'Pending'} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Registered Students */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Derniers Élèves Inscrits
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Gérer les dossiers
              </button>
            </div>

            {recentStudents.length === 0 ? (
              <EmptyState
                title="Aucun élève inscrit"
                description="Aucun dossier élève n'a été trouvé dans la base de données."
              />
            ) : (
              <div className="space-y-3">
                {recentStudents.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9]"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">
                        {st.firstName} {st.lastName} ({st.studentNumber})
                      </h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {st.email || '—'} {st.previousSchool ? `· Provenance : ${st.previousSchool}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={st.status || 'Active'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Calendar + Real Events */}
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
                description="Aucun événement à venir."
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

export default StaffDashboard
