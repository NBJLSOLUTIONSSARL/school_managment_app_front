import React, { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import StaffSidebar from './StaffSidebar';
import LibrarianSidebar from './LibrarianSidebar';
import TeacherSidebar from './TeacherSidebar';
import StudentSidebar from './StudentSidebar';
import ParentSidebar from './ParentSidebar';
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

import TeacherDashboardView from '../../views/teacher/TeacherDashboardView';
import StudentDashboardView from '../../views/student/StudentDashboardView';
import ParentDashboardView from '../../views/parent/ParentDashboardView';

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
  'settings',
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
  'settings',
];

const teacherAllowedViews = [
  'teacher-dashboard',
  'classes',
  'students',
  'timetable',
  'grades',
  'evaluations',
  'documents',
  'communications',
  'settings',
];

const studentAllowedViews = [
  'student-dashboard',
  'student-portal',
  'timetable',
  'grades',
  'reports',
  'evaluations',
  'documents',
  'library-catalog',
  'communications',
  'settings',
];

const parentAllowedViews = [
  'parent-dashboard',
  'grades',
  'reports',
  'timetable',
  'finances',
  'documents',
  'communications',
  'settings',
];

export default function AppLayout() {
  const { currentUser, activeView, setActiveView } = useAuth();

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');
  const isStaff = currentUser?.roles?.includes('ROLE_STAFF');
  const isLibrarian = currentUser?.roles?.includes('ROLE_LIBRARIAN');
  const isTeacher = currentUser?.roles?.includes('ROLE_TEACHER');
  const isStudent = currentUser?.roles?.includes('ROLE_STUDENT');
  const isParent = currentUser?.roles?.includes('ROLE_PARENT');

  useEffect(() => {
    if (!currentUser) return;
    if (activeView === 'landing' || activeView === 'login' || activeView === 'admissions') return;

    if (isAdmin && !adminAllowedViews.includes(activeView)) {
      setActiveView('dashboard');
    } else if (isStaff && !staffAllowedViews.includes(activeView)) {
      setActiveView('staff-dashboard');
    } else if (isLibrarian && !librarianAllowedViews.includes(activeView)) {
      setActiveView('librarian-dashboard');
    } else if (isTeacher && !teacherAllowedViews.includes(activeView)) {
      setActiveView('teacher-dashboard');
    } else if (isStudent && !studentAllowedViews.includes(activeView)) {
      setActiveView('student-dashboard');
    } else if (isParent && !parentAllowedViews.includes(activeView)) {
      setActiveView('parent-dashboard');
    }
  }, [activeView, currentUser, isAdmin, isStaff, isLibrarian, isTeacher, isStudent, isParent, setActiveView]);

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'admissions' && (!currentUser || !currentUser.roles)) {
    return <AdmissionsPage />;
  }

  if (activeView === 'login' || !currentUser) {
    return <LoginPage />;
  }

  const renderSidebar = () => {
    if (isAdmin) return <AdminSidebar />;
    if (isStaff) return <StaffSidebar />;
    if (isLibrarian) return <LibrarianSidebar />;
    if (isTeacher) return <TeacherSidebar />;
    if (isStudent) return <StudentSidebar />;
    if (isParent) return <ParentSidebar />;
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
      case 'teacher-dashboard':
        return <TeacherDashboardView />;
      case 'student-dashboard':
        return <StudentDashboardView />;
      case 'parent-dashboard':
        return <ParentDashboardView />;
      case 'students':
        return <StudentsView />;
      case 'teachers':
        return isAdmin ? <TeachersView /> : <StaffDashboardView />;
      case 'classes':
        return <ClassesView />;
      case 'timetable':
        return <TimetableView />;
      case 'grades':
      case 'evaluations':
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
        return <SettingsView />;
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
        if (isTeacher) return <TeacherDashboardView />;
        if (isStudent) return <StudentDashboardView />;
        if (isParent) return <ParentDashboardView />;
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      {renderSidebar()}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-6 sm:px-8 pb-10 max-w-[1600px] w-full mx-auto animate-in fade-in duration-200">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
