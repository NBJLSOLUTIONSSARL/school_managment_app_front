import React from 'react';
import { Users, GraduationCap, TrendingUp, FileText, ArrowRight, Calendar, Clock, DollarSign } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import LineChart from '../components/common/LineChart';
import { ENROLLMENT_DATA, UPCOMING_EVENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function DashboardView() {
  const { currentUser, setActiveView } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-5 z-10">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
            alt="Dr. Martin"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E8DFC9] shadow-md"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
              Bonjour {currentUser?.fullName || 'Dr. Martin'},
            </h1>
            <p className="text-sm sm:text-base text-[#78716C] mt-1">
              Voici un aperçu de votre établissement.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80 h-32 rounded-2xl overflow-hidden shadow-inner border border-[#EFECE6] shrink-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Campus Académie Lumière"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16222F]/60 via-transparent to-transparent flex items-end p-3">
            <span className="text-xs font-semibold text-white tracking-wide">
              Campus Principal • Année 2026/2027
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Users}
          title="Élèves"
          value="1 248"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={GraduationCap}
          title="Enseignants"
          value="82"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={TrendingUp}
          title="Assiduité"
          value="98%"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={FileText}
          title="Candidatures"
          value="24"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 academy-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Évolution des inscriptions
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Nombre de nouveaux élèves admis par mois
              </p>
            </div>
            <span className="text-xs font-semibold text-[#78716C] bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EFECE6]">
              2026 - 2027
            </span>
          </div>

          <div className="pt-4">
            <LineChart
              data={ENROLLMENT_DATA}
              dataKey="count"
              labelKey="month"
              minY={10}
              maxY={40}
              ySuffix=""
              lineColor="#16222F"
              fillColor="rgba(22, 34, 47, 0.08)"
              height={220}
            />
          </div>
        </div>

        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F4EDE2]">
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Prochaines échéances
              </h2>
              <Clock className="w-4 h-4 text-[#C5A880]" />
            </div>

            <div className="mt-4 space-y-3.5">
              {UPCOMING_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] hover:bg-[#F4EDE2]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#EFECE6] flex items-center justify-center shrink-0 text-[#C5A880] group-hover:scale-105 transition-transform">
                      {event.type === 'Finance' ? (
                        <DollarSign className="w-4 h-4" />
                      ) : (
                        <Calendar className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#16222F] truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-[#C5A880] font-medium mt-0.5">
                        {event.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EDE2] mt-4">
            <button
              onClick={() => setActiveView('calendar')}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#16222F] hover:text-[#C5A880] transition-colors py-1.5"
            >
              <span>Voir tout le calendrier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
