import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, FileText, ArrowRight, Award, AlertCircle, Loader2, Folder, ExternalLink } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { evaluationService } from '../services/evaluationService';
import { homeworkService } from '../services/homeworkService';
import { documentService } from '../services/documentService';
import { communicationService } from '../services/communicationService';

export default function StudentPortalView() {
  const { currentUser, setActiveView } = useAuth();
  const [reportCards, setReportCards] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentId = currentUser?.id;

  const fetchStudentData = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const [cardsRes, hwRes, docsRes, eventsRes] = await Promise.allSettled([
        evaluationService.getReportCards({ studentId }),
        homeworkService.getSubmissionsByStudent(studentId),
        documentService.getMyDocuments(),
        communicationService.getEvents({ page: 0, size: 4 }),
      ]);

      if (cardsRes.status === 'fulfilled') {
        const cards = Array.isArray(cardsRes.value) ? cardsRes.value : [];
        setReportCards(cards);
      }

      if (hwRes.status === 'fulfilled') {
        const hwList = Array.isArray(hwRes.value) ? hwRes.value : [];
        setSubmissions(hwList);
      }

      if (docsRes.status === 'fulfilled') {
        const docsList = Array.isArray(docsRes.value) ? docsRes.value : [];
        setDocuments(docsList);
      }

      if (eventsRes.status === 'fulfilled') {
        const evts = eventsRes.value?.content || (Array.isArray(eventsRes.value) ? eventsRes.value : []);
        setEvents(evts);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données étudiantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const latestReportCard = reportCards.length > 0 ? reportCards[0] : null;
  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Élève';

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#4361EE]"></span>
            <span className="text-xs uppercase tracking-widest text-[#4361EE] font-bold">
              Portail Pédagogique
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
            Mon espace étudiant
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Bienvenue {displayName} ! Retrouvez vos résultats académiques officiels.
          </p>
        </div>

        <div className="relative w-48 h-24 rounded-2xl overflow-hidden shadow-inner hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80"
            alt="Books"
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/40" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStudentData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#64748B]">
          <Loader2 className="w-8 h-8 animate-spin text-[#4361EE]" />
          <span className="text-sm font-medium">Chargement de votre dossier scolaire...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="academy-card p-5 flex items-center gap-4 bg-white border border-[#F1F5F9]">
              <img
                src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"}
                alt={displayName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#4361EE] shadow-sm shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80";
                }}
              />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#1E293B] truncate">
                  {displayName}
                </h3>
                <p className="text-xs font-semibold text-[#64748B] mt-0.5 truncate">
                  {currentUser?.email}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Année 2026/2027
                </span>
              </div>
            </div>

            <StatCard
              icon={CheckSquare}
              title="Moyenne générale"
              value={latestReportCard ? `${latestReportCard.average}/20` : 'En attente'}
              subtitle={latestReportCard ? latestReportCard.term : 'Trimestre en cours'}
              iconBg="bg-[#EEF2FF]"
              iconColor="text-[#4361EE]"
            />
            <StatCard
              icon={Award}
              title="Mention obtenue"
              value={latestReportCard?.mention || 'Non attribuée'}
              subtitle={latestReportCard ? `Rang : ${latestReportCard.rankPosition || 1}` : 'Résultat officiel'}
              iconBg="bg-[#EEF2FF]"
              iconColor="text-[#4361EE]"
            />
            <StatCard
              icon={FileText}
              title="Devoirs rendus"
              value={submissions.length.toString()}
              subtitle="Travaux enregistrés"
              iconBg="bg-[#EEF2FF]"
              iconColor="text-[#4361EE]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="academy-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1E293B]">
                  Derniers travaux & Devoirs
                </h2>
                <span className="text-xs font-semibold text-[#64748B] bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#E2E8F0]">
                  {submissions.length} travaux
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  Aucun devoir soumis pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#1E293B]">{sub.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Soumis le {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('fr-FR') : 'Date non spécifiée'}
                        </p>
                        {sub.feedback && (
                          <p className="text-xs text-[#4361EE] mt-1 italic">
                            « {sub.feedback} »
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {sub.score !== undefined ? `${sub.score} / 20` : 'Corrigé'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="academy-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1E293B]">
                  Documents justificatifs & GED
                </h2>
                <button
                  onClick={() => setActiveView('documents')}
                  className="text-xs text-[#4361EE] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Gérer</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  Aucun document déposé pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-4 h-4 text-[#4361EE]" />
                        <div>
                          <p className="text-xs font-bold text-[#1E293B]">
                            {doc.documentTypeName || 'Document officiel'}
                          </p>
                          <span className="text-[10px] text-[#64748B]">
                            Déposé le {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : 'Récemment'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : doc.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {doc.status === 'APPROVED' ? 'Validé' : doc.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
