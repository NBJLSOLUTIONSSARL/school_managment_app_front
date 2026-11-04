import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CheckSquare,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  BookOpen,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/statsService';

export default function TeacherDashboardView() {
  const { currentUser, setActiveView } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teacherName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : '';

  const fetchTeacherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getTeacherStats(teacherName);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les données du professeur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [teacherName]);

  const displayName = teacherName || currentUser?.email || 'Professeur';

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-5 z-10">
          <img
            src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E8DFC9] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#16222F] text-[#DFC2A0]">
                Espace Enseignant
              </span>
              <span className="text-xs text-[#64748B]">
                {currentUser?.email}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif-title text-[#16222F] mt-1">
              Bonjour, {displayName}
            </h1>
            <p className="text-sm text-[#64748B]">
              Gérez vos cours, évaluez vos élèves et suivez votre emploi du temps en direct.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setActiveView('grades')}
            className="academy-btn-primary flex items-center gap-2 text-sm shadow-md"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Saisir des notes</span>
          </button>
          <button
            onClick={() => setActiveView('timetable')}
            className="academy-btn-secondary flex items-center gap-2 text-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Mon emploi du temps</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin mb-3" />
          <p className="text-sm text-[#64748B]">Chargement des données pédagogiques réelles...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Classes assignées"
              value={stats?.totalClasses ?? 0}
              icon={Building2}
              badge="Actif"
              trend="up"
            />
            <StatCard
              title="Effectif total élèves"
              value={stats?.totalStudents ?? 0}
              icon={Users}
              badge="Établissement"
            />
            <StatCard
              title="Examens & Évaluations"
              value={stats?.totalExams ?? 0}
              icon={CheckSquare}
              badge="Session active"
            />
            <StatCard
              title="Séances planifiées"
              value={stats?.timetableSlots?.length ?? 0}
              icon={Calendar}
              badge="Semaine"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 academy-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C5A880]" />
                  <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                    Mes Cours & Séances de la semaine
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('timetable')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#C5A880] flex items-center gap-1 transition-colors"
                >
                  <span>Planning complet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {stats?.timetableSlots && stats.timetableSlots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase">
                        <th className="py-3 px-3">Jour</th>
                        <th className="py-3 px-3">Horaire</th>
                        <th className="py-3 px-3">Matière</th>
                        <th className="py-3 px-3">Salle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {stats.timetableSlots.slice(0, 8).map((slot) => (
                        <tr key={slot.id} className="hover:bg-[#FAF7F2] transition-colors">
                          <td className="py-3 px-3 font-semibold text-[#16222F]">
                            {slot.dayOfWeek}
                          </td>
                          <td className="py-3 px-3 text-[#64748B]">
                            {slot.timeSlotLabel || `${slot.startTime} - ${slot.endTime}`}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#16222F]/5 text-[#16222F]">
                              <BookOpen className="w-3 h-3 text-[#C5A880]" />
                              {slot.subject}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-[#64748B]">
                            {slot.classroomName || 'Salle attribuée'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#94A3B8] text-sm">
                  Aucun créneau d'enseignement assigné dans l'emploi du temps actif.
                </div>
              )}
            </div>

            <div className="academy-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C5A880]" />
                  <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                    Évaluations en cours
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('grades')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#C5A880] flex items-center gap-1 transition-colors"
                >
                  <span>Gérer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {stats?.upcomingExams && stats.upcomingExams.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingExams.slice(0, 5).map((exam) => (
                    <div
                      key={exam.id}
                      className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#16222F]">
                          {exam.title || exam.name || `Examen #${exam.id}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Ouvert
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Coeff: {exam.coefficient || 1}</span>
                        <span>Date: {exam.examDate || 'À planifier'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#94A3B8] text-sm">
                  Toutes les évaluations sont clôturées ou aucune n'a été créée.
                </div>
              )}

              <div className="pt-2 border-t border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#16222F] uppercase tracking-wider mb-2">
                  Annonces & Événements
                </h3>
                {stats?.events && stats.events.length > 0 ? (
                  <div className="space-y-2">
                    {stats.events.slice(0, 3).map((evt) => (
                      <div key={evt.id} className="text-xs text-[#64748B] flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-[#16222F]">{evt.title}</p>
                          <p className="text-[10px] text-[#94A3B8]">{evt.startDate || 'Date à venir'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#94A3B8]">Aucun événement récent.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
