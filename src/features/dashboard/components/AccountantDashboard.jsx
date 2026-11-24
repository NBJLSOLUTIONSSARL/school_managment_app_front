import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  Clock,
  AlertCircle,
  CreditCard,
  ArrowUpRight,
  FileCheck,
  Send,
  PlusCircle,
  Receipt,
  Download,
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

export function AccountantDashboard() {
  const navigate = useNavigate()

  const [recentPayments] = useState([
    { id: 'PAY-8901', student: 'Thomas Dupont', parent: 'Jean Dupont', mode: 'Virement bancaire', date: '2026-11-16', amount: '$750.00', receiptId: 'REC-4410' },
    { id: 'PAY-8900', student: 'Camille Leroy', parent: 'Alain Leroy', mode: 'Carte bancaire', date: '2026-11-15', amount: '$450.00', receiptId: 'REC-4409' },
    { id: 'PAY-8899', student: 'Léa Fontaine', parent: 'Sophie Fontaine', mode: 'Chèque', date: '2026-11-15', amount: '$250.00', receiptId: 'REC-4408' },
    { id: 'PAY-8898', student: 'Lucas Roux', parent: 'David Roux', mode: 'Espèces', date: '2026-11-14', amount: '$180.00', receiptId: 'REC-4407' },
  ])

  const overdueAccounts = [
    { student: 'Maxime Bertrand', parent: 'Éric Bertrand', overdueDays: '18 jours', amount: '$450.00' },
    { student: 'Inès Colin', parent: 'Nathalie Colin', overdueDays: '24 jours', amount: '$600.00' },
    { student: 'Adrien Petit', parent: 'Julien Petit', overdueDays: '12 jours', amount: '$320.00' },
    { student: 'Sarah Benali', parent: 'Youssef Benali', overdueDays: '35 jours', amount: '$750.00' },
  ]

  const accountantShortcuts = [
    { title: 'Encaisser un Paiement', desc: 'Saisie comptable avec émission de reçu PDF immédiat', route: '/finances/invoices', icon: PlusCircle },
    { title: 'Plan d’Échelonnement', desc: 'Gestion des échéanciers et versements en 3x ou 10x', route: '/finances/invoices', icon: Receipt },
    { title: 'Grille Tarifaire & Bourses', desc: 'Paramétrage des tarifs par niveau et remises fratrie', route: '/settings', icon: FileCheck },
    { title: 'Rapports Financiers & Clôture', desc: 'Grand livre, balance trimestrielle et exports comptables', route: '/reports', icon: Download },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Comptabilité & Gestion Financière
            </h1>
            <Badge variant="blue" className="text-xs">
              Comptable
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Suivi des encaissements, factures échues, relances impayés, régularisations et reçus fiscaux
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/reports')}
            className="cursor-pointer gap-1.5"
          >
            <span>Rapports Comptables</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/finances/invoices')}
            className="cursor-pointer gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enregistrer Paiement</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/finances/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements Reçus MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">$48,650</div>
            <p className="text-xs text-muted-foreground mt-1">+12.4% vs mois précédent</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/finances/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reste à Recouvrer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$14,200</div>
            <p className="text-xs text-muted-foreground mt-1">94% taux de recouvrement</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/finances/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures en Retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">14 Échues</div>
            <p className="text-xs text-muted-foreground mt-1">Relances à expédier</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-xs" onClick={() => navigate('/finances/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses Engagées</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$11,430</div>
            <p className="text-xs text-muted-foreground mt-1">Fournitures & maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Split Grid: Recent Payments Table + Overdue Accounts Queue */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        {/* Recent Payments Table */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Derniers Règlements Enregistrés</CardTitle>
              <CardDescription>
                Paiements récents de frais de scolarité, cantine et activités périscolaires.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/finances/invoices')}
              className="ml-auto gap-1 cursor-pointer"
            >
              <span>Grand Livre</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf. Paiement</TableHead>
                  <TableHead>Élève & Tuteur</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate('/finances/invoices')}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">{p.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground text-xs">{p.student}</div>
                      <div className="text-[11px] text-muted-foreground">{p.parent}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-2xs">
                        {p.mode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground text-xs">{p.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Overdue Accounts Queue */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Comptes en Retard</CardTitle>
              <CardDescription>Dossiers prioritaires pour relance.</CardDescription>
            </div>
            <Badge variant="destructive" className="text-xs">
              Action
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {overdueAccounts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.student}</p>
                  <p className="text-[11px] text-muted-foreground">{item.parent}</p>
                  <span className="text-[10px] text-destructive font-medium inline-block mt-1">
                    Retard : {item.overdueDays}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-foreground">{item.amount}</p>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/messages')
                    }}
                    className="mt-1.5 gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Relancer</span>
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
          <CardTitle>Raccourcis Financiers & Comptables</CardTitle>
          <CardDescription>Opérations courantes de gestion de caisse et de facturation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accountantShortcuts.map((sc) => {
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

export default AccountantDashboard
