import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { communicationService } from '../services/communicationService';

export default function AbsencesView() {
  const { currentUser } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await communicationService.getLeaveRequests({
          userId: currentUser?.roles?.includes('ROLE_ADMIN') ? null : currentUser?.id,
          page: 0,
          size: 20
        });
        const list = res?.content || (Array.isArray(res) ? res : []);
        setLeaveRequests(list);
      } catch (err) {
        setLeaveRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [currentUser?.id]);

  const approvedCount = leaveRequests.filter((l) => l.status === 'APPROVED').length;
  const pendingCount = leaveRequests.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Vie Scolaire
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Absences & Congés
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Suivi des absences et des demandes de congés enregistrées
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Absences"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Note d'intégration Backend :</span>
          <span>
            Le schéma MySQL actuel ne comporte pas de table d'assiduité / d'absences dédiée aux élèves.
            Le backend intègre en revanche la gestion des congés et absences du personnel éducatif (table MySQL <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">leave_requests</code>).
            Aucun pourcentage d'assiduité aléatoire ou fictif n'est inventé.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Calendar}
          title="Demandes enregistrées"
          value={leaveRequests.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Table leave_requests"
        />
        <StatCard
          icon={CheckCircle2}
          title="Congés validés"
          value={approvedCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Statut APPROVED"
        />
        <StatCard
          icon={Clock}
          title="En attente d'avis"
          value={pendingCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Statut PENDING"
        />
        <StatCard
          icon={AlertCircle}
          title="Assiduité élèves"
          value="Non configuré"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Donnée non disponible"
        />
      </div>

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des congés depuis MySQL...</span>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-xs text-[#78716C]">
            <Calendar className="w-10 h-10 text-[#C5A880] mx-auto opacity-50" />
            <p className="font-bold text-[#16222F]">Aucune absence ou demande de congé pour le moment.</p>
            <p>Les demandes validées apparaîtront automatiquement dans ce tableau.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2] font-bold text-[#78716C] uppercase">
                  <th className="py-4 px-6">Demandeur ID</th>
                  <th className="py-4 px-6">Motif</th>
                  <th className="py-4 px-6">Période d'absence</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2]">
                {leaveRequests.map((leave) => (
                  <tr key={leave.id} className="hover:bg-[#FAF7F2]/60">
                    <td className="py-4 px-6 font-mono text-[#16222F]">Utilisateur #{leave.userId}</td>
                    <td className="py-4 px-6 font-semibold text-[#16222F]">{leave.reason}</td>
                    <td className="py-4 px-6 text-[#78716C]">
                      Du {leave.startDate} au {leave.endDate}
                    </td>
                    <td className="py-4 px-6 text-[#78716C]">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EFECE6]">
                        {leave.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${
                          leave.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : leave.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {leave.status === 'APPROVED' ? 'Validé' : leave.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
