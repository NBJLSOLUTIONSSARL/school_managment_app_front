import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    notifications,
    setNotifications,
    selectUser,
    logout,
    setActiveView
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length || 3;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

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
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#16222F] hover:bg-black/5 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-[#16222F]" />
            <span className="absolute 1 top-0 right-0 w-4 h-4 bg-[#EF4444] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F4EDE2]">
                <span className="text-xs font-bold text-[#16222F]">Notifications ({unreadCount})</span>
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[#C5A880] hover:underline font-medium"
                >
                  Tout marquer comme lu
                </button>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${
                      n.unread ? 'bg-[#FAF7F2] border border-[#EFECE6]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#16222F]">{n.title}</span>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>}
                    </div>
                    <span className="text-[10px] text-[#78716C]">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <img
              src="/assets/dr-martin.png"
              alt="Dr. Martin"
              className="w-8 h-8 rounded-full object-cover border border-[#EFECE6]"
              onError={(e) => {
                e.currentTarget.src = currentUser?.avatar || "/assets/dr-martin.png";
              }}
            />
            <span className="text-xs sm:text-sm font-medium text-[#16222F]">
              Dr. Martin
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#16222F]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#F4EDE2]">
                <p className="text-xs font-bold text-[#16222F]">{currentUser?.fullName || 'Dr. Martin'}</p>
                <p className="text-[11px] text-[#78716C] truncate">{currentUser?.email || 'direction@academie-lumiere.ma'}</p>
              </div>

              <div className="py-2 border-b border-[#F4EDE2] space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Changer de rôle démo</p>
                <button
                  onClick={() => { selectUser('admin'); setShowUserMenu(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg hover:bg-[#FAF7F2] text-left"
                >
                  <span>Dr. Martin (Directeur)</span>
                  {currentUser?.role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => { selectUser('student'); setShowUserMenu(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg hover:bg-[#FAF7F2] text-left"
                >
                  <span>Inès Belkacem (Élève)</span>
                  {currentUser?.role === 'STUDENT' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => { selectUser('teacher'); setShowUserMenu(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg hover:bg-[#FAF7F2] text-left"
                >
                  <span>Dr. Sarah Khalid (Prof)</span>
                  {currentUser?.role === 'TEACHER' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setActiveView('landing'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Landing Page</span>
                </button>
                <button
                  onClick={() => { setActiveView('admissions'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Page Admissions</span>
                </button>
                <button
                  onClick={() => { setActiveView('settings'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#16222F] hover:bg-[#FAF7F2] rounded-lg"
                >
                  Paramètres
                </button>
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
