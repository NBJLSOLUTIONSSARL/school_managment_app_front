import React, { useState, useEffect } from 'react';
import { X, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { financeService } from '../../services/financeService';

const PRESET_CATEGORIES = [
  'Fournitures & Manuels',
  'Maintenance & Travaux',
  'Pédagogie & Événements',
  'Salaires & Honoraires',
  'Énergie & Fluides',
  'Informatique & Licences',
  'Assurance & Taxes',
  'Autre',
];

export default function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  expense = null,
}) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (expense) {
        setLabel(expense.label || '');
        setAmount(String(expense.amount || ''));
        setCategory(expense.category || PRESET_CATEGORIES[0]);
        setDate(expense.date || new Date().toISOString().split('T')[0]);
      } else {
        setLabel('');
        setAmount('');
        setCategory(PRESET_CATEGORIES[0]);
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, expense]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        label,
        amount: Number(amount),
        category,
        date,
      };

      if (expense) {
        await financeService.updateExpense(expense.id, payload);
      } else {
        await financeService.createExpense(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la dépense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E8DFC9] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold font-serif-title text-[#16222F]">
            {expense ? 'Modifier la dépense' : 'Enregistrer une dépense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
              Libellé de la dépense *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Achat de fournitures de rentrée"
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Montant (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
              Catégorie de dépense *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#4361EE] cursor-pointer"
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="academy-btn-primary flex items-center gap-2 text-xs shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{expense ? 'Enregistrer' : 'Valider la dépense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
