import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  School,
  GraduationCap,
  Users,
  Calendar,
  Bell,
  MoreVertical,
  FlaskConical,
  Palette,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { LineChart } from '@/components/ui/LineChart'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { statsService } from '../api/statsService'

const defaultEnrollments = [
  { id: 1, name: 'Emma Johnson', grade: 'Terminale S', status: 'Active' },
  { id: 2, name: 'Liam Carter', grade: '1ère ES', status: 'Pending' },
  { id: 3, name: 'Olivia Brown', grade: '3ème A', status: 'Active' },
  { id: 4, name: 'Noah Williams', grade: 'Seconde B', status: 'Pending' },
  { id: 5, name: 'Sophia Davis', grade: '6ème C', status: 'Completed' },
]

const defaultEvents = [
  {
    id: 'e1',
    title: 'Conseil de classe trimestriel',
    date: '15 Nov · Salle Polyvalente',
    icon: Users,
    iconBg: 'bg-[#FFEDD5]',
    iconColor: 'text-[#EA580C]',
  },
  {
    id: 'e2',
    title: 'Olympiades de Mathématiques',
    date: '20 Nov · Labo Sciences',
    icon: FlaskConical,
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
  },
  {
    id: 'e3',
    title: 'Rencontre Parents-Professeurs',
    date: '25 Nov · Hall Principal',
    icon: Users,
    iconBg: 'bg-[#FCE7F3]',
    iconColor: 'text-[#DB2777]',
  },
  {
    id: 'e4',
    title: 'Exposition Artistique Annuelle',
    date: '02 Déc · Galerie',
    icon: Palette,
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#D97706]',
  },
  {
    id: 'e5',
    title: 'Cérémonie de remise des diplômes',
    date: '10 Déc · Grand Amphithéâtre',
    icon: GraduationCap,
    iconBg: 'bg-[#EDE9FE]',
    iconColor: 'text-[#7C3AED]',
  },
]

const attendanceChartData = [
  { month: 'Sep', rate: 94 },
  { month: 'Oct', rate: 96 },
  { month: 'Nov', rate: 93 },
  { month: 'Dec', rate: 95 },
  { month: 'Jan', rate: 97 },
  { month: 'Feb', rate: 96 },
]

export function AdminDashboard() {
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getAdminStats()
      setStats(data)
      if (data.recentEvents && data.recentEvents.length > 0) {
        setEvents(data.recentEvents)
      } else {
        setEvents(defaultEvents)
      }

      if (data.applicationsList && data.applicationsList.length > 0) {
        const mapped = data.applicationsList.slice(0, 5).map((app) => ({
          id: app.id,
          name: `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Élève Candidat',
          grade: app.applyingForGrade ? `Classe ${app.applyingForGrade}` : 'Seconde',
          status: app.status || 'Active',
        }))
        setEnrollments(mapped)
      } else {
        setEnrollments(defaultEnrollments)
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des statistiques.')
      setEnrollments(defaultEnrollments)
      setEvents(defaultEvents)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    statsService.getAdminStats().then((data) => {
      if (!ignore) {
        setStats(data)
        if (data.recentEvents?.length > 0) {
          setEvents(data.recentEvents)
        } else {
          setEvents(defaultEvents)
        }
        if (data.applicationsList?.length > 0) {
          const mapped = data.applicationsList.slice(0, 5).map((app) => ({
            id: app.id,
            name: `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Élève Candidat',
            grade: app.applyingForGrade ? `Classe ${app.applyingForGrade}` : 'Seconde',
            status: app.status || 'Active',
          }))
          setEnrollments(mapped)
        } else {
          setEnrollments(defaultEnrollments)
        }
        setLoading(false)
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Erreur lors du chargement des statistiques.')
        setEnrollments(defaultEnrollments)
        setEvents(defaultEvents)
        setLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [])

  const greetingName = user?.lastName
    ? `Directeur ${user.lastName}`
    : user?.firstName || 'Directeur'

  const pendingAppsCount = stats?.totalApplications ?? 16
  const pendingTeachersCount = 3

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Bonjour, ${greetingName} !`}
        description={`Vous avez ${pendingAppsCount} nouvelles inscriptions à valider et ${pendingTeachersCount} approbations en attente. Bonne journée de gestion ! 🎯`}
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

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Overview + Chart + Enrollments */}
        <div className="lg:col-span-2 space-y-6">
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

            {/* 4 StatCards with Circular Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Élèves Inscrits"
                value={loading ? '...' : (stats?.totalStudents?.toString() || '1 248')}
                subtitle="(+18 ce mois)"
                progress={88}
                progressColor="#4361EE"
                onClick={() => navigate('/students')}
              />
              <StatCard
                title="Corps Enseignant"
                value={loading ? '...' : (stats?.totalTeachers?.toString() || '84')}
                subtitle="(3 en congé)"
                progress={92}
                progressColor="#EF4444"
                onClick={() => navigate('/teachers')}
              />
              <StatCard
                title="Départements & Classes"
                value={loading ? '...' : (stats?.totalDepartments?.toString() || '12')}
                subtitle="(36 classes actives)"
                progress={100}
                progressColor="#10B981"
                onClick={() => navigate('/departments')}
              />
              <StatCard
                title="Taux de Présence"
                value={`${stats?.attendanceRate || 95.8}%`}
                subtitle="(Cette semaine)"
                progress={Math.round(stats?.attendanceRate || 95.8)}
                progressColor="#06B6D4"
              />
            </div>
          </div>

          {/* Attendance Trend Line Chart */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Évolution de l'Assiduité Scolaire
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +2.4% ce semestre
              </span>
            </div>
            <LineChart
              data={attendanceChartData}
              dataKey="rate"
              labelKey="month"
              maxY={100}
              minY={80}
              ySuffix="%"
              lineColor="#4361EE"
              height={180}
            />
          </div>

          {/* Recent Enrollments Table */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Inscriptions Récentes
              </h2>
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Gérer les élèves
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Nom de l'élève</th>
                    <th className="pb-3 font-semibold">Classe</th>
                    <th className="pb-3 font-semibold">Statut</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {enrollments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-[#1E293B]">
                        {item.name}
                      </td>
                      <td className="py-3.5 pr-4 text-[#64748B]">
                        {item.grade}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 text-right text-[#94A3B8]">
                        <button
                          type="button"
                          onClick={() => navigate('/students')}
                          className="p-1 hover:text-[#1E293B] rounded-md transition cursor-pointer"
                          aria-label="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1): Mini Calendar + Upcoming Events */}
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

            <div className="space-y-3.5">
              {events.map((evt, idx) => {
                const EvtIcon = evt.icon || Calendar
                return (
                  <div
                    key={evt.id || idx}
                    className="flex items-center justify-between gap-3 p-1 hover:bg-slate-50 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full ${evt.iconBg || 'bg-[#FFEDD5]'} ${
                          evt.iconColor || 'text-[#EA580C]'
                        } flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        <EvtIcon className="w-4 h-4 stroke-[2]" />
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
                              })
                            : evt.date || 'À venir'}
                          {evt.location ? ` · ${evt.location}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/events')}
                      className="text-[#94A3B8] hover:text-[#4361EE] p-1.5 rounded-full transition cursor-pointer shrink-0"
                      aria-label="Rappel"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
