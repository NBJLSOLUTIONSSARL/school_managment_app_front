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
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="h-20 bg-transparent px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher..."
          className="w-full bg-white/90 backdrop-blur-sm border border-[#EFECE6] rounded-full pl-11 pr-4 py-2 text-sm text-[#16222F] placeholder:text-[#A8A29E] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]/40 focus:border-[#C5A880] transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
            className="flex items-center gap-2 bg-[#F4EDE2] hover:bg-[#E8DFC9] text-[#16222F] text-xs font-semibold px-3.5 py-2 rounded-full border border-[#D9CEBC] transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Rôle : {currentUser?.roleTitle || 'Visiteur'}</span>
            <ChevronDown className="w-3 h-3 text-[#78716C]" />
          </button>

          {showDemoSwitcher && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-xs font-semibold text-[#78716C] border-b border-[#F4EDE2]">
                Changer de rôle / vue démo :
              </div>
              <div className="py-1 space-y-1">
                <button
                  onClick={() => { selectUser('admin'); setShowDemoSwitcher(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#FAF7F2] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center font-bold text-[10px] text-[#16222F]">
                      DM
                    </div>
                    <div>
                      <p className="font-semibold text-[#16222F]">Dr. Martin (Directeur)</p>
                      <p className="text-[10px] text-[#78716C]">Accès complet administration</p>
                    </div>
                  </div>
                  {currentUser?.role === 'ADMIN' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => { selectUser('student'); setShowDemoSwitcher(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#FAF7F2] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center font-bold text-[10px] text-amber-800">
                      IB
                    </div>
                    <div>
                      <p className="font-semibold text-[#16222F]">Inès Belkacem (Élève)</p>
                      <p className="text-[10px] text-[#78716C]">Espace étudiant personnalisé</p>
                    </div>
                  </div>
                  {currentUser?.role === 'STUDENT' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => { selectUser('teacher'); setShowDemoSwitcher(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#FAF7F2] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center font-bold text-[10px] text-sky-800">
                      SK
                    </div>
                    <div>
                      <p className="font-semibold text-[#16222F]">Dr. Sarah Khalid (Prof)</p>
                      <p className="text-[10px] text-[#78716C]">Gestion notes & cours</p>
                    </div>
                  </div>
                  {currentUser?.role === 'TEACHER' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <div className="border-t border-[#F4EDE2] pt-1">
                  <button
                    onClick={() => { setActiveView('landing'); setShowDemoSwitcher(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Voir le Site Public / Landing Page</span>
                  </button>
                  <button
                    onClick={() => { setActiveView('admissions'); setShowDemoSwitcher(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Portail Candidatures & Admissions</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-[#16222F] hover:bg-[#FAF7F2] transition-colors relative shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
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
                    className="text-[11px] text-[#C5A880] hover:underline font-medium"
                  >
                    Tout marquer comme lu
                  </button>
                )}
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
            className="flex items-center gap-2.5 p-1 pl-2 pr-3 bg-white rounded-full border border-[#EFECE6] hover:bg-[#FAF7F2] transition-colors shadow-sm"
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.fullName}
              className="w-8 h-8 rounded-full object-cover border border-[#EFECE6]"
            />
            <span className="text-xs font-semibold text-[#16222F]">
              {currentUser?.fullName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#F4EDE2]">
                <p className="text-xs font-bold text-[#16222F]">{currentUser?.fullName}</p>
                <p className="text-[11px] text-[#78716C] truncate">{currentUser?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setActiveView('settings'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-[#16222F] hover:bg-[#FAF7F2] rounded-xl transition-colors"
                >
                  Paramètres du compte
                </button>
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
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
