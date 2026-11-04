import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Users,
  Coins,
  FolderCheck,
  ArrowRight,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle,
  FilePlus,
  UserPlus,
  Receipt,
  FileSearch,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/statsService';

export default function StaffDashboardView() {
  const { currentUser, setActiveView } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getStaffStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les données réelles du secrétariat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Secrétaire';

  const formatAmount = (val) => {
    return new Intl.NumberFormat('fr-FR').format(val || 0) + ' MAD';
  };

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
                Secrétariat & Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F] mt-1">
              Bonjour {displayName},
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Bienvenue sur votre espace de gestion administrative quotidienne.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveView('admissions')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16222F] text-white text-xs font-semibold hover:bg-[#223244] transition-colors shadow-sm cursor-pointer"
          >
            <FilePlus className="w-4 h-4 text-[#DFC2A0]" />
            <span>Traiter candidatures</span>
          </button>
          <button
            onClick={() => setActiveView('students')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EFECE6] text-[#16222F] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#C5A880]" />
            <span>Inscrire un élève</span>
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
            onClick={fetchStaffData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
          <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
          <span className="text-sm font-medium">Chargement des dossiers administratifs...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={FileCheck}
              title="Candidatures reçues"
              value={stats ? stats.totalApplications.toString() : '0'}
              iconBg="bg-[#F4EDE2]"
              iconColor="text-[#16222F]"
              subtitle="Total des dossiers"
            />
            <StatCard
              icon={Clock}
              title="Admissions en attente"
              value={stats ? stats.pendingApplications.toString() : '0'}
              iconBg="bg-amber-50"
              iconColor="text-amber-800"
              badgeText={stats?.pendingApplications > 0 ? "À traiter" : undefined}
              badgeType="warning"
              subtitle="En attente de traitement"
            />
            <StatCard
              icon={Users}
              title="Élèves inscrits"
              value={stats ? stats.totalStudents.toString() : '0'}
              iconBg="bg-[#F4EDE2]"
              iconColor="text-[#16222F]"
              subtitle="Dossiers scolarité actifs"
            />
            <StatCard
              icon={Coins}
              title="Factures impayées"
              value={stats ? stats.unpaidInvoicesCount.toString() : '0'}
              iconBg="bg-rose-50"
              iconColor="text-rose-700"
              badgeText={stats ? formatAmount(stats.totalUnpaidAmount) : undefined}
              badgeType="warning"
              subtitle="Reste à recouvrer"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 academy-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                    Candidatures récentes
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Derniers dossiers d'admission déposés
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('admissions')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#C5A880] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Voir toutes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#78716C]">
                  Aucune candidature récente à afficher.
                </div>
              ) : (
                <div className="divide-y divide-[#EFECE6]">
                  {stats.recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF7F2]/50 px-2 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#16222F]">
                            {app.firstName} {app.lastName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            app.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {app.status || 'PENDING'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#78716C]">
                          Niveau: {app.targetGrade || 'Non spécifié'} • {app.email}
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveView('admissions')}
                        className="self-start sm:self-center px-3 py-1 rounded-lg border border-[#EFECE6] text-[11px] font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      >
                        Consulter
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="academy-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                    Actions quotidiennes
                  </h2>
                  <span className="text-xs font-semibold text-[#78716C] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#EFECE6]">
                    Accès rapide
                  </span>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveView('admissions')}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between hover:border-[#C5A880] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16222F] block">
                          Admissions & Candidatures
                        </span>
                        <span className="text-[10px] text-[#78716C]">
                          Valider ou convertir les dossiers
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#78716C]" />
                  </button>

                  <button
                    onClick={() => setActiveView('documents')}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between hover:border-[#C5A880] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
                        <FolderCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16222F] block">
                          Vérification de documents
                        </span>
                        <span className="text-[10px] text-[#78716C]">
                          Pièces d'identité, justificatifs
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#78716C]" />
                  </button>

                  <button
                    onClick={() => setActiveView('finances')}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between hover:border-[#C5A880] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16222F] block">
                          Factures & Encaissements
                        </span>
                        <span className="text-[10px] text-[#78716C]">
                          Enregistrer les règlements
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#78716C]" />
                  </button>

                  <button
                    onClick={() => setActiveView('guardians')}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between hover:border-[#C5A880] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16222F] block">
                          Tuteurs & Parents
                        </span>
                        <span className="text-[10px] text-[#78716C]">
                          Associer les responsables légaux
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#78716C]" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFECE6] mt-4">
                <span className="text-[11px] text-[#78716C] block text-center">
                  Session sécurisée • Droits administratifs actifs
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
