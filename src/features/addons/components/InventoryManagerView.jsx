import React, { useState, useEffect, useCallback } from 'react';
import { addonService } from '../api/addonService';
import { Package, Plus, Trash2, ArrowUpDown, Search } from 'lucide-react';

const CATEGORIES = [
  { value: 'IT_EQUIPMENT', label: 'Matériel Informatique' },
  { value: 'FURNITURE', label: 'Mobilier & Agencement' },
  { value: 'LAB_MATERIAL', label: 'Laboratoire & Sciences' },
  { value: 'SPORTS', label: 'Équipement Sportif' },
  { value: 'OFFICE_SUPPLIES', label: 'Fournitures de Bureau' },
  { value: 'TEXTBOOKS', label: 'Manuels & Pédagogie' },
  { value: 'OTHER', label: 'Autre' },
];

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'GOOD', label: 'Bon état', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'FAIR', label: 'État moyen', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'POOR', label: 'Usé', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'DAMAGED', label: 'Endommagé', color: 'bg-red-50 text-red-700 border-red-200' },
];

export default function InventoryManagerView() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [adjustModalItem, setAdjustModalItem] = useState(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    itemCode: '',
    category: 'IT_EQUIPMENT',
    location: '',
    quantity: 1,
    minQuantity: 1,
    unitPrice: 0,
    itemCondition: 'GOOD',
    notes: '',
  });

  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustReason, setAdjustReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsPage, statsData] = await Promise.all([
        addonService.getInventoryItems({
          category: selectedCategory || undefined,
          query: searchQuery || undefined,
          size: 50,
        }).catch(() => ({ content: [] })),
        addonService.getInventoryStats().catch(() => null),
      ]);
      setItems(itemsPage?.content || []);
      setStats(statsData);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du chargement de l’inventaire.' });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await addonService.createInventoryItem({
        ...itemForm,
        quantity: parseInt(itemForm.quantity, 10),
        minQuantity: parseInt(itemForm.minQuantity, 10),
        unitPrice: parseFloat(itemForm.unitPrice) || 0,
      });
      setMessage({ type: 'success', text: 'Article enregistré dans l’inventaire.' });
      setShowItemModal(false);
      setItemForm({
        name: '',
        itemCode: '',
        category: 'IT_EQUIPMENT',
        location: '',
        quantity: 1,
        minQuantity: 1,
        unitPrice: 0,
        itemCondition: 'GOOD',
        notes: '',
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de la création de l’article.' });
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustModalItem) return;
    try {
      await addonService.adjustStock(adjustModalItem.id, parseInt(adjustDelta, 10), adjustReason);
      setMessage({ type: 'success', text: 'Stock ajusté avec succès.' });
      setAdjustModalItem(null);
      setAdjustDelta(1);
      setAdjustReason('');
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de l’ajustement de stock.' });
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Voulez-vous supprimer cet article de l’inventaire ?')) return;
    try {
      await addonService.deleteInventoryItem(id);
      setMessage({ type: 'success', text: 'Article supprimé.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur de suppression.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" /> Gestion de l’Inventaire & Équipements
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            Suivi des actifs matériels, valorisation financière et contrôle des seuils de réapprovisionnement.
          </p>
        </div>
        <button
          onClick={() => setShowItemModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Nouvel Article
        </button>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Total Références</span>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{stats?.totalItems ?? items.length}</span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Valorisation Totale</span>
          <span className="text-lg font-bold text-emerald-600 font-mono">
            {stats?.totalValuation != null ? `${Number(stats.totalValuation).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD` : '—'}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Alerte Stock Bas</span>
          <span className="text-lg font-bold text-amber-600">
            {stats?.lowStockCount ?? items.filter((i) => i.quantity <= i.minQuantity).length}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Matériel Endommagé</span>
          <span className="text-lg font-bold text-red-600">
            {stats?.damagedCount ?? items.filter((i) => i.itemCondition === 'DAMAGED').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, code ou localisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Chargement de l’inventaire...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-2xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="py-2.5 px-3">Code / Réf</th>
                <th className="py-2.5 px-3">Article</th>
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3">Emplacement</th>
                <th className="py-2.5 px-3 text-right">Quantité</th>
                <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                <th className="py-2.5 px-3">État</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400 text-xs">
                    Aucun article trouvé dans l’inventaire.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const cond = CONDITIONS.find((c) => c.value === item.itemCondition) || CONDITIONS[1];
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-600 dark:text-gray-300">
                        {item.itemCode || `#${item.id}`}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-gray-800 dark:text-gray-100">{item.name}</div>
                        {item.notes && <div className="text-2xs text-gray-400">{item.notes}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-2xs text-gray-600 dark:text-gray-300">
                        {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                        {item.location || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-mono font-bold ${
                            isLow ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        {isLow && (
                          <span className="block text-2xs text-amber-500 font-normal">
                            Min: {item.minQuantity}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-600 dark:text-gray-300">
                        {item.unitPrice != null ? `${Number(item.unitPrice).toFixed(2)} MAD` : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-2xs font-semibold border ${cond.color}`}>
                          {cond.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustModalItem(item);
                              setAdjustDelta(1);
                              setAdjustReason('');
                            }}
                            className="p-1 text-gray-500 hover:text-emerald-600 rounded transition-colors"
                            title="Ajuster le stock (+/-)"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Supprimer cet article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" /> Nouvel Article dans l’Inventaire
            </h3>
            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Code / SKU</label>
                  <input
                    type="text"
                    placeholder="Ex: PC-LAB-01"
                    value={itemForm.itemCode}
                    onChange={(e) => setItemForm({ ...itemForm, itemCode: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Catégorie *</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nom de l’article / Équipement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ordinateur portable Dell Latitude 5420"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Emplacement / Salle</label>
                  <input
                    type="text"
                    placeholder="Ex: Salle Info 2, Étagère B"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">État matériel</label>
                  <select
                    value={itemForm.itemCondition}
                    onChange={(e) => setItemForm({ ...itemForm, itemCondition: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Quantité *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Seuil Alerte</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.minQuantity}
                    onChange={(e) => setItemForm({ ...itemForm, minQuantity: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Prix Unitaire (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.unitPrice}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Remarques / Spécifications</label>
                <textarea
                  rows="2"
                  placeholder="Garantie, numéro de série, fournisseur..."
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Enregistrer l’Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-emerald-600" /> Ajustement de Stock
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Article: <span className="font-semibold text-gray-900 dark:text-white">{adjustModalItem.name}</span>
              <br />
              Stock actuel: <span className="font-mono font-bold text-emerald-600">{adjustModalItem.quantity}</span>
            </p>
            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Variation (+ pour entrée, - pour sortie)
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Motif de l’ajustement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réception livraison, Casse, Inventaire annuel"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
