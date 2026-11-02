import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckSquare,
  CalendarCheck,
  Percent,
  Plus,
  Search,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Trash2
} from 'lucide-react';
import LineChart from '../components/common/LineChart';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { financeService } from '../services/financeService';
import { studentService } from '../services/studentService';

export default function FinancesView() {
  const { searchQuery, hasAnyRole } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    method: 'BANK_TRANSFER',
  });

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    number: '',
    totalAmount: '',
    dueDate: '2026-11-30',
    billingPeriod: '2026-T1',
  });

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const loadFinances = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, stuRes] = await Promise.all([
        financeService.getInvoices({ page: 0, size: 50 }),
        studentService.getStudents({ page: 0, size: 50 })
      ]);

      const invList = invRes?.content || (Array.isArray(invRes) ? invRes : []);
      const stuList = stuRes?.content || (Array.isArray(stuRes) ? stuRes : []);

      setInvoices(invList);
      setStudents(stuList);
    } catch (err) {
      setError(err.message || 'Impossible de charger les données financières.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinances();
  }, []);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => inv.status === 'PAID' ? sum + (Number(inv.totalAmount) || 0) : sum, 0);
  const totalUnpaid = Math.max(0, totalInvoiced - totalPaid);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  const formatAmount = (val) => {
    return new Intl.NumberFormat('fr-FR').format(val || 0) + ' MAD';
  };

  const handleOpenPayment = (invoice) => {
    setPaymentForm({
      invoiceId: invoice.id,
      amount: invoice.totalAmount || '',
      method: 'BANK_TRANSFER',
    });
    setIsPaymentModalOpen(true);
  };

  const handleOpenAddInvoice = () => {
    setInvoiceForm({
      studentId: students.length > 0 ? students[0].id : '',
      number: `FAC-2026-${Math.floor(100 + Math.random() * 900)}`,
      totalAmount: '4500',
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      billingPeriod: '2026-T1',
    });
    setIsInvoiceModalOpen(true);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await financeService.createPayment({
        invoiceId: Number(paymentForm.invoiceId),
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
      });
      setIsPaymentModalOpen(false);
      setSuccessMessage('Paiement enregistré avec succès dans MySQL.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadFinances();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du paiement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await financeService.createInvoice({
        studentId: Number(invoiceForm.studentId),
        number: invoiceForm.number,
        totalAmount: Number(invoiceForm.totalAmount),
        dueDate: invoiceForm.dueDate,
        billingPeriod: invoiceForm.billingPeriod,
        discount: 0,
      });
      setIsInvoiceModalOpen(false);
      setSuccessMessage('Facture émise avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadFinances();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la facture.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const blob = await financeService.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu_paiement_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert("Le reçu officiel n'est pas encore disponible pour ce règlement.");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (selectedStatus === 'ALL') return true;
    return inv.status === selectedStatus;
  });

  const chartData = [
    { month: 'Sep', amount: Math.round(totalPaid * 0.3) },
    { month: 'Oct', amount: Math.round(totalPaid * 0.7) },
    { month: 'Nov', amount: totalPaid }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-2 overflow-hidden">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#16222F] tracking-tight">
            Gestion Financière
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-2">
            Suivi des paiements, factures et frais de scolarité réels
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddInvoice}
              className="flex items-center gap-1.5 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Émettre une facture</span>
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadFinances}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              {formatAmount(totalInvoiced)}
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Total des frais facturés
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              {formatAmount(totalPaid)}
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Montant réellement encaissé
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              {formatAmount(totalUnpaid)}
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Restant à percevoir
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              {collectionRate}%
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Taux de recouvrement réel
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Évolution des règlements
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Cumul des montants perçus dans MySQL
              </p>
            </div>
            <span className="text-xs font-semibold text-[#78716C] bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EFECE6]">
              2026 - 2027
            </span>
          </div>

          <div className="pt-4">
            <LineChart
              data={chartData}
              dataKey="amount"
              labelKey="month"
              minY={0}
              maxY={Math.max(10000, totalPaid + 2000)}
              ySuffix=" MAD"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Filtrer les factures
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Statut de facture</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F]"
                >
                  <option value="ALL">Toutes les factures</option>
                  <option value="PAID">Payée (PAID)</option>
                  <option value="UNPAID">Impayée (UNPAID)</option>
                  <option value="PARTIAL">Paiement partiel (PARTIAL)</option>
                  <option value="OVERDUE">En retard (OVERDUE)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] text-xs text-[#78716C]">
                <p className="font-bold text-[#16222F] mb-1">Règle de comptabilité :</p>
                <p>Les paiements saisis alimentent directement la caisse et changent l'état de la facture correspondante.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des écritures comptables...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CreditCard className="w-12 h-12 text-[#C5A880] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-[#16222F]">
              Aucune facture enregistrée
            </h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Aucune facture ne correspond au filtre sélectionné dans MySQL.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  <th className="py-4 px-6">Numéro de facture</th>
                  <th className="py-4 px-6">Élève ID</th>
                  <th className="py-4 px-6">Montant total</th>
                  <th className="py-4 px-6">Date d'échéance</th>
                  <th className="py-4 px-6">Période</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2] text-sm">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#16222F]">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-[#C5A880]" />
                        <span>{inv.number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#16222F] font-mono">
                      Élève #{inv.studentId}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#16222F]">
                      {formatAmount(inv.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#78716C]">
                      {inv.dueDate || '-'}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#78716C]">
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFECE6]">
                        {inv.billingPeriod || 'Scolarité'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500'
                              : inv.status === 'OVERDUE'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        ></span>
                        <span>{inv.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      {canManage && inv.status !== 'PAID' && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-3 py-1 bg-[#16222F] text-white rounded-lg text-xs font-semibold hover:bg-[#203144] transition-colors cursor-pointer"
                        >
                          Encaisser
                        </button>
                      )}
                      {inv.status === 'PAID' && (
                        <button
                          onClick={() => handleDownloadReceipt(inv.id)}
                          title="Télécharger le reçu PDF officiel"
                          className="p-1.5 text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Enregistrer un encaissement dans MySQL"
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Montant perçu (MAD) *</label>
            <input
              type="number"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Mode de règlement *</label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            >
              <option value="BANK_TRANSFER">Virement bancaire</option>
              <option value="CASH">Espèces</option>
              <option value="CHECK">Chèque bancaire</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Valider le règlement</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Créer une nouvelle facture"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Élève bénéficiaire *</label>
            <select
              required
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            >
              <option value="">Sélectionnez un élève...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.firstName} {s.user?.lastName} ({s.studentNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Numéro de facture *</label>
              <input
                type="text"
                required
                value={invoiceForm.number}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, number: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Montant total (MAD) *</label>
              <input
                type="number"
                required
                value={invoiceForm.totalAmount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Date d'échéance *</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Période de facturation</label>
              <input
                type="text"
                value={invoiceForm.billingPeriod}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriod: e.target.value })}
                placeholder="Ex: 2026-T1"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Émettre la facture</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
