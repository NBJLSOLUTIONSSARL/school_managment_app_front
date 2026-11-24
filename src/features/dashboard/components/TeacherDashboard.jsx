import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  Calendar,
  BookOpen,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { StarStudentsCard } from '@/components/ui/StarStudentsCard'
import { RecentActivityFeedCard } from '@/components/ui/RecentActivityFeedCard'
import { TodayScheduleWidget } from '@/features/timetables'
import { StaffClockWidget } from '@/features/attendance'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeacherData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getTeacherStats(user?.id)
      setStats(data)
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données enseignant.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let ignore = false
    statsService
      .getTeacherStats(user?.id)
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Erreur lors du chargement des données enseignant.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [user?.id])

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Professeur'

  // Custom activity feed for teachers with blue shades
  const teacherActivities = [
    {
      id: '1',
      title: 'Upcoming Math Exam',
      subtitle: 'Session planned for Grade 10 - Room 204',
      time: 'Tomorrow',
      icon: Award,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: '2',
      title: 'Grading Deadline',
      subtitle: 'End of Term 1 grade submission closes',
      time: 'In 3 days',
      icon: Calendar,
      iconBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#1D4ED8]',
    },
    {
      id: '3',
      title: 'New Syllabus Material',
      subtitle: 'Physics and Chemistry curriculum update',
      time: 'This week',
      icon: BookOpen,
      iconBg: 'bg-[#F0F9FF]',
      iconColor: 'text-[#0284C7]',
    },
  ]

  return (
    <div className="space-y-6 select-none">
      {/* Figma Signature Blue Banner */}
      <HeroBanner
        title={`Espace Enseignant · ${displayName}`}
        description="Gérez vos classes, planifiez les contrôles continus et procédez à la saisie des notes trimestrielles en direct."
        buttonText="Saisir les notes"
        onButtonClick={() => navigate('/grades')}
        icon={GraduationCap}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Évaluations et Examens — Gestion académique, saisie des notes et suivi de vos classes
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
            onClick={fetchTeacherData}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-2xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* shadcn dashboard-01 Top 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/departments')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Assignées</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.totalClasses ? `${stats.totalClasses} Classes` : '4 Classes')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Niveau Secondaire & Lycée</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/students')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élèves Suivis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.totalStudents ? `${stats.totalStudents}` : '142')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Répartis sur 4 divisions</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/exams')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Évaluations & Contrôles</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.totalExams ? `${stats.totalExams}` : '18')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">2 contrôles prévus cette semaine</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/grades')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.attendanceRate ? `${stats.attendanceRate}%` : '96.2%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+1.5% par rapport au T1</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Timetable & Presence Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TodayScheduleWidget title="Mon emploi du temps du jour" />
        <StaffClockWidget />
      </div>

      {/* Middle Row: Trend Wave Chart + Radial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ExamResultsWaveChart
            title="All Exam Results"
            series={[
              { name: 'Class Average', color: '#2563EB' },
              { name: 'Submissions', color: '#38BDF8' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <RadialDistributionCard
            title="Students"
            totalLabel="Enrolled"
            totalValue={(stats?.totalStudents || 142).toString()}
            outerColor="#2563EB"
            outerPercent={82}
            outerLabel="Present"
            innerColor="#38BDF8"
            innerPercent={64}
            innerLabel="Completed"
            onOptionsClick={() => navigate('/students')}
          />
        </div>
      </div>

      {/* Bottom Row: Star Students Table + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <StarStudentsCard
            title="Star Students"
            onOptionsClick={() => navigate('/grades')}
            onRowClick={() => navigate('/students')}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeedCard
            title="All Exam Results"
            items={teacherActivities}
            onOptionsClick={() => navigate('/exams')}
            onItemClick={() => navigate('/exams')}
          />
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
