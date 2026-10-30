import { Link } from 'react-router-dom'
import { DocTypePageHead } from '@/components/erpnext/DocTypePageHead'
import { DocTimeline } from '@/components/erpnext/DocTimeline'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: 'Élèves Inscrits', value: '1 248', trend: '+12% ce trimestre', status: 'Active' },
    { label: 'Enseignants Actifs', value: '84', trend: 'Effectif complet', status: 'Submitted' },
    {
      label: 'Taux de Recouvrement',
      value: '94.2%',
      trend: 'Frais de scolarité',
      status: 'Completed',
    },
    { label: 'Demandes en Attente', value: '7', trend: 'Inscriptions 2026', status: 'Pending' },
  ]

  const recentActivities = [
    {
      user: 'Bureau des Inscriptions',
      time: 'Il y a 10 min',
      content: 'Nouvelle inscription confirmée : STU-2026-0042 (Lucas Bernard - Terminale S1)',
    },
    {
      user: 'Service Comptabilité',
      time: 'Il y a 1 heure',
      content: 'Encaissement validé pour la facture INV-2026-0018 (450,00 €)',
    },
    {
      user: 'Administration',
      time: 'Il y a 3 heures',
      content: 'Mise à jour des règles de notation du second semestre.',
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={['Desk', 'Tableau de bord']}
        title="Vue d'ensemble Scolaire"
        docstatus="Active"
        primaryAction="Nouveau Document"
        onPrimaryAction={() => {}}
        secondaryActions={[
          { label: 'Exporter', onClick: () => {} },
          { label: 'Actualiser', onClick: () => {} },
        ]}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Bienvenue sur SchoolDesk, {user?.name || 'Administrateur'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Année académique 2026-2027 • Session en cours : Semestre 1
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/students">
              <Button variant="secondary" size="sm">
                Consulter les élèves
              </Button>
            </Link>
            <Link to="/showcase">
              <Button variant="primary" size="sm">
                Catalogue Composants
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="rounded border border-slate-200 bg-white p-4 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xs font-medium text-slate-500">{s.label}</span>
                <StatusBadge status={s.status} size="xs" />
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">{s.value}</div>
              <div className="text-[11px] text-slate-400">{s.trend}</div>
            </div>
          ))}
        </div>

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Panel (3 cols) */}
          <div className="md:col-span-3 space-y-6">
            <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-xs font-semibold text-slate-800">Accès Rapide aux Modules</h3>
                <span className="text-2xs text-slate-400 font-mono">
                  ERPNext Desk Specification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <Link
                  to="/students"
                  className="rounded border border-slate-200 bg-slate-50/60 p-3 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <div className="font-semibold text-slate-800 mb-1">🎓 Gestion des Élèves</div>
                  <p className="text-2xs text-slate-500">
                    Table paginée unifiée avec normalisation Spring Page & PageResponse.
                  </p>
                </Link>

                <Link
                  to="/showcase"
                  className="rounded border border-slate-200 bg-slate-50/60 p-3 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <div className="font-semibold text-slate-800 mb-1">
                    🧩 Composants Réutilisables
                  </div>
                  <p className="text-2xs text-slate-500">
                    Modal, DatePicker, Select, Toast, ConfirmDialog, StatusBadge...
                  </p>
                </Link>

                <Link
                  to="/admin-only"
                  className="rounded border border-slate-200 bg-slate-50/60 p-3 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <div className="font-semibold text-slate-800 mb-1">🛡️ Sécurité & Rôles (403)</div>
                  <p className="text-2xs text-slate-500">
                    Vérification du RoleGuard et redirection automatique vers la page 403.
                  </p>
                </Link>
              </div>
            </div>

            <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs">
              <DocTimeline activities={recentActivities} />
            </div>
          </div>

          {/* Sidebar Panel (1 col) */}
          <aside className="md:col-span-1 space-y-4">
            <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs text-xs space-y-3">
              <h4 className="text-2xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                Métadonnées Établissement
              </h4>
              <div className="space-y-2 text-2xs">
                <div>
                  <span className="text-slate-400">Établissement :</span>
                  <div className="font-medium text-slate-800">Lycée d'Excellence 2026</div>
                </div>
                <div>
                  <span className="text-slate-400">Période active :</span>
                  <div className="font-medium text-slate-800">Trimestre 1 (Automne)</div>
                </div>
                <div>
                  <span className="text-slate-400">Rôle actif :</span>
                  <div className="font-medium text-slate-800">{user?.roles?.[0] || 'admin'}</div>
                </div>
                <div>
                  <span className="text-slate-400">API Gateway :</span>
                  <div className="font-mono text-slate-600">/api (Axios + Bearer)</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
