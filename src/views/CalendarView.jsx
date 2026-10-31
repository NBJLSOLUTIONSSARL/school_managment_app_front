import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView() {
  const [viewMode, setViewMode] = useState('Mois');
  const [selectedDay, setSelectedDay] = useState(17);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const eventsMap = {
    3: [{ title: 'Réunion département', color: 'bg-sky-500' }],
    8: [{ title: 'Devoir surveillé Math', color: 'bg-rose-500' }],
    12: [{ title: 'Conseil de classe 1ère A', color: 'bg-amber-500' }],
    17: [{ title: 'Inauguration campus', color: 'bg-[#C5A880]' }],
    24: [{ title: 'Remise des bulletins', color: 'bg-emerald-500' }],
    27: [{ title: 'Sortie pédagogique', color: 'bg-indigo-500' }],
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Agenda Général
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Calendrier
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Événements scolaires, examens et réunions
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-full border border-[#EFECE6]">
          {['Mois', 'Semaine', 'Jour'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === mode
                  ? 'bg-[#E8DFC9] text-[#16222F] shadow-sm'
                  : 'text-[#78716C] hover:text-[#16222F]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="academy-card p-6">
        
        <div className="flex items-center justify-between pb-6 border-b border-[#F4EDE2]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-serif-title text-[#16222F]">
              Novembre 2026
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Trimestre 1
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full border border-[#EFECE6] bg-[#FAF7F2] hover:bg-[#F4EDE2] text-[#16222F] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full border border-[#EFECE6] bg-[#FAF7F2] hover:bg-[#F4EDE2] text-[#16222F] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mt-4 text-center">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, idx) => (
            <div key={idx} className="py-2 text-xs font-bold text-[#78716C] uppercase tracking-wider">
              {d}
            </div>
          ))}

          {days.map((day) => {
            const isSelected = selectedDay === day;
            const events = eventsMap[day] || [];

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[90px] p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#16222F] bg-[#FAF7F2] shadow-sm ring-2 ring-[#C5A880]/30'
                    : 'border-[#F4EDE2] hover:border-[#C5A880] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full ${
                      isSelected
                        ? 'bg-[#16222F] text-white shadow'
                        : 'text-[#16222F]'
                    }`}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
                  )}
                </div>

                <div className="space-y-1 mt-1">
                  {events.map((ev, i) => (
                    <div
                      key={i}
                      className="text-[10px] font-semibold text-[#16222F] bg-[#F4EDE2] px-1.5 py-0.5 rounded truncate"
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
