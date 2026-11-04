import React, { useState, useEffect } from 'react';
import {
  History,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  BookOpen,
  User,
  Clock,
  Calendar,
} from 'lucide-react';
import { libraryService } from '../../services/libraryService';

export default function LoanHistoryView() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await libraryService.getLoans({
        status: selectedStatus || undefined,
        page,
        size: 15,
      });
      setLoans(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Impossible de charger l\'historique des emprunts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, selectedStatus]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full text-[10px] font-bold">En cours</span>;
      case 'RETURNED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">Retourné</span>;
      case 'OVERDUE':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">En retard</span>;
      case 'LOST':
        return <span className="bg-slate-200 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Perdu</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <History className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F]">
              Historique des emprunts
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Registre exhaustif de tous les mouvements et états de circulation des ouvrages.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="academy-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#78716C] shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">En cours (ACTIVE)</option>
            <option value="RETURNED">Retournés (RETURNED)</option>
            <option value="OVERDUE">En retard (OVERDUE)</option>
            <option value="LOST">Signalés perdus (LOST)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement du registre...</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun enregistrement d'emprunt dans l'historique pour ce filtre.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#EFECE6] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Livre</th>
                  <th className="py-3.5 px-4">Emprunteur</th>
                  <th className="py-3.5 px-4">Date prêt</th>
                  <th className="py-3.5 px-4">Échéance</th>
                  <th className="py-3.5 px-4">Date restitution</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4">Remarques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#16222F]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                        <span>{loan.bookTitle || `Livre #${loan.bookId}`}</span>
                      </div>
                      <span className="text-[10px] text-[#78716C] block pl-5.5">
                        ISBN: {loan.bookIsbn}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#16222F] block">{loan.borrowerName}</span>
                      <span className="text-[10px] text-[#78716C]">{loan.borrowerEmail}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#78716C]">
                      {loan.loanDate}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#16222F]">
                      {loan.dueDate}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-700 font-semibold">
                      {loan.returnDate || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(loan.status)}
                    </td>
                    <td className="py-3 px-4 text-[#78716C] max-w-xs truncate">
                      {loan.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#78716C]">
            <span>Page {page + 1} sur {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#EFECE6] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#EFECE6] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
