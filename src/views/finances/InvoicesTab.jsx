import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Download,
  CreditCard,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';
import { downloadInvoicePdf } from '../../services/invoicePdfService';

export default function InvoicesTab({
  invoices = [],
  students = [],
  canManage,
  onViewInvoice,
  onOpenPayment,
  onOpenCreateInvoice,
  onOpenGenerateInvoices,
  onDeleteInvoice,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState(null);

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  const filteredInvoices = invoices.filter((inv) => {
    if (selectedStatus !== 'ALL' && inv.status !== selectedStatus) return false;
    if (selectedStudentId !== 'ALL' && String(inv.studentId) !== selectedStudentId) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const num = (inv.number || '').toLowerCase();
    const stName = (inv.studentName || '').toLowerCase();
    const stNum = (inv.studentNumber || '').toLowerCase();
    const period = (inv.billingPeriod || '').toLowerCase();

    return num.includes(q) || stName.includes(q) || stNum.includes(q) || period.includes(q);
  });

  const handleDownloadPdf = async (inv) => {
    setDownloadingId(inv.id);
    try {
      await downloadInvoicePdf(inv);
    } catch {
      alert('Erreur lors de la génération de la facture PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="academy-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher facture, élève..."
              className="w-full bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="UNPAID">Impayées</option>
              <option value="PARTIAL">Partiellement payées</option>
              <option value="PAID">Soldées</option>
              <option value="OVERDUE">En retard</option>
            </select>
          </div>

          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
          >
            <option value="ALL">Tous les élèves</option>
            {students.map((st) => (
              <option key={st.id} value={String(st.id)}>
                {st.user ? `${st.user.firstName} ${st.user.lastName}` : `Élève #${st.id}`}
              </option>
            ))}
          </select>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={onOpenGenerateInvoices}
              className="academy-btn-secondary flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Génération groupée</span>
            </button>
            <button
              onClick={onOpenCreateInvoice}
              className="academy-btn-primary flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Émettre une facture</span>
            </button>
          </div>
        )}
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B] uppercase">
                <th className="py-3 px-4">Numéro</th>
                <th className="py-3 px-4">Élève</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4">Montant Net</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#16222F]">
                      {inv.number || `INV-${inv.id}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#16222F] block">
                        {inv.studentName || `Élève #${inv.studentId}`}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {inv.studentNumber || 'STU'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B]">
                      {inv.dueDate || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#16222F]">
                      {inv.billingPeriod || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#16222F]">
                      {formatAmount(inv.finalAmount || inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {inv.status === 'PAID' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Payée
                        </span>
                      )}
                      {inv.status === 'PARTIAL' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          Partielle
                        </span>
                      )}
                      {inv.status === 'UNPAID' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          Impayée
                        </span>
                      )}
                      {inv.status === 'OVERDUE' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                          En retard
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="Voir les détails"
                          className="p-1.5 rounded-lg text-[#16222F] hover:bg-white hover:text-[#C5A880] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          title="Télécharger la facture PDF"
                          disabled={downloadingId === inv.id}
                          className="p-1.5 rounded-lg text-[#16222F] hover:bg-white hover:text-[#C5A880] transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {canManage && inv.status !== 'PAID' && (
                          <button
                            onClick={() => onOpenPayment(inv)}
                            title="Enregistrer un paiement"
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        {canManage && (
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            title="Supprimer la facture"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-[#94A3B8]">
                    Aucune facture ne correspond aux critères de recherche.
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
