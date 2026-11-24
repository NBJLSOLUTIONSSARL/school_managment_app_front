import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  School,
  GraduationCap,
  UserCheck,
  DollarSign,
  Activity,
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Palmtree,
  Brain,
  AlertCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { statsService } from '../api/statsService'

export function DirectorDashboard() {
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
      setError(err.message || 'Erreur lors du chargement des statistiques de direction.')
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

  const pendingItems = [
    {
      id: 'p-1',
      title: 'Inscriptions & Candidatures',
      count: stats?.totalApplications || 16,
      subtext: 'Dossiers en attente de décision de direction',
      route: '/admissions',
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'p-2',
      title: 'Documents Légaux à Vérifier',
      count: 8,
      subtext: 'Certificats médicaux et pièces d’identité',
      route: '/documents',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'p-3',
      title: 'Demandes de Congés Enseignants',
      count: 4,
      subtext: 'Autorisations d’absence à valider',
      route: '/leave-requests',
      icon: Palmtree,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'p-4',
      title: 'Analyses IA Pédagogiques',
      count: 6,
      subtext: 'Rapports d’adaptation pédagogique à approuver',
      route: '/analyses',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const classAttendanceOverview = [
    { className: 'Terminale S1', teacher: 'Claire Martin', presenceRate: '98.5%', status: 'Excellente', badgeVariant: 'success' },
    { className: 'Première L2', teacher: 'David Robert', presenceRate: '96.2%', status: 'Bonne', badgeVariant: 'success' },
    { className: 'Seconde A', teacher: 'Michel Bernard', presenceRate: '91.8%', status: 'Attention', badgeVariant: 'warning' },
    { className: 'Troisième B', teacher: 'Sophie Laurent', presenceRate: '97.4%', status: 'Excellente', badgeVariant: 'success' },
    { className: 'Quatrième C', teacher: 'Alexandre Roux', presenceRate: '88.3%', status: 'Alerte Absence', badgeVariant: 'destructive' },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Tableau de Bord de Direction
            </h1>
            <Badge variant="blue" className="text-xs">
              Directeur
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Vue d'ensemble de l'établissement — Suivi consolidé des effectifs, de l'assiduité, des finances et des validations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/reports')}
            className="cursor-pointer gap-1.5"
          >
            <span>Rapports & Exports</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admissions')}
            className="cursor-pointer gap-1.5"
          >
            <School className="w-4 h-4" />
            <span>Admissions</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="cursor-pointer text-xs"
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* shadcn dashboard-01 Top 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/students')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effectif Élèves</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.totalStudents ? stats.totalStudents.toLocaleString('fr-FR') : '1 248')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Répartis sur 42 classes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/teachers')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corps Enseignant</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.totalTeachers ? stats.totalTeachers : '84')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">100% postes pourvus</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/attendance')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Assiduité</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.attendanceRate ? `${stats.attendanceRate}%` : '96.4%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+1.8% vs semaine précédente</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/finances/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Scolaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (stats?.totalPaid ? `$${stats.totalPaid.toLocaleString('fr-FR')}` : '$186,000')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">94% taux de recouvrement</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items to Validate (Spec requirement for Director) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pendingItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition cursor-pointer shadow-2xs hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <div className={`w-8 h-8 rounded-lg ${item.bgColor} ${item.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {item.count} en attente
                </Badge>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.subtext}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Split Grid: Class Attendance Monitoring + Financial Snapshot */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        {/* Class Attendance Table */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Suivi de l'Assiduité par Classe</CardTitle>
              <CardDescription>
                Surveillance des taux de présence et détection des alertes d'absentéisme répété.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/attendance')}
              className="ml-auto gap-1 cursor-pointer"
            >
              <span>Détails</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe / Division</TableHead>
                  <TableHead>Professeur Principal</TableHead>
                  <TableHead>Taux Présence</TableHead>
                  <TableHead className="text-right">État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classAttendanceOverview.map((row) => (
                  <TableRow key={row.className} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate('/attendance')}>
                    <TableCell className="font-semibold text-foreground">{row.className}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{row.teacher}</TableCell>
                    <TableCell className="font-mono text-xs font-medium">{row.presenceRate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={row.badgeVariant} className="text-2xs">
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Radial Distribution Donut */}
        <div className="lg:col-span-1">
          <RadialDistributionCard
            title="Répartition Élèves"
            totalLabel="Total"
            totalValue={stats?.totalStudents ? stats.totalStudents.toString() : '1248'}
            outerColor="#2563EB"
            outerPercent={52}
            outerLabel="Filles"
            innerColor="#38BDF8"
            innerPercent={48}
            innerLabel="Garçons"
            onOptionsClick={() => navigate('/students')}
          />
        </div>
      </div>

      {/* Academic Wave Chart */}
      <ExamResultsWaveChart
        title="Progression des Résultats d'Examens"
        series={[
          { name: 'Moyenne Trimestrielle', color: '#2563EB' },
          { name: 'Objectif Académique', color: '#38BDF8' },
        ]}
      />
    </div>
  )
}

export default DirectorDashboard
