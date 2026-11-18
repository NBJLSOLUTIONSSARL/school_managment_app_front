import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  School,
  Users,
  UserCheck,
  DollarSign,
  Activity,
  ArrowUpRight,
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
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { ExamResultsWaveChart } from '@/components/ui/ExamResultsWaveChart'
import { RadialDistributionCard } from '@/components/ui/RadialDistributionCard'
import { statsService } from '../api/statsService'

export function AdminDashboard() {
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

  // Format revenue in €K format (e.g. €19.3K)
  const formatEarnings = (num, fallback = '€45,231.89') => {
    if (num === null || num === undefined) return fallback
    const val = Number(num)
    if (Number.isNaN(val)) return fallback
    if (val >= 1000) {
      return `€${val.toLocaleString('en-US')}`
    }
    return `€${val.toLocaleString('en-US')}`
  }

  const transactions = [
    {
      id: 'TX-1049',
      student: 'Liam Johnson',
      email: 'liam.johnson@edutrack.school',
      type: 'Écolage Annuel',
      status: 'Payé',
      variant: 'success',
      date: '2026-11-15',
      amount: '€750.00',
    },
    {
      id: 'TX-1048',
      student: 'Olivia Martin',
      email: 'olivia.m@edutrack.school',
      type: 'Frais Inscription',
      status: 'Payé',
      variant: 'success',
      date: '2026-11-14',
      amount: '€250.00',
    },
    {
      id: 'TX-1047',
      student: 'Noah Williams',
      email: 'noah.w@edutrack.school',
      type: 'Cantine Scolaire',
      status: 'En attente',
      variant: 'warning',
      date: '2026-11-14',
      amount: '€180.00',
    },
    {
      id: 'TX-1046',
      student: 'Emma Brown',
      email: 'emma.b@edutrack.school',
      type: 'Transport T1',
      status: 'Payé',
      variant: 'success',
      date: '2026-11-12',
      amount: '€120.00',
    },
    {
      id: 'TX-1045',
      student: 'Lucas Davis',
      email: 'lucas.d@edutrack.school',
      type: 'Écolage Trimestre 2',
      status: 'Validé',
      variant: 'blue',
      date: '2026-11-10',
      amount: '€450.00',
    },
  ]

  const recentActivities = [
    {
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      initials: 'OM',
      roleOrClass: 'Terminale S1 · Inscription validée',
      amount: '+€1,999.00',
    },
    {
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      initials: 'JL',
      roleOrClass: 'Première L2 · Frais réglés',
      amount: '+€39.00',
    },
    {
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      initials: 'IN',
      roleOrClass: 'Seconde A · Dossier médical à jour',
      amount: '+€299.00',
    },
    {
      name: 'William Kim',
      email: 'will@email.com',
      initials: 'WK',
      roleOrClass: 'Troisième B · Club Robotique',
      amount: '+€99.00',
    },
    {
      name: 'Sofia Davis',
      email: 'sofia.davis@email.com',
      initials: 'SD',
      roleOrClass: 'Quatrième C · Transport validé',
      amount: '+€39.00',
    },
  ]

  const totalStudents = stats?.totalStudents ?? 350
  const totalTeachers = stats?.totalTeachers ?? 28
  const totalClasses = stats?.totalClasses ?? 12
  const attendanceRate = stats?.attendanceRate ?? 94
  const totalPaid = stats?.totalPaid ?? 45231.89

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6 select-none">
      {/* Header with live metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h1 className="text-display-md font-display font-bold tracking-tight text-[var(--ink)]">
            Tableau de bord — Établissement
          </h1>
          <p className="text-body text-[var(--ink-muted)] mt-1">
            {totalStudents} élèves · {totalTeachers} enseignants · {totalClasses} classes · {attendanceRate}% assiduité
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/students')}
            className="cursor-pointer gap-1.5"
          >
            <School className="w-4 h-4" />
            <span>Gérer les élèves</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-card border border-[var(--rose)]/20 bg-[var(--rose-wash)] text-[var(--rose)] text-body flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="cursor-pointer text-caption"
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Metric Cards — 4 key indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          interactive
          onClick={() => navigate('/finances/invoices')}
          className="animate-entrance animate-entrance-stagger-1"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recettes du mois</CardTitle>
            <DollarSign className="h-4 w-4 text-[var(--ink-muted)]" />
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-display font-bold text-[var(--ink)]">
              {loading ? '...' : formatEarnings(totalPaid)}
            </div>
            <p className="text-caption text-[var(--ink-muted)] mt-1">
              +20.1% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card
          interactive
          onClick={() => navigate('/students')}
          className="animate-entrance animate-entrance-stagger-2"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Élèves inscrits</CardTitle>
            <Users className="h-4 w-4 text-[var(--ink-muted)]" />
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-display font-bold text-[var(--ink)]">
              {loading ? '...' : formatK(totalStudents)}
            </div>
            <p className="text-caption text-[var(--ink-muted)] mt-1">
              +180 nouvelles inscriptions
            </p>
          </CardContent>
        </Card>

        <Card
          interactive
          onClick={() => navigate('/teachers')}
          className="animate-entrance animate-entrance-stagger-3"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Corps enseignant</CardTitle>
            <UserCheck className="h-4 w-4 text-[var(--ink-muted)]" />
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-display font-bold text-[var(--ink)]">
              {loading ? '...' : formatK(totalTeachers)}
            </div>
            <p className="text-caption text-[var(--ink-muted)] mt-1">
              +19% actifs cette semaine
            </p>
          </CardContent>
        </Card>

        <Card
          interactive
          onClick={() => navigate('/attendance')}
          className="animate-entrance animate-entrance-stagger-4"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Taux de présence</CardTitle>
            <Activity className="h-4 w-4 text-[var(--ink-muted)]" />
          </CardHeader>
          <CardContent>
            <div className="text-display-lg font-display font-bold text-[var(--ink)]">
              {loading ? '...' : `${attendanceRate}%`}
            </div>
            <p className="text-caption text-[var(--ink-muted)] mt-1">
              +201 connectés cette heure
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Split Grid: Transactions (col-span-2) + Recent Activity (col-span-1) */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Left Column: Transactions & Invoices Table */}
        <Card className="xl:col-span-2 animate-entrance animate-entrance-stagger-5">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Derniers règlements</CardTitle>
              <CardDescription>
                Ecolage, cantine, transport — derniers paiements enregistrés.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/finances/invoices')}
              className="ml-auto gap-1 cursor-pointer"
            >
              <span>Voir tout</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève / Tuteur</TableHead>
                  <TableHead className="hidden xl:table-cell">Type</TableHead>
                  <TableHead className="hidden xl:table-cell">Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} selectable onClick={() => navigate('/finances/invoices')}>
                    <TableCell>
                      <div className="font-medium text-[var(--ink)]">{tx.student}</div>
                      <div className="hidden text-caption text-[var(--ink-muted)] md:inline">
                        {tx.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-[var(--ink-muted)]">
                      {tx.type}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant={tx.variant} className="text-caption">
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[var(--ink-muted)]">
                      {tx.date}
                    </TableCell>
                    <TableCell className="text-right font-medium text-[var(--ink)] font-mono">
                      {tx.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column: Recent Activities */}
        <Card className="animate-entrance animate-entrance-stagger-6">
          <CardHeader>
            <CardTitle>Inscriptions récentes</CardTitle>
            <CardDescription>
              Nouveaux élèves et mouvements récents.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recentActivities.map((act) => (
              <div key={act.name} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[var(--blue-wash)] text-[var(--blue-core)] text-caption font-bold">
                    {act.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5 min-w-0">
                  <p className="text-body font-semibold leading-none truncate text-[var(--ink)]">
                    {act.name}
                  </p>
                  <p className="text-caption text-[var(--ink-muted)] truncate">
                    {act.roleOrClass}
                  </p>
                </div>
                <div className="ml-auto font-medium text-caption text-[var(--ink)] shrink-0 font-mono">
                  {act.amount}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Academic Insights Grid */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-entrance animate-entrance-stagger-7">
          <ExamResultsWaveChart
            title="Résultats d'examens"
            series={[
              { name: 'Enseignants', color: '#1E40AF' },
              { name: 'Élèves', color: '#38BDF8' },
            ]}
          />
        </div>
        <div className="animate-entrance animate-entrance-stagger-8">
          <RadialDistributionCard
            title="Répartition élèves"
            totalLabel="Total"
            totalValue={totalStudents.toString()}
            outerColor="#1E40AF"
            outerPercent={75}
            outerLabel="Garçons"
            innerColor="#38BDF8"
            innerPercent={55}
            innerLabel="Filles"
            onOptionsClick={() => navigate('/students')}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard