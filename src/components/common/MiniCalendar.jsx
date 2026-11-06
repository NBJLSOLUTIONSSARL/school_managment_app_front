import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar({ onSelectDate, className = '' }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 15)); // Oct 15, 2026
  const [selectedDay, setSelectedDay] = useState(15);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];
  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  // Next month leading days to complete full grid (multiple of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  const handleDayClick = (d) => {
    if (d.isCurrentMonth) {
      setSelectedDay(d.day);
      if (onSelectDate) onSelectDate(new Date(year, month, d.day));
    }
  };

  return (
    <div className={`edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[#1E293B]">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
          <span key={d} className="text-[10px] font-bold text-[#94A3B8] tracking-wider py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, index) => {
          const isSelected = d.isCurrentMonth && d.day === selectedDay;
          const isSecondary = d.isCurrentMonth && d.day === 16 && selectedDay === 15;

          return (
            <button
              key={index}
              onClick={() => handleDayClick(d)}
              disabled={!d.isCurrentMonth}
              className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer ${
                !d.isCurrentMonth
                  ? 'text-[#CBD5E1] cursor-default'
                  : isSelected
                  ? 'bg-[#4361EE] text-white shadow-xs'
                  : isSecondary
                  ? 'bg-[#EEF2FF] text-[#4361EE]'
                  : 'text-[#1E293B] hover:bg-slate-100'
              }`}
            >
              {d.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
