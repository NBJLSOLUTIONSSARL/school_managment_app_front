import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  User,
  Activity,
  FileCode,
} from 'lucide-react';
import { auditLogService } from '../../services/auditLogService';
import Modal from '../../components/common/Modal';
import HeroBanner from '../../components/common/HeroBanner';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditLogService.getAuditLogs({
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        page,
        size: 15,
      });
      const items = res.content || (Array.isArray(res) ? res : []);
      setLogs(items);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Impossible de charger les journaux d\'audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const getActionBadge = (action) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (!action) return <span className="text-xs text-slate-400">—</span>;

    const actUpper = action.toUpperCase();
    if (actUpper.includes('CREATE') || actUpper.includes('POST') || actUpper.includes('ADD')) {
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (actUpper.includes('DELETE') || actUpper.includes('REMOVE')) {
      color = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (actUpper.includes('UPDATE') || actUpper.includes('PUT') || actUpper.includes('PATCH')) {
      color = 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (actUpper.includes('LOGIN') || actUpper.includes('AUTH')) {
      color = 'bg-[#16222F] text-[#DFC2A0] border-[#C5A880]/30';
    }

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <HeroBanner
        title="Security & System Audit Logs"
        description="Immutable chronological trace of all administrative operations, CRUD events, authentication flows, and security checkpoints."
        buttonText="Refresh Audit Trail"
        onButtonClick={fetchLogs}
        icon={ShieldAlert}
      />

      <div className="academy-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#78716C]" />
            <span className="text-xs font-semibold text-[#16222F]">Filtres :</span>
          </div>

          <input
            type="text"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
            placeholder="Action (ex: CREATE, DELETE)..."
            className="bg-white border border-[#F1F5F9] rounded-xl px-3 py-1.5 text-xs text-[#16222F] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
          />

          <input
            type="text"
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(0);
            }}
            placeholder="Entité (ex: Student, Invoice)..."
            className="bg-white border border-[#F1F5F9] rounded-xl px-3 py-1.5 text-xs text-[#16222F] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des traces d'audit...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucune trace d'audit enregistrée pour ces critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-[#F1F5F9] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date & Heure</th>
                  <th className="py-3.5 px-4">Utilisateur / Auteur</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entité ciblée</th>
                  <th className="py-3.5 px-4">Détails</th>
                  <th className="py-3.5 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4 text-[#78716C] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                        <span>
                          {log.timestamp || log.createdAt
                            ? new Date(log.timestamp || log.createdAt).toLocaleString('fr-FR')
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#16222F]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>{log.userName || log.userEmail || (log.userId ? `ID #${log.userId}` : 'Système')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#16222F] bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {log.entity || log.targetEntity || 'Général'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#78716C] max-w-xs truncate">
                      {log.details || log.description || (log.entityId ? `ID: ${log.entityId}` : '—')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg border border-[#F1F5F9] text-[11px] font-semibold text-[#16222F] hover:bg-white transition-colors cursor-pointer"
                      >
                        Inspecter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#78716C]">
            <span>Page {page + 1} sur {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#F1F5F9] disabled:opacity-40 hover:bg-white transition-colors cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#F1F5F9] disabled:opacity-40 hover:bg-white transition-colors cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Détails du journal d'audit"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs text-[#16222F]">
            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#F1F5F9]">
              <div>
                <span className="text-[#78716C] block">Identifiant log :</span>
                <span className="font-bold">#{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-[#78716C] block">Horodatage :</span>
                <span className="font-mono font-bold">
                  {new Date(selectedLog.timestamp || selectedLog.createdAt || Date.now()).toLocaleString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-[#78716C] block">Auteur de l'action :</span>
                <span className="font-bold">{selectedLog.userName || selectedLog.userEmail || `User #${selectedLog.userId}`}</span>
              </div>
              <div>
                <span className="text-[#78716C] block">Action exécutée :</span>
                <span className="font-bold">{selectedLog.action}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#16222F] block mb-1">
                Charge utile / Détails techniques :
              </span>
              <pre className="p-3 bg-[#152332] text-[#DFC2A0] rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 whitespace-pre-wrap">
                {typeof selectedLog.details === 'string'
                  ? selectedLog.details
                  : JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#16222F] text-white text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
