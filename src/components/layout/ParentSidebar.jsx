import React from 'react';
import {
  Home,
  CheckSquare,
  FileText,
  Calendar,
  Coins,
  Folder,
  MessageSquare,
  Settings,
} from 'lucide-react';
import AppSidebarBase from './AppSidebarBase';

export default function ParentSidebar() {
  const menuItems = [
    { id: 'parent-dashboard', label: 'Dashboard', icon: Home },
    { id: 'grades', label: 'Grades & Exams', icon: CheckSquare },
    { id: 'reports', label: 'Report Cards', icon: FileText },
    { id: 'timetable', label: 'Calendar', icon: Calendar },
    { id: 'finances', label: 'Fees & Invoices', icon: Coins },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return <AppSidebarBase menuItems={menuItems} roleBadge="Parent" />;
}
