import React from 'react';
import {
  Home,
  Users,
  GraduationCap,
  School,
  Calendar,
  CheckSquare,
  XCircle,
  Coins,
  MessageSquare,
  BarChart2,
  Settings,
  Folder,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { activeView, setActiveView, currentUser } = useAuth();

  const isTeacher = currentUser?.roles?.includes('ROLE_TEACHER');
  const isParent = currentUser?.roles?.includes('ROLE_PARENT');

  const adminMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'students', label: 'Élèves', icon: Users },
    { id: 'teachers', label: 'Enseignants', icon: GraduationCap },
    { id: 'finances', label: 'Finances', icon: Coins },
    { id: 'documents', label: 'Mes documents', icon: Folder },
    { id: 'grades', label: 'Notes & Examens', icon: CheckSquare },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'classes', label: 'Classes', icon: School },
    { id: 'timetable', label: 'Emplois du temps', icon: Calendar },
    { id: 'absences', label: 'Absences', icon: XCircle },
    { id: 'reports', label: 'Rapports', icon: BarChart2 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const teacherMenuItems = [
    { id: 'grades', label: 'Notes & Examens', icon: CheckSquare },
    { id: 'students', label: 'Mes Élèves', icon: Users },
    { id: 'documents', label: 'Documents & GED', icon: Folder },
    { id: 'communications', label: 'Messagerie', icon: MessageSquare },
    { id: 'timetable', label: 'Emploi du temps', icon: Calendar },
    { id: 'settings', label: 'Mon Compte', icon: Settings },
  ];

  const parentMenuItems = [
    { id: 'student-portal', label: 'Suivi de mes enfants', icon: Home },
    { id: 'grades', label: 'Notes & Bulletins', icon: CheckSquare },
    { id: 'finances', label: 'Frais & Factures', icon: Coins },
    { id: 'documents', label: 'Documents justificatifs', icon: Folder },
    { id: 'communications', label: 'Messagerie école', icon: MessageSquare },
    { id: 'settings', label: 'Mon profil', icon: Settings },
  ];

  const menuItems = isParent ? parentMenuItems : isTeacher ? teacherMenuItems : adminMenuItems;

  return (
    <aside className="w-60 bg-[#152332] text-white flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-[#1C2F43] z-30 justify-between">
      <div>
        <div
          onClick={() => setActiveView(isParent ? 'student-portal' : isTeacher ? 'grades' : 'dashboard')}
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
            <span className="font-serif-title text-base tracking-wide text-white block">
              Lumière
            </span>
          </div>
        </div>

        <nav className="px-3.5 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
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
        Académie Lumière v1.0
      </div>
    </aside>
  );
}
