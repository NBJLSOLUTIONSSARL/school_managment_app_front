import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ClockAlert,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  BookOpen,
  User,
  CheckCircle,
  Mail,
} from 'lucide-react';
import { libraryService } from '../../services/libraryService';
import Modal from '../../components/common/Modal';

export default function ReturnsView() {
  const [activeTab, setActiveTab] = useState('overdue');
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [returnedLoans, setReturnedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [loanToReturn, setLoanToReturn] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overdueRes, returnedRes] = await Promise.all([
        libraryService.getOverdueLoans(),
        libraryService.getLoans({ status: 'RETURNED', page: 0, size: 25 }),
      ]);
      setOverdueLoans(Array.isArray(overdueRes) ? overdueRes : []);
      setReturnedLoans(returnedRes.content || []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les données des retours.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturnSubmit = async (status = 'RETURNED') => {
    if (!loanToReturn) return;
    setActionLoading(true);
    try {
      await libraryService.returnLoan(loanToReturn.id, {
        status,
        notes: returnNotes || undefined,
      });
      setLoanToReturn(null);
      setReturnNotes('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Impossible de valider ce retour.');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateDaysOverdue = (dueDate) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F]">
              Retours des livres et retards
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Gestion des réintégrations d'ouvrages et suivi des dépassements d'échéances.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="flex gap-2 border-b border-[#EFECE6] pb-2">
        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'text-[#78716C] hover:bg-[#FAF7F2]'
          }`}
        >
          <ClockAlert className="w-4 h-4 text-rose-600" />
          <span>Livres en retard ({overdueLoans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returned')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'returned'
              ? 'bg-[#16222F] text-[#DFC2A0] shadow-sm'
              : 'text-[#78716C] hover:bg-[#FAF7F2]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Retours récents enregistrés ({returnedLoans.length})</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
          <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
          <span className="text-sm font-medium">Chargement des retours...</span>
        </div>
      ) : activeTab === 'overdue' ? (
        <div className="academy-card overflow-hidden">
          {overdueLoans.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#78716C]">
              Excellente nouvelle ! Aucun livre n'est actuellement en retard de restitution.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/50 border-b border-rose-100 text-rose-900 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Livre</th>
                    <th className="py-3.5 px-4">Emprunteur</th>
                    <th className="py-3.5 px-4">Échéance dépassée</th>
                    <th className="py-3.5 px-4 text-center">Jours de retard</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {overdueLoans.map((loan) => {
                    const daysLate = calculateDaysOverdue(loan.dueDate);
                    return (
                      <tr key={loan.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#16222F]">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{loan.bookTitle || `Livre #${loan.bookId}`}</span>
                          </div>
                          <span className="text-[10px] text-[#78716C] block pl-6">
                            ISBN: {loan.bookIsbn}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 font-medium text-[#16222F]">
                            <User className="w-3.5 h-3.5 text-[#78716C]" />
                            <span>{loan.borrowerName}</span>
                          </div>
                          <span className="text-[10px] text-[#78716C] block pl-5.5">
                            {loan.borrowerEmail}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-rose-700 font-bold">
                          {loan.dueDate}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-rose-200">
                            +{daysLate} jours
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setLoanToReturn(loan)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Enregistrer le retour</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="academy-card overflow-hidden">
          {returnedLoans.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#78716C]">
              Aucun retour récent enregistré.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#EFECE6] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Livre</th>
                    <th className="py-3.5 px-4">Emprunteur</th>
                    <th className="py-3.5 px-4">Date de sortie</th>
                    <th className="py-3.5 px-4">Date de retour effectif</th>
                    <th className="py-3.5 px-4">Remarques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {returnedLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#16222F]">
                        {loan.bookTitle || `Livre #${loan.bookId}`}
                      </td>
                      <td className="py-3 px-4 text-[#78716C]">
                        {loan.borrowerName} ({loan.borrowerEmail})
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#78716C]">
                        {loan.loanDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-emerald-700">
                        {loan.returnDate || 'Validé'}
                      </td>
                      <td className="py-3 px-4 text-[#78716C]">
                        {loan.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={Boolean(loanToReturn)}
        onClose={() => setLoanToReturn(null)}
        title="Retour d'un ouvrage"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#78716C]">
            Valider le retour de <strong className="text-[#16222F]">{loanToReturn?.bookTitle}</strong> par{' '}
            <strong className="text-[#16222F]">{loanToReturn?.borrowerName}</strong>. L'exemplaire sera réintégré dans le stock disponible.
          </p>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">Remarques / État au retour :</label>
            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Ex: Bon état..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={() => setLoanToReturn(null)}
              className="px-4 py-2 rounded-xl border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleReturnSubmit('RETURNED')}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Validation...' : 'Valider le retour'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
