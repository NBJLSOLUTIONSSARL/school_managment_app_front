import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileText,
  Coins,
  Calendar,
  Building2,
  Users,
} from 'lucide-react'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { StarStudentsCard } from '@/components/ui/StarStudentsCard'
import { RecentActivityFeedCard } from '@/components/ui/RecentActivityFeedCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function ParentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)

  const fetchParentData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getParentStats(user?.id)
      setStats(data)
    } catch (err) {
      setError(err.message || 'Impossible de synchroniser le dossier parental.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let ignore = false
    statsService
      .getParentStats(user?.id)
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Impossible de synchroniser le dossier parental.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [user?.id])

  const children = stats?.children || [
    { id: 1, firstName: 'Thomas', lastName: 'Dupont', grade: 'Seconde A', average: 15.8, attendance: 97 },
  ]
  const currentChild = children[selectedChildIndex] || children[0]

  const parentActivities = [
    {
      id: '1',
      title: 'Parent-Teacher Meeting',
      subtitle: 'Individual consultation scheduled with French teacher',
      time: 'Friday 17:30',
      icon: Calendar,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: '2',
      title: 'Term 1 Tuition Paid',
      subtitle: 'Receipt #INV-2026-089 validated by accounting',
      time: 'Yesterday',
      icon: Coins,
      iconBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#1D4ED8]',
    },
    {
      id: '3',
      title: 'School Excursion Consent',
      subtitle: 'Science museum field trip form signed',
      time: '3 days ago',
      icon: Building2,
      iconBg: 'bg-[#F0F9FF]',
      iconColor: 'text-[#0284C7]',
    },
  ]

  return (
    <div className="space-y-6 select-none">
      {/* Figma Signature Blue Banner */}
      <HeroBanner
        title="Espace Famille · Suivi Scolaire"
        description="Accédez aux résultats d'évaluations, au suivi d'assiduité et aux communications de l'établissement en temps réel."
        buttonText="Bulletins scolaires"
        onButtonClick={() => navigate('/report-cards')}
        icon={Users}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Parent Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Espace Parents — Suivi académique, assiduité et scolarité de vos enfants
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
            onClick={fetchParentData}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-2xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {children.length === 0 && !loading ? (
        <EmptyState
          title="Aucun élève rattaché"
          description="Votre compte tuteur n'est actuellement associé à aucun dossier élève. Veuillez contacter le secrétariat pour la liaison du compte."
        />
      ) : (
        <>
          {/* Child Selector Tabs (if multiple children) */}
          {children.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider shrink-0">
                Enfant suivi :
              </span>
              {children.map((child, idx) => (
                <button
                  type="button"
                  key={child.id || idx}
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedChildIndex === idx
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                  }`}
                >
                  <span>{child.firstName} {child.lastName}</span>
                  <span className="text-[10px] opacity-75">({child.grade || 'Élève'})</span>
                </button>
              ))}
            </div>
          )}

          {/* Top 4 Pastel Metric Cards with Blue Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              variant="blue"
              title="Student Average"
              value={loading ? '...' : (currentChild?.average ? `${currentChild.average} / 20` : '15.8 / 20')}
              icon={Award}
              onClick={() => navigate('/report-cards')}
            />
            <StatCard
              variant="skyBlue"
              title="Attendance"
              value={loading ? '...' : (currentChild?.attendance ? `${currentChild.attendance}%` : '97.0%')}
              icon={CheckCircle2}
              onClick={() => navigate('/observations')}
            />
            <StatCard
              variant="mediumBlue"
              title="Homework"
              value={loading ? '...' : '2 Tasks'}
              icon={FileText}
              onClick={() => navigate('/homework')}
            />
            <StatCard
              variant="darkBlue"
              title="School Fees"
              value={loading ? '...' : (stats?.unpaidAmount ? `${stats.unpaidAmount} €` : '0 € Dû')}
              icon={Coins}
              onClick={() => navigate('/finances/invoices')}
            />
          </div>

          {/* Middle Row: Trend Wave Chart + Radial Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <ExamResultsWaveChart
                title="All Exam Results"
                series={[
                  { name: `${currentChild?.firstName || 'Student'} Marks`, color: '#2563EB' },
                  { name: 'Class Benchmark', color: '#38BDF8' },
                ]}
              />
            </div>
            <div className="lg:col-span-1">
              <RadialDistributionCard
                title="Attendance & Progress"
                totalLabel="Average"
                totalValue={currentChild?.average ? `${currentChild.average}/20` : '15.8/20'}
                outerColor="#2563EB"
                outerPercent={97}
                outerLabel="Presence"
                innerColor="#38BDF8"
                innerPercent={78}
                innerLabel="Grades"
                onOptionsClick={() => navigate('/report-cards')}
              />
            </div>
          </div>

          {/* Bottom Row: Star Students / Term Summary + Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <StarStudentsCard
                title="Term Grades Summary"
                onOptionsClick={() => navigate('/report-cards')}
              />
            </div>
            <div className="lg:col-span-1">
              <RecentActivityFeedCard
                title="All Exam Results"
                items={parentActivities}
                onOptionsClick={() => navigate('/events')}
                onItemClick={() => navigate('/events')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ParentDashboard
