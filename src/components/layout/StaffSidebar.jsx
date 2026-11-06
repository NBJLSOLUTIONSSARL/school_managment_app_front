import React from 'react';
import {
  Home,
  FileCheck,
  GraduationCap,
  HeartHandshake,
  FolderCheck,
  Coins,
  FileText,
  Calendar,
  Eye,
  Megaphone,
} from 'lucide-react';
import AppSidebarBase from './AppSidebarBase';

export default function StaffSidebar() {
  const menuItems = [
    { id: 'staff-dashboard', label: 'Dashboard', icon: Home },
    { id: 'admissions', label: 'Admissions', icon: FileCheck },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'guardians', label: 'Guardians & Parents', icon: HeartHandshake },
    { id: 'documents', label: 'Documents', icon: FolderCheck },
    { id: 'finances', label: 'Finances', icon: Coins },
    { id: 'reports', label: 'Report Cards', icon: FileText },
    { id: 'timetable', label: 'Calendar', icon: Calendar },
    { id: 'grades', label: 'Grades', icon: Eye },
    { id: 'communications', label: 'Announcements', icon: Megaphone },
  ];

  return <AppSidebarBase menuItems={menuItems} roleBadge="Staff" />;
}
