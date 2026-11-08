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

      {/* Top 4 Pastel Metric Cards with Blue Palette */}
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
