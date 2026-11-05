import React, { useState, useEffect } from 'react';
import {
  Coins,
  FileText,
  CreditCard,
  Building,
  TrendingDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { financeService } from '../services/financeService';
import { studentService } from '../services/studentService';

import FinanceDashboardTab from './finances/FinanceDashboardTab';
import InvoicesTab from './finances/InvoicesTab';
import InvoiceDetailModal from './finances/InvoiceDetailModal';
import InvoiceFormModal from './finances/InvoiceFormModal';
import GenerateInvoicesModal from './finances/GenerateInvoicesModal';
import PaymentsTab from './finances/PaymentsTab';
import PaymentModal from './finances/PaymentModal';
import FeeTypesTab from './finances/FeeTypesTab';
import ExpensesTab from './finances/ExpensesTab';
import ParentStudentFinanceView from './finances/ParentStudentFinanceView';

export default function FinancesView() {
  const { currentUser, hasAnyRole } = useAuth();

  const isParentOrStudent = currentUser?.roles?.includes('ROLE_PARENT') || currentUser?.roles?.includes('ROLE_STUDENT');
  if (isParentOrStudent) {
    return <ParentStudentFinanceView />;
  }

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadAllFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, expRes, feeRes, stuRes] = await Promise.allSettled([
        financeService.getInvoices({ page: 0, size: 100 }),
        financeService.getExpenses({ page: 0, size: 100 }),
        financeService.getFeeTypes(),
        studentService.getStudents({ page: 0, size: 100 }),
      ]);

      const invList = invRes.status === 'fulfilled' ? invRes.value?.content || (Array.isArray(invRes.value) ? invRes.value : []) : [];
      const expList = expRes.status === 'fulfilled' ? expRes.value?.content || (Array.isArray(expRes.value) ? expRes.value : []) : [];
      const feeList = feeRes.status === 'fulfilled' && Array.isArray(feeRes.value) ? feeRes.value : [];
      const stuList = stuRes.status === 'fulfilled' ? stuRes.value?.content || (Array.isArray(stuRes.value) ? stuRes.value : []) : [];

      setInvoices(invList);
      setExpenses(expList);
      setFeeTypes(feeList);
      setStudents(stuList);

      const allPaymentsPromises = invList.slice(0, 30).map((inv) =>
        financeService.getPaymentsByInvoice(inv.id).catch(() => [])
      );
      const paymentsResults = await Promise.allSettled(allPaymentsPromises);
      const combinedPayments = [];
      paymentsResults.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          const list = Array.isArray(res.value) ? res.value : res.value?.data || [];
          list.forEach((p) => {
            combinedPayments.push({
              ...p,
              invoiceId: invList[idx]?.id,
              invoiceNumber: invList[idx]?.number,
            });
          });
        }
      });
      setPayments(combinedPayments);
    } catch (err) {
      setError(err.message || 'Impossible de charger les données financières.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFinancialData();
  }, []);

  const handleViewInvoice = (inv) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Voulez-vous supprimer cette facture ? (Possible uniquement si aucun paiement n\'est enregistré)')) return;
    try {
      await financeService.deleteInvoice(id);
      setSuccessMessage('Facture supprimée avec succès.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadAllFinancialData();
    } catch (err) {
      alert(err.message || 'Impossible de supprimer cette facture.');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Coins },
    { id: 'invoices', label: 'Factures & Échéancier', icon: FileText, count: invoices.length },
    { id: 'payments', label: 'Règlements & Reçus', icon: Receipt, count: payments.length },
    { id: 'fee-types', label: 'Types de frais', icon: Building, count: feeTypes.length },
    { id: 'expenses', label: 'Dépenses', icon: TrendingDown, count: expenses.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-1">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#16222F] tracking-tight">
            Gestion Financière
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Supervision globale des frais de scolarité, factures, encaissements et dépenses
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="border-b border-[#E2E8F0] flex items-center gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#C5A880] text-[#16222F] bg-white rounded-t-xl'
                  : 'border-transparent text-[#64748B] hover:text-[#16222F] hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880]' : 'text-[#94A3B8]'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#16222F] text-[#DFC2A0]' : 'bg-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin mb-3" />
          <p className="text-sm text-[#64748B]">Chargement des données financières réelles...</p>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <FinanceDashboardTab
              invoices={invoices}
              expenses={expenses}
              feeTypes={feeTypes}
              onSelectTab={setActiveTab}
              onViewInvoice={handleViewInvoice}
              onDownloadReceipt={() => {}}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesTab
              invoices={invoices}
              students={students}
              canManage={canManage}
              onViewInvoice={handleViewInvoice}
              onOpenPayment={handleOpenPayment}
              onOpenCreateInvoice={() => setIsInvoiceModalOpen(true)}
              onOpenGenerateInvoices={() => setIsGenerateModalOpen(true)}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              payments={payments}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {activeTab === 'fee-types' && (
            <FeeTypesTab
              feeTypes={feeTypes}
              canManage={canManage}
              onRefresh={loadAllFinancialData}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab
              expenses={expenses}
              canManage={canManage}
              onRefresh={loadAllFinancialData}
            />
          )}
        </>
      )}

      <InvoiceDetailModal
        invoiceId={selectedInvoice?.id}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        onOpenPayment={handleOpenPayment}
        canManage={canManage}
      />

      <InvoiceFormModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Facture émise avec succès.');
          setTimeout(() => setSuccessMessage(''), 3000);
          loadAllFinancialData();
        }}
        students={students}
        feeTypes={feeTypes}
      />

      <GenerateInvoicesModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Factures périodiques générées avec succès.');
          setTimeout(() => setSuccessMessage(''), 3000);
          loadAllFinancialData();
        }}
        students={students}
        feeTypes={feeTypes}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSuccess={(createdPayment) => {
          setSuccessMessage(`Règlement enregistré avec succès (Réf: PAY-${createdPayment.id || ''}).`);
          setTimeout(() => setSuccessMessage(''), 3000);
          loadAllFinancialData();
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
}
