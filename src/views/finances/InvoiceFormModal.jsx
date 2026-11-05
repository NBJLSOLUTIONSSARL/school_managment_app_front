import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle, Coins, Calendar, User } from 'lucide-react';
import { financeService } from '../../services/financeService';

export default function InvoiceFormModal({
  isOpen,
  onClose,
  onSuccess,
  students = [],
  feeTypes = [],
}) {
  const [studentId, setStudentId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [discount, setDiscount] = useState('0');
  const [lines, setLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setDiscount('0');
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
      if (students.length > 0) {
        setStudentId(String(students[0].id));
      }
      if (feeTypes.length > 0) {
        setLines([
          {
            feeTypeId: feeTypes[0].id,
            quantity: 1,
            unitAmount: feeTypes[0].amount || 1000,
          },
        ]);
      } else {
        setLines([
          {
            feeTypeId: 1,
            quantity: 1,
            unitAmount: 1000,
          },
        ]);
      }
    }
  }, [isOpen, students, feeTypes]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    const firstFee = feeTypes[0];
    setLines([
      ...lines,
      {
        feeTypeId: firstFee?.id || 1,
        quantity: 1,
        unitAmount: firstFee?.amount || 1000,
      },
    ]);
  };

  const handleRemoveLine = (idx) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx, field, value) => {
    const updated = [...lines];
    if (field === 'feeTypeId') {
      const selectedFee = feeTypes.find((f) => String(f.id) === String(value));
      updated[idx] = {
        ...updated[idx],
        feeTypeId: Number(value),
        unitAmount: selectedFee?.amount || updated[idx].unitAmount,
      };
    } else if (field === 'quantity') {
      updated[idx] = { ...updated[idx], quantity: Math.max(1, Number(value) || 1) };
    } else if (field === 'unitAmount') {
      updated[idx] = { ...updated[idx], unitAmount: Number(value) || 0 };
    }
    setLines(updated);
  };

  const grossTotal = lines.reduce((acc, l) => acc + (Number(l.quantity) * Number(l.unitAmount) || 0), 0);
  const finalTotal = Math.max(0, grossTotal - (Number(discount) || 0));

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setError('Veuillez sélectionner un élève.');
      return;
    }
    if (lines.length === 0) {
      setError('La facture doit comporter au moins une ligne de frais.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        studentId: Number(studentId),
        dueDate,
        discount: Number(discount) || 0,
        lines: lines.map((l) => ({
          feeTypeId: Number(l.feeTypeId),
          quantity: Number(l.quantity),
          unitAmount: Number(l.unitAmount),
        })),
      };

      await financeService.createInvoice(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la facture.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DFC9] flex flex-col">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold font-serif-title text-[#16222F]">
              Émettre une nouvelle facture
            </h2>
            <p className="text-xs text-[#64748B]">
              Ajoutez les lignes de frais pour l'élève concerné
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Élève bénéficiaire *
              </label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.user ? `${st.user.firstName} ${st.user.lastName}` : `Élève #${st.id}`} ({st.studentNumber || `STU-${st.id}`})
                  </option>
                ))}
              </select>
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
                Lignes de frais *
              </label>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#16222F] hover:text-[#C5A880] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {lines.map((l, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC9] grid grid-cols-12 gap-2.5 items-center"
                >
                  <div className="col-span-5">
                    <label className="text-[10px] font-semibold text-[#64748B] block mb-1">
                      Type de frais
                    </label>
                    <select
                      value={l.feeTypeId}
                      onChange={(e) => handleLineChange(idx, 'feeTypeId', e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    >
                      {feeTypes.map((ft) => (
                        <option key={ft.id} value={ft.id}>
                          {ft.name} ({formatAmount(ft.amount)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-[#64748B] block mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={l.quantity}
                      onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#16222F] text-center focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] font-semibold text-[#64748B] block mb-1">
                      Prix unit. (MAD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.unitAmount}
                      onChange={(e) => handleLineChange(idx, 'unitAmount', e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#16222F] text-right focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-end pt-4">
                    <button
                      type="button"
                      disabled={lines.length <= 1}
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Réduction / Bourse (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC9] flex flex-col justify-center">
              <span className="text-xs text-[#64748B]">Total net calculé :</span>
              <span className="text-xl font-bold font-serif-title text-[#16222F] mt-0.5">
                {formatAmount(finalTotal)}
              </span>
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
                <Coins className="w-4 h-4" />
              )}
              <span>Émettre la facture</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
