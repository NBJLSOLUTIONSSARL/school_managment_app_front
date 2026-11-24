import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  GraduationCap,
  FileText,
  TrendingUp,
  BookOpen,
  Calendar,
} from 'lucide-react'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { StarStudentsCard } from '@/components/ui/StarStudentsCard'
import { RecentActivityFeedCard } from '@/components/ui/RecentActivityFeedCard'
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

  const studentActivities = [
    {
      id: '1',
      title: 'Devoir de mathématiques remis',
      subtitle: 'Chapitre 4 Algèbre · Note obtenue : 18/20',
      time: 'Il y a 2h',
      icon: BookOpen,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      id: '2',
      title: 'Dissertation de français',
      subtitle: 'Commentaire littéraire sur Molière',
      time: 'Demain, 14:00',
      icon: FileText,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      id: '3',
      title: 'Planning des examens S1',
      subtitle: 'Calendrier des épreuves semestrielles publié',
      time: 'Hier',
      icon: Calendar,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
  ]

  return (
    <div className="space-y-6 select-none">
      {/* Calm Scholastic Desk Banner */}
      <HeroBanner
        title={`Bienvenue, ${displayName}`}
        description="Consultez votre progression académique, vos devoirs à rendre et vos derniers résultats d'examens."
        buttonText="Mes devoirs"
        onButtonClick={() => navigate('/homework')}
        icon={BookOpen}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            Espace Personnel
          </h2>
          <p className="text-2xs font-medium text-slate-500 mt-0.5">
            Suivi des cours, devoirs et moyennes académiques
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchStudentData}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded text-2xs font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          variant="blue"
          title="General Average"
          value={loading ? '...' : (stats?.generalAverage ? `${stats.generalAverage} / 20` : '16.5 / 20')}
          icon={Award}
          onClick={() => navigate('/report-cards')}
        />
        <StatCard
          variant="skyBlue"
          title="Class Rank"
          value={loading ? '...' : (stats?.rank ? `#${stats.rank} / 32` : '#2 / 32')}
          icon={GraduationCap}
          onClick={() => navigate('/report-cards')}
        />
        <StatCard
          variant="mediumBlue"
          title="Pending Tasks"
          value={loading ? '...' : (stats?.pendingHomework ? `${stats.pendingHomework} Tasks` : '3 Tasks')}
          icon={FileText}
          onClick={() => navigate('/homework')}
        />
        <StatCard
          variant="darkBlue"
          title="Attendance"
          value={loading ? '...' : (stats?.attendanceRate ? `${stats.attendanceRate}%` : '98.0%')}
          icon={TrendingUp}
          onClick={() => navigate('/observations')}
        />
      </div>

      {/* Middle Row: Trend Wave Chart + Radial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ExamResultsWaveChart
            title="All Exam Results"
            series={[
              { name: 'My Results', color: '#5B5FC7' },
              { name: 'Class Average', color: '#CBD5E1' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <RadialDistributionCard
            title="Performance"
            totalLabel="Average"
            totalValue={stats?.generalAverage ? `${stats.generalAverage}/20` : '16.5/20'}
            outerColor="#5B5FC7"
            outerPercent={85}
            outerLabel="Homework"
            innerColor="#38BDF8"
            innerPercent={70}
            innerLabel="Exams"
            onOptionsClick={() => navigate('/report-cards')}
          />
        </div>
      </div>

      {/* Bottom Row: Star Students / Leaderboard + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <StarStudentsCard
            title="Class Leaderboard"
            onOptionsClick={() => navigate('/report-cards')}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeedCard
            title="Devoirs et échéances"
            items={studentActivities}
            onOptionsClick={() => navigate('/homework')}
            onItemClick={() => navigate('/homework')}
          />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
