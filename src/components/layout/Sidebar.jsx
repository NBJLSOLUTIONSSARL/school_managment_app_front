import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Clock,
  CheckSquare,
  XCircle,
  Coins,
  MessageSquare,
  BarChart2,
  Settings,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { activeView, setActiveView } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'students', label: 'Élèves', icon: Users },
    { id: 'teachers', label: 'Enseignants', icon: GraduationCap },
    { id: 'classes', label: 'Classes', icon: School },
    { id: 'timetable', label: 'Emplois du temps', icon: Clock },
    { id: 'grades', label: 'Notes', icon: CheckSquare },
    { id: 'absences', label: 'Absences', icon: XCircle },
    { id: 'finances', label: 'Finances', icon: Coins },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'documents', label: 'Mes documents', icon: FileText },
    { id: 'reports', label: 'Rapports', icon: BarChart2 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#16222F] text-white flex flex-col shrink-0 h-screen sticky top-0 select-none shadow-xl border-r border-[#1F2D3D] z-30">
      
      <div
        onClick={() => setActiveView('dashboard')}
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

      <div className="p-4 border-t border-white/5 relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="text-center">
          <p className="text-[11px] text-[#64748B] font-medium">Session sécurisée v2.4</p>
          <p className="text-[10px] text-[#475569]">Académie Lumière • Casablanca</p>
        </div>
      </div>
    </aside>
  );
}
