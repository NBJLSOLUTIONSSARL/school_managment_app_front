import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import HeroBanner from '../components/common/HeroBanner';
import { communicationService } from '../services/communicationService';

export default function CalendarView() {
  const [viewMode, setViewMode] = useState('Month');
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
    <div className="space-y-6 pb-12 select-none">
      {/* EduTrack Hero Banner */}
      <HeroBanner
        title="Institutional Calendar"
        description="Official school schedule, academic semesters, faculty meetings, and institutional milestones."
        icon={Calendar}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#E2E8F0] shadow-2xs">
          {['Month', 'Week', 'Day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === mode
                  ? 'bg-[#4361EE] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="edutrack-card bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#1E293B]">
              October 2026
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981]">
              Semester 1
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#64748B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#4361EE]" />
            <span className="text-xs sm:text-sm font-medium">Loading events from MySQL...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 mt-4 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, idx) => (
                <div key={idx} className="py-2 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 mt-2">
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-20 sm:h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4361EE] bg-[#EEF2FF]/60 shadow-xs ring-1 ring-[#4361EE]'
                        : 'border-[#F1F5F9] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-[#4361EE] text-white' : 'text-[#1E293B]'
                      }`}
                    >
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <div className="space-y-1 overflow-hidden w-full">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className="text-[10px] truncate bg-[#4361EE] text-white px-1.5 py-0.5 rounded font-medium"
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
