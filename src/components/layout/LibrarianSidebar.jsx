import React from 'react';
import {
  Home,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  ClockAlert,
  History,
  Boxes,
  Users,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LibrarianSidebar() {
  const { activeView, setActiveView } = useAuth();

  const menuItems = [
    { id: 'librarian-dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'library-catalog', label: 'Catalogue des livres', icon: BookOpen },
    { id: 'library-loans', label: 'Gestion des emprunts', icon: ArrowUpRight },
    { id: 'library-returns', label: 'Retours des livres', icon: ArrowDownLeft },
    { id: 'library-overdue', label: 'Livres en retard', icon: ClockAlert },
    { id: 'library-history', label: 'Historique des emprunts', icon: History },
    { id: 'library-availability', label: 'Disponibilité des exemplaires', icon: Boxes },
    { id: 'library-students', label: 'Consultation des élèves', icon: Users },
    { id: 'library-staff', label: 'Consultation du personnel', icon: Briefcase },
  ];

  return (
    <aside className="w-64 bg-[#152332] text-white flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-[#1C2F43] z-30 justify-between">
      <div>
        <div
          onClick={() => setActiveView('librarian-dashboard')}
          className="px-6 pt-6 pb-5 flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img
              src="/logo.svg"
              alt="Académie Lumière"
              className="w-full h-full object-contain filter invert brightness-200"
            />
          </div>
          <div className="leading-tight">
            <span className="font-serif-title text-base tracking-wide text-white block">
              Académie
            </span>
            <span className="font-serif-title text-base tracking-wide text-[#DFC2A0] block">
              Lumière
            </span>
          </div>
        </div>

        <div className="px-5 pb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] bg-[#1E2E40] px-2.5 py-1 rounded-md block text-center">
            Bibliothèque & Fonds
          </span>
        </div>

        <nav className="px-3.5 py-1 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#DFC2A0] text-[#16222F] font-semibold shadow-sm'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 stroke-[2] ${
                    isActive ? 'text-[#16222F]' : 'text-[#CBD5E1]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#1C2F43] text-center text-[10px] text-[#64748B]">
        Académie Lumière • Bibliothèque
      </div>
    </aside>
  );
}
