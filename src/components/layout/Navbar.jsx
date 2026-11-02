import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, LogOut, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { communicationService } from '../../services/communicationService';

export default function Navbar() {
  const {
    currentUser,
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

  const unreadNotifications = notifications.filter((n) => !n.isRead && !n.read);
  const unreadCount = unreadNotifications.length;

  const markAllRead = async () => {
    try {
      await Promise.all(
        unreadNotifications.map((n) => communicationService.markNotificationRead(n.id))
      );
      await refreshNotifications();
    } catch {
    }
  };

  const getRoleLabel = () => {
    if (!currentUser?.roles) return 'Utilisateur';
    if (currentUser.roles.includes('ROLE_ADMIN')) return 'Direction Générale';
    if (currentUser.roles.includes('ROLE_TEACHER')) return 'Corps Enseignant';
    if (currentUser.roles.includes('ROLE_STAFF')) return 'Administration & CPE';
    if (currentUser.roles.includes('ROLE_STUDENT')) return 'Élève';
    if (currentUser.roles.includes('ROLE_PARENT')) return 'Parent / Tuteur';
    return 'Membre';
  };

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Utilisateur';

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <header className="h-16 sm:h-20 bg-transparent px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="relative flex-1 max-w-sm sm:max-w-md">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher..."
          className="w-full bg-white/95 border border-[#EBE5DA] rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-[#16222F] placeholder:text-[#94A3B8] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-all"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center bg-white border border-[#EFECE6] rounded-full p-0.5 text-xs font-semibold text-[#78716C] shadow-sm">
          {['FR', 'EN', 'AR'].map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-2 py-0.5 rounded-full transition-all text-[11px] cursor-pointer ${
                language === l ? 'bg-[#16222F] text-white shadow-xs' : 'hover:text-[#16222F]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#16222F] hover:bg-black/5 transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5 text-[#16222F]" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#EF4444] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F4EDE2]">
                <span className="text-xs font-bold text-[#16222F]">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#C5A880] hover:underline font-medium cursor-pointer"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#78716C]">
                    Aucune notification pour le moment.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${
                        !n.isRead && !n.read ? 'bg-[#FAF7F2] border border-[#EFECE6]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#16222F]">{n.content || n.title}</span>
                        {!n.isRead && !n.read && <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>}
                      </div>
                      <span className="text-[10px] text-[#78716C]">{n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 py-1 px-2.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <img
              src={currentUser?.photoUrl || defaultAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-[#EFECE6]"
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
            />
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-bold text-[#16222F] block">
                {displayName}
              </span>
              <span className="text-[10px] text-[#78716C] block">
                {getRoleLabel()}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#16222F]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#F4EDE2]">
                <p className="text-xs font-bold text-[#16222F]">{displayName}</p>
                <p className="text-[10px] text-[#78716C] truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold bg-[#FAF7F2] text-[#C5A880] px-2 py-0.5 rounded-full border border-[#EFECE6]">
                  {getRoleLabel()}
                </span>
              </div>
              <div className="pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
