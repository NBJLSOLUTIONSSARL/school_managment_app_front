import { useState, useEffect } from 'react'
import {
  BookOpen,
  Boxes,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function LibrarianDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    statsService.getLibrarianStats().then((data) => {
      if (!ignore) {
        setStats(data)
        setLoading(false)
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Impossible de charger les statistiques de la bibliothèque.')
        setLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [])

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Bibliothécaire'

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Espace Bibliothèque · ${displayName}`}
        description="Gérez le catalogue des ouvrages, enregistrez les prêts et retours, et suivez la disponibilité des livres du CDI."
        buttonText="Catalogue des livres"
        onButtonClick={() => {}}
        icon={BookOpen}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchStats}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={BookOpen}
          title="Titres au Catalogue"
          value={loading ? '...' : (stats?.totalBooks?.toString() || '3 450')}
          iconBg="bg-[#EEF2FF]"
          iconColor="text-[#4361EE]"
          subtitle="Ouvrages enregistrés"
        />
        <StatCard
          icon={Boxes}
          title="Exemplaires Disponibles"
          value={loading ? '...' : (stats?.availableBooks?.toString() || '3 322')}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          badgeText="En rayon"
          badgeType="positive"
          subtitle="Prêt immédiat"
        />
        <StatCard
          icon={ArrowUpRight}
          title="Emprunts en Cours"
          value={loading ? '...' : (stats?.activeLoans?.toString() || '128')}
          iconBg="bg-[#EEF2FF]"
          iconColor="text-[#4361EE]"
          subtitle="En circulation"
        />
        <StatCard
          icon={Clock}
          title="Retours en Retard"
          value={loading ? '...' : (stats?.overdueLoans?.toString() || '14')}
          iconBg="bg-rose-50"
          iconColor="text-rose-700"
          badgeText="À relancer"
          badgeType="warning"
          subtitle="Rappels nécessaires"
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Loans Table */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Emprunts Récents
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                128 prêts actifs
              </span>
            </div>

            <div className="space-y-3">
              {[
                { book: 'Le Petit Prince - Antoine de Saint-Exupéry', borrower: 'Thomas Dubois (Seconde A)', date: '12 Nov 2026', status: 'Active' },
                { book: 'Les Misérables (Tome 1) - Victor Hugo', borrower: 'Léa Bernard (1ère S)', date: '15 Nov 2026', status: 'Active' },
                { book: 'Fondation - Isaac Asimov', borrower: 'Lucas Martin (Terminale S)', date: '02 Nov 2026', status: 'Overdue' },
              ].map((loan, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9]">
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B]">{loan.book}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{loan.borrower} · Retour prévu : {loan.date}</p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Calendar */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />
        </div>
      </div>
    </div>
  )
}

export default LibrarianDashboard
