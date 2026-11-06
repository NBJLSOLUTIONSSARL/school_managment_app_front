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
} from 'lucide-react';
import AppSidebarBase from './AppSidebarBase';

export default function StudentSidebar() {
  const menuItems = [
    { id: 'student-dashboard', label: 'Dashboard', icon: Home },
    { id: 'timetable', label: 'Calendar', icon: Calendar },
    { id: 'grades', label: 'Grades & Exams', icon: CheckSquare },
    { id: 'reports', label: 'Report Cards', icon: FileText },
    { id: 'evaluations', label: 'Homework', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'library-catalog', label: 'Library', icon: Bookmark },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return <AppSidebarBase menuItems={menuItems} roleBadge="Student" />;
}
