import React, { useState, useEffect, useCallback } from 'react';
import { invoiceInstallmentService } from '../api/invoiceInstallmentService';

export const InstallmentsPlanModal = ({ isOpen, onClose, invoice }) => {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [splitCount, setSplitCount] = useState(3);
  const [payingId, setPayingId] = useState(null);

  const loadInstallments = useCallback(async () => {
    if (!invoice?.id) return;
    try {
      setLoading(true);
      const data = await invoiceInstallmentService.getInstallments(invoice.id);
      setInstallments(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, [invoice]);

  useEffect(() => {
    let active = true;
    if (isOpen && invoice) {
      Promise.resolve().then(() => {
        if (active) loadInstallments();
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen, invoice, loadInstallments]);

  const handleGeneratePlan = async () => {
    if (!invoice?.finalAmount || splitCount < 2) return;
    const total = parseFloat(invoice.finalAmount);
    const amountPerInstallment = parseFloat((total / splitCount).toFixed(2));

    const today = new Date();
    const items = [];
    for (let i = 1; i <= splitCount; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);
      const isLast = i === splitCount;
      const amt = isLast ? parseFloat((total - amountPerInstallment * (splitCount - 1)).toFixed(2)) : amountPerInstallment;

      items.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: amt,
      });
    }

    try {
      setCreating(true);
      await invoiceInstallmentService.createInstallmentPlan(invoice.id, {
        installments: items,
      });
      loadInstallments();
    } catch {
      // Non-blocking
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async (installment) => {
    const remaining = installment.amount - installment.paidAmount;
    if (remaining <= 0) return;

    try {
      setPayingId(installment.id);
      await invoiceInstallmentService.payInstallment(installment.id, remaining);
      loadInstallments();
    } catch {
      // Non-blocking
    } finally {
      setPayingId(null);
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Échéancier de Paiement — Facture {invoice.number}
            </h3>
            <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
              Montant total net : <span className="font-semibold">{invoice.finalAmount} EUR</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none p-1"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {installments.length === 0 && !loading && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-md">
              <div className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
                Aucun échéancier configuré
              </div>
              <p className="text-2xs text-amber-700 dark:text-amber-400 mb-3">
                Vous pouvez diviser automatiquement cette facture en plusieurs échéances mensuelles.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xs text-gray-600 dark:text-gray-400">Nombre d'échéances :</span>
                <select
                  value={splitCount}
                  onChange={(e) => setSplitCount(parseInt(e.target.value, 10))}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value={2}>2 mensualités</option>
                  <option value={3}>3 mensualités (Trimestriel)</option>
                  <option value={4}>4 mensualités</option>
                  <option value={6}>6 mensualités</option>
                  <option value={10}>10 mensualités (Annuel)</option>
                </select>
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={creating}
                  className="text-xs px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors"
                >
                  {creating ? 'Génération...' : 'Créer l\'échéancier'}
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-6 text-xs text-gray-500">Chargement de l'échéancier...</div>
          ) : installments.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-2xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2">N°</th>
                    <th className="px-3 py-2">Échéance</th>
                    <th className="px-3 py-2">Montant</th>
                    <th className="px-3 py-2">Payé</th>
                    <th className="px-3 py-2 text-center">Statut</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-mono text-2xs">#{inst.installmentNumber}</td>
                      <td className="px-3 py-2">{inst.dueDate}</td>
                      <td className="px-3 py-2 font-semibold">{inst.amount} EUR</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{inst.paidAmount} EUR</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`text-2xs px-2 py-0.5 rounded font-medium ${
                            inst.status === 'PAID'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : inst.status === 'PARTIAL'
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {inst.status !== 'PAID' && (
                          <button
                            type="button"
                            onClick={() => handlePay(inst)}
                            disabled={payingId === inst.id}
                            className="text-2xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium"
                          >
                            {payingId === inst.id ? 'Paiement...' : 'Régler'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
