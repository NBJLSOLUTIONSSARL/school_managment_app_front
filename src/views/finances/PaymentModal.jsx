import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { financeService } from '../../services/financeService';

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  invoice = null,
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && invoice) {
      setError(null);
      const finalAmt = invoice.finalAmount || invoice.totalAmount || 0;
      const paid = invoice.paidAmount || (invoice.status === 'PAID' ? finalAmt : 0);
      const remaining = invoice.remainingAmount !== undefined ? invoice.remainingAmount : Math.max(0, finalAmt - paid);
      setAmount(String(remaining || finalAmt));
      setMethod('BANK_TRANSFER');
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const finalAmt = invoice.finalAmount || invoice.totalAmount || 0;
  const paid = invoice.paidAmount || (invoice.status === 'PAID' ? finalAmt : 0);
  const remaining = invoice.remainingAmount !== undefined ? invoice.remainingAmount : Math.max(0, finalAmt - paid);

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Veuillez saisir un montant strictement positif.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await financeService.createPayment({
        invoiceId: invoice.id,
        amount: numAmount,
        method,
      });
      onSuccess(res?.data || res);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du paiement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E8DFC9] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold font-serif-title text-[#16222F]">
              Enregistrer un règlement
            </h2>
            <p className="text-xs text-[#64748B]">
              Facture {invoice.number || `INV-${invoice.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC9] space-y-2">
            <div className="flex justify-between text-xs text-[#64748B]">
              <span>Élève :</span>
              <span className="font-semibold text-[#16222F]">{invoice.studentName || `Élève #${invoice.studentId}`}</span>
            </div>
            <div className="flex justify-between text-xs text-[#64748B]">
              <span>Total facture :</span>
              <span className="font-semibold text-[#16222F]">{formatAmount(finalAmt)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-rose-600 pt-1 border-t border-[#E8DFC9]">
              <span>Reste actuellement dû :</span>
              <span>{formatAmount(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
              Montant versé (MAD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-base font-bold text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
              Mode de paiement *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
            >
              <option value="BANK_TRANSFER">Virement Bancaire</option>
              <option value="CASH">Espèces</option>
              <option value="CHECK">Chèque</option>
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
                <CreditCard className="w-4 h-4" />
              )}
              <span>Valider le règlement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
