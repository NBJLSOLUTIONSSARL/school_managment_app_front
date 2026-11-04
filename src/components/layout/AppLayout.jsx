import React, { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import StaffSidebar from './StaffSidebar';
import LibrarianSidebar from './LibrarianSidebar';
import StudentSidebar from './StudentSidebar';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

import DashboardView from '../../views/DashboardView';
import UsersManagementView from '../../views/admin/UsersManagementView';
import AuditLogsView from '../../views/admin/AuditLogsView';

import StaffDashboardView from '../../views/staff/StaffDashboardView';
import GuardiansView from '../../views/staff/GuardiansView';

import LibrarianDashboardView from '../../views/librarian/LibrarianDashboardView';
import BookCatalogView from '../../views/librarian/BookCatalogView';
import LoansView from '../../views/librarian/LoansView';
import ReturnsView from '../../views/librarian/ReturnsView';
import LoanHistoryView from '../../views/librarian/LoanHistoryView';
import AvailabilityView from '../../views/librarian/AvailabilityView';
import LibraryStudentsView from '../../views/librarian/LibraryStudentsView';
import LibraryStaffView from '../../views/librarian/LibraryStaffView';

import StudentsView from '../../views/StudentsView';
import TeachersView from '../../views/TeachersView';
import ClassesView from '../../views/ClassesView';
import TimetableView from '../../views/TimetableView';
import GradesView from '../../views/GradesView';
import AbsencesView from '../../views/AbsencesView';
import FinancesView from '../../views/FinancesView';
import CommunicationsView from '../../views/CommunicationsView';
import ReportsView from '../../views/ReportsView';
import SettingsView from '../../views/SettingsView';
import StudentPortalView from '../../views/StudentPortalView';
import DocumentsView from '../../views/DocumentsView';
import CalendarView from '../../views/CalendarView';
import LandingPage from '../../views/LandingPage';
import AdmissionsPage from '../../views/AdmissionsPage';
import LoginPage from '../../views/LoginPage';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { currentUser, activeView, setActiveView } = useAuth();

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'admissions' && (!currentUser || !currentUser.roles)) {
    return <AdmissionsPage />;
  }

  if (activeView === 'login' || !currentUser) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.roles?.includes('ROLE_ADMIN');
  const isStaff = currentUser.roles?.includes('ROLE_STAFF');
  const isLibrarian = currentUser.roles?.includes('ROLE_LIBRARIAN');
  const isStudent = currentUser.roles?.includes('ROLE_STUDENT');
  const isParent = currentUser.roles?.includes('ROLE_PARENT');
  const isTeacher = currentUser.roles?.includes('ROLE_TEACHER');

  const adminAllowedViews = [
    'dashboard',
    'users-management',
    'students',
    'teachers',
    'classes',
    'admissions-admin',
    'admissions',
    'documents',
    'finances',
    'grades',
    'reports',
    'timetable',
    'library-catalog',
    'library-loans',
    'library-returns',
    'library-overdue',
    'library-history',
    'library-availability',
    'communications',
    'audit-logs',
    'settings',
    'calendar',
    'absences',
  ];

  const staffAllowedViews = [
    'staff-dashboard',
    'admissions',
    'students',
    'guardians',
    'documents',
    'finances',
    'reports',
    'timetable',
    'grades',
    'communications',
    'calendar',
  ];

  const librarianAllowedViews = [
    'librarian-dashboard',
    'library-catalog',
    'library-loans',
    'library-returns',
    'library-overdue',
    'library-history',
    'library-availability',
    'library-students',
    'library-staff',
  ];

  useEffect(() => {
    if (isAdmin && !adminAllowedViews.includes(activeView)) {
      setActiveView('dashboard');
    } else if (isStaff && !staffAllowedViews.includes(activeView)) {
      setActiveView('staff-dashboard');
    } else if (isLibrarian && !librarianAllowedViews.includes(activeView)) {
      setActiveView('librarian-dashboard');
    }
  }, [activeView, isAdmin, isStaff, isLibrarian]);

  const renderSidebar = () => {
    if (isAdmin) return <AdminSidebar />;
    if (isStaff) return <StaffSidebar />;
    if (isLibrarian) return <LibrarianSidebar />;
    if (isStudent) return <StudentSidebar />;
    return <Sidebar />;
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'users-management':
        return isAdmin ? <UsersManagementView /> : <DashboardView />;
      case 'audit-logs':
        return isAdmin ? <AuditLogsView /> : <DashboardView />;
      case 'staff-dashboard':
        return <StaffDashboardView />;
      case 'guardians':
        return <GuardiansView />;
      case 'librarian-dashboard':
        return <LibrarianDashboardView />;
      case 'library-catalog':
        return <BookCatalogView />;
      case 'library-loans':
        return <LoansView />;
      case 'library-returns':
      case 'library-overdue':
        return <ReturnsView />;
      case 'library-history':
        return <LoanHistoryView />;
      case 'library-availability':
        return <AvailabilityView />;
      case 'library-students':
        return <LibraryStudentsView />;
      case 'library-staff':
        return <LibraryStaffView />;
      case 'students':
        return <StudentsView />;
      case 'teachers':
        return isAdmin ? <TeachersView /> : <StaffDashboardView />;
      case 'classes':
        return isAdmin ? <ClassesView /> : <StaffDashboardView />;
      case 'timetable':
        return <TimetableView />;
      case 'grades':
        return <GradesView />;
      case 'absences':
        return <AbsencesView />;
      case 'finances':
        return <FinancesView />;
      case 'communications':
        return <CommunicationsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return isAdmin ? <SettingsView /> : <DashboardView />;
      case 'admissions':
      case 'admissions-admin':
        return <AdmissionsPage />;
      case 'student-portal':
        return <StudentPortalView />;
      case 'documents':
        return <DocumentsView />;
      case 'calendar':
        return <CalendarView />;
      default:
        if (isAdmin) return <DashboardView />;
        if (isStaff) return <StaffDashboardView />;
        if (isLibrarian) return <LibrarianDashboardView />;
        if (isStudent || isParent) return <StudentPortalView />;
        if (isTeacher) return <GradesView />;
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#1E293B]">
      {renderSidebar()}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-4 sm:px-8 py-2 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
