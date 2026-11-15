import React, { useState, useEffect, useCallback } from 'react';
import { payrollService } from '../api/payrollService';

export const PayrollManagerModal = ({ isOpen, onClose, staff }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [formData, setFormData] = useState({
    period: '2026-10',
    baseSalary: '3200',
    bonuses: '0',
    deductions: '0',
    paymentMethod: 'BANK_TRANSFER',
    note: '',
  });

  const loadPayroll = useCallback(async () => {
    if (!staff?.id) return;
    try {
      setLoading(true);
      const data = await payrollService.getByStaff(staff.id);
      setRecords(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, [staff]);

  useEffect(() => {
    let active = true;
    if (isOpen && staff) {
      Promise.resolve().then(() => {
        if (active) loadPayroll();
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen, staff, loadPayroll]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!staff?.id) return;

    try {
      setCreating(true);
      await payrollService.create({
        staffId: staff.id,
        period: formData.period,
        baseSalary: parseFloat(formData.baseSalary),
        bonuses: parseFloat(formData.bonuses || 0),
        deductions: parseFloat(formData.deductions || 0),
        paymentMethod: formData.paymentMethod,
        note: formData.note,
      });
      loadPayroll();
    } catch {
      // Non-blocking
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (recordId) => {
    try {
      setDownloadingId(recordId);
      const blob = await payrollService.downloadPayslip(recordId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulletin_paie_${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Non-blocking
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen || !staff) return null;

  const staffName = staff.user ? `${staff.user.firstName || ''} ${staff.user.lastName || ''}`.trim() : `Membre #${staff.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Gestion de la Paie & Bulletins — {staffName}
            </h3>
            <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
              Historique des salaires, primes et téléchargement des bulletins officiels.
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
          {/* Create form */}
          <form onSubmit={handleCreate} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-md border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="text-2xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Générer une Fiche de Paie
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Période (AAAA-MM)</label>
                <input
                  type="text"
                  required
                  placeholder="2026-10"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Salaire Base (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Primes (+)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.bonuses}
                  onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Déductions (-)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                {creating ? 'Création...' : '+ Émettre le Bulletin de Paie'}
              </button>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <div className="text-center py-6 text-xs text-gray-500">Chargement de la paie...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500">Aucun historique de paie pour cet employé.</div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-2xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2">Période</th>
                    <th className="px-3 py-2">Base</th>
                    <th className="px-3 py-2">Net à Payer</th>
                    <th className="px-3 py-2 text-center">Statut</th>
                    <th className="px-3 py-2 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-mono text-xs font-semibold">{r.period}</td>
                      <td className="px-3 py-2">{r.baseSalary} EUR</td>
                      <td className="px-3 py-2 font-semibold text-emerald-700 dark:text-emerald-400">
                        {r.netSalary} EUR
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-2xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownload(r.id)}
                          disabled={downloadingId === r.id}
                          className="text-2xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-200 font-medium"
                        >
                          {downloadingId === r.id ? 'Téléchargement...' : 'Télécharger PDF'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
