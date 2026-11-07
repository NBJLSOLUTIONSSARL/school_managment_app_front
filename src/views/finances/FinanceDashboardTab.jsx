import React from 'react';
import {
  Coins,
  CheckCircle2,
  AlertTriangle,
  ClockAlert,
  TrendingDown,
  ArrowRight,
  Receipt,
  FileText,
  CreditCard,
  Building,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';

export default function FinanceDashboardTab({
  invoices = [],
  expenses = [],
  feeTypes = [],
  onSelectTab,
  onViewInvoice,
  onDownloadReceipt,
}) {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => {
    if (inv.status === 'PAID') return sum + (Number(inv.totalAmount) || 0);
    if (inv.paidAmount) return sum + (Number(inv.paidAmount) || 0);
    return sum;
  }, 0);
  const totalRemaining = Math.max(0, totalInvoiced - totalPaid);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  const countUnpaid = invoices.filter((i) => i.status === 'UNPAID').length;
  const countPartial = invoices.filter((i) => i.status === 'PARTIAL').length;
  const countPaid = invoices.filter((i) => i.status === 'PAID').length;
  const countOverdue = invoices.filter((i) => i.status === 'OVERDUE').length;

  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Autres';
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
    return acc;
  }, {});

  const formatAmount = (val) => `${new Intl.NumberFormat('fr-FR').format(val || 0)} MAD`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Montant total facturé"
          value={formatAmount(totalInvoiced)}
          icon={Coins}
          badge={`${invoices.length} facture(s)`}
          trend="up"
        />
        <StatCard
          title="Total encaissé"
          value={formatAmount(totalPaid)}
          icon={CheckCircle2}
          badge={`Taux : ${collectionRate}%`}
          trend="up"
        />
        <StatCard
          title="Reste à recouvrer"
          value={formatAmount(totalRemaining)}
          icon={AlertTriangle}
          badge={`${countUnpaid + countPartial} en attente`}
          trend="neutral"
        />
        <StatCard
          title="Dépenses enregistrées"
          value={formatAmount(totalExpenses)}
          icon={TrendingDown}
          badge={`${expenses.length} dépense(s)`}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="academy-card p-4 flex items-center justify-between border-l-4 border-l-rose-500 bg-white">
          <div>
            <p className="text-xs font-semibold text-[#64748B]">Factures Impayées</p>
            <p className="text-xl font-bold text-rose-600 mt-0.5">{countUnpaid}</p>
          </div>
          <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </span>
        </div>

        <div className="academy-card p-4 flex items-center justify-between border-l-4 border-l-amber-500 bg-white">
          <div>
            <p className="text-xs font-semibold text-[#64748B]">Paiements Partiels</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{countPartial}</p>
          </div>
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Coins className="w-5 h-5" />
          </span>
        </div>

        <div className="academy-card p-4 flex items-center justify-between border-l-4 border-l-emerald-500 bg-white">
          <div>
            <p className="text-xs font-semibold text-[#64748B]">Factures Soldées</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{countPaid}</p>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>

        <div className="academy-card p-4 flex items-center justify-between border-l-4 border-l-purple-500 bg-white">
          <div>
            <p className="text-xs font-semibold text-[#64748B]">En Retard d'Échéance</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">{countOverdue}</p>
          </div>
          <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <ClockAlert className="w-5 h-5" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 academy-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4361EE]" />
              <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                Dernières Factures Émises
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('invoices')}
              className="text-xs font-semibold text-[#16222F] hover:text-[#4361EE] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase">
                    <th className="py-2.5 px-3">Numéro</th>
                    <th className="py-2.5 px-3">Élève</th>
                    <th className="py-2.5 px-3">Échéance</th>
                    <th className="py-2.5 px-3">Montant</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#16222F]">
                        {inv.number || `INV-${inv.id}`}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-[#16222F] block">
                          {inv.studentName || `Élève #${inv.studentId}`}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {inv.studentNumber || 'STU'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#64748B]">
                        {inv.dueDate || '-'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#16222F]">
                        {formatAmount(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-3">
                        {inv.status === 'PAID' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Payée
                          </span>
                        )}
                        {inv.status === 'PARTIAL' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Partielle
                          </span>
                        )}
                        {inv.status === 'UNPAID' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Impayée
                          </span>
                        )}
                        {inv.status === 'OVERDUE' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            En retard
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="text-xs font-semibold text-[#16222F] hover:text-[#4361EE] underline cursor-pointer"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-6 text-sm text-[#94A3B8]">
              Aucune facture enregistrée dans le système.
            </p>
          )}
        </div>

        <div className="academy-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#4361EE]" />
              <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                Dépenses par catégorie
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('expenses')}
              className="text-xs font-semibold text-[#16222F] hover:text-[#4361EE] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Gérer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {Object.keys(expensesByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([cat, amt]) => {
                const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#16222F]">{cat}</span>
                      <span className="text-[#64748B]">{formatAmount(amt)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#4361EE] h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 text-sm text-[#94A3B8]">
              Aucune dépense enregistrée.
            </p>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
            <button
              onClick={() => onSelectTab('fee-types')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#E8DFC9] transition-colors cursor-pointer text-xs font-semibold text-[#16222F]"
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#4361EE]" />
                <span>Consulter les types de frais ({feeTypes.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#16222F]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
