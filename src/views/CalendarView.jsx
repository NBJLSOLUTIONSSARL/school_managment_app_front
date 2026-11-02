import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { communicationService } from '../services/communicationService';

export default function CalendarView() {
  const [viewMode, setViewMode] = useState('Mois');
  const [selectedDay, setSelectedDay] = useState(15);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await communicationService.getEvents({ page: 0, size: 50 });
        const list = res.content || (Array.isArray(res) ? res : []);
        setEvents(list);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const getEventsForDay = (day) => {
    return events.filter((evt) => {
      if (!evt.startAt) return false;
      const d = new Date(evt.startAt);
      return d.getDate() === day;
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

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
            Calendrier Scolaire
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Événements officiels enregistrés dans MySQL
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-full border border-[#EFECE6]">
          {['Mois', 'Semaine', 'Jour'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === mode
                  ? 'bg-[#E8DFC9] text-[#16222F] shadow-xs'
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
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement du calendrier...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 mt-4 text-center">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, idx) => (
                <div key={idx} className="py-2 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  {d}
                </div>
              ))}

              {days.map((day) => {
                const isSelected = selectedDay === day;
                const dayEvents = getEventsForDay(day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[85px] p-2 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#16222F] bg-[#FAF7F2] shadow-xs ring-2 ring-[#C5A880]/30'
                        : 'border-[#F4EDE2] hover:border-[#C5A880] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                          isSelected ? 'bg-[#16222F] text-white' : 'text-[#16222F]'
                        }`}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((ev, i) => (
                        <div
                          key={i}
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate bg-[#16222F] text-white"
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6]">
              <h3 className="text-sm font-bold text-[#16222F] mb-2">
                Événements pour le {selectedDay} Novembre 2026 :
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-[#78716C] italic">Aucun événement planifié ce jour.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((evt) => (
                    <div key={evt.id} className="p-3 bg-white rounded-xl border border-[#EFECE6] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#16222F]">{evt.title}</p>
                        <p className="text-[10px] text-[#78716C]">{evt.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#C5A880] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#EFECE6]">
                        {evt.location || 'Campus'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
