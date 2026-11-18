import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  DollarSign,
  Layers,
  ArrowUpRight,
  PlusCircle,
  RotateCcw,
  BookMarked,
  CheckCircle2,
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

export function LibrarianDashboard() {
  const navigate = useNavigate()

  const [recentLoans] = useState([
    { id: 'LN-501', title: 'Les Misérables (Tome 1)', author: 'Victor Hugo', borrower: 'Lucas Martin (Terminale S1)', dueDate: '2026-11-20', status: 'En cours', badgeVariant: 'blue' },
    { id: 'LN-500', title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', borrower: 'Emma Leroy (Sixième A)', dueDate: '2026-11-18', status: 'En cours', badgeVariant: 'blue' },
    { id: 'LN-499', title: 'Physique-Chimie 1ère', author: 'Éditions Hatier', borrower: 'Thomas Dupont (Première S)', dueDate: '2026-11-12', status: 'En retard', badgeVariant: 'destructive' },
    { id: 'LN-498', title: 'L’Étranger', author: 'Albert Camus', borrower: 'Chloé Roux (Seconde B)', dueDate: '2026-11-15', status: 'Rendu', badgeVariant: 'success' },
  ])

  const overdueBooks = [
    { title: 'Physique-Chimie 1ère', borrower: 'Thomas Dupont', daysOverdue: '4 jours', fine: '2.00 €' },
    { title: '1984', borrower: 'Arthur Simon', daysOverdue: '8 jours', fine: '4.00 €' },
    { title: 'Histoire-Géo Terminale', borrower: 'Sarah Benali', daysOverdue: '12 jours', fine: '6.00 €' },
  ]

  const librarianShortcuts = [
    { title: 'Enregistrer un Prêt', desc: 'Scanner ou saisir le prêt d’un ouvrage à un élève', route: '/addons', icon: PlusCircle },
    { title: 'Enregistrer un Retour', desc: 'Valider le retour d’un livre et recalculer les pénalités', route: '/addons', icon: RotateCcw },
    { title: 'Catalogue & Ouvrages', desc: 'Ajouter, éditer et classifier les volumes de la BCD/CDI', route: '/addons', icon: BookMarked },
    { title: 'Pénalités & Amendes', desc: 'Consulter et encaisser les amendes pour retards ou détériorations', route: '/addons', icon: CheckCircle2 },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Bibliothèque & Centre de Documentation (CDI)
            </h1>
            <Badge variant="blue" className="text-xs">
              Bibliothécaire
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Circulation des ouvrages, catalogue numérique, suivi des retards et gestion des pénalités
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/addons')}
            className="cursor-pointer gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Prêt</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/addons')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts en Cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142 Ouvrages</div>
            <p className="text-xs text-muted-foreground mt-1">28 emprunts enregistrés cette semaine</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/addons')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emprunts en Retard</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">9 Livres</div>
            <p className="text-xs text-muted-foreground mt-1">Relances automatiques envoyées</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/addons')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pénalités Dues</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">45.00 €</div>
            <p className="text-xs text-muted-foreground mt-1">Sur 6 élèves retardataires</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/addons')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catalogue Total</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,850 Volumes</div>
            <p className="text-xs text-muted-foreground mt-1">96% disponibles en rayon</p>
          </CardContent>
        </Card>
      </div>

      {/* Split Grid: Loans Table + Overdue Books Queue */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        {/* Loans Table */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Circulation des Ouvrages</CardTitle>
              <CardDescription>
                Derniers prêts et retours enregistrés au guichet du CDI.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/addons')}
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
                  <TableHead>Titre & Auteur</TableHead>
                  <TableHead>Emprunteur</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoans.map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate('/addons')}>
                    <TableCell>
                      <div className="font-semibold text-foreground text-xs">{l.title}</div>
                      <div className="text-[11px] text-muted-foreground">{l.author}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.borrower}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{l.dueDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={l.badgeVariant} className="text-2xs">
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Overdue Queue */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Retards Critiques</CardTitle>
              <CardDescription>Ouvrages non restitués après date limite.</CardDescription>
            </div>
            <Badge variant="destructive" className="text-xs">
              Urgents
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {overdueBooks.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.borrower}</p>
                  <span className="text-[10px] text-destructive font-medium inline-block mt-1">
                    Dépassement : {item.daysOverdue}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-amber-600">Amende : {item.fine}</p>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/addons')
                    }}
                    className="mt-1.5 cursor-pointer text-2xs"
                  >
                    Rendre
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Operational Shortcuts */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Raccourcis CDI & Bibliothèque</CardTitle>
          <CardDescription>Accès rapide aux opérations de gestion du fonds documentaire.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {librarianShortcuts.map((sc) => {
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

export default LibrarianDashboard
