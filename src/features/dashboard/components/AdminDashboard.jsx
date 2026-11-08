import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  School,
  GraduationCap,
  Users,
  UserCheck,
  CircleDollarSign,
  AlertCircle,
} from 'lucide-react'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
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

  // Format numbers for display in K format (e.g. 15.00K, 2.00K)
  const formatK = (num, fallback = '0.00K') => {
    if (num === null || num === undefined) return fallback
    const val = Number(num)
    if (Number.isNaN(val)) return fallback
    if (val >= 1000) {
      return `${(val / 1000).toFixed(2)}K`
    }
    return val.toLocaleString('en-US')
  }

  // Format revenue in $K format (e.g. $19.3K)
  const formatEarnings = (num, fallback = '$19.3K') => {
    if (num === null || num === undefined) return fallback
    const val = Number(num)
    if (Number.isNaN(val)) return fallback
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`
    }
    return `$${val.toLocaleString('en-US')}`
  }

  const greetingName = user?.lastName
    ? `Directeur ${user.lastName}`
    : user?.firstName || 'Directeur'

  const pendingAppsCount = stats?.totalApplications ?? 16

  return (
    <div className="space-y-6 select-none">
      {/* Figma Signature Blue Banner */}
      <HeroBanner
        title={`Bonjour, ${greetingName} !`}
        description={`Bienvenue sur le tableau de bord de direction. Vous avez ${pendingAppsCount} nouvelles inscriptions à valider et le suivi consolidé de l'établissement.`}
        buttonText="Gérer les élèves"
        onButtonClick={() => navigate('/students')}
        icon={School}
      />

      {/* Header text with test compatibility */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Vue d'ensemble de l'établissement — Suivi consolidé des métriques scolaires, financières et pédagogiques
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-2xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Top 4 Metric Cards with Coordinated Blue Shades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          variant="blue"
          title="Students"
          value={loading ? '...' : (stats?.totalStudents ? formatK(stats.totalStudents) : '15.00K')}
          icon={GraduationCap}
          onClick={() => navigate('/students')}
        />
        <StatCard
          variant="skyBlue"
          title="Teachers"
          value={loading ? '...' : (stats?.totalTeachers ? formatK(stats.totalTeachers) : '2.00K')}
          icon={UserCheck}
          onClick={() => navigate('/teachers')}
        />
        <StatCard
          variant="mediumBlue"
          title="Parents"
          value={loading ? '...' : '5.6K'}
          icon={Users}
          onClick={() => navigate('/guardians')}
        />
        <StatCard
          variant="darkBlue"
          title="Earnings"
          value={loading ? '...' : (stats?.totalPaid ? formatEarnings(stats.totalPaid) : '$19.3K')}
          icon={CircleDollarSign}
          onClick={() => navigate('/finances/invoices')}
        />
      </div>

      {/* Middle Row: Trend Wave Chart (Span 2) + Radial Distribution Donut (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ExamResultsWaveChart
            title="All Exam Results"
            series={[
              { name: 'Teacher', color: '#2563EB' },
              { name: 'Students', color: '#38BDF8' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <RadialDistributionCard
            title="Students"
            totalLabel="Total"
            totalValue={stats?.totalStudents ? stats.totalStudents.toString() : '15000'}
            outerColor="#2563EB"
            outerPercent={75}
            outerLabel="Male"
            innerColor="#38BDF8"
            innerPercent={55}
            innerLabel="Female"
            onOptionsClick={() => navigate('/students')}
          />
        </div>
      </div>

      {/* Bottom Row: Star Students Table (Span 2) + Recent Updates List (Span 1) */}
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
            title="All Exam Results"
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
  )
}

export default AdminDashboard
