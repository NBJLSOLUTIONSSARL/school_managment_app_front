import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Award,
  TrendingUp,
  Download,
  Plus,
  Search,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { evaluationService } from '../services/evaluationService';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';

export default function GradesView() {
  const { searchQuery, hasAnyRole, currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalError, setModalError] = useState(null);
  const [localSearch, setLocalSearch] = useState('');

  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isBatchGradeOpen, setIsBatchGradeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [examForm, setExamForm] = useState({
    title: '',
    type: 'EXAM',
    date: new Date().toISOString().split('T')[0],
    maxScore: 20,
    coefficient: 2.0,
    locked: false,
    teacherId: 2,
  });

  const [batchScores, setBatchScores] = useState({});

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STAFF']);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsRes, stuRes, rcRes, teachRes] = await Promise.allSettled([
        evaluationService.getExams(),
        studentService.getStudents({ page: 0, size: 50 }),
        evaluationService.getReportCards(),
        teacherService.getTeachers()
      ]);

      const examsList = examsRes.status === 'fulfilled' && Array.isArray(examsRes.value) ? examsRes.value : [];
      const stuList = stuRes.status === 'fulfilled' ? (stuRes.value?.content || (Array.isArray(stuRes.value) ? stuRes.value : [])) : [];
      const rcList = rcRes.status === 'fulfilled' && Array.isArray(rcRes.value) ? rcRes.value : [];
      const teachList = teachRes.status === 'fulfilled' && Array.isArray(teachRes.value) ? teachRes.value : [];

      setExams(examsList);
      setStudents(stuList);
      setReportCards(rcList);
      setTeachers(teachList);

      if (teachList.length > 0) {
        setExamForm((prev) => ({ ...prev, teacherId: teachList[0].id }));
      }

      if (examsList.length > 0) {
        setSelectedExamId(examsList[0].id.toString());
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger les examens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadGradesForExam = async (examId) => {
    if (!examId) return;
    setGradesLoading(true);
    try {
      const res = await evaluationService.getGradesByExam(Number(examId));
      const list = Array.isArray(res) ? res : [];
      setGrades(list);
    } catch {
      setGrades([]);
    } finally {
      setGradesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      loadGradesForExam(selectedExamId);
    }
  }, [selectedExamId]);

  const selectedExam = exams.find((e) => e.id.toString() === selectedExamId);

  const handleOpenAddExam = () => {
    setModalError(null);
    setExamForm({
      title: '',
      type: 'EXAM',
      date: new Date().toISOString().split('T')[0],
      maxScore: 20,
      coefficient: 2.0,
      locked: false,
      teacherId: teachers.length > 0 ? teachers[0].id : 2,
    });
    setIsAddExamOpen(true);
  };

  const handleOpenBatchGrade = () => {
    setModalError(null);
    const initial = {};
    students.forEach((s) => {
      const existing = grades.find((g) => g.studentId === s.id);
      initial[s.id] = existing ? existing.score : '';
    });
    setBatchScores(initial);
    setIsBatchGradeOpen(true);
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    setError(null);
    try {
      const created = await evaluationService.createExam({
        title: examForm.title,
        type: examForm.type,
        date: examForm.date,
        maxScore: Number(examForm.maxScore),
        coefficient: Number(examForm.coefficient),
        teacherId: Number(examForm.teacherId || (teachers.length > 0 ? teachers[0].id : 2)),
      });
      setIsAddExamOpen(false);
      setSuccessMessage('Examen créé avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      const updated = await evaluationService.getExams();
      setExams(Array.isArray(updated) ? updated : []);
      if (created?.id) setSelectedExamId(created.id.toString());
    } catch (err) {
      setModalError(err.message || 'Erreur lors de la création de l\'examen.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitBatchGrade = async (e) => {
    e.preventDefault();
    if (!selectedExamId) return;
    setSubmitting(true);
    setModalError(null);
    setError(null);
    try {
      const entries = Object.entries(batchScores)
        .filter(([_, score]) => score !== '' && !isNaN(Number(score)))
        .map(([studentId, score]) => ({
          studentId: Number(studentId),
          score: Number(score),
          comment: 'Saisie officielle de note',
        }));

      if (entries.length === 0) {
        throw new Error('Veuillez renseigner au moins une note pour enregistrer.');
      }

      await evaluationService.batchGrade(Number(selectedExamId), { grades: entries });
      setIsBatchGradeOpen(false);
      setSuccessMessage('Notes enregistrées avec succès dans MySQL.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadGradesForExam(selectedExamId);
    } catch (err) {
      setModalError(err.message || 'Erreur lors de l\'enregistrement des notes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async () => {
    if (!selectedExam) return;
    try {
      const nextLocked = !selectedExam.locked;
      await evaluationService.lockExam(selectedExam.id, nextLocked);
      setSuccessMessage(nextLocked ? 'Examen verrouillé.' : 'Examen déverrouillé.');
      setTimeout(() => setSuccessMessage(''), 3000);
      const updated = await evaluationService.getExams();
      setExams(Array.isArray(updated) ? updated : []);
    } catch (err) {
      setError(err.message || 'Action impossible.');
    }
  };

  const handleDownloadReportCard = async (reportCardId) => {
    try {
      const blob = await evaluationService.downloadReportCardPdf(reportCardId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulletin_officiel_${reportCardId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert("Le bulletin PDF officiel est en cours de consolidation.");
    }
  };

  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + Number(g.score), 0) / grades.length).toFixed(1)
    : 'N/A';

  const q = (localSearch || searchQuery).toLowerCase().trim();
  const filteredGrades = grades.filter((grade) => {
    if (!q) return true;
    const student = students.find((s) => s.id === grade.studentId);
    const studentName = `${student?.user?.firstName || ''} ${student?.user?.lastName || ''}`.toLowerCase();
    const studentMat = (student?.studentNumber || '').toLowerCase();
    return studentName.includes(q) || studentMat.includes(q) || grade.studentId.toString().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Évaluations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Notes & Examens
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Consultez les notes réelles enregistrées dans MySQL et éditez les bulletins
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsAddExamOpen(true)}
              className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Créer un examen</span>
            </button>
            {reportCards.length > 0 && (
              <button
                onClick={() => handleDownloadReportCard(reportCards[0].id)}
                className="flex items-center gap-2 border border-[#D9CEBC] text-[#16222F] hover:bg-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exporter Bulletin PDF</span>
              </button>
            )}
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadInitialData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={CheckSquare}
          title="Examens organisés"
          value={exams.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Évaluations créées"
        />
        <StatCard
          icon={TrendingUp}
          title="Moyenne de l'épreuve"
          value={averageGrade !== 'N/A' ? `${averageGrade} / 20` : 'En attente'}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle={selectedExam ? selectedExam.title : 'Sélectionnez un examen'}
        />
        <StatCard
          icon={Award}
          title="Copies notées"
          value={grades.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Saisies dans MySQL"
        />
        <StatCard
          icon={FileSpreadsheet}
          title="Bulletins officiels"
          value={reportCards.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Générés en PDF"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold text-[#16222F] shrink-0">Épreuve active :</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2.5 text-xs font-semibold text-[#16222F] shadow-xs focus:outline-none cursor-pointer flex-1 max-w-md"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.type} - Coeff {exam.coefficient})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filtrer élève ou matricule..."
            className="w-full bg-white border border-[#EFECE6] rounded-full pl-9 pr-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>

        {canManage && selectedExam && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLock}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                selectedExam.locked
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {selectedExam.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{selectedExam.locked ? 'Épreuve verrouillée' : 'Verrouiller l\'épreuve'}</span>
            </button>
            {!selectedExam.locked && (
              <button
                onClick={handleOpenBatchGrade}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] transition-colors cursor-pointer"
              >
                <span>Saisie en masse des notes</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="academy-card overflow-hidden">
        {loading || gradesLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des notes enregistrées...</span>
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-[#C5A880] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-[#16222F]">
              Aucune note trouvée
            </h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Aucune note ne correspond à la recherche ou aucune saisie n'a été effectuée.
            </p>
            {canManage && !selectedExam?.locked && (
              <button
                onClick={handleOpenBatchGrade}
                className="mt-2 inline-flex items-center gap-2 bg-[#16222F] text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-[#203144]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Saisir les premières notes</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  <th className="py-4 px-6">Élève</th>
                  <th className="py-4 px-6">Identifiant Élève</th>
                  <th className="py-4 px-6">Note obtenue</th>
                  <th className="py-4 px-6">Appréciation</th>
                  <th className="py-4 px-6 text-right">Barème</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2] text-sm">
                {filteredGrades.map((grade) => {
                  const student = students.find((s) => s.id === grade.studentId);
                  const studentName = student
                    ? `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim()
                    : `Élève #${grade.studentId}`;

                  return (
                    <tr key={grade.id || grade.studentId} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#16222F]">
                        {studentName}
                      </td>
                      <td className="py-4 px-6 text-xs text-[#78716C] font-mono">
                        {student?.studentNumber || `#${grade.studentId}`}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            Number(grade.score) >= 15
                              ? 'bg-emerald-100 text-emerald-800'
                              : Number(grade.score) >= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {grade.score} / {selectedExam?.maxScore || 20}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#78716C]">
                        {grade.comment || 'Aucune observation particulière.'}
                      </td>
                      <td className="py-4 px-6 text-right text-xs font-bold text-[#16222F]">
                        Coeff. {selectedExam?.coefficient || 1.0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        title="Créer un examen dans MySQL"
      >
        <form onSubmit={handleSubmitExam} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Intitulé de l'évaluation *</label>
            <input
              type="text"
              required
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              placeholder="Ex: Devoir Surveillé 2 - Algèbre"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Enseignant responsable *</label>
            <select
              required
              value={examForm.teacherId}
              onChange={(e) => setExamForm({ ...examForm, teacherId: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.firstName} {t.user?.lastName} ({t.specialization || 'Enseignant'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Type d'épreuve *</label>
              <select
                value={examForm.type}
                onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
              >
                <option value="EXAM">Examen surveillé (DS)</option>
                <option value="TEST">Contrôle continu (CC)</option>
                <option value="PROJECT">Projet pratique</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Date de l'épreuve *</label>
              <input
                type="date"
                required
                value={examForm.date}
                onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Note maximale *</label>
              <input
                type="number"
                required
                value={examForm.maxScore}
                onChange={(e) => setExamForm({ ...examForm, maxScore: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Coefficient *</label>
              <input
                type="number"
                step="0.5"
                required
                value={examForm.coefficient}
                onChange={(e) => setExamForm({ ...examForm, coefficient: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddExamOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Créer l'examen</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBatchGradeOpen}
        onClose={() => setIsBatchGradeOpen(false)}
        title={`Saisie des notes : ${selectedExam?.title || ''}`}
      >
        <form onSubmit={handleSubmitBatchGrade} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <p className="text-xs text-[#78716C]">
            Renseignez la note sur {selectedExam?.maxScore || 20} pour chaque élève inscrit.
          </p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EFECE6]"
              >
                <div>
                  <span className="block text-xs font-bold text-[#16222F]">
                    {student.user?.firstName} {student.user?.lastName}
                  </span>
                  <span className="block text-[10px] text-[#78716C]">
                    Matricule : {student.studentNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max={selectedExam?.maxScore || 20}
                    value={batchScores[student.id] !== undefined ? batchScores[student.id] : ''}
                    onChange={(e) => setBatchScores({ ...batchScores, [student.id]: e.target.value })}
                    placeholder="/ 20"
                    className="w-20 bg-white border border-[#EFECE6] rounded-xl px-2.5 py-1.5 text-xs text-center font-bold text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsBatchGradeOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Valider toutes les notes</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
