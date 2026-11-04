import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Clock,
  User,
  BookOpen,
  ArrowDownLeft,
  Calendar,
} from 'lucide-react';
import { libraryService } from '../../services/libraryService';
import { userService } from '../../services/userService';
import Modal from '../../components/common/Modal';

export default function LoansView() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [loanToReturn, setLoanToReturn] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');

  const [createForm, setCreateForm] = useState({
    bookId: '',
    borrowerUserId: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await libraryService.getLoans({
        status: 'ACTIVE',
        page,
        size: 15,
      });
      setLoans(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Impossible de charger la liste des emprunts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [page]);

  const handleOpenCreateModal = async () => {
    setIsCreateModalOpen(true);
    try {
      const [booksRes, usersRes] = await Promise.all([
        libraryService.getBooks({ page: 0, size: 50 }),
        userService.getUsers({ page: 0, size: 50 }),
      ]);
      const bList = booksRes.content || [];
      setAvailableBooks(bList.filter((b) => b.availableCopies > 0));
      setUsersList(usersRes.content || []);
    } catch {
      setAvailableBooks([]);
      setUsersList([]);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.bookId || !createForm.borrowerUserId) return;
    setActionLoading(true);
    try {
      await libraryService.createLoan({
        bookId: Number(createForm.bookId),
        borrowerUserId: Number(createForm.borrowerUserId),
        dueDate: createForm.dueDate,
        notes: createForm.notes,
      });
      setIsCreateModalOpen(false);
      setCreateForm({
        bookId: '',
        borrowerUserId: '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
      });
      fetchLoans();
    } catch (err) {
      alert(err.message || 'Impossible d\'enregistrer cet emprunt.');
    } finally {
      setActionLoading(false);
    }
  };

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
      fetchLoans();
    } catch (err) {
      alert(err.message || 'Impossible de valider ce retour.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F]">
              Gestion des emprunts en cours
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Suivi actif des ouvrages empruntés par les élèves et le personnel scolaire.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLoans}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel emprunt</span>
          </button>
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
            <span className="text-sm font-medium">Chargement des fiches de prêt...</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun emprunt en cours actuellement. Tous les ouvrages sont en rayon.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#EFECE6] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Livre emprunté</th>
                  <th className="py-3.5 px-4">Emprunteur</th>
                  <th className="py-3.5 px-4">Date de sortie</th>
                  <th className="py-3.5 px-4">Date limite</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {loans.map((loan) => {
                  const isLate = new Date(loan.dueDate) < new Date();
                  return (
                    <tr key={loan.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#16222F]">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#C5A880] shrink-0" />
                          <span>{loan.bookTitle || `Livre #${loan.bookId}`}</span>
                        </div>
                        <span className="text-[10px] text-[#78716C] block pl-6">
                          ISBN: {loan.bookIsbn || '—'}
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
                      <td className="py-3 px-4 font-mono text-[11px] text-[#78716C]">
                        {loan.loanDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span
                          className={`font-semibold ${
                            isLate ? 'text-rose-600 font-bold' : 'text-[#16222F]'
                          }`}
                        >
                          {loan.dueDate}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLate
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{isLate ? 'En retard' : 'En cours'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setLoanToReturn(loan)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Enregistrer retour</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Enregistrer un nouvel emprunt"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#16222F] font-semibold mb-1">
              Sélectionner le livre à prêter :
            </label>
            <select
              value={createForm.bookId}
              onChange={(e) => setCreateForm({ ...createForm, bookId: e.target.value })}
              required
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            >
              <option value="">-- Choisir un livre disponible --</option>
              {availableBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author} ({b.availableCopies} dispo)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">
              Emprunteur (élève, enseignant ou personnel) :
            </label>
            <select
              value={createForm.borrowerUserId}
              onChange={(e) => setCreateForm({ ...createForm, borrowerUserId: e.target.value })}
              required
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            >
              <option value="">-- Choisir un utilisateur --</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">
              Date limite de retour prévue :
            </label>
            <input
              type="date"
              required
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">Remarques éventuelles :</label>
            <textarea
              rows="2"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              placeholder="Ex: Prêt dans le cadre d'un projet de classe..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Enregistrement...' : 'Valider l\'emprunt'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(loanToReturn)}
        onClose={() => setLoanToReturn(null)}
        title="Retour d'un ouvrage"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#78716C]">
            Confirmer le retour de <strong className="text-[#16222F]">{loanToReturn?.bookTitle}</strong> emprunté par{' '}
            <strong className="text-[#16222F]">{loanToReturn?.borrowerName}</strong>. L'exemplaire sera réintégré dans le stock disponible.
          </p>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">État de l'ouvrage au retour :</label>
            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Ex: Très bon état, couverture intacte..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={() => handleReturnSubmit('LOST')}
              disabled={actionLoading}
              className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Signaler comme perdu (LOST)
            </button>

            <div className="flex gap-2">
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
                {actionLoading ? 'Validation...' : 'Confirmer le retour (RETURNED)'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
