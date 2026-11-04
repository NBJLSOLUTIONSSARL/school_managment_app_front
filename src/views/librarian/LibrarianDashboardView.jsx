import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  ClockAlert,
  History,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowRight,
  BookmarkCheck,
  Calendar,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { libraryService } from '../../services/libraryService';

export default function LibrarianDashboardView() {
  const { currentUser, setActiveView } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await libraryService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les statistiques réelles de la bibliothèque.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Bibliothécaire';

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-5 z-10">
          <img
            src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E8DFC9] shadow-md"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#16222F] bg-[#DFC2A0] px-2.5 py-0.5 rounded-full">
                Gestion du fonds & Bibliothèque
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F] mt-1">
              Bonjour {displayName},
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Supervision du catalogue, suivi des prêts d'ouvrages et gestion des retards.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveView('library-loans')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors shadow-sm cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Enregistrer un emprunt</span>
          </button>
          <button
            onClick={() => setActiveView('library-catalog')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EFECE6] text-[#16222F] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Ajouter un livre</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStats}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
          <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
          <span className="text-sm font-medium">Chargement des données de la bibliothèque...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              icon={BookOpen}
              title="Titres au catalogue"
              value={stats ? stats.totalBooks.toString() : '0'}
              iconBg="bg-[#F4EDE2]"
              iconColor="text-[#16222F]"
              subtitle={`${stats?.totalCopies || 0} exemplaires au total`}
            />
            <StatCard
              icon={Boxes}
              title="Exemplaires disponibles"
              value={stats ? stats.availableCopies.toString() : '0'}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-700"
              badgeText="Prêt immédiat"
              badgeType="positive"
              subtitle="En rayon actuellement"
            />
            <StatCard
              icon={ArrowUpRight}
              title="Livres empruntés"
              value={stats ? stats.borrowedCopies.toString() : '0'}
              iconBg="bg-[#F4EDE2]"
              iconColor="text-[#16222F]"
              subtitle="En circulation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              icon={BookmarkCheck}
              title="Emprunts en cours"
              value={stats ? stats.activeLoans.toString() : '0'}
              iconBg="bg-[#F4EDE2]"
              iconColor="text-[#16222F]"
              subtitle="Fiches de prêt actives"
            />
            <StatCard
              icon={ClockAlert}
              title="Emprunts en retard"
              value={stats ? stats.overdueLoans.toString() : '0'}
              iconBg="bg-rose-50"
              iconColor="text-rose-700"
              badgeText={stats?.overdueLoans > 0 ? "Attention" : "À jour"}
              badgeType={stats?.overdueLoans > 0 ? "warning" : "positive"}
              subtitle="Date limite dépassée"
            />
            <StatCard
              icon={ArrowDownLeft}
              title="Retours enregistrés"
              value={stats ? stats.returnedLoans.toString() : '0'}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-700"
              subtitle="Historique des retours"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 academy-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                    Activité récente des prêts & retours
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Mouvements d'ouvrages enregistrés en temps réel dans MySQL
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('library-history')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#C5A880] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Historique complet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#78716C]">
                  Aucun mouvement récent enregistré dans la bibliothèque.
                </div>
              ) : (
                <div className="divide-y divide-[#EFECE6]">
                  {stats.recentActivity.map((loan) => (
                    <div
                      key={loan.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF7F2]/50 px-2 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#16222F]">
                            {loan.bookTitle || `Livre #${loan.bookId}`}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              loan.status === 'ACTIVE'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : loan.status === 'OVERDUE'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : loan.status === 'RETURNED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#78716C]">
                          Emprunteur: {loan.borrowerName || loan.borrowerEmail} • Échéance: {loan.dueDate}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-[#78716C]">
                        {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="academy-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                    Modules de gestion
                  </h2>
                  <span className="text-xs font-semibold text-[#78716C] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#EFECE6]">
                    Accès direct
                  </span>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveView('library-catalog')}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between hover:border-[#C5A880] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16222F] block">
                          Catalogue des livres
                        </span>
                        <span className="text-[10px] text-[#78716C]">
                          Ajouter, éditer, chercher
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#78716C]" />
                  </button>

                  <button
                    onClick={() => setActiveView('library-returns')}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between hover:border-[#C5A880] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16222F] block">
                          Retours des livres
                        </span>
                        <span className="text-[10px] text-[#78716C]">
                          Réintégrer dans le stock
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#78716C]" />
                  </button>

                  <button
                    onClick={() => setActiveView('library-overdue')}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between hover:border-[#C5A880] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                        <ClockAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16222F] block">
                          Livres en retard ({stats?.overdueLoans || 0})
                        </span>
                        <span className="text-[10px] text-rose-600 font-medium">
                          Relances à effectuer
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#78716C]" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFECE6] mt-4">
                <span className="text-[11px] text-[#78716C] block text-center">
                  Base de données bibliothèque connectée
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
