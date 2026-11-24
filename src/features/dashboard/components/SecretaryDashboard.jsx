import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardCheck,
  FileText,
  Calendar,
  AlertCircle,
  Users,
  CheckCircle2,
  Printer,
  ArrowUpRight,
  Clock,
  UserPlus,
  FileCheck,
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

export function SecretaryDashboard() {
  const navigate = useNavigate()

  const [recentApplications] = useState([
    { id: 'APP-2026-089', applicant: 'Gabriel Moreau', grade: 'Seconde Générale', parent: 'Claire Moreau', status: 'Entretien prévu', badgeVariant: 'blue', date: '2026-11-16' },
    { id: 'APP-2026-088', applicant: 'Emma Lefebvre', grade: 'Sixième A', parent: 'Marc Lefebvre', status: 'Dossier complet', badgeVariant: 'success', date: '2026-11-15' },
    { id: 'APP-2026-087', applicant: 'Lucas Dubois', grade: 'Première S', parent: 'Sophie Dubois', status: 'Pièces manquantes', badgeVariant: 'warning', date: '2026-11-14' },
    { id: 'APP-2026-086', applicant: 'Sarah Benali', grade: 'Terminale ES', parent: 'Youssef Benali', status: 'En attente test', badgeVariant: 'secondary', date: '2026-11-12' },
  ])

  const todayInterviews = [
    { time: '09:00', student: 'Gabriel Moreau', parent: 'Claire Moreau', room: 'Bureau Secrétariat A', status: 'Confirmé' },
    { time: '10:30', student: 'Emma Lefebvre', parent: 'Marc Lefebvre', room: 'Salle des Entretiens', status: 'En cours' },
    { time: '14:00', student: 'Arthur Simon', parent: 'Hélène Simon', room: 'Bureau Secrétariat A', status: 'Confirmé' },
    { time: '15:30', student: 'Chloé Roux', parent: 'Patrick Roux', room: 'Salle de Réunion 2', status: 'En attente' },
  ]

  const secretaryShortcuts = [
    { title: 'Certificat de Scolarité', desc: 'Éditer et imprimer un certificat officiel', route: '/documents', icon: Printer },
    { title: 'Vérification des Documents', desc: 'Examiner les pièces justificatives déposées', route: '/documents', icon: FileCheck },
    { title: 'Justifications d’Absence', desc: 'Traiter les justificatifs transmis par les parents', route: '/attendance', icon: CheckCircle2 },
    { title: 'Liaison Tuteur-Élève', desc: 'Rattacher un parent ou modifier la garde', route: '/guardians', icon: Users },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Secrétariat & Accueil Scolaire
            </h1>
            <Badge variant="blue" className="text-xs">
              Secrétaire
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            File d'attente des admissions, gestion des pièces légales, planification des entretiens et attestations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/guardians')}
            className="cursor-pointer gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Parents & Tuteurs</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admissions')}
            className="cursor-pointer gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouvelle Candidature</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/admissions')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dossiers d'Admission</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 Dossiers</div>
            <p className="text-xs text-muted-foreground mt-1">Dont 8 à examiner ce jour</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/documents')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pièces en Attente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 Documents</div>
            <p className="text-xs text-muted-foreground mt-1">Certificats et pièces d'identité</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/events')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entretiens du Jour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 Prévus</div>
            <p className="text-xs text-muted-foreground mt-1">Prochain entretien à 10h30</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/admissions')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dossiers Incomplets</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">11 Élèves</div>
            <p className="text-xs text-muted-foreground mt-1">Relances automatiques envoyées</p>
          </CardContent>
        </Card>
      </div>

      {/* Split Grid: Applications Queue + Today's Interviews */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        {/* Applications Queue Table */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>File des Inscriptions & Candidatures</CardTitle>
              <CardDescription>
                Dossiers en attente de vérification documentaire et planification des tests.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admissions')}
              className="ml-auto gap-1 cursor-pointer"
            >
              <span>Gérer les admissions</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Classe demandée</TableHead>
                  <TableHead>Parent référent</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApplications.map((app) => (
                  <TableRow key={app.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate('/admissions')}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{app.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{app.applicant}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{app.grade}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{app.parent}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={app.badgeVariant} className="text-2xs">
                        {app.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Today's Interviews */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Entretiens d'Aujourd'hui</CardTitle>
            <CardDescription>Rendez-vous parents et tests d'admission.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayInterviews.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">{item.time}</span>
                    <Badge variant={item.status === 'En cours' ? 'default' : 'secondary'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate mt-0.5">{item.student}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.parent} • {item.room}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Raccourcis Opérationnels du Secrétariat</CardTitle>
          <CardDescription>Accès instantané aux tâches administratives récurrentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {secretaryShortcuts.map((sc) => {
              const Icon = sc.icon
              return (
                <div
                  key={sc.title}
                  onClick={() => navigate(sc.route)}
                  className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition cursor-pointer shadow-2xs hover:border-primary/50 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">{sc.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">{sc.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SecretaryDashboard
