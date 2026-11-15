import React, { useState } from 'react';
import { Sliders, Building2, Shield, Database } from 'lucide-react';
import { DocTypePageHead } from '@/components/ui/DocTypePageHead';
import { SchoolProfileSettingsView } from '@/features/settings/components/SchoolProfileSettingsView';
import { RolesPermissionsManager } from '@/features/settings/components/RolesPermissionsManager';
import { DatabaseBackupsManager } from '@/features/settings/components/DatabaseBackupsManager';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] dark:bg-gray-900 min-h-screen">
      <DocTypePageHead
        icon={Sliders}
        title="Paramètres & Administration"
        countLabel="modules système"
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Profil Établissement & Barèmes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Rôles & Permissions (Spec 3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'backups'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Sauvegardes Base de Données</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'profile' && <SchoolProfileSettingsView />}
        {activeTab === 'roles' && <RolesPermissionsManager />}
        {activeTab === 'backups' && <DatabaseBackupsManager />}
      </div>
    </div>
  );
}
