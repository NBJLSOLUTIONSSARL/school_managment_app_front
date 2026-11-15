import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { addonService } from '@/features/addons/api/addonService';
import LibraryManagerView from '@/features/addons/components/LibraryManagerView';
import TransportManagerView from '@/features/addons/components/TransportManagerView';
import CanteenManagerView from '@/features/addons/components/CanteenManagerView';
import InventoryManagerView from '@/features/addons/components/InventoryManagerView';
import HealthCenterView from '@/features/addons/components/HealthCenterView';
import ClubsActivitiesView from '@/features/addons/components/ClubsActivitiesView';
import { BookOpen, Bus, Utensils, Package, HeartPulse, Sparkles, AlertCircle } from 'lucide-react';

const MODULES = [
  { id: 'library', name: 'Bibliothèque', icon: BookOpen, flag: 'library', desc: 'Gestion du fonds documentaire, prêts et pénalités de retard' },
  { id: 'transport', name: 'Transport Scolaire', icon: Bus, flag: 'transport', desc: 'Flotte de bus, tournées, chauffeurs et arrêts élèves' },
  { id: 'canteen', name: 'Cantine Scolaire', icon: Utensils, flag: 'canteen', desc: 'Menus diététiques, allergènes et forfaits repas' },
  { id: 'inventory', name: 'Inventaire & Actifs', icon: Package, flag: 'inventory', desc: 'Mobilier, parc informatique, consommables et valorisation' },
  { id: 'health', name: 'Santé & Infirmerie', icon: HeartPulse, flag: 'health', desc: 'Consultations, soins, vaccinations et dossier médical (accès restreint)' },
  { id: 'clubs', name: 'Clubs & Périscolaire', icon: Sparkles, flag: 'clubs', desc: 'Ateliers thématiques, encadrement et inscriptions' },
];

export function AddonsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();
  const isNurse = hasRole(['ROLE_NURSE', 'nurse']);
  const isLibrarian = hasRole(['ROLE_LIBRARIAN', 'librarian']);

  const initialTab = searchParams.get('tab') || (isNurse ? 'health' : isLibrarian ? 'library' : 'library');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [features, setFeatures] = useState({
    library: true,
    transport: true,
    canteen: true,
    inventory: true,
    health: true,
    clubs: true,
  });

  useEffect(() => {
    let isMounted = true;
    addonService
      .getFeatureStatus()
      .then((data) => {
        if (isMounted && data && typeof data === 'object') {
          setFeatures(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const currentModule = MODULES.find((m) => m.id === activeTab) || MODULES[0];
  const isCurrentFeatureActive = features[currentModule.flag] !== false;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Modules Complémentaires & Services Scolaires
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Administration modulaire des services annexes : bibliothèque, transport, restauration, inventaire, santé et clubs.
          </p>
        </div>
      </div>

      {/* Module Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isSelected = activeTab === mod.id;
          const isEnabled = features[mod.flag] !== false;

          return (
            <button
              key={mod.id}
              onClick={() => handleSelectTab(mod.id)}
              className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500 dark:bg-emerald-950/20'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 rounded ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!isEnabled && (
                  <span className="text-3xs uppercase font-bold px-1 py-0.2 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                    OFF
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{mod.name}</h3>
                <p className="text-3xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{mod.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main View Area */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-xs">
        {!isCurrentFeatureActive ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Module Désactivé ({currentModule.name})
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Ce module optionnel a été désactivé dans la configuration de l'établissement (<code>app.features.{currentModule.flag}.enabled=false</code>).
              Contactez l'administrateur système pour réactiver ce service.
            </p>
          </div>
        ) : (
          <div>
            {activeTab === 'library' && <LibraryManagerView />}
            {activeTab === 'transport' && <TransportManagerView />}
            {activeTab === 'canteen' && <CanteenManagerView />}
            {activeTab === 'inventory' && <InventoryManagerView />}
            {activeTab === 'health' && <HealthCenterView />}
            {activeTab === 'clubs' && <ClubsActivitiesView />}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddonsPage;
