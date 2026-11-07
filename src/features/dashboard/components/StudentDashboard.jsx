import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  Clock,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Award,
  Sparkles,
  FileText,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Élève'

  useEffect(() => {
    let ignore = false
    statsService.getStudentStats(user?.id).then((data) => {
      if (!ignore) {
        setStats(data)
        setLoading(false)
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Impossible de charger vos données scolaires.')
        setLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [user?.id])

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Bienvenue, ${displayName} !`}
        description="Consultez votre progression scolaire, vos devoirs à rendre et vos prochaines évaluations. Bon travail aujourd'hui ! 🚀"
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
            onClick={() => statsService.getStudentStats(user?.id).then(setStats)}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Moyenne Générale"
          value={loading ? '...' : (stats?.generalAverage ? `${stats.generalAverage}/20` : '15.4/20')}
          subtitle={stats?.termTitle || 'Semestre 1'}
          progress={77}
          progressColor="#4361EE"
          onClick={() => navigate('/report-cards')}
        />
        <StatCard
          title="Devoirs à Rendre"
          value={loading ? '...' : (stats?.pendingHomework?.toString() || '3')}
          subtitle="Cette semaine"
          progress={40}
          progressColor="#F59E0B"
          onClick={() => navigate('/homework')}
        />
        <StatCard
          title="Évaluations Passées"
          value={loading ? '...' : (stats?.submissionCount?.toString() || '8')}
          subtitle="Notes disponibles"
          progress={100}
          progressColor="#10B981"
          onClick={() => navigate('/report-cards')}
        />
        <StatCard
          title="Taux d'Assiduité"
          value={`${stats?.attendanceRate || 98}%`}
          subtitle="0 absence injustifiée"
          progress={Math.round(stats?.attendanceRate || 98)}
          progressColor="#06B6D4"
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Emploi du Temps du Jour
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Semaine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { time: '08h30 - 10h00', subject: 'Mathématiques', teacher: 'Claire Martin', room: 'Salle 101' },
                { time: '10h15 - 12h00', subject: 'Physique-Chimie', teacher: 'Sophie Dubois', room: 'Labo 201' },
                { time: '13h30 - 15h00', subject: 'Français & Littérature', teacher: 'Thomas Bernard', room: 'Salle 102' },
                { time: '15h15 - 17h00', subject: 'Anglais LV1', teacher: 'Sarah Miller', room: 'Salle 104' },
              ].map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#4361EE] bg-[#EEF2FF] px-2.5 py-1 rounded-md">
                      {slot.time}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">{slot.subject}</h4>
                      <p className="text-[11px] text-[#64748B]">{slot.teacher} · {slot.room}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Confirmé</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Homework */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Prochains Devoirs & Livrables
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/homework')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Tous les devoirs
              </button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Exercices 42 et 45 page 112 - Dérivées', subject: 'Mathématiques', deadline: 'Demain à 08h00', status: 'Pending' },
                { title: 'Dissertation : Le réalisme dans Madame Bovary', subject: 'Français', deadline: 'Jeudi à 14h00', status: 'Active' },
                { title: 'Compte-rendu de TP : Synthèse de l\'aspirine', subject: 'Physique-Chimie', deadline: 'Lundi prochain', status: 'Pending' },
              ].map((hw, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9] flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B]">{hw.title}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {hw.subject} · À rendre pour {hw.deadline}
                    </p>
                  </div>
                  <StatusBadge status={hw.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Calendar + Upcoming Exams */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />

          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Prochaines Évaluations
              </h2>
            </div>

            <div className="space-y-3.5">
              {[
                { title: 'DS n°2 Mathématiques', date: 'Vendredi 14 Nov', icon: Award, color: 'text-[#4361EE]', bg: 'bg-[#EEF2FF]' },
                { title: 'Contrôle continu Histoire-Géo', date: 'Mardi 18 Nov', icon: BookOpen, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
                { title: 'Épreuve Blanche Anglais', date: 'Vendredi 28 Nov', icon: CheckSquare, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-xl transition">
                    <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">{item.title}</h4>
                      <p className="text-[11px] text-[#64748B]">{item.date}</p>
                    </div>
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

export default StudentDashboard
