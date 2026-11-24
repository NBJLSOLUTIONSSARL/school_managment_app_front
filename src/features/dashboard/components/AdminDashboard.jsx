import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { WhiteThemeDashboardHeader } from '@/components/ui/WhiteThemeDashboardHeader'
import { WhiteThemeKpiCards } from '@/components/ui/WhiteThemeKpiCards'
import { RevenueAssistedLineChartCard } from '@/components/ui/RevenueAssistedLineChartCard'
import { TeamUtilizationBarChartCard } from '@/components/ui/TeamUtilizationBarChartCard'
import { ProjectHealthSegmentedCard } from '@/components/ui/ProjectHealthSegmentedCard'
import { UpcomingMeetingsCards } from '@/components/ui/UpcomingMeetingsCards'
import { CompanyDetailsTableCard } from '@/components/ui/CompanyDetailsTableCard'

// Pedagogical secondary components
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { StarStudentsCard } from '@/components/ui/StarStudentsCard'
import { RecentActivityFeedCard } from '@/components/ui/RecentActivityFeedCard'

import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPedagogicalSection, setShowPedagogicalSection] = useState(false)

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

  const greetingName = user?.firstName || (user?.lastName ? `Directeur ${user.lastName}` : 'Alex')

  // Navigation handlers for the 6 top KPI cards
  const handleKpiCardClick = (card) => {
    switch (card.id) {
      case 'revenue':
        navigate('/finances/invoices')
        break
      case 'projects':
        navigate('/departments')
        break
      case 'tasks':
        navigate('/homework')
        break
      case 'meetings':
        navigate('/events')
        break
      case 'health':
        navigate('/students')
        break
      case 'ai-productivity':
        navigate('/analyses')
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6 select-none pb-8">
      {/* 1. White Theme Main Greeting Header */}
      <WhiteThemeDashboardHeader
        name={greetingName}
        greeting="Good morning"
        subtitle="Today's workspace updates."
        onAskAi={() => navigate('/analyses')}
        onSearch={() => navigate('/students')}
      />

      {/* Subheader and Institutional context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            Vue d'ensemble de l'établissement
          </h2>
          <p className="text-2xs font-medium text-slate-500 mt-0.5">
            Suivi consolidé des métriques de travail, financières et académiques
          </p>
        </div>

        {/* Quick button to toggle academic modules */}
        <button
          type="button"
          onClick={() => setShowPedagogicalSection((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#5B5FC7] hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{showPedagogicalSection ? 'Masquer modules académiques' : 'Afficher modules académiques'}</span>
          {showPedagogicalSection ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Error alert with retry button */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-2xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 2. Top 6 KPI Metric Cards */}
      <WhiteThemeKpiCards onCardClick={handleKpiCardClick} />

      {/* 3. Charts Row: Revenue & AI Wave (Col 7) + Team Utilization (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <RevenueAssistedLineChartCard
            title="REVENUE & AI-ASSISTED REVENUE"
            pinnedMonthIndex={3}
          />
        </div>
        <div className="lg:col-span-5">
          <TeamUtilizationBarChartCard
            title="TEAM UTILIZATION"
            initialPeriod="Last Week"
            onPeriodChange={() => {}}
          />
        </div>
      </div>

      {/* 4. Middle Row: Project Health (Col 7) + Upcoming Meetings (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ProjectHealthSegmentedCard
            title="PROJECT HEALTH"
            totalSegments={24}
            onProjectClick={() => navigate('/departments')}
          />
        </div>
        <div className="lg:col-span-5">
          <UpcomingMeetingsCards
            title="UPCOMING MEETINGS"
            onMeetingClick={() => navigate('/events')}
            onActionClick={() => navigate('/events')}
          />
        </div>
      </div>

      {/* 5. Bottom Row: Company Details Table */}
      <CompanyDetailsTableCard
        title="COMPANY DETAILS"
        onRowClick={() => navigate('/departments')}
      />

      {/* 6. Optional Expandable Academic Modules (Exam Results, Radial Distribution, Star Students, Recent Activity) */}
      {showPedagogicalSection && (
        <div className="space-y-5 pt-4 border-t border-slate-200/80 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5B5FC7]" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Indicateurs Académiques & Pédagogiques Détaillés
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <ExamResultsWaveChart
                title="All Exam Results"
                series={[
                  { name: 'Teacher', color: '#5B5FC7' },
                  { name: 'Students', color: '#CBD5E1' },
                ]}
              />
            </div>
            <div className="lg:col-span-1">
              <RadialDistributionCard
                title="Students"
                totalLabel="Total"
                totalValue={stats?.totalStudents ? stats.totalStudents.toString() : '15000'}
                outerColor="#5B5FC7"
                outerPercent={75}
                outerLabel="Male"
                innerColor="#38BDF8"
                innerPercent={55}
                innerLabel="Female"
                onOptionsClick={() => navigate('/students')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <StarStudentsCard
                title="Star Students"
                onOptionsClick={() => navigate('/students')}
                onRowClick={() => navigate('/students')}
              />
            </div>
            <div className="lg:col-span-1">
              <RecentActivityFeedCard
                title="Dernières activités"
                onOptionsClick={() => navigate('/events')}
                onItemClick={(item) => {
                  if (item.title?.includes('Teacher')) navigate('/teachers')
                  else if (item.title?.includes('Fees')) navigate('/finances/invoices')
                  else navigate('/events')
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
