import React from 'react';
import {
  CheckSquare,
  Clock,
  FileText,
  ArrowRight,
  Award
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

export default function StudentPortalView() {
  const { currentUser, setActiveView } = useAuth();

  const studentScheduleToday = [
    { time: '08:00 - 09:30', subject: 'Mathématiques', room: 'Salle 204', color: 'border-l-4 border-l-sky-500' },
    { time: '10:00 - 11:30', subject: 'Français', room: 'Salle 101', color: 'border-l-4 border-l-rose-500' },
    { time: '14:00 - 15:30', subject: 'Physique', room: 'Salle 205', color: 'border-l-4 border-l-blue-500' },
  ];

  const recentGrades = [
    { subject: 'Mathématiques', grade: '16/20', icon: '📐' },
    { subject: 'Français', grade: '15/20', icon: '📖' },
    { subject: 'Physique', grade: '17/20', icon: '🔬' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Portail Pédagogique
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Mon espace étudiant
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Bienvenue Inès !
          </p>
        </div>

        <div className="relative w-48 h-24 rounded-2xl overflow-hidden shadow-inner hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80"
            alt="Books"
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FAF7F2]/40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="academy-card p-5 flex items-center gap-4 bg-white border border-[#EFECE6]">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"}
            alt="Inès Belkacem"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C5A880] shadow-sm shrink-0"
          />
          <div>
            <h3 className="text-lg font-bold text-[#16222F]">
              {currentUser?.fullName || 'Inès Belkacem'}
            </h3>
            <p className="text-xs font-semibold text-[#78716C] mt-0.5">
              Élève • {currentUser?.class || '1ère A'}
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Année 2026/2027
            </span>
          </div>
        </div>

        <StatCard
          icon={CheckSquare}
          title="Moyenne générale"
          value="16.5"
          subtitle="Trimestre 1"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={Clock}
          title="Assiduité"
          value="92%"
          subtitle="Taux de présence"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={FileText}
          title="Devoirs à rendre"
          value="3"
          subtitle="Cette semaine"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EDE2]">
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Mon emploi du temps
              </h2>
              <span className="text-xs font-semibold text-[#16222F] bg-[#FAF7F2] border border-[#EFECE6] px-3 py-1.5 rounded-full">
                Aujourd'hui
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {studentScheduleToday.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between ${slot.color}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#78716C] w-28">
                      {slot.time}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#16222F]">
                        {slot.subject}
                      </p>
                      <p className="text-xs text-[#A8A29E]">
                        {slot.room}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#C5A880] bg-white px-2.5 py-1 rounded-lg border border-[#EFECE6]">
                    En présentiel
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EDE2] mt-4 text-center">
            <button
              onClick={() => setActiveView('timetable')}
              className="text-xs font-bold text-[#16222F] hover:text-[#C5A880] transition-colors"
            >
              Consulter l'emploi du temps complet →
            </button>
          </div>
        </div>

        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EDE2]">
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Mes dernières notes
              </h2>
              <Award className="w-4 h-4 text-[#C5A880]" />
            </div>

            <div className="mt-5 space-y-3.5">
              {recentGrades.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] hover:bg-[#F4EDE2]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold text-[#16222F]">
                      {item.subject}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#16222F] bg-white px-3 py-1 rounded-xl border border-[#EFECE6] shadow-sm">
                    {item.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EDE2] mt-4 text-center">
            <button
              onClick={() => setActiveView('grades')}
              className="text-xs font-bold text-[#16222F] hover:text-[#C5A880] transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <span>Voir toutes mes notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
