import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  TrendingDown,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import ExpenseModal from './ExpenseModal';

export default function ExpensesTab({ expenses = [], canManage, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [success, setSuccess] = useState('');

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const lbl = (e.label || '').toLowerCase();
    const cat = (e.category || '').toLowerCase();
    const staff = (e.registeredByStaffName || '').toLowerCase();
    return lbl.includes(q) || cat.includes(q) || staff.includes(q);
  });

  const handleOpenCreate = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setSelectedExpense(exp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) return;
    try {
      await financeService.deleteExpense(id);
      setSuccess('Dépense supprimée.');
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Impossible de supprimer cette dépense.');
    }
  };

  const categories = Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)));

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="academy-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher dépense..."
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
            >
              <option value="ALL">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="text-right">
            <span className="text-[11px] text-[#64748B] block">Total dépenses :</span>
            <span className="font-bold text-sm text-[#16222F]">{formatAmount(totalAmount)}</span>
          </div>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="academy-btn-primary flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer dépense</span>
            </button>
          )}
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B] uppercase">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Libellé</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Enregistré par</th>
                <th className="py-3 px-4 text-right">Montant</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#16222F]">
                      {e.date || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#16222F]">
                      {e.label}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#16222F]/5 text-[#16222F]">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B]">
                      {e.registeredByStaffName || 'Secrétariat'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      - {formatAmount(e.amount)}
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(e)}
                            className="p-1.5 rounded-lg text-[#16222F] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[#94A3B8]">
                    Aucune dépense enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setSuccess('Dépense enregistrée avec succès.');
          setTimeout(() => setSuccess(''), 3000);
          onRefresh();
        }}
        expense={selectedExpense}
      />
    </div>
  );
}
