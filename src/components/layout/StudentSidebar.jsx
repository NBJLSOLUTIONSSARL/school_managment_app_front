import React from 'react';
import {
  Home,
  Calendar,
  CheckSquare,
  FileText,
  BookOpen,
  Folder,
  Bookmark,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar() {
  const { activeView, setActiveView, logout } = useAuth();

  const menuItems = [
    { id: 'student-dashboard', label: 'Mon Espace', icon: Home },
    { id: 'timetable', label: 'Mon Emploi du temps', icon: Calendar },
    { id: 'grades', label: 'Mes Notes & Examens', icon: CheckSquare },
    { id: 'reports', label: 'Mes Bulletins', icon: FileText },
    { id: 'evaluations', label: 'Mes Devoirs', icon: BookOpen },
    { id: 'documents', label: 'Mes Documents', icon: Folder },
    { id: 'library-catalog', label: 'Bibliothèque', icon: Bookmark },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'settings', label: 'Mon Profil', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#152332] text-white flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-[#1C2F43] z-30 justify-between">
      <div>
        <div
          onClick={() => setActiveView('student-dashboard')}
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
            Espace Élève
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#C5A880] text-[#16222F] font-semibold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#16222F]' : 'text-[#94A3B8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#1C2F43]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#F87171] hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
