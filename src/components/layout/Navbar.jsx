import React, { useState } from 'react';
import { Search, Bell, Mail, ChevronDown, LogOut, User, Globe, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { communicationService } from '../../services/communicationService';

export default function Navbar() {
  const {
    currentUser,
    activeView,
    searchQuery,
    setSearchQuery,
    notifications,
    refreshNotifications,
    logout,
    language,
    setLanguage,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const unreadNotifications = notifications?.filter((n) => !n.isRead && !n.read) || [];
  const unreadCount = unreadNotifications.length;

  const markAllRead = async () => {
    try {
      if (notifications && notifications.length > 0) {
        await Promise.all(
          unreadNotifications.map((n) => communicationService.markNotificationRead(n.id))
        );
        await refreshNotifications();
      }
    } catch {
    }
  };

  // Convert activeView slug to a clean title matching Figma
  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard':
      case 'staff-dashboard':
      case 'teacher-dashboard':
      case 'student-dashboard':
      case 'parent-dashboard':
      case 'librarian-dashboard':
        return 'Dashboard';
      case 'students':
      case 'student-portal':
        return 'Students';
      case 'teachers':
        return 'Teachers';
      case 'classes':
        return 'Classes';
      case 'calendar':
      case 'timetable':
        return 'Calendar';
      case 'settings':
        return 'Settings';
      case 'finances':
        return 'Finances';
      case 'grades':
        return 'Grades & Examinations';
      case 'documents':
        return 'Documents';
      case 'admissions':
      case 'admissions-admin':
        return 'Admissions';
      case 'communications':
        return 'Communications';
      case 'library-catalog':
      case 'library-loans':
      case 'library-returns':
      case 'library-history':
      case 'library-availability':
        return 'Library';
      case 'users-management':
        return 'Users Management';
      case 'audit-logs':
        return 'Audit Logs';
      case 'absences':
        return 'Absences';
      case 'reports':
        return 'Reports';
      default:
        return 'Dashboard';
    }
  };

  const getInitials = () => {
    if (!currentUser) return 'PA';
    const first = currentUser.firstName ? currentUser.firstName.charAt(0) : '';
    const last = currentUser.lastName ? currentUser.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'PA';
  };

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Principal Adams';

  const userRole = currentUser?.roles?.[0]?.replace('ROLE_', '') || 'SUPER ADMIN';

  return (
    <header className="h-20 bg-transparent px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Page Title from Figma */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar / Icon */}
        <div className="relative">
          {showSearchInput ? (
            <div className="flex items-center bg-white border border-[#E2E8F0] rounded-full pl-3 pr-2 py-1.5 shadow-sm">
              <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-36 sm:w-56 text-xs text-[#1E293B] pl-2 focus:outline-none"
                onBlur={() => !searchQuery && setShowSearchInput(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>

        {/* Messages / Mail Icon from Figma */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors cursor-pointer"
          title="Messages"
        >
          <Mail className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Notifications Bell from Figma */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#F1F5F9] p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#F1F5F9]">
                <span className="text-xs font-bold text-[#1E293B]">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#4361EE] hover:underline font-medium cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs ${
                        n.isRead ? 'bg-slate-50 text-[#64748B]' : 'bg-[#EEF2FF] text-[#1E293B]'
                      }`}
                    >
                      <p className="font-semibold">{n.title || 'Notification'}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{n.message || n.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-[#94A3B8] py-4">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language selector subtle pill */}
        <div className="hidden sm:flex items-center bg-white border border-[#E2E8F0] rounded-full p-0.5 text-xs text-[#64748B] shadow-2xs">
          {['FR', 'EN'].map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-2 py-0.5 rounded-full transition-all text-[11px] font-semibold cursor-pointer ${
                language === l ? 'bg-[#4361EE] text-white' : 'hover:text-[#1E293B]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* User Avatar Circle from Figma ("PA") */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#4361EE]/20 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4361EE] text-xs font-bold shadow-xs">
              {getInitials()}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#F1F5F9] p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-[#F1F5F9]">
                <p className="text-xs font-bold text-[#1E293B] truncate">{displayName}</p>
                <span className="text-[10px] font-semibold text-[#4361EE] bg-[#EEF2FF] px-2 py-0.5 rounded-md inline-block mt-1">
                  {userRole}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
