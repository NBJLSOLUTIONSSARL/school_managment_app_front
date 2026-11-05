import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { financeService } from '../../services/financeService';

export default function FeeTypesTab({ feeTypes = [], canManage, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  const handleOpenCreate = () => {
    setEditingFee(null);
    setName('');
    setAmount('');
    setFrequency('MONTHLY');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ft) => {
    setEditingFee(ft);
    setName(ft.name || '');
    setAmount(String(ft.amount || ''));
    setFrequency(ft.frequency || 'MONTHLY');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingFee) {
        await financeService.updateFeeType(editingFee.id, {
          name,
          amount: Number(amount),
          frequency,
        });
        setSuccess('Type de frais mis à jour.');
      } else {
        await financeService.createFeeType({
          name,
          amount: Number(amount),
          frequency,
        });
        setSuccess('Type de frais créé avec succès.');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du type de frais.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type de frais ?')) return;
    try {
      await financeService.deleteFeeType(id);
      setSuccess('Type de frais supprimé.');
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Impossible de supprimer un type de frais déjà rattaché à des factures.');
    }
  };

  const frequencyLabel = {
    MONTHLY: 'Mensuel',
    QUARTERLY: 'Trimestriel',
    SEMESTRIAL: 'Semestriel',
    ANNUAL: 'Annuel',
    ONE_TIME: 'Unique / Ponctuel',
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="academy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#16222F] font-serif-title">
            Nomenclature des Frais Scolaires
          </h2>
          <p className="text-xs text-[#64748B]">
            Configurez les rubriques de facturation et leurs tarifs de référence
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="academy-btn-primary flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau type de frais</span>
          </button>
        )}
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B] uppercase">
                <th className="py-3 px-4">Libellé du frais</th>
                <th className="py-3 px-4">Tarif de référence</th>
                <th className="py-3 px-4">Fréquence</th>
                <th className="py-3 px-4">Statut</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {feeTypes.length > 0 ? (
                feeTypes.map((ft) => (
                  <tr key={ft.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#16222F]">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#C5A880]" />
                        <span>{ft.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#16222F]">
                      {formatAmount(ft.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#64748B]">
                      {frequencyLabel[ft.frequency] || ft.frequency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Actif
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(ft)}
                            className="p-1.5 rounded-lg text-[#16222F] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ft.id)}
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
                  <td colSpan={5} className="py-8 text-center text-sm text-[#94A3B8]">
                    Aucun type de frais configuré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E8DFC9] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold font-serif-title text-[#16222F]">
                {editingFee ? 'Modifier le type de frais' : 'Ajouter un type de frais'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  Nom du frais *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Frais de scolarité, Cantine..."
                  className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                  Tarif de référence (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ex: 4500"
                  className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                  Périodicité / Fréquence *
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
                >
                  <option value="MONTHLY">Mensuel</option>
                  <option value="QUARTERLY">Trimestriel</option>
                  <option value="SEMESTRIAL">Semestriel</option>
                  <option value="ANNUAL">Annuel</option>
                  <option value="ONE_TIME">Unique / Ponctuel</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="academy-btn-primary flex items-center gap-2 text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingFee ? 'Enregistrer' : 'Créer le frais'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
