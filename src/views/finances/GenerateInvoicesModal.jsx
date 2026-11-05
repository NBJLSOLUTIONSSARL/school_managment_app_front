import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { financeService } from '../../services/financeService';

export default function GenerateInvoicesModal({
  isOpen,
  onClose,
  onSuccess,
  students = [],
  feeTypes = [],
}) {
  const [feeTypeId, setFeeTypeId] = useState(() => (feeTypes[0]?.id ? String(feeTypes[0].id) : ''));
  const [billingPeriod, setBillingPeriod] = useState('2026-T1');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState(() => students.map((s) => s.id));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleToggleStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sid) => sid !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feeTypeId) {
      setError('Veuillez sélectionner un type de frais.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      setError('Veuillez sélectionner au moins un élève.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        feeTypeId: Number(feeTypeId),
        studentIds: selectedStudentIds.map(Number),
        billingPeriod,
        dueDate,
      };

      await financeService.generateInvoices(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la génération groupée des factures.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DFC9] flex flex-col">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold font-serif-title text-[#16222F]">
              Génération groupée de factures
            </h2>
            <p className="text-xs text-[#64748B]">
              Émettre automatiquement une facture périodique pour plusieurs élèves
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
              Type de frais à facturer *
            </label>
            <select
              required
              value={feeTypeId}
              onChange={(e) => setFeeTypeId(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
            >
              {feeTypes.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  {ft.name} ({new Intl.NumberFormat('fr-FR').format(ft.amount || 0)} MAD — {ft.frequency})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Période de facturation *
              </label>
              <input
                type="text"
                required
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                placeholder="ex: 2026-T1, 2026-09"
                className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Date d'échéance *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#16222F] uppercase tracking-wider">
                Élèves à facturer ({selectedStudentIds.length}/{students.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-[#C5A880] hover:underline cursor-pointer"
              >
                {selectedStudentIds.length === students.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-[#E2E8F0] rounded-2xl p-2 space-y-1 bg-[#FAF7F2]">
              {students.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => handleToggleStudent(st.id)}
                    className="p-2 rounded-xl flex items-center justify-between hover:bg-white transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#C5A880]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#94A3B8]" />
                      )}
                      <span className="font-semibold text-[#16222F]">
                        {st.user ? `${st.user.firstName} ${st.user.lastName}` : `Élève #${st.id}`}
                      </span>
                    </div>
                    <span className="text-[#64748B] text-[11px]">
                      {st.studentNumber || `STU-${st.id}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3 pt-4">
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
                <Sparkles className="w-4 h-4" />
              )}
              <span>Générer {selectedStudentIds.length} facture(s)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
