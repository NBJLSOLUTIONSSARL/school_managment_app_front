import React, { useState, useEffect, useCallback } from 'react';
import { databaseBackupService } from '../api/databaseBackupService';

export const DatabaseBackupsManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState(null);

  const loadBackups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await databaseBackupService.listBackups();
      setBackups(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadBackups();
    });
    return () => {
      active = false;
    };
  }, [loadBackups]);

  const handleTrigger = async () => {
    try {
      setTriggering(true);
      const res = await databaseBackupService.triggerBackup();
      setMessage({ type: 'success', text: `Sauvegarde ${res?.filename || ''} créée avec succès` });
      loadBackups();
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du déclenchement de la sauvegarde' });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Sauvegardes de la Base de Données
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sauvegarde automatique programmée tous les jours à 02h00. Instantanés manuels traçables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span
              className={`text-2xs px-2.5 py-1 rounded font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
              }`}
            >
              {message.text}
            </span>
          )}
          <button
            type="button"
            onClick={handleTrigger}
            disabled={triggering}
            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            {triggering ? 'Création en cours...' : '+ Déclencher Sauvegarde Manuelle'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-gray-500 py-4 text-center">Chargement de l'historique...</div>
      ) : backups.length === 0 ? (
        <div className="text-xs text-gray-500 py-4 text-center">Aucune sauvegarde enregistrée.</div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-2xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-2">Fichier</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Taille</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-3 py-2 font-mono text-2xs text-gray-900 dark:text-gray-100">
                    {b.filename}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-2xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-gray-700 dark:text-gray-300">
                      {b.backupType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {b.sizeBytes ? `${(b.sizeBytes / 1024).toFixed(1)} KB` : '-'}
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`text-2xs px-2 py-0.5 rounded font-medium ${
                        b.status === 'SUCCESS'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
