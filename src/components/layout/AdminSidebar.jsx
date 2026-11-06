import React from 'react';
import {
  Home,
  GraduationCap,
  UserCheck,
  BookOpen,
  Calendar,
  Settings,
  Coins,
  Folder,
  CheckSquare,
  MessageSquare,
  FileCheck,
  UserCog,
  ShieldAlert,
} from 'lucide-react';
import AppSidebarBase from './AppSidebarBase';

export default function AdminSidebar() {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: UserCheck },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'timetable', label: 'Calendar', icon: Calendar },
    { id: 'finances', label: 'Finances', icon: Coins },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'grades', label: 'Grades & Exams', icon: CheckSquare },
    { id: 'admissions-admin', label: 'Admissions', icon: FileCheck },
    { id: 'library-catalog', label: 'Library', icon: BookOpen },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'users-management', label: 'Users', icon: UserCog },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return <AppSidebarBase menuItems={menuItems} roleBadge="Super Admin" />;
}
