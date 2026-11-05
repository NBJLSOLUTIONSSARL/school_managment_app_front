import React, { useState } from 'react';
import { Search, Download, CreditCard, Receipt, Loader2, Filter } from 'lucide-react';
import { financeService } from '../../services/financeService';

export default function PaymentsTab({ payments = [], onViewInvoice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState(null);

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  const handleDownloadReceipt = async (paymentId) => {
    setDownloadingId(paymentId);
    try {
      const blob = await financeService.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu_officiel_PAY-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    } catch {
      alert('Impossible de générer le reçu PDF pour ce paiement.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (selectedMethod !== 'ALL' && p.method !== selectedMethod) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const invNum = (p.invoiceNumber || '').toLowerCase();
    const pid = String(p.id);
    const method = (p.method || '').toLowerCase();
    return invNum.includes(q) || pid.includes(q) || method.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="academy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par référence, facture..."
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
            >
              <option value="ALL">Tous les modes</option>
              <option value="BANK_TRANSFER">Virement Bancaire</option>
              <option value="CASH">Espèces</option>
              <option value="CHECK">Chèque</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-semibold text-[#64748B]">
          {filteredPayments.length} paiement(s) enregistré(s)
        </span>
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B] uppercase">
                <th className="py-3 px-4">Réf. Règlement</th>
                <th className="py-3 px-4">Facture Liée</th>
                <th className="py-3 px-4">Date et Heure</th>
                <th className="py-3 px-4">Mode de règlement</th>
                <th className="py-3 px-4">Montant Versé</th>
                <th className="py-3 px-4 text-right">Reçu Officiel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#16222F]">
                      PAY-{p.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#16222F]">
                      <button
                        onClick={() => onViewInvoice && onViewInvoice({ id: p.invoiceId, number: p.invoiceNumber })}
                        className="hover:text-[#C5A880] underline cursor-pointer"
                      >
                        {p.invoiceNumber || `INV-${p.invoiceId}`}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B]">
                      {p.paidAt ? p.paidAt.substring(0, 16).replace('T', ' ') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.method === 'BANK_TRANSFER' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Virement Bancaire
                        </span>
                      )}
                      {p.method === 'CASH' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Espèces
                        </span>
                      )}
                      {p.method === 'CHECK' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          Chèque
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {formatAmount(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(p.id)}
                        disabled={downloadingId === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {downloadingId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-[#DFC2A0]" />
                        )}
                        <span>Télécharger Reçu</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[#94A3B8]">
                    Aucun paiement enregistré pour l'instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
