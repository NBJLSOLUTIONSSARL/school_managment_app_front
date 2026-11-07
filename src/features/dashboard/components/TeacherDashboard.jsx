import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Bell,
  Award,
  Calendar,
  Users,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const teacherName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''

  const fetchTeacherData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getTeacherStats(teacherName)
      setStats(data)
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données enseignant.')
    } finally {
      setLoading(false)
    }
  }, [teacherName])

  useEffect(() => {
    let ignore = false
    statsService.getTeacherStats(teacherName).then((data) => {
      if (!ignore) {
        setStats(data)
        setLoading(false)
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Erreur lors du chargement des données enseignant.')
        setLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [teacherName])

  const displayName = teacherName || user?.email || 'Enseignant'

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Bonjour, ${displayName} !`}
        description="Vous avez vos cours programmés aujourd'hui et les évaluations en cours. Suivez votre emploi du temps et la saisie des notes."
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

      {/* 4 StatCards with Circular Progress from Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Classes Attribuées"
          value={loading ? '...' : (stats?.totalClasses?.toString() || '4')}
          subtitle="Cours Actifs"
          progress={85}
          progressColor="#4361EE"
        />
        <StatCard
          title="Élèves Suivis"
          value={loading ? '...' : (stats?.totalStudents?.toString() || '142')}
          subtitle="Effectif Total"
          progress={92}
          progressColor="#10B981"
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Notes & Évaluations"
          value={loading ? '...' : (stats?.totalExams?.toString() || '6')}
          subtitle="En attente de notation"
          progress={65}
          progressColor="#EF4444"
          onClick={() => navigate('/grades')}
        />
        <StatCard
          title="Taux de Présence"
          value={`${stats?.attendanceRate || 96.2}%`}
          subtitle="Moyenne des classes"
          progress={Math.round(stats?.attendanceRate || 96.2)}
          progressColor="#06B6D4"
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Weekly Schedule Table + Upcoming Evaluations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Emploi du Temps Hebdomadaire
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Agenda complet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    <th className="pb-3">Jour</th>
                    <th className="pb-3">Horaire</th>
                    <th className="pb-3">Matière</th>
                    <th className="pb-3">Salle / Classe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {[
                    { id: 1, day: 'Lundi', time: '08h30 - 10h00', subject: 'Mathématiques', room: 'Salle 101 Richelieu (Terminale S)' },
                    { id: 2, day: 'Lundi', time: '10h15 - 12h00', subject: 'Mathématiques', room: 'Salle 102 Molière (1ère S)' },
                    { id: 3, day: 'Mardi', time: '14h00 - 16h00', subject: 'Algèbre Avancée', room: 'Laboratoire 201 (Seconde A)' },
                    { id: 4, day: 'Mercredi', time: '09h00 - 11h00', subject: 'Géométrie', room: 'Salle 101 Richelieu (3ème B)' },
                    { id: 5, day: 'Jeudi', time: '10h00 - 12h00', subject: 'Mathématiques', room: 'Salle 102 Molière (Terminale S)' },
                  ].map((slot) => (
                    <tr key={slot.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-[#1E293B]">{slot.day}</td>
                      <td className="py-3.5 text-[#64748B]">{slot.time}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4361EE]">
                          <BookOpen className="w-3 h-3" />
                          {slot.subject}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#64748B]">{slot.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evaluations / Exams Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Évaluations et Devoirs en Cours
              </h2>
              <button
                type="button"
                onClick={() => navigate('/grades')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Gérer les notes
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: 'ex1', title: 'Contrôle Continu n°2 - Dérivées et Suites', date: 'Semaine en cours', coef: 2, status: 'Active' },
                { id: 'ex2', title: 'Devoir Maison n°3 - Trigonométrie', date: 'À rendre le 18 Nov', coef: 1, status: 'Active' },
                { id: 'ex3', title: 'Examen Blanc Semestriel - Épreuve Math', date: 'Programmé pour Décembre', coef: 4, status: 'Pending' },
              ].map((exam) => (
                <div
                  key={exam.id}
                  className="p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">{exam.title}</h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Coefficient : {exam.coef} · {exam.date}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={exam.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Span 1): MiniCalendar + Upcoming Deadlines */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />

          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Échéances Pédagogiques
              </h2>
            </div>

            <div className="space-y-3.5">
              {[
                { title: 'Date limite saisie des bulletins', date: '24 Nov · Semestre 1', icon: Calendar, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]' },
                { title: 'Réunion du Département Math', date: '28 Nov · Salle des Profs', icon: Users, color: 'text-[#4361EE]', bg: 'bg-[#EEF2FF]' },
                { title: 'Conseil de Classe Trimestriel', date: '02 Déc · Salle Polyvalente', icon: BookOpen, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1E293B]">{item.title}</h4>
                        <p className="text-[11px] text-[#64748B]">{item.date}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/events')}
                      className="text-[#94A3B8] hover:text-[#4361EE] p-1 cursor-pointer"
                      aria-label="Notification"
                    >
                      <Bell className="w-3.5 h-3.5" />
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

export default TeacherDashboard
