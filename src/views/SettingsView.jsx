import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Palette,
  Edit2,
  Users,
  GraduationCap,
  UserCheck,
  Download,
  Play,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { SCHOOL_SETTINGS } from '../data/mockData';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings] = useState(SCHOOL_SETTINGS);
  const [theme, setTheme] = useState('Clair');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'database', label: 'Base de données', icon: Database },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ];

  const handleLaunchBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      alert('Sauvegarde de la base de données effectuée avec succès ! (Dump SQL exporté)');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Paramètres
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Personnalisez votre plateforme selon vos besoins
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#F4EDE2] flex items-center justify-center text-[#C5A880] shrink-0 hidden sm:flex">
          <Settings className="w-8 h-8 stroke-[1.5]" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#EFECE6] pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#E8DFC9] text-[#16222F] shadow-sm'
                  : 'text-[#78716C] hover:bg-[#FAF7F2] hover:text-[#16222F]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EDE2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F4EDE2] flex items-center justify-center text-[#C5A880]">
                  <img src="/logo.svg" alt="logo" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#16222F]">
                    Informations de l'établissement
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Gérez les informations principales de votre établissement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F4EDE2] border border-[#EFECE6] text-[#16222F] transition-colors"
              >
                <Edit2 className="w-3 h-3 text-[#C5A880]" />
                <span>{isEditingInfo ? 'Fermer' : 'Modifier'}</span>
              </button>
            </div>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF7F2]">
                <span className="text-[#78716C] font-medium">Nom de l'établissement</span>
                <span className="font-bold text-[#16222F]">{settings.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF7F2]">
                <span className="text-[#78716C] font-medium">Adresse</span>
                <span className="font-semibold text-[#16222F]">{settings.address}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF7F2]">
                <span className="text-[#78716C] font-medium">Email officiel</span>
                <span className="font-semibold text-[#16222F]">{settings.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF7F2]">
                <span className="text-[#78716C] font-medium">Téléphone</span>
                <span className="font-semibold text-[#16222F]">{settings.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EDE2]">
              <div>
                <h3 className="text-sm font-bold text-[#16222F]">
                  Gestion des utilisateurs
                </h3>
                <p className="text-xs text-[#78716C]">
                  Gérez les comptes et les rôles des utilisateurs
                </p>
              </div>
              <button
                onClick={() => alert('Ouverture du panneau de gestion des habilitations RBAC')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F4EDE2] border border-[#EFECE6] text-[#16222F] transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Gérer les utilisateurs</span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6]">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs text-[#78716C] block">Élèves</span>
                <span className="text-xl font-bold text-[#16222F]">1 248</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6]">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs text-[#78716C] block">Enseignants</span>
                <span className="text-xl font-bold text-[#16222F]">124</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6]">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-[#78716C] block">Administrateurs</span>
                <span className="text-xl font-bold text-[#16222F]">12</span>
              </div>
            </div>
          </div>
        </div>

        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#F4EDE2]">
              <h3 className="text-sm font-bold text-[#16222F]">
                Préférences système
              </h3>
              <p className="text-xs text-[#78716C]">
                Configurez les options générales
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C] font-semibold">Langue par défaut</span>
                <select className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#16222F] focus:outline-none">
                  <option>🇫🇷 Français</option>
                  <option>🇲🇦 العربية</option>
                  <option>🇬🇧 English</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C] font-semibold">Fuseau horaire</span>
                <select className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#16222F] focus:outline-none">
                  <option>(GMT+1) Casablanca</option>
                  <option>(GMT+1) Paris</option>
                  <option>(GMT+0) Londres</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C] font-semibold">Thème de l'interface</span>
                <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EFECE6]">
                  <button
                    onClick={() => setTheme('Clair')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      theme === 'Clair' ? 'bg-[#16222F] text-white' : 'text-[#78716C]'
                    }`}
                  >
                    ☀️ Clair
                  </button>
                  <button
                    onClick={() => setTheme('Sombre')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      theme === 'Sombre' ? 'bg-[#16222F] text-white' : 'text-[#78716C]'
                    }`}
                  >
                    🌙 Sombre
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C] font-semibold">Éléments par page</span>
                <select className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#16222F] focus:outline-none">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#F4EDE2]">
              <h3 className="text-sm font-bold text-[#16222F]">
                Sauvegarde et maintenance
              </h3>
              <p className="text-xs text-[#78716C]">
                Gérez les sauvegardes et la maintenance du système
              </p>
            </div>

            <div className="mt-5 text-center p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6]">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-xs text-[#78716C] block">Dernière sauvegarde</span>
              <span className="text-sm font-bold text-[#16222F] block mt-0.5">
                25/10/2026 à 02:30
              </span>
              <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                ● Réussie
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => alert('Téléchargement du fichier SQL de sauvegarde chiffré...')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger une sauvegarde</span>
              </button>

              <button
                onClick={handleLaunchBackup}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EDE2] border border-[#EFECE6] text-[#16222F] text-xs font-semibold transition-colors"
              >
                <Play className="w-4 h-4 text-[#C5A880]" />
                <span>{isBackingUp ? 'Sauvegarde en cours...' : 'Lancer une sauvegarde'}</span>
              </button>

              <button
                onClick={() => alert('Mode maintenance activé : seuls les administrateurs peuvent se connecter.')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[#78716C] hover:text-[#16222F] text-xs font-semibold transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Mode maintenance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
