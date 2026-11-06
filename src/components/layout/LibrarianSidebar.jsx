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
import AppSidebarBase from './AppSidebarBase';

export default function LibrarianSidebar() {
  const menuItems = [
    { id: 'librarian-dashboard', label: 'Dashboard', icon: Home },
    { id: 'library-catalog', label: 'Book Catalog', icon: BookOpen },
    { id: 'library-loans', label: 'Loans', icon: ArrowUpRight },
    { id: 'library-returns', label: 'Returns', icon: ArrowDownLeft },
    { id: 'library-overdue', label: 'Overdue Books', icon: ClockAlert },
    { id: 'library-history', label: 'Loan History', icon: History },
    { id: 'library-availability', label: 'Availability', icon: Boxes },
    { id: 'library-students', label: 'Students', icon: Users },
    { id: 'library-staff', label: 'Staff', icon: Briefcase },
  ];

  return <AppSidebarBase menuItems={menuItems} roleBadge="Librarian" />;
}
