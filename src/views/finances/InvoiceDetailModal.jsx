import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Plus,
  Loader2,
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { downloadInvoicePdf } from '../../services/invoicePdfService';

export default function InvoiceDetailModal({
  invoiceId,
  isOpen,
  onClose,
  onOpenPayment,
  canManage,
}) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  useEffect(() => {
    if (!isOpen || !invoiceId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await financeService.getInvoiceById(invoiceId);
        setInvoice(data);
      } catch (err) {
        setError(err.message || 'Impossible de charger le détail de la facture.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, invoiceId]);

  if (!isOpen) return null;

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  const handleDownloadInvoice = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice);
    } catch {
      alert('Erreur lors de la génération de la facture PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    setDownloadingReceiptId(paymentId);
    try {
      const blob = await financeService.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu_paiement_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    } catch {
      alert('Le reçu PDF officiel n\'est pas encore disponible.');
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DFC9] flex flex-col">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center font-bold">
              AL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif-title text-[#16222F]">
                  Facture {invoice?.number || `INV-${invoiceId}`}
                </h2>
                {invoice?.status === 'PAID' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Payée
                  </span>
                )}
                {invoice?.status === 'PARTIAL' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Partielle
                  </span>
                )}
                {invoice?.status === 'UNPAID' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    Impayée
                  </span>
                )}
                {invoice?.status === 'OVERDUE' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    En retard
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                Période : {invoice?.billingPeriod || 'Semestre en cours'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#64748B]">
              <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin mb-3" />
              <p className="text-sm">Chargement des données de facturation...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : invoice ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC9] space-y-1">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Élève concerné
                  </span>
                  <p className="text-base font-bold text-[#16222F]">
                    {invoice.studentName || `Élève #${invoice.studentId}`}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Matricule : {invoice.studentNumber || `STU-${invoice.studentId}`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC9] space-y-1">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Échéance de paiement
                  </span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#16222F]">
                    <Calendar className="w-4 h-4 text-[#C5A880]" />
                    <span>{invoice.dueDate || 'Non définie'}</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Paiement exigible avant la date limite
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider mb-3">
                  Lignes de frais
                </h3>
                <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B]">
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-center">Quantité</th>
                        <th className="py-2.5 px-4 text-right">Prix Unitaire</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {invoice.lines && invoice.lines.length > 0 ? (
                        invoice.lines.map((l) => (
                          <tr key={l.id}>
                            <td className="py-3 px-4 font-semibold text-[#16222F]">
                              {l.feeTypeName}
                            </td>
                            <td className="py-3 px-4 text-center text-[#64748B]">
                              {l.quantity}
                            </td>
                            <td className="py-3 px-4 text-right text-[#64748B]">
                              {formatAmount(l.unitAmount)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-[#16222F]">
                              {formatAmount(l.lineTotal)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-sm text-[#94A3B8]">
                            Aucune ligne détaillée.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-80 bg-[#FAF7F2] border border-[#E8DFC9] rounded-2xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Montant brut :</span>
                    <span className="font-semibold text-[#16222F]">{formatAmount(invoice.totalAmount)}</span>
                  </div>
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Réduction accordée :</span>
                      <span className="font-semibold">- {formatAmount(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-[#16222F] pt-2 border-t border-[#E8DFC9]">
                    <span>Net à payer :</span>
                    <span className="text-[#C5A880]">{formatAmount(invoice.finalAmount || invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#64748B] pt-1">
                    <span>Montant déjà versé :</span>
                    <span className="font-semibold text-emerald-600">{formatAmount(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-rose-600 pt-0.5">
                    <span>Reste à payer :</span>
                    <span>{formatAmount(invoice.remainingAmount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#16222F] uppercase tracking-wider mb-3">
                  Historique des règlements
                </h3>
                {invoice.payments && invoice.payments.length > 0 ? (
                  <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B]">
                          <th className="py-2.5 px-4">Réf. Paiement</th>
                          <th className="py-2.5 px-4">Date et heure</th>
                          <th className="py-2.5 px-4">Mode</th>
                          <th className="py-2.5 px-4">Montant</th>
                          <th className="py-2.5 px-4 text-right">Reçu officiel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {invoice.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-3 px-4 font-semibold text-[#16222F]">
                              PAY-{p.id}
                            </td>
                            <td className="py-3 px-4 text-xs text-[#64748B]">
                              {p.paidAt ? p.paidAt.substring(0, 16).replace('T', ' ') : '-'}
                            </td>
                            <td className="py-3 px-4 text-xs font-medium text-[#16222F]">
                              {p.method}
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-600">
                              {formatAmount(p.amount)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDownloadReceipt(p.id)}
                                disabled={downloadingReceiptId === p.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {downloadingReceiptId === p.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5 text-[#DFC2A0]" />
                                )}
                                <span>Reçu PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 bg-[#FAF7F2] rounded-xl text-xs text-[#94A3B8] border border-[#E8DFC9]">
                    Aucun paiement enregistré pour cette facture.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="p-4 border-t border-[#E2E8F0] bg-[#FAF7F2] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading || !invoice}
            className="academy-btn-secondary flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-[#C5A880]" />
            )}
            <span>Télécharger Facture PDF</span>
          </button>

          <div className="flex items-center gap-3">
            {canManage && invoice?.status !== 'PAID' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPayment(invoice);
                }}
                className="academy-btn-primary flex items-center gap-2 text-xs shadow-md cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Enregistrer un règlement</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-white transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
