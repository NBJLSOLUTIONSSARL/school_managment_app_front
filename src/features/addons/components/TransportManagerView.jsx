import React, { useState, useEffect, useCallback } from 'react';
import { addonService } from '../api/addonService';
import { Bus, MapPin, Plus, Trash2, Clock } from 'lucide-react';

export default function TransportManagerView() {
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'vehicles' | 'allocations'
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);

  // Forms
  const [vehicleForm, setVehicleForm] = useState({ plateNumber: '', model: '', capacity: 30, driverName: '', driverPhone: '', licenseNumber: '' });
  const [routeForm, setRouteForm] = useState({ name: '', description: '', vehicleId: '', departureTime: '07:30', arrivalTime: '08:15', stops: '' });
  const [allocForm, setAllocForm] = useState({ studentId: '', routeId: '', pickupStop: '', dropoffStop: '' });

  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [r, v, a] = await Promise.all([
        addonService.getRoutes().catch(() => []),
        addonService.getVehicles().catch(() => []),
        addonService.getAllocations().catch(() => []),
      ]);
      setRoutes(r);
      setVehicles(v);
      setAllocations(a);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données de transport.' });
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      await addonService.createVehicle({
        ...vehicleForm,
        capacity: parseInt(vehicleForm.capacity, 10),
      });
      setMessage({ type: 'success', text: 'Véhicule ajouté à la flotte.' });
      setShowVehicleModal(false);
      setVehicleForm({ plateNumber: '', model: '', capacity: 30, driverName: '', driverPhone: '', licenseNumber: '' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de la création du véhicule.' });
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      await addonService.createRoute({
        ...routeForm,
        vehicleId: routeForm.vehicleId ? parseInt(routeForm.vehicleId, 10) : null,
      });
      setMessage({ type: 'success', text: 'Itinéraire créé avec succès.' });
      setShowRouteModal(false);
      setRouteForm({ name: '', description: '', vehicleId: '', departureTime: '07:30', arrivalTime: '08:15', stops: '' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de la création de l’itinéraire.' });
    }
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    try {
      await addonService.createAllocation({
        studentId: parseInt(allocForm.studentId, 10),
        routeId: parseInt(allocForm.routeId, 10),
        pickupStop: allocForm.pickupStop,
        dropoffStop: allocForm.dropoffStop,
      });
      setMessage({ type: 'success', text: 'Élève affecté avec succès au transport.' });
      setShowAllocModal(false);
      setAllocForm({ studentId: '', routeId: '', pickupStop: '', dropoffStop: '' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de l’affectation de l’élève.' });
    }
  };

  const handleDeleteAllocation = async (id) => {
    if (!window.confirm('Voulez-vous retirer cette affectation de transport ?')) return;
    try {
      await addonService.deleteAllocation(id);
      setMessage({ type: 'success', text: 'Affectation retirée.' });
      loadData();
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du retrait de l’affectation.' });
    }
  };

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-3 text-xs rounded flex justify-between items-center ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="font-bold">×</button>
        </div>
      )}

      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'routes'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Lignes & Itinéraires ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'vehicles'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Flotte de Véhicules ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'allocations'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Élèves Affectés ({allocations.length})
          </button>
        </div>

        <div className="flex gap-2">
          {activeTab === 'routes' && (
            <button
              onClick={() => setShowRouteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs rounded font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvel Itinéraire
            </button>
          )}
          {activeTab === 'vehicles' && (
            <button
              onClick={() => setShowVehicleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs rounded font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter Véhicule
            </button>
          )}
          {activeTab === 'allocations' && (
            <button
              onClick={() => setShowAllocModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs rounded font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Affecter Élève
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-zinc-500">Chargement des données transport...</div>
      ) : activeTab === 'routes' ? (
        routes.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6">
            <Bus className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Aucun itinéraire de transport configuré</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => (
              <div key={route.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Bus className="w-3.5 h-3.5 text-blue-600" />
                      {route.name}
                    </h4>
                    <p className="text-2xs text-zinc-500 mt-0.5">{route.description || 'Ligne régulière scolaire'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                    route.active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {route.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded">
                  <div>
                    <span className="text-zinc-500 block">Horaires :</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {route.departureTime || '—'} → {route.arrivalTime || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Véhicule assigné :</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                      {route.vehiclePlate ? `${route.vehiclePlate} (${route.vehicleCapacity || 30} pl.)` : 'Non assigné'}
                    </span>
                  </div>
                </div>

                {route.stops && (
                  <div>
                    <span className="text-2xs text-zinc-500 block mb-1">Arrêts desservis :</span>
                    <div className="flex flex-wrap gap-1">
                      {route.stops.split(',').map((stop, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-2xs rounded">
                          <MapPin className="w-2.5 h-2.5" />
                          {stop.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-2xs text-zinc-500">
                  <span>Élèves affectés : <strong className="text-zinc-800 dark:text-zinc-200">{route.assignedStudentsCount || 0}</strong></span>
                  {route.driverName && <span>Chauffeur : {route.driverName} ({route.driverPhone})</span>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'vehicles' ? (
        /* Vehicles Tab */
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-2xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Immatriculation</th>
                <th className="py-2.5 px-3 font-semibold">Modèle</th>
                <th className="py-2.5 px-3 font-semibold">Capacité</th>
                <th className="py-2.5 px-3 font-semibold">Chauffeur</th>
                <th className="py-2.5 px-3 font-semibold">Téléphone Chauffeur</th>
                <th className="py-2.5 px-3 font-semibold text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">{v.plateNumber}</td>
                  <td className="py-2.5 px-3">{v.model}</td>
                  <td className="py-2.5 px-3">{v.capacity} places</td>
                  <td className="py-2.5 px-3 font-medium">{v.driverName || '—'}</td>
                  <td className="py-2.5 px-3">{v.driverPhone || '—'}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                      v.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Allocations Tab */
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-2xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Élève</th>
                <th className="py-2.5 px-3 font-semibold">Itinéraire</th>
                <th className="py-2.5 px-3 font-semibold">Arrêt Montée</th>
                <th className="py-2.5 px-3 font-semibold">Arrêt Descente</th>
                <th className="py-2.5 px-3 font-semibold">Statut</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {allocations.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {a.studentName} <span className="text-2xs text-zinc-400">({a.studentNumber})</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-600 dark:text-blue-400">{a.routeName}</td>
                  <td className="py-2.5 px-3">{a.pickupStop || 'Arrêt principal'}</td>
                  <td className="py-2.5 px-3">{a.dropoffStop || 'École'}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteAllocation(a.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Retirer l'élève"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Nouveau Véhicule */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-600" />
              Ajouter un véhicule de transport
            </h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Immatriculation</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : AB-123-CD"
                  value={vehicleForm.plateNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Modèle</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Mercedes Sprinter 30pl."
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Capacité (places)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={vehicleForm.capacity}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nom du Chauffeur</label>
                <input
                  type="text"
                  placeholder="Ex : Karim Alami"
                  value={vehicleForm.driverName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Téléphone Chauffeur</label>
                <input
                  type="text"
                  placeholder="Ex : +33611223344"
                  value={vehicleForm.driverPhone}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  Annuler
                </button>
                <button type="submit" className="px-3 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nouvel Itinéraire */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Créer un itinéraire de transport
            </h3>
            <form onSubmit={handleCreateRoute} className="space-y-3">
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nom de la ligne</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Ligne 1 - Centre Ville"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Véhicule assigné</label>
                <select
                  value={routeForm.vehicleId}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Sélectionner un véhicule...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.plateNumber} — {v.model} ({v.capacity} pl.)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Heure départ</label>
                  <input
                    type="time"
                    value={routeForm.departureTime}
                    onChange={(e) => setRouteForm({ ...routeForm, departureTime: e.target.value })}
                    className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Heure arrivée</label>
                  <input
                    type="time"
                    value={routeForm.arrivalTime}
                    onChange={(e) => setRouteForm({ ...routeForm, arrivalTime: e.target.value })}
                    className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Arrêts (séparés par une virgule)</label>
                <textarea
                  rows="2"
                  placeholder="Gare Centrale, Mairie, Avenue de la Paix, École"
                  value={routeForm.stops}
                  onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  Annuler
                </button>
                <button type="submit" className="px-3 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium">
                  Créer la ligne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Affecter Élève */}
      {showAllocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-600" />
              Affecter un élève à une ligne
            </h3>
            <form onSubmit={handleCreateAllocation} className="space-y-3">
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">ID Élève</label>
                <input
                  type="number"
                  required
                  placeholder="Identifiant numérique de l'élève"
                  value={allocForm.studentId}
                  onChange={(e) => setAllocForm({ ...allocForm, studentId: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Itinéraire</label>
                <select
                  required
                  value={allocForm.routeId}
                  onChange={(e) => setAllocForm({ ...allocForm, routeId: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Sélectionner une ligne...</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.departureTime} → {r.arrivalTime})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-2xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Arrêt de montée</label>
                <input
                  type="text"
                  placeholder="Ex : Mairie"
                  value={allocForm.pickupStop}
                  onChange={(e) => setAllocForm({ ...allocForm, pickupStop: e.target.value })}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllocModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  Annuler
                </button>
                <button type="submit" className="px-3 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium">
                  Affecter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
