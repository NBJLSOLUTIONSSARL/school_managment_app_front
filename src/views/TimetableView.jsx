import React, { useState } from 'react';
import { Calendar, ChevronDown, Printer } from 'lucide-react';
import { TIMETABLE_SCHEDULE, INITIAL_CLASSES } from '../data/mockData';

export default function TimetableView() {
  const [selectedWeek] = useState('Semaine actuelle');
  const [selectedClass, setSelectedClass] = useState('1ère A');

  return (
    <div className="space-y-6 pb-12">
      
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Planning Académique
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Emplois du Temps
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Consultez l'emploi du temps scolaire
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2 text-xs font-semibold text-[#16222F] shadow-sm focus:outline-none cursor-pointer"
          >
            {INITIAL_CLASSES.map((c) => (
              <option key={c.id} value={c.name}>
                Classe : {c.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <button className="flex items-center gap-2 bg-white border border-[#EFECE6] rounded-full px-4 py-2 text-xs font-semibold text-[#16222F] shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{selectedWeek}</span>
              <ChevronDown className="w-3 h-3 text-[#78716C]" />
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 bg-white border border-[#EFECE6] rounded-full text-[#78716C] hover:text-[#16222F] shadow-sm transition-colors"
            title="Imprimer le planning"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="academy-card overflow-hidden p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#F4EDE2] text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="py-4 px-4 text-left w-36">Heure</th>
                <th className="py-4 px-4 text-center">Lundi</th>
                <th className="py-4 px-4 text-center">Mardi</th>
                <th className="py-4 px-4 text-center">Mercredi</th>
                <th className="py-4 px-4 text-center">Jeudi</th>
                <th className="py-4 px-4 text-center">Vendredi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EDE2]/80">
              {TIMETABLE_SCHEDULE.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF7F2]/40 transition-colors">
                  <td className="py-4 px-4 text-xs font-semibold text-[#78716C] whitespace-nowrap">
                    {row.time}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-full max-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold border ${row.lundi.color}`}>
                      {row.lundi.subject}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-full max-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold border ${row.mardi.color}`}>
                      {row.mardi.subject}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-full max-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold border ${row.mercredi.color}`}>
                      {row.mercredi.subject}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-full max-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold border ${row.jeudi.color}`}>
                      {row.jeudi.subject}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-full max-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold border ${row.vendredi.color}`}>
                      {row.vendredi.subject}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
