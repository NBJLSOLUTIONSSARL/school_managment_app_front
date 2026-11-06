import React from 'react';
import {
  Home,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckSquare,
  FileText,
  Folder,
  MessageSquare,
  Settings,
} from 'lucide-react';
import AppSidebarBase from './AppSidebarBase';

export default function TeacherSidebar() {
  const menuItems = [
    { id: 'teacher-dashboard', label: 'Dashboard', icon: Home },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'timetable', label: 'Calendar', icon: Calendar },
    { id: 'grades', label: 'Grades & Report Cards', icon: CheckSquare },
    { id: 'evaluations', label: 'Homework & Tests', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return <AppSidebarBase menuItems={menuItems} roleBadge="Teacher" />;
}
