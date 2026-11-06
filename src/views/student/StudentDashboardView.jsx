import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  FileText,
  Bookmark,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import HeroBanner from '../../components/common/HeroBanner';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/statsService';
import { evaluationService } from '../../services/evaluationService';

export default function StudentDashboardView() {
  const { currentUser, setActiveView } = useAuth();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Élève';

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentStats, examsRes] = await Promise.allSettled([
          statsService.getStudentStats(currentUser?.id),
          evaluationService.getExams(),
        ]);

        if (studentStats.status === 'fulfilled') {
          setStats(studentStats.value);
        }
        if (examsRes.status === 'fulfilled' && Array.isArray(examsRes.value)) {
          setExams(examsRes.value);
        }
      } catch (err) {
        setError(err.message || 'Impossible de charger vos données scolaires.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-5 z-10">
          <img
            src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E8DFC9] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4361EE] text-white">
                Espace Élève
              </span>
              <span className="text-xs text-[#64748B]">
                {currentUser?.email}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif-title text-[#16222F] mt-1">
              Bienvenue, {displayName}
            </h1>
            <p className="text-sm text-[#64748B]">
              Suivez votre progression scolaire, consultez votre emploi du temps et préparez vos cours.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setActiveView('timetable')}
            className="academy-btn-primary flex items-center gap-2 text-sm shadow-md"
          >
            <Calendar className="w-4 h-4" />
            <span>Mon emploi du temps</span>
          </button>
          <button
            onClick={() => setActiveView('grades')}
            className="academy-btn-secondary flex items-center gap-2 text-sm"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Mes notes</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 text-[#4361EE] animate-spin mb-3" />
          <p className="text-sm text-[#64748B]">Chargement de votre dossier scolaire...</p>
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
              title="Moyenne générale"
              value={stats?.generalAverage ? `${stats.generalAverage}/20` : 'En attente'}
              icon={Award}
              badge={stats?.termTitle || 'Semestre 1'}
              trend="up"
            />
            <StatCard
              title="Devoirs soumis"
              value={stats?.submissionCount ?? 0}
              icon={BookOpen}
              badge="Enregistrés"
            />
            <StatCard
              title="Cours cette semaine"
              value={stats?.timetableSlots?.length ?? 0}
              icon={Clock}
              badge="Actifs"
            />
            <StatCard
              title="Année scolaire"
              value="2026 – 2027"
              icon={Sparkles}
              badge="En cours"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 academy-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4361EE]" />
                  <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                    Mes Cours & Emploi du Temps
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('timetable')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#4361EE] flex items-center gap-1 transition-colors"
                >
                  <span>Vue calendrier</span>
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
                        <th className="py-3 px-3">Professeur</th>
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
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4361EE]/5 text-[#16222F]">
                              <BookOpen className="w-3 h-3 text-[#4361EE]" />
                              {slot.subject}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-[#64748B]">
                            {slot.teacherName || 'Enseignant titulaire'}
                          </td>
                          <td className="py-3 px-3 text-xs text-[#64748B]">
                            {slot.classroomName || 'Salle de classe'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#94A3B8] text-sm">
                  Votre emploi du temps n'est pas encore publié pour ce trimestre.
                </div>
              )}
            </div>

            <div className="academy-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4361EE]" />
                  <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                    Prochaines Évaluations
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('grades')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#4361EE] flex items-center gap-1 transition-colors"
                >
                  <span>Mes notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {exams && exams.length > 0 ? (
                <div className="space-y-3">
                  {exams.slice(0, 4).map((ex) => (
                    <div
                      key={ex.id}
                      className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#16222F]">
                          {ex.title || ex.name || `Évaluation #${ex.id}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4361EE]/10 text-[#16222F]">
                          Coeff: {ex.coefficient || 1}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Date : {ex.examDate || 'Session en cours'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] text-center py-4">
                  Aucun examen programmé à court terme.
                </p>
              )}

              <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
                <button
                  onClick={() => setActiveView('library-catalog')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#E8DFC9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-[#4361EE]" />
                    <span className="text-xs font-semibold text-[#16222F]">
                      Consulter la bibliothèque
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16222F]" />
                </button>
                <button
                  onClick={() => setActiveView('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#E8DFC9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-[#4361EE]" />
                    <span className="text-xs font-semibold text-[#16222F]">
                      Consulter mes bulletins
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16222F]" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
