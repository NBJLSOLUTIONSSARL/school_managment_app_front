import React, { useState, useEffect, useCallback } from 'react';
import { addonService } from '../api/addonService';
import { Utensils, Calendar, Plus, Trash2, CheckCircle, Ban } from 'lucide-react';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const MEAL_TYPES = [
  { value: 'LUNCH', label: 'Déjeuner' },
  { value: 'BREAKFAST', label: 'Petit-déjeuner' },
  { value: 'SNACK', label: 'Goûter' },
  { value: 'DINNER', label: 'Dîner' },
];

const PLAN_TYPES = [
  { value: 'MONTHLY', label: 'Mensuel' },
  { value: 'WEEKLY', label: 'Hebdomadaire' },
  { value: 'ANNUAL', label: 'Annuel' },
  { value: 'DAILY', label: 'Journalier' },
];

export default function CanteenManagerView() {
  const [activeTab, setActiveTab] = useState('menus'); // 'menus' | 'subscriptions'
  const [menus, setMenus] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  // Forms
  const [menuForm, setMenuForm] = useState(() => ({
    menuDate: getTodayDate(),
    mealType: 'LUNCH',
    title: '',
    description: '',
    allergens: '',
    calories: '',
    isVegetarian: false,
  }));

  const [subForm, setSubForm] = useState(() => ({
    studentId: '',
    planType: 'MONTHLY',
    startDate: getTodayDate(),
    endDate: '',
    dietaryRestrictions: '',
  }));

  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [m, s] = await Promise.all([
        addonService.getMenus({ mealType: selectedMealType || undefined }).catch(() => []),
        addonService.getSubscriptions().catch(() => []),
      ]);
      setMenus(m);
      setSubscriptions(s);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données de la cantine.' });
    } finally {
      setLoading(false);
    }
  }, [selectedMealType]);

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

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    try {
      await addonService.createMenu({
        ...menuForm,
        calories: menuForm.calories ? parseInt(menuForm.calories, 10) : null,
      });
      setMessage({ type: 'success', text: 'Menu ajouté au calendrier.' });
      setShowMenuModal(false);
      setMenuForm({
        menuDate: getTodayDate(),
        mealType: 'LUNCH',
        title: '',
        description: '',
        allergens: '',
        calories: '',
        isVegetarian: false,
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de la création du menu.' });
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Voulez-vous supprimer ce menu ?')) return;
    try {
      await addonService.deleteMenu(id);
      setMessage({ type: 'success', text: 'Menu retiré.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur de suppression.' });
    }
  };

  const handleCreateSub = async (e) => {
    e.preventDefault();
    try {
      await addonService.createSubscription({
        studentId: parseInt(subForm.studentId, 10),
        planType: subForm.planType,
        startDate: subForm.startDate,
        endDate: subForm.endDate || null,
        dietaryRestrictions: subForm.dietaryRestrictions || null,
      });
      setMessage({ type: 'success', text: 'Abonnement cantine enregistré.' });
      setShowSubModal(false);
      setSubForm({
        studentId: '',
        planType: 'MONTHLY',
        startDate: getTodayDate(),
        endDate: '',
        dietaryRestrictions: '',
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de l’inscription cantine.' });
    }
  };

  const handleCancelSub = async (id) => {
    if (!window.confirm('Annuler cet abonnement de restauration ?')) return;
    try {
      await addonService.cancelSubscription(id);
      setMessage({ type: 'success', text: 'Abonnement annulé.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur d’annulation.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" /> Restauration Scolaire & Cantine
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            Menus diététiques, gestion des allergènes et suivi des forfaits repas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'menus' ? (
            <button
              onClick={() => setShowMenuModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Nouveau Menu
            </button>
          ) : (
            <button
              onClick={() => setShowSubModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvel Abonnement
            </button>
          )}
        </div>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Total Menus Prévus</span>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{menus.length}</span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Abonnements Actifs</span>
          <span className="text-lg font-bold text-emerald-600">
            {subscriptions.filter((s) => s.status === 'ACTIVE').length}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Option Végétarienne</span>
          <span className="text-lg font-bold text-indigo-600">
            {menus.filter((m) => m.isVegetarian).length}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Abonnés Spéciaux (Allergies)</span>
          <span className="text-lg font-bold text-amber-600">
            {subscriptions.filter((s) => s.dietaryRestrictions).length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 text-xs">
        <button
          onClick={() => setActiveTab('menus')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'menus'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Menus du Calendrier ({menus.length})
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'subscriptions'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Inscriptions & Forfaits ({subscriptions.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Chargement des données cantine...</div>
      ) : activeTab === 'menus' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold text-gray-500 uppercase">Filtrer par service:</span>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value="">Tous les services</option>
              {MEAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-2xs uppercase tracking-wider text-gray-500 font-medium">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Plat / Menu</th>
                  <th className="py-2.5 px-3">Allergènes</th>
                  <th className="py-2.5 px-3 text-right">Calories</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400 text-xs">
                      Aucun menu programmé pour cette sélection.
                    </td>
                  </tr>
                ) : (
                  menus.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-700 dark:text-gray-300">
                        {m.menuDate}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-2xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                          {MEAL_TYPES.find((t) => t.value === m.mealType)?.label || m.mealType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                          {m.title}
                          {m.isVegetarian && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-2xs rounded">
                              Végétarien
                            </span>
                          )}
                        </div>
                        {m.description && <div className="text-2xs text-gray-400 mt-0.5">{m.description}</div>}
                      </td>
                      <td className="py-2.5 px-3">
                        {m.allergens ? (
                          <div className="flex flex-wrap gap-1">
                            {m.allergens.split(',').map((a, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-2xs bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800">
                                {a.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-2xs">Aucun</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-600 dark:text-gray-300">
                        {m.calories ? `${m.calories} kcal` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteMenu(m.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Supprimer ce menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-2xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="py-2.5 px-3">Élève</th>
                <th className="py-2.5 px-3">Formule / Forfait</th>
                <th className="py-2.5 px-3">Période</th>
                <th className="py-2.5 px-3">Régime / Allergies</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 text-xs">
                    Aucun abonnement enregistré.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                    <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-gray-100">
                      {s.studentName || `Élève #${s.studentId}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {PLAN_TYPES.find((p) => p.value === s.planType)?.label || s.planType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-2xs text-gray-500">
                      {s.startDate} {s.endDate ? `→ ${s.endDate}` : '(Indéterminé)'}
                    </td>
                    <td className="py-2.5 px-3">
                      {s.dietaryRestrictions ? (
                        <span className="text-2xs text-amber-600 dark:text-amber-400 font-medium">
                          {s.dietaryRestrictions}
                        </span>
                      ) : (
                        <span className="text-2xs text-gray-400">Standard</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelSub(s.id)}
                          className="px-2 py-0.5 text-2xs text-red-600 hover:text-red-800 font-medium border border-red-200 hover:border-red-300 rounded transition-colors"
                        >
                          Résilier
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Ajouter un Plat au Calendrier
            </h3>
            <form onSubmit={handleCreateMenu} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={menuForm.menuDate}
                    onChange={(e) => setMenuForm({ ...menuForm, menuDate: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Service</label>
                  <select
                    value={menuForm.mealType}
                    onChange={(e) => setMenuForm({ ...menuForm, mealType: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    {MEAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Intitulé du Plat *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tajine de légumes et semoule bio"
                  value={menuForm.title}
                  onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Détails des accompagnements, origine des produits..."
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Allergènes (séparés par virgule)</label>
                  <input
                    type="text"
                    placeholder="Ex: Gluten, Lait"
                    value={menuForm.allergens}
                    onChange={(e) => setMenuForm({ ...menuForm, allergens: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    placeholder="Ex: 580"
                    value={menuForm.calories}
                    onChange={(e) => setMenuForm({ ...menuForm, calories: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isVegetarian"
                  checked={menuForm.isVegetarian}
                  onChange={(e) => setMenuForm({ ...menuForm, isVegetarian: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isVegetarian" className="text-2xs font-medium text-gray-700 dark:text-gray-300">
                  Option Végétarienne
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowMenuModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" /> Inscription Abonnement Cantine
            </h3>
            <form onSubmit={handleCreateSub} className="space-y-3 text-xs">
              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">ID Élève *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 1"
                  value={subForm.studentId}
                  onChange={(e) => setSubForm({ ...subForm, studentId: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Formule / Forfait *</label>
                <select
                  value={subForm.planType}
                  onChange={(e) => setSubForm({ ...subForm, planType: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  {PLAN_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date Début *</label>
                  <input
                    type="date"
                    required
                    value={subForm.startDate}
                    onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date Fin (optionnelle)</label>
                  <input
                    type="date"
                    value={subForm.endDate}
                    onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Restrictions alimentaires / Allergies</label>
                <input
                  type="text"
                  placeholder="Ex: Sans porc, allergie aux arachides"
                  value={subForm.dietaryRestrictions}
                  onChange={(e) => setSubForm({ ...subForm, dietaryRestrictions: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Inscrire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
