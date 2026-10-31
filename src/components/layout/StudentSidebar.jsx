import React from 'react';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Folder,
  MessageSquare,
  User,
  LogOut,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar() {
  const { activeView, setActiveView, logout } = useAuth();

  const menuItems = [
    { id: 'student-portal', label: 'Mon tableau de bord', icon: LayoutDashboard },
    { id: 'timetable', label: 'Mon emploi du temps', icon: Clock },
    { id: 'grades', label: 'Mes notes', icon: CheckSquare },
    { id: 'calendar', label: 'Calendrier scolaire', icon: Calendar },
    { id: 'documents', label: 'Mes ressources & docs', icon: Folder },
    { id: 'communications', label: 'Mes messages', icon: MessageSquare },
    { id: 'settings', label: 'Mon profil', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#16222F] text-white flex flex-col shrink-0 h-screen sticky top-0 select-none shadow-xl border-r border-[#1F2D3D] z-30">
      
      <div
        onClick={() => setActiveView('student-portal')}
        className="px-6 py-6 flex items-center gap-3.5 cursor-pointer border-b border-white/5 group"
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 group-hover:bg-white/15 transition-all">
          <img src="/logo.svg" alt="Académie Lumière" className="w-full h-full object-contain filter invert brightness-200" />
        </div>
        <div>
          <h1 className="font-brand text-base tracking-wider text-white font-semibold leading-tight">
            Académie
          </h1>
          <p className="font-brand text-xs tracking-widest text-[#C5A880] uppercase">
            Lumière
          </p>
        </div>
      </div>

      <div className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
          Espace Étudiant
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#E8DFC9] text-[#16222F] font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#203144]'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 stroke-[1.8] ${isActive ? 'text-[#16222F]' : 'text-[#94A3B8]'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#F87171] hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
