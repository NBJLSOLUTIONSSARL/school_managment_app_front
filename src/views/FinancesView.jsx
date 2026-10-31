import React, { useState } from 'react';
import {
  Coins,
  CheckCircle2,
  AlertCircle,
  Percent,
  Plus,
  Receipt
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
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
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Comptabilité & Facturation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion Financière
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Suivez les paiements et les frais de scolarité
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Encaisser un paiement +</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Coins}
          title="Total des frais"
          value="85 000 MAD"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={CheckCircle2}
          title="Payés"
          value="73 500 MAD"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-emerald-700"
        />
        <StatCard
          icon={AlertCircle}
          title="Restants"
          value="11 500 MAD"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-rose-600"
        />
        <StatCard
          icon={Percent}
          title="Taux de paiement"
          value="86%"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-teal-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 academy-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Évolution des paiements
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Cumul des règlements enregistrés (en milliers de MAD)
              </p>
            </div>
            <span className="text-xs font-semibold text-[#78716C] bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EFECE6]">
              Exercice en cours
            </span>
          </div>

          <div className="pt-4">
            <LineChart
              data={FINANCIAL_DATA.monthlyChart}
              dataKey="amount"
              labelKey="month"
              minY={0}
              maxY={100}
              ySuffix="k"
              lineColor="#2E4C6D"
              height={230}
            />
          </div>
        </div>

        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F4EDE2]">
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Derniers paiements
              </h2>
              <Receipt className="w-4 h-4 text-[#C5A880]" />
            </div>

            <div className="mt-4 space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] hover:bg-[#F4EDE2]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.studentName}
                      className="w-10 h-10 rounded-full object-cover border border-[#EFECE6]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#16222F]">
                        {p.studentName}
                      </p>
                      <p className="text-[11px] text-[#A8A29E]">
                        {p.date} • {p.method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#16222F]">
                      {p.amount.toLocaleString()} {p.currency}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">
                      Encaissé
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EDE2] mt-4 text-center">
            <button
              onClick={() => alert('Génération du grand livre comptable (PDF/Excel)...')}
              className="text-xs font-bold text-[#16222F] hover:text-[#C5A880] transition-colors"
            >
              Télécharger le relevé comptable →
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Encaisser un paiement"
        subtitle="Enregistrez un règlement de frais de scolarité"
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Élève / Famille *
            </label>
            <select
              value={newPayment.studentName}
              onChange={(e) => setNewPayment({ ...newPayment, studentName: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            >
              {INITIAL_STUDENTS.map(s => (
                <option key={s.id} value={s.fullName}>
                  {s.fullName} ({s.class})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Montant (MAD) *
              </label>
              <input
                type="number"
                required
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Mode de règlement
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
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-md"
            >
              Émettre le reçu & valider
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
