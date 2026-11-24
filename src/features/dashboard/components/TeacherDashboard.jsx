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
import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { StarStudentsCard } from '@/components/ui/StarStudentsCard'
import { RecentActivityFeedCard } from '@/components/ui/RecentActivityFeedCard'
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

  // Custom activity feed for teachers with quiet craft tokens
  const teacherActivities = [
    {
      id: '1',
      title: 'Contrôle de mathématiques',
      subtitle: 'Session programmée en classe de 2nde A · Salle 204',
      time: 'Demain',
      icon: Award,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      id: '2',
      title: 'Clôture de saisie des notes',
      subtitle: 'Date limite du conseil pédagogique de trimestre',
      time: 'Dans 3 jours',
      icon: Calendar,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      id: '3',
      title: 'Support de cours partagé',
      subtitle: 'Nouveau chapitre de physique distribué aux élèves',
      time: 'Cette semaine',
      icon: BookOpen,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
  ]

  return (
    <div className="space-y-6 select-none">
      {/* Calm Scholastic Desk Banner */}
      <HeroBanner
        title={`Espace Enseignant · ${displayName}`}
        description="Gérez vos classes, planifiez les contrôles continus et procédez à la saisie des notes trimestrielles en direct."
        buttonText="Saisir les notes"
        onButtonClick={() => navigate('/grades')}
        icon={GraduationCap}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            Évaluations et Examens
          </h2>
          <p className="text-2xs font-medium text-slate-500 mt-0.5">
            Gestion académique, saisie des notes et suivi de vos classes
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
            onClick={fetchTeacherData}
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
          title="Classes"
          value={loading ? '...' : (stats?.totalClasses ? `${stats.totalClasses} Classes` : '4 Classes')}
          icon={GraduationCap}
          onClick={() => navigate('/departments')}
        />
        <StatCard
          variant="skyBlue"
          title="Students"
          value={loading ? '...' : (stats?.totalStudents ? `${stats.totalStudents}` : '142')}
          icon={Users}
          onClick={() => navigate('/students')}
        />
        <StatCard
          variant="mediumBlue"
          title="Exams"
          value={loading ? '...' : (stats?.totalExams ? `${stats.totalExams}` : '18')}
          icon={Award}
          onClick={() => navigate('/exams')}
        />
        <StatCard
          variant="darkBlue"
          title="Pass Rate"
          value={loading ? '...' : (stats?.attendanceRate ? `${stats.attendanceRate}%` : '96.2%')}
          icon={TrendingUp}
          onClick={() => navigate('/grades')}
        />
      </div>

      {/* Middle Row: Trend Wave Chart + Radial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ExamResultsWaveChart
            title="All Exam Results"
            series={[
              { name: 'Class Average', color: '#5B5FC7' },
              { name: 'Submissions', color: '#CBD5E1' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <RadialDistributionCard
            title="Students"
            totalLabel="Enrolled"
            totalValue={(stats?.totalStudents || 142).toString()}
            outerColor="#5B5FC7"
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
            title="Échéances pédagogiques"
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
