import React, { useState } from 'react';
import {
  CreditCard,
  CheckSquare,
  CalendarCheck,
  Percent,
  Plus
} from 'lucide-react';
import LineChart from '../components/common/LineChart';
import Modal from '../components/common/Modal';
import { FINANCIAL_DATA, INITIAL_STUDENTS } from '../data/mockData';

export default function FinancesView() {
  const [payments, setPayments] = useState(FINANCIAL_DATA.recentPayments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    studentName: INITIAL_STUDENTS[0].fullName,
    amount: 1200,
    method: 'Virement bancaire',
  });

  const handleAddPayment = (e) => {
    e.preventDefault();
    const student = INITIAL_STUDENTS.find(s => s.fullName === newPayment.studentName) || INITIAL_STUDENTS[0];

    setPayments([
      {
        id: Date.now(),
        studentName: student.fullName,
        amount: Number(newPayment.amount),
        currency: 'MAD',
        date: '31/10/2026',
        avatar: student.avatar,
        method: newPayment.method,
        invoiceNumber: `FAC-2026-0${payments.length + 90}`
      },
      ...payments
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-2 overflow-hidden">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#16222F] tracking-tight">
            Gestion Financière
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-2">
            Suivez les paiements et les frais de scolarité
          </p>
        </div>

        <div className="hidden lg:block absolute right-44 top-1/2 -translate-y-1/2 h-24 w-52 pointer-events-none">
          <img
            src="/assets/finances-illustration.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Voir tous</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              85 000 MAD
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Total des frais
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              73 500 MAD
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Payés
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              11 500 MAD
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Restants
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-serif-title font-bold text-[#16222F]">
              86%
            </p>
            <p className="text-xs text-[#526071] font-medium mt-0.5">
              Taux de paiement
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold font-serif-title text-[#16222F]">
              Évolution des paiements
            </h2>
          </div>

          <div className="pt-2">
            <LineChart
              data={FINANCIAL_DATA.monthlyChart}
              dataKey="amount"
              labelKey="month"
              minY={0}
              maxY={100}
              ySuffix="k"
              lineColor="#2563EB"
              height={230}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE1]">
              <h2 className="text-base sm:text-lg font-bold font-serif-title text-[#16222F]">
                Derniers paiements
              </h2>
            </div>

            <div className="space-y-4">
              {payments.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-[#FAF6EE] last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.studentName}
                      className="w-9 h-9 rounded-full object-cover border border-[#EFECE6]"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/dr-martin.png";
                      }}
                    />
                    <span className="text-xs sm:text-sm font-semibold text-[#16222F]">
                      {p.studentName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs sm:text-sm font-medium text-[#16222F]">
                      {p.amount.toLocaleString()} MAD
                    </span>
                    <span className="text-xs text-[#78716C]">
                      {p.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Encaisser un règlement de scolarité"
        subtitle="Enregistrez un paiement d'un élève ou parent"
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Élève concerné *
            </label>
            <select
              value={newPayment.studentName}
              onChange={(e) => setNewPayment({ ...newPayment, studentName: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            >
              {INITIAL_STUDENTS.map((s) => (
                <option key={s.id} value={s.fullName}>
                  {s.fullName} ({s.class})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Montant (MAD) *
            </label>
            <input
              type="number"
              required
              min="100"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Moyen de règlement *
            </label>
            <select
              value={newPayment.method}
              onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            >
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Carte Bancaire">Carte Bancaire</option>
              <option value="Espèces">Espèces</option>
              <option value="Chèque">Chèque</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-xs flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Valider l'encaissement</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
