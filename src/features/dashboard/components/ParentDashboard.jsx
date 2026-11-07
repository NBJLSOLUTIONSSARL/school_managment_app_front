import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Award,
  ArrowRight,
  AlertCircle,
  Coins,
  CheckCircle2,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function ParentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const parentName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Parent'

  useEffect(() => {
    let ignore = false
    statsService.getParentStats(user?.id).then((data) => {
      if (!ignore) {
        setStats(data)
        setLoading(false)
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Impossible de récupérer la scolarité de vos enfants.')
        setLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [user?.id])

  const children = stats?.children || [
    { id: 101, firstName: 'Thomas', lastName: user?.lastName || 'Dubois', grade: 'Seconde A', average: 15.8, attendance: 97 },
    { id: 102, firstName: 'Léa', lastName: user?.lastName || 'Dubois', grade: '4ème B', average: 14.5, attendance: 99 },
  ]

  const currentChild = children[selectedChildIndex] || children[0]

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Bonjour, ${parentName} !`}
        description="Suivez l'assiduité, les bulletins scolaires, les devoirs et les communications avec l'équipe pédagogique pour vos enfants."
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
            onClick={() => statsService.getParentStats(user?.id).then(setStats)}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Child Selector Tabs */}
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
            <span>{child.firstName} {child.lastName}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedChildIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {child.grade}
            </span>
          </button>
        ))}
      </div>

      {/* 4 StatCards for selected child */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Moyenne Générale"
          value={loading ? '...' : `${currentChild.average || 15.5}/20`}
          subtitle="Semestre en cours"
          progress={Math.round(((currentChild.average || 15.5) / 20) * 100)}
          progressColor="#4361EE"
          onClick={() => navigate('/report-cards')}
        />
        <StatCard
          title="Taux d'Assiduité"
          value={`${currentChild.attendance || 98}%`}
          subtitle="0 retard cette semaine"
          progress={currentChild.attendance || 98}
          progressColor="#10B981"
        />
        <StatCard
          title="Factures de Scolarité"
          value={stats?.unpaidInvoices ? `${stats.unpaidInvoices} à régler` : 'À jour'}
          subtitle={stats?.unpaidAmount ? `${stats.unpaidAmount} € restant` : 'Aucun impayé'}
          progress={stats?.unpaidInvoices ? 50 : 100}
          progressColor={stats?.unpaidInvoices ? '#F59E0B' : '#10B981'}
        />
        <StatCard
          title="Messages Enseignants"
          value="2 nouveaux"
          subtitle="Dernier message hier"
          progress={100}
          progressColor="#06B6D4"
          onClick={() => navigate('/messages')}
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Grades */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  Dernières Notes Reçues : {currentChild.firstName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/report-cards')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Bulletin complet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { subject: 'Mathématiques', title: 'DS n°2 - Dérivées', grade: '16.5/20', classAvg: '13.2', teacher: 'Claire Martin' },
                { subject: 'Physique-Chimie', title: 'TP n°1 - Optique', grade: '17.0/20', classAvg: '14.1', teacher: 'Sophie Dubois' },
                { subject: 'Histoire-Géographie', title: 'Contrôle - La Guerre Froide', grade: '14.0/20', classAvg: '12.8', teacher: 'Alain Laurent' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9]"
                >
                  <div>
                    <span className="text-xs font-bold text-[#1E293B]">{item.subject}</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{item.title} · Prof. {item.teacher}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#4361EE]">{item.grade}</span>
                    <p className="text-[10px] text-slate-400">Moy. classe : {item.classAvg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Contact with Teachers */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Équipe Pédagogique Principale
              </h2>
              <button
                type="button"
                onClick={() => navigate('/messages')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Écrire un message
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Claire Martin', role: 'Professeur Principal - Mathématiques', email: 'c.martin@school.edu' },
                { name: 'Thomas Bernard', role: 'Français & Littérature', email: 't.bernard@school.edu' },
              ].map((teacher, idx) => (
                <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-[#F1F5F9] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B]">{teacher.name}</h4>
                    <p className="text-[11px] text-[#64748B]">{teacher.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/messages')}
                    className="text-xs font-semibold text-[#4361EE] hover:underline"
                  >
                    Contacter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: MiniCalendar + Upcoming Deadlines */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />

          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Rappels & Réunions
              </h2>
            </div>

            <div className="space-y-3.5">
              {[
                { title: 'Réunion Parents-Professeurs', date: '25 Nov · 17h30', icon: Users, color: 'text-[#4361EE]', bg: 'bg-[#EEF2FF]' },
                { title: 'Date limite règlement cantine', date: '30 Nov · Facture #INV-2026', icon: Coins, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]' },
                { title: 'Fin du 1er Trimestre', date: '10 Déc · Arrêt des notes', icon: CheckCircle2, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
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

export default ParentDashboard
