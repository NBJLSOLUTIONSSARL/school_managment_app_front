import React, { useState, useEffect } from 'react';
import {
  Coins,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Receipt,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { financeService } from '../../services/financeService';
import { guardianService } from '../../services/guardianService';
import { downloadInvoicePdf } from '../../services/invoicePdfService';
import InvoiceDetailModal from './InvoiceDetailModal';

export default function ParentStudentFinanceView() {
  const { currentUser } = useAuth();
  const isParent = currentUser?.roles?.includes('ROLE_PARENT');

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isParent) {
          const res = await guardianService.getMyChildren();
          const list = Array.isArray(res) ? res : res?.data || [];
          setChildren(list);
          if (list.length > 0) {
            setSelectedChildId(list[0].id);
          }
        } else {
          const stuId = currentUser?.id;
          if (stuId) {
            const invRes = await financeService.getInvoicesByStudent(stuId);
            setInvoices(invRes?.content || (Array.isArray(invRes) ? invRes : []));
          }
        }
      } catch (err) {
        setError(err.message || 'Impossible de récupérer votre dossier financier.');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [currentUser, isParent]);

  useEffect(() => {
    if (!isParent || !selectedChildId) return;

    const fetchChildInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const invRes = await financeService.getInvoicesByStudent(selectedChildId);
        setInvoices(invRes?.content || (Array.isArray(invRes) ? invRes : []));
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des factures.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildInvoices();
  }, [isParent, selectedChildId]);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => {
    if (inv.status === 'PAID') return sum + (Number(inv.totalAmount) || 0);
    if (inv.paidAmount) return sum + (Number(inv.paidAmount) || 0);
    return sum;
  }, 0);
  const totalRemaining = Math.max(0, totalInvoiced - totalPaid);

  const handleDownloadInvoicePdf = async (inv) => {
    try {
      await downloadInvoicePdf(inv);
    } catch {
      alert('Impossible de générer le document de facturation.');
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    setDownloadingReceiptId(paymentId);
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
      alert('Le reçu officiel n\'est pas encore disponible.');
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            {isParent ? 'Scolarité & Facturation des Enfants' : 'Mon Dossier de Scolarité & Factures'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Consultez vos échéances, l'état de vos règlements et téléchargez vos reçus officiels
          </p>
        </div>

        {isParent && children.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] uppercase">Enfant :</span>
            <div className="relative">
              <select
                value={selectedChildId || ''}
                onChange={(e) => setSelectedChildId(Number(e.target.value))}
                className="appearance-none bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl px-4 py-2 pr-9 font-semibold text-xs text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.user ? `${c.user.firstName} ${c.user.lastName}` : `Élève #${c.id}`} ({c.studentNumber || `STU-${c.id}`})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total des frais de scolarité"
          value={formatAmount(totalInvoiced)}
          icon={Coins}
          badge={`${invoices.length} facture(s)`}
        />
        <StatCard
          title="Montant déjà réglé"
          value={formatAmount(totalPaid)}
          icon={CheckCircle2}
          badge="Encaissé"
          trend="up"
        />
        <StatCard
          title="Reste à régler"
          value={formatAmount(totalRemaining)}
          icon={AlertTriangle}
          badge={totalRemaining > 0 ? 'À régulariser' : 'À jour'}
          trend={totalRemaining > 0 ? 'down' : 'up'}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin mb-3" />
          <p className="text-sm text-[#64748B]">Chargement des factures et règlements...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="academy-card overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#16222F] font-serif-title">
              Historique des Factures
            </h2>
            <span className="text-xs text-[#64748B]">
              {invoices.length} document(s) émis
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B] uppercase">
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Période</th>
                  <th className="py-3 px-4">Date d'échéance</th>
                  <th className="py-3 px-4">Montant Net</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#16222F]">
                        {inv.number || `INV-${inv.id}`}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#16222F]">
                        {inv.billingPeriod || 'Année 2026-2027'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#64748B]">
                        {inv.dueDate || '-'}
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoiceId(inv.id);
                              setIsDetailOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#DFC2A0]" />
                            <span>Détails</span>
                          </button>

                          <button
                            onClick={() => handleDownloadInvoicePdf(inv)}
                            className="p-1.5 rounded-xl border border-[#E8DFC9] text-[#16222F] hover:bg-white transition-colors cursor-pointer"
                            title="Télécharger la facture"
                          >
                            <Download className="w-4 h-4 text-[#C5A880]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#94A3B8]">
                      Aucune facture enregistrée dans votre dossier scolaire.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedInvoiceId(null);
        }}
        onOpenPayment={() => {}}
        canManage={false}
      />
    </div>
  );
}
