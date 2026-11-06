import React from 'react';
import EduTrackLogo from '../common/EduTrackLogo';
import { useAuth } from '../../context/AuthContext';

export default function AppSidebarBase({
  menuItems = [],
  roleBadge = 'Admin',
  onChatClick,
}) {
  const { activeView, setActiveView } = useAuth();

  return (
    <aside className="w-60 lg:w-64 bg-white text-[#1E293B] flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-[#F1F5F9] z-30 justify-between">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div
          onClick={() => setActiveView(menuItems[0]?.id || 'dashboard')}
          className="px-6 pt-6 pb-5 flex items-center cursor-pointer group"
        >
          <EduTrackLogo size="md" />
        </div>

        {/* Navigation list */}
        <nav className="px-3.5 py-1 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4361EE] font-semibold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 stroke-[2] ${
                    isActive ? 'text-[#4361EE]' : 'text-[#64748B]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Support 24/7 Widget from Figma */}
      <div className="p-3.5">
        <div className="bg-[#F3F4FD] rounded-2xl p-4 text-center border border-[#E0E7FF]/50 shadow-2xs">
          <div className="flex justify-center items-center -space-x-1.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#C7D2FE] text-[#3730A3] text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
              SA
            </div>
            <div className="w-7 h-7 rounded-full bg-[#DDD6FE] text-[#5B21B6] text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
              IT
            </div>
          </div>
          <h4 className="text-xs font-bold text-[#1E2238]">Support 24/7</h4>
          <p className="text-[11px] text-[#64748B] mt-0.5 mb-3">
            Contact admin anytime
          </p>
          <button
            onClick={
              onChatClick ||
              (() => setActiveView('communications'))
            }
            className="w-full bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-xs transition cursor-pointer active:scale-98"
          >
            Start chat
          </button>
        </div>
      </div>
    </aside>
  );
}
