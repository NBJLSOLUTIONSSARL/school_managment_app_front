import React, { useState, useEffect, useCallback } from 'react';
import { discountRuleService } from '../api/discountRuleService';

export const DiscountRulesManager = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    ruleType: 'SCHOLARSHIP',
    discountType: 'PERCENTAGE',
    discountValue: '',
    description: '',
    validFrom: '',
    validTo: '',
    active: true,
  });

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await discountRuleService.getAll();
      setRules(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (isOpen) {
      Promise.resolve().then(() => {
        if (active) loadRules();
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen, loadRules]);

  const handleToggle = async (id, currentActive) => {
    try {
      await discountRuleService.toggle(id, !currentActive);
      loadRules();
    } catch {
      // Non-blocking
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette règle de réduction ?')) {
      try {
        await discountRuleService.delete(id);
        loadRules();
      } catch {
        // Non-blocking
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.discountValue) return;

    try {
      setCreating(true);
      await discountRuleService.create({
        ...formData,
        discountValue: parseFloat(formData.discountValue),
      });
      setFormData({
        ruleType: 'SCHOLARSHIP',
        discountType: 'PERCENTAGE',
        discountValue: '',
        description: '',
        validFrom: '',
        validTo: '',
        active: true,
      });
      loadRules();
    } catch {
      // Non-blocking
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Règles de Réduction, Bourses & Exonérations
            </h3>
            <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
              Ces règles s'appliquent automatiquement lors de la génération des factures.
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
              Nouvelle Règle de Réduction
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Type de Règle</label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="SIBLING_DISCOUNT">Réduction Fratrie (Global)</option>
                  <option value="SCHOLARSHIP">Bourse d'Étude</option>
                  <option value="EXEMPTION">Exonération</option>
                  <option value="STAFF_CHILD">Enfant de Personnel</option>
                  <option value="CUSTOM">Personnalisée</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Type de Calcul</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="PERCENTAGE">Pourcentage (%)</option>
                  <option value="FIXED_AMOUNT">Montant Fixe (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Valeur</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="ex: 15"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Description / Motif</label>
              <input
                type="text"
                placeholder="ex: Bourse au mérite académique 2026"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                {creating ? 'Enregistrement...' : '+ Ajouter la Règle'}
              </button>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <div className="text-center py-6 text-xs text-gray-500">Chargement des règles...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500">Aucune règle configurée.</div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-2xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Détail</th>
                    <th className="px-3 py-2">Valeur</th>
                    <th className="px-3 py-2 text-center">Statut</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-mono text-2xs text-gray-700 dark:text-gray-300">
                        {rule.ruleType}
                      </td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                        <div>{rule.description || '-'}</div>
                        {rule.studentName && (
                          <div className="text-2xs text-gray-500">Élève : {rule.studentName}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100">
                        {rule.discountValue} {rule.discountType === 'PERCENTAGE' ? '%' : 'EUR'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(rule.id, rule.active)}
                          className={`text-2xs px-2 py-0.5 rounded font-medium ${
                            rule.active
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}
                        >
                          {rule.active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(rule.id)}
                          className="text-2xs text-rose-600 hover:text-rose-800 font-medium"
                        >
                          Supprimer
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
