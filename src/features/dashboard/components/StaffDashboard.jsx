import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  FileCheck,
  Users,
  Coins,
  Receipt,
  UserPlus,
  FileText,
} from 'lucide-react'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { StarStudentsCard } from '@/components/ui/StarStudentsCard'
import { RecentActivityFeedCard } from '@/components/ui/RecentActivityFeedCard'
import { statsService } from '../api/statsService'

export function StaffDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStaffData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsService.getStaffStats()
      setStats(data)
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des statistiques du secrétariat.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    statsService
      .getStaffStats()
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Erreur lors du chargement des statistiques du secrétariat.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  const staffActivities = [
    {
      id: '1',
      title: 'New Student Admission',
      subtitle: 'Dossier #ADM-2026-45 submitted for review',
      time: '10 min ago',
      icon: UserPlus,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: '2',
      title: 'Tuition Receipt Generated',
      subtitle: 'Monthly billing cycle compiled (140 invoices)',
      time: 'Today',
      icon: Receipt,
      iconBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#1D4ED8]',
    },
    {
      id: '3',
      title: 'Attendance Report Printed',
      subtitle: 'Weekly absence log verified for prefect',
      time: 'Yesterday',
      icon: FileText,
      iconBg: 'bg-[#F0F9FF]',
      iconColor: 'text-[#0284C7]',
    },
  ]

  return (
    <div className="space-y-6 select-none">
      {/* Figma Signature Blue Banner */}
      <HeroBanner
        title="Secrétariat & Administration"
        description="Gestion opérationnelle des dossiers d'admissions, du registre des élèves et des encaissements scolaires."
        buttonText="Admissions en attente"
        onButtonClick={() => navigate('/admissions')}
        icon={FileCheck}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Staff Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Secrétariat Scolaire — Gestion administrative, admissions et facturation
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
            onClick={fetchStaffData}
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
          title="Applications"
          value={loading ? '...' : (stats?.totalApplications ? `${stats.totalApplications}` : '24')}
          icon={FileCheck}
          onClick={() => navigate('/admissions')}
        />
        <StatCard
          variant="skyBlue"
          title="Total Students"
          value={loading ? '...' : (stats?.totalStudents ? `${stats.totalStudents}` : '1 248')}
          icon={Users}
          onClick={() => navigate('/students')}
        />
        <StatCard
          variant="mediumBlue"
          title="Pending Invoices"
          value={loading ? '...' : (stats?.unpaidInvoicesCount ? `${stats.unpaidInvoicesCount}` : '14')}
          icon={AlertCircle}
          onClick={() => navigate('/finances/invoices')}
        />
        <StatCard
          variant="darkBlue"
          title="Revenue Collected"
          value={loading ? '...' : (stats?.totalPaidAmount ? `$${Math.round(stats.totalPaidAmount / 1000)}K` : '$186K')}
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
              { name: 'Admissions Processed', color: '#2563EB' },
              { name: 'Registered Students', color: '#38BDF8' },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <RadialDistributionCard
            title="Applications"
            totalLabel="Total"
            totalValue={(stats?.totalApplications || 24).toString()}
            outerColor="#2563EB"
            outerPercent={70}
            outerLabel="Accepted"
            innerColor="#38BDF8"
            innerPercent={30}
            innerLabel="Pending"
            onOptionsClick={() => navigate('/admissions')}
          />
        </div>
      </div>

      {/* Bottom Row: Star Students / Registrations Table + Recent Tasks */}
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
            items={staffActivities}
            onOptionsClick={() => navigate('/events')}
            onItemClick={() => navigate('/admissions')}
          />
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
