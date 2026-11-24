import React, { useState, useEffect, useCallback } from 'react';
import { addonService } from '../api/addonService';
import { BookOpen, DollarSign, CheckCircle, Search } from 'lucide-react';

export default function LibraryManagerView() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'loans'
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyNotes, setPenaltyNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, booksPage, loansPage] = await Promise.all([
        addonService.getLibraryStats().catch(() => null),
        addonService.getBooks({ query: searchQuery || undefined, size: 30 }).catch(() => ({ content: [] })),
        addonService.getLoans({ size: 30 }).catch(() => ({ content: [] })),
      ]);
      setStats(statsData);
      setBooks(booksPage?.content || []);
      setLoans(loansPage?.content || []);
    } catch {
      setActionError('Erreur de chargement des données de la bibliothèque.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleApplyPenalty = async (e) => {
    e.preventDefault();
    if (!selectedLoan || !penaltyAmount) return;
    try {
      await addonService.applyPenalty(selectedLoan.id, {
        penaltyAmount: parseFloat(penaltyAmount),
        notes: penaltyNotes,
      });
      setActionSuccess('Pénalité financière appliquée avec succès.');
      setSelectedLoan(null);
      setPenaltyAmount('');
      setPenaltyNotes('');
      loadData();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Erreur lors de l’application de la pénalité.');
    }
  };

  const handlePayPenalty = async (loanId) => {
    try {
      await addonService.payPenalty(loanId);
      setActionSuccess('Pénalité marquée comme réglée.');
      loadData();
    } catch {
      setActionError('Erreur lors de l’enregistrement du paiement.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold ml-2">×</button>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
          <p className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Total Livres</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">{stats?.totalBooks ?? books.length}</p>
        </div>
        <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
          <p className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Exemplaires Dispos</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.availableCopies ?? '—'}</p>
        </div>
        <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
          <p className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Emprunts en cours</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{stats?.activeLoans ?? loans.length}</p>
        </div>
        <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
          <p className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider">Retards constatés</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{stats?.overdueLoans ?? 0}</p>
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'catalog'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Catalogue des Livres
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'loans'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Emprunts & Pénalités ({loans.length})
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-10 text-xs text-zinc-500">Chargement de la bibliothèque...</div>
      ) : activeTab === 'catalog' ? (
        books.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6">
            <BookOpen className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Aucun livre trouvé dans le catalogue</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-2xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Titre</th>
                  <th className="py-2.5 px-3 font-semibold">Auteur</th>
                  <th className="py-2.5 px-3 font-semibold">Catégorie</th>
                  <th className="py-2.5 px-3 font-semibold">ISBN</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Disponibilité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">{b.title}</td>
                    <td className="py-2.5 px-3">{b.author}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-2xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {b.category || 'Général'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-2xs">{b.isbn}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        b.availableCopies > 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}>
                        {b.availableCopies} / {b.totalCopies} dispo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Loans & Penalties Tab */
        loans.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Aucun emprunt enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-2xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Livre</th>
                  <th className="py-2.5 px-3 font-semibold">Emprunteur</th>
                  <th className="py-2.5 px-3 font-semibold">Date Échéance</th>
                  <th className="py-2.5 px-3 font-semibold">Statut</th>
                  <th className="py-2.5 px-3 font-semibold">Pénalité</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">{loan.bookTitle}</td>
                    <td className="py-2.5 px-3">{loan.borrowerName}</td>
                    <td className="py-2.5 px-3 font-mono text-2xs">{loan.dueDate}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        loan.status === 'RETURNED'
                          ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          : loan.status === 'OVERDUE'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {loan.penaltyAmount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {loan.penaltyAmount.toFixed(2)} €
                          </span>
                          <span className={`text-2xs px-1.5 py-0.2 rounded ${
                            loan.penaltyPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {loan.penaltyPaid ? 'Payée' : 'Impayée'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-2xs">Aucune</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      {loan.penaltyAmount > 0 && !loan.penaltyPaid && (
                        <button
                          onClick={() => handlePayPenalty(loan.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-2xs rounded font-medium transition-colors"
                        >
                          Régler
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          setPenaltyAmount(loan.penaltyAmount > 0 ? loan.penaltyAmount.toString() : '5.00');
                        }}
                        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-2xs rounded transition-colors"
                      >
                        Pénalité
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal: Appliquer Pénalité */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Appliquer une pénalité financière
            </h3>
            <p className="text-2xs text-zinc-500">
              Emprunt : <strong className="text-zinc-700 dark:text-zinc-300">{selectedLoan.bookTitle}</strong> ({selectedLoan.borrowerName})
            </p>
            <form onSubmit={handleApplyPenalty} className="space-y-3">
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Montant de la pénalité (€)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  required
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Motif / Notes</label>
                <input
                  type="text"
                  placeholder="Ex : Retard supérieur à 7 jours"
                  value={penaltyNotes}
                  onChange={(e) => setPenaltyNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(null)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded font-medium"
                >
                  Enregistrer la pénalité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
