import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  GraduationCap,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { StarStudentsCard } from '@/components/ui/StarStudentsCard'
import { RecentActivityFeedCard } from '@/components/ui/RecentActivityFeedCard'
import { TodayScheduleWidget } from '@/features/timetables'
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
      title: 'Math Homework Submitted',
      subtitle: 'Algebra Chapter 4 - Graded: 18/20',
      time: '2 hours ago',
      icon: BookOpen,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: '2',
      title: 'French Essay Due',
      subtitle: 'Literary commentary on Molière',
      time: 'Tomorrow, 14:00',
      icon: FileText,
      iconBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#1D4ED8]',
    },
    {
      id: '3',
      title: 'Term 1 Exam Schedule',
      subtitle: 'Final examination timetable published',
      time: 'Yesterday',
      icon: Calendar,
      iconBg: 'bg-[#F0F9FF]',
      iconColor: 'text-[#0284C7]',
    },
  ]

  return (
    <div className="space-y-6 select-none">
      {/* Figma Signature Blue Banner */}
      <HeroBanner
        title={`Bienvenue, ${displayName} !`}
        description="Consultez votre progression académique, vos devoirs à rendre et vos derniers résultats d'examens."
        buttonText="Mes devoirs"
        onButtonClick={() => navigate('/homework')}
        icon={BookOpen}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Espace Personnel — Suivi des cours, devoirs et moyennes académiques
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
            onClick={fetchStudentData}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-2xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* shadcn dashboard-01 Top 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/report-cards')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.generalAverage ? `${stats.generalAverage} / 20` : '16.5 / 20')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Félicitations du conseil</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/report-cards')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rang dans la classe</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.rank ? `#${stats.rank} / 32` : '#2 / 32')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Top 5% de la division</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/homework')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devoirs & Tâches</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.pendingHomework ? `${stats.pendingHomework} Devoirs` : '3 Devoirs')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">À rendre cette semaine</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/attendance')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Assiduité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.attendanceRate ? `${stats.attendanceRate}%` : '98.0%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">0 absence injustifiée</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Timetable Widget */}
      <TodayScheduleWidget title="Mes cours d'aujourd'hui" />

      {/* Middle Row: Trend Wave Chart + Radial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ExamResultsWaveChart
            title="All Exam Results"
            series={[
              { name: 'My Results', color: '#2563EB' },
              { name: 'Class Average', color: '#38BDF8' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <RadialDistributionCard
            title="Performance"
            totalLabel="Average"
            totalValue={stats?.generalAverage ? `${stats.generalAverage}/20` : '16.5/20'}
            outerColor="#2563EB"
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
            title="All Exam Results"
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
