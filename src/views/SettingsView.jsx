import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Palette,
  Users,
  GraduationCap,
  Download,
  Play,
  Wrench,
  ChevronDown,
  School,
  MapPin,
  Mail,
  Phone,
  Pencil,
  SlidersHorizontal,
  Globe,
  Clock,
  Sun,
  List,
  RotateCw,
  Monitor,
  UserCheck
} from 'lucide-react';
import { SCHOOL_SETTINGS } from '../data/mockData';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(SCHOOL_SETTINGS);
  const [theme, setTheme] = useState('Clair');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

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
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 pb-2 overflow-hidden">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-0.5 bg-[#C5A880] rounded-full inline-block" />
            <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#16222F] tracking-tight">
              Paramètres
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] mt-2">
            Personnalisez votre plateforme selon vos besoins
          </p>
        </div>

        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-36 w-96 pointer-events-none">
          <img
            src="/assets/settings-illustration.png"
            alt=""
            className="w-full h-full object-contain object-right"
          />
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
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-[#DFC2A0] text-[#16222F] shadow-xs'
                  : 'text-[#475569] hover:bg-white/60 hover:text-[#16222F]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <School className="w-5 h-5 text-[#C5A880]" />
                <h3 className="text-base font-bold font-serif-title text-[#16222F]">
                  Informations de l'établissement
                </h3>
              </div>
              <button
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-[#FAF7F2] border border-[#E5DFD5] text-[#16222F] transition-colors"
              >
                <Pencil className="w-3 h-3 text-[#C5A880]" />
                <span>Modifier</span>
              </button>
            </div>
            <p className="text-xs text-[#78716C] mb-5">
              Gérez les informations principales de votre établissement
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 flex items-center justify-center p-3 rounded-2xl bg-[#FCF8F2] border border-[#F0EBE1]">
                <img
                  src="/assets/school-emblem.png"
                  alt="Académie Lumière"
                  className="w-28 h-28 object-contain"
                />
              </div>

              <div className="sm:col-span-8 space-y-2.5">
                <div>
                  <label className="text-[11px] text-[#78716C] font-medium block mb-1">
                    Nom de l'établissement
                  </label>
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-xs font-semibold text-[#16222F]">
                    {settings.name}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#78716C] font-medium block mb-1">
                    Adresse
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-xs text-[#16222F]">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                    <span className="truncate">{settings.address}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#78716C] font-medium block mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-xs text-[#16222F]">
                    <Mail className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                    <span className="truncate">{settings.email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#78716C] font-medium block mb-1">
                    Téléphone
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-xs text-[#16222F]">
                    <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                    <span>{settings.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#C5A880]" />
                <h3 className="text-base font-bold font-serif-title text-[#16222F]">
                  Gestion des utilisateurs
                </h3>
              </div>
              <button
                onClick={() => alert('Panneau de gestion des utilisateurs')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-[#FAF7F2] border border-[#E5DFD5] text-[#16222F] transition-colors"
              >
                <span>Gérer les utilisateurs</span>
              </button>
            </div>
            <p className="text-xs text-[#78716C] mb-6">
              Gérez les comptes et les rôles des utilisateurs
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EFEBE3] text-center">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs text-[#526071] block font-medium">Élèves</span>
                <span className="text-2xl font-serif-title font-bold text-[#16222F] block mt-1">
                  1 248
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EFEBE3] text-center">
                <div className="w-10 h-10 rounded-full bg-[#78350F] text-white flex items-center justify-center mx-auto mb-3">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="text-xs text-[#526071] block font-medium">Enseignants</span>
                <span className="text-2xl font-serif-title font-bold text-[#16222F] block mt-1">
                  124
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EFEBE3] text-center">
                <div className="w-10 h-10 rounded-full bg-[#0284C7] text-white flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-[#526071] block font-medium">Administrateurs</span>
                <span className="text-2xl font-serif-title font-bold text-[#16222F] block mt-1">
                  12
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <SlidersHorizontal className="w-5 h-5 text-[#C5A880]" />
              <h3 className="text-base font-bold font-serif-title text-[#16222F]">
                Préférences système
              </h3>
            </div>
            <p className="text-xs text-[#78716C] mb-6">
              Configurez les options générales
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#16222F] font-medium">
                  <Globe className="w-4 h-4 text-[#78716C]" />
                  <span>Langue par défaut</span>
                </div>
                <div className="relative">
                  <select className="appearance-none bg-white border border-[#E5DFD5] rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-[#16222F] focus:outline-none cursor-pointer">
                    <option>🇫🇷 Français</option>
                    <option>🇲🇦 العربية</option>
                    <option>🇬🇧 English</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#16222F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#16222F] font-medium">
                  <Clock className="w-4 h-4 text-[#78716C]" />
                  <span>Fuseau horaire</span>
                </div>
                <div className="relative">
                  <select className="appearance-none bg-white border border-[#E5DFD5] rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-[#16222F] focus:outline-none cursor-pointer">
                    <option>(GMT+1) Casablanca</option>
                    <option>(GMT+1) Paris</option>
                    <option>(GMT+0) Londres</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#16222F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#16222F] font-medium">
                  <Sun className="w-4 h-4 text-[#78716C]" />
                  <span>Thème de l'interface</span>
                </div>
                <div className="flex items-center bg-[#FAF6EE] p-1 rounded-xl border border-[#EFEBE3]">
                  <button
                    onClick={() => setTheme('Clair')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      theme === 'Clair' ? 'bg-[#16222F] text-white' : 'text-[#78716C]'
                    }`}
                  >
                    Clair
                  </button>
                  <button
                    onClick={() => setTheme('Sombre')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      theme === 'Sombre' ? 'bg-[#16222F] text-white' : 'text-[#78716C]'
                    }`}
                  >
                    Sombre
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#16222F] font-medium">
                  <List className="w-4 h-4 text-[#78716C]" />
                  <span>Éléments par page</span>
                </div>
                <div className="relative">
                  <select className="appearance-none bg-white border border-[#E5DFD5] rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-[#16222F] focus:outline-none cursor-pointer">
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#16222F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Database className="w-5 h-5 text-[#C5A880]" />
              <h3 className="text-base font-bold font-serif-title text-[#16222F]">
                Sauvegarde et maintenance
              </h3>
            </div>
            <p className="text-xs text-[#78716C] mb-6">
              Gérez les sauvegardes et la maintenance du système
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 p-4 rounded-2xl bg-[#FAF6EE] border border-[#EFEBE3] text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#F0E5D3] text-[#16222F] flex items-center justify-center mb-2">
                  <RotateCw className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs text-[#526071] block font-medium">Dernière sauvegarde</span>
                <span className="text-xs font-bold text-[#16222F] block mt-1">
                  25/10/2026 à 02:30
                </span>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✔ Réussie
                </span>
              </div>

              <div className="sm:col-span-7 space-y-2">
                <button
                  onClick={() => alert('Téléchargement de la sauvegarde')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger une sauvegarde</span>
                </button>

                <button
                  onClick={handleLaunchBackup}
                  disabled={isBackingUp}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D9CEBC] text-[#16222F] text-xs font-semibold transition-colors"
                >
                  <Play className="w-3 h-3 text-[#16222F] fill-current" />
                  <span>{isBackingUp ? 'Sauvegarde...' : backupSuccess ? 'Sauvegarde réussie !' : 'Lancer une sauvegarde'}</span>
                </button>

                <button
                  onClick={() => alert('Mode maintenance')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D9CEBC] text-[#16222F] text-xs font-semibold transition-colors"
                >
                  <Wrench className="w-3 h-3 text-[#16222F]" />
                  <span>Mode maintenance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
