import React from 'react';
import Sidebar from './Sidebar';
import StudentSidebar from './StudentSidebar';
import Navbar from './Navbar';
import DashboardView from '../../views/DashboardView';
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
  const { currentUser, activeView } = useAuth();

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'admissions') {
    return <AdmissionsPage />;
  }

  if (activeView === 'login' || !currentUser) {
    return <LoginPage />;
  }

  const isStudent = currentUser?.roles?.includes('ROLE_STUDENT');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentsView />;
      case 'teachers':
        return <TeachersView />;
      case 'classes':
        return <ClassesView />;
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
        return <SettingsView />;
      case 'student-portal':
        return <StudentPortalView />;
      case 'documents':
        return <DocumentsView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return isStudent ? <StudentPortalView /> : <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#1E293B]">
      {isStudent ? <StudentSidebar /> : <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-8 py-2 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
