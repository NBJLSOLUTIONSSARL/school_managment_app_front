import React, { useEffect, useState, useCallback } from 'react';
import { invoiceInstallmentService } from '../api/invoiceInstallmentService';

export const AccountingSummaryCard = ({ onRefreshTrigger }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoiceInstallmentService.getAccountingSummary();
      setSummary(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchSummary();
    });
    return () => {
      active = false;
    };
  }, [onRefreshTrigger, fetchSummary]);

  const handleTriggerReminders = async () => {
    try {
      setTriggering(true);
      const res = await invoiceInstallmentService.triggerOverdueReminders();
      setMessage(res?.message || 'Rappels envoyés avec succès');
      fetchSummary();
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage('Erreur lors du déclenchement des rappels');
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setTriggering(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
            Récapitulatif Comptable
          </span>
          <span className="text-2xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono px-1.5 py-0.5 rounded">
            {summary.totalInvoicesCount} factures
          </span>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
              {message}
            </span>
          )}
          <button
            type="button"
            onClick={handleTriggerReminders}
            disabled={triggering}
            className="text-2xs px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded font-medium transition-colors"
          >
            {triggering ? 'Vérification...' : 'Relancer impayés email'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center md:text-left">
        <div className="p-2 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-100 dark:border-gray-800">
          <div className="text-2xs text-gray-500 dark:text-gray-400 uppercase font-medium">Facturé Brut</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
            {summary.totalInvoiced?.toLocaleString()} EUR
          </div>
        </div>

        <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/30">
          <div className="text-2xs text-emerald-700 dark:text-emerald-400 uppercase font-medium">Encaissé</div>
          <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
            {summary.totalCollected?.toLocaleString()} EUR
          </div>
        </div>

        <div className="p-2 bg-blue-50/60 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900/30">
          <div className="text-2xs text-blue-700 dark:text-blue-400 uppercase font-medium">En attente</div>
          <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mt-0.5">
            {summary.totalPending?.toLocaleString()} EUR
          </div>
        </div>

        <div className="p-2 bg-rose-50/60 dark:bg-rose-950/20 rounded border border-rose-100 dark:border-rose-900/30">
          <div className="text-2xs text-rose-700 dark:text-rose-400 uppercase font-medium">
            Impayés ({summary.overdueInvoicesCount})
          </div>
          <div className="text-sm font-semibold text-rose-800 dark:text-rose-300 mt-0.5">
            {summary.totalOverdue?.toLocaleString()} EUR
          </div>
        </div>

        <div className="p-2 bg-indigo-50/60 dark:bg-indigo-950/20 rounded border border-indigo-100 dark:border-indigo-900/30">
          <div className="text-2xs text-indigo-700 dark:text-indigo-400 uppercase font-medium">Solde Net</div>
          <div className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mt-0.5">
            {summary.netBalance?.toLocaleString()} EUR
          </div>
        </div>
      </div>
    </div>
  );
};
