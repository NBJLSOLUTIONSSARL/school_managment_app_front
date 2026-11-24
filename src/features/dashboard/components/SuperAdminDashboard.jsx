import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Activity,
  ShieldAlert,
  Server,
  Database,
  Mail,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
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

export function SuperAdminDashboard() {
  const navigate = useNavigate()

  const [systemServices] = useState([
    { name: 'API REST (Spring Boot 3.4)', status: 'Opérationnel', uptime: '99.99%', latency: '18ms', icon: Server, color: 'text-emerald-500' },
    { name: 'Base de données MySQL 8.0', status: 'Opérationnel', uptime: '99.98%', latency: '4ms', icon: Database, color: 'text-emerald-500' },
    { name: 'Cache Redis 7.0 Cluster', status: 'Opérationnel', uptime: '100%', latency: '1ms', icon: Zap, color: 'text-emerald-500' },
    { name: 'Service Mail SMTP / Mailpit', status: 'Opérationnel', uptime: '99.95%', latency: '42ms', icon: Mail, color: 'text-emerald-500' },
  ])

  const userDistribution = [
    { role: 'Élèves', count: 18450, percentage: 75, color: 'bg-blue-600' },
    { role: 'Parents / Tuteurs', count: 4820, percentage: 20, color: 'bg-sky-500' },
    { role: 'Enseignants', count: 980, percentage: 4, color: 'bg-indigo-600' },
    { role: 'Administration & Direction', count: 330, percentage: 1, color: 'bg-slate-700' },
  ]

  const recentAuditEvents = [
    { id: 'EV-8841', user: 'directeur.dupont@edutrack.school', action: 'TENANT_CONFIG_UPDATED', target: 'Lycée Victor Hugo', timestamp: 'Il y a 8 min', status: 'Succès' },
    { id: 'EV-8840', user: 'admin.system@edutrack.cloud', action: 'REDIS_CACHE_FLUSHED', target: 'Sessions Cluster', timestamp: 'Il y a 24 min', status: 'Succès' },
    { id: 'EV-8839', user: 'secretaire.martin@edutrack.school', action: 'BATCH_ADMISSIONS_EXPORT', target: 'Cohorte 2026-2027', timestamp: 'Il y a 1h', status: 'Succès' },
    { id: 'EV-8838', user: 'unknown@192.168.1.104', action: 'AUTH_FAILED_RATE_LIMIT', target: 'Endpoint /auth/login', timestamp: 'Il y a 2h', status: 'Bloqué' },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Super Admin Platform Console
            </h1>
            <Badge variant="blue" className="text-xs">
              Multi-Établissements
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Surveillance globale des tenants, métriques d'infrastructure, gestion des rôles et sécurité multi-écoles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/audit-logs')}
            className="cursor-pointer gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Journaux Sécurité</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/settings')}
            className="cursor-pointer gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Paramètres Globaux</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="shadow-xs hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/settings')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Établissements Actifs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Écoles</div>
            <p className="text-xs text-muted-foreground mt-1">+2 déployées ce trimestre</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/students')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Globaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,580</div>
            <p className="text-xs text-muted-foreground mt-1">Actifs sur l'ensemble des tenants</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité Système</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">99.98%</div>
            <p className="text-xs text-muted-foreground mt-1">Tous les services au vert</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/audit-logs')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements d'Audit 24h</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,429</div>
            <p className="text-xs text-muted-foreground mt-1">0 incident de sécurité</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Split Grid: System Health Matrix (2 cols) + Users Breakdown (1 col) */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* System Services Matrix */}
        <Card className="xl:col-span-2 shadow-xs">
          <CardHeader>
            <CardTitle>État de l'Infrastructure & Micro-services</CardTitle>
            <CardDescription>
              Santé en temps réel des couches d'application, bases de données et services asynchrones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {systemServices.map((srv) => {
                const Icon = srv.icon
                return (
                  <div
                    key={srv.name}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{srv.name}</p>
                        <p className="text-[11px] text-muted-foreground">Latence : {srv.latency}</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-2xs">
                      {srv.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Distribution per Role */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Répartition par Rôle</CardTitle>
            <CardDescription>Volume des comptes utilisateurs consolidés.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userDistribution.map((item) => (
              <div key={item.role} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{item.role}</span>
                  <span className="text-muted-foreground font-mono">{item.count.toLocaleString('fr-FR')} ({item.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Latest Global Audit Events Table */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-1">
            <CardTitle>Dernières Activités d'Audit Système</CardTitle>
            <CardDescription>
              Traces immuables des opérations administratives et modifications de configuration.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/audit-logs')}
            className="ml-auto gap-1 cursor-pointer"
          >
            <span>Voir le journal complet</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identifiant</TableHead>
                <TableHead>Utilisateur / Auteur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Horodatage</TableHead>
                <TableHead className="text-right">Résultat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAuditEvents.map((evt) => (
                <TableRow key={evt.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate('/audit-logs')}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{evt.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{evt.user}</TableCell>
                  <TableCell>
                    <code className="text-2xs bg-muted px-2 py-0.5 rounded border border-border">
                      {evt.action}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{evt.target}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{evt.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={evt.status === 'Succès' ? 'success' : 'destructive'} className="text-2xs">
                      {evt.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard
