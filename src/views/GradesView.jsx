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
  FileSpreadsheet,
  FileText
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalError, setExportModalError] = useState(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearchInModal, setStudentSearchInModal] = useState('');
  const [exportPeriod, setExportPeriod] = useState('Semestre 1');

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

      if (stuList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stuList[0].id.toString());
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

  const handleOpenExportModal = (preselectedStudent = null) => {
    setExportModalError(null);
    setStudentSearchInModal('');
    if (preselectedStudent) {
      setSelectedStudentId(preselectedStudent.id.toString());
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id.toString());
    }
    setIsExportModalOpen(true);
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

  const handleGenerateBulletinPdf = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setExportModalError('Veuillez sélectionner un élève.');
      return;
    }
    setExportLoading(true);
    setExportModalError(null);
    try {
      const studentObj = students.find((s) => s.id.toString() === selectedStudentId.toString());
      const res = await evaluationService.generateReportCards({
        studentId: Number(selectedStudentId),
        term: exportPeriod,
        academicYear: '2026-2027',
      });

      const cards = res?.reportCards || res?.data?.reportCards || (Array.isArray(res) ? res : []);
      const generatedCard = cards[0];
      const cardId = generatedCard?.id;

      if (!cardId) {
        throw new Error('Impossible de générer le bulletin pour cet élève.');
      }

      const response = await evaluationService.downloadReportCardPdf(cardId);
      const studentName = studentObj
        ? `${studentObj.user?.firstName || ''}_${studentObj.user?.lastName || ''}`.trim()
        : `Eleve_${selectedStudentId}`;
      const cleanPeriod = exportPeriod.replace(/\s+/g, '_');
      const blob = response instanceof Blob ? response : new Blob([response.data || response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulletin_officiel_${studentName}_${cleanPeriod}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
      setSuccessMessage(`Bulletin PDF de ${studentObj?.user?.firstName || ''} ${studentObj?.user?.lastName || ''} (${exportPeriod}) généré avec succès.`);
      setTimeout(() => setSuccessMessage(''), 5000);
      await loadInitialData();
    } catch (err) {
      setExportModalError(err.message || 'Erreur lors de la génération du bulletin PDF.');
    } finally {
      setExportLoading(false);
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

  const filteredStudentsForModal = students.filter((s) => {
    if (!studentSearchInModal) return true;
    const sq = studentSearchInModal.toLowerCase().trim();
    const fullName = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.toLowerCase();
    const mat = (s.studentNumber || '').toLowerCase();
    return fullName.includes(sq) || mat.includes(sq);
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
              onClick={handleOpenAddExam}
              className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Créer un examen</span>
            </button>
            <button
              onClick={() => handleOpenExportModal()}
              className="flex items-center gap-2 border border-[#D9CEBC] bg-[#FAF7F2] text-[#16222F] hover:bg-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#C5A880]" />
              <span>Exporter Bulletin PDF</span>
            </button>
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
          icon={FileSpreadsheet}
          title="Examens & Épreuves"
          value={exams.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Épreuves configurées"
        />
        <StatCard
          icon={Award}
          title="Notes saisies"
          value={grades.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Pour l'examen sélectionné"
        />
        <StatCard
          icon={TrendingUp}
          title="Moyenne de l'épreuve"
          value={averageGrade !== 'N/A' ? `${averageGrade} / 20` : '—'}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Toutes notes confondues"
        />
        <StatCard
          icon={CheckSquare}
          title="Élèves inscrits"
          value={students.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Effectif total promotion"
        />
      </div>

      <div className="academy-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-[#16222F] mb-1.5 uppercase tracking-wider">
              Sélectionner l'examen / épreuve :
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#16222F] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.type}) — {exam.date} (Coeff {exam.coefficient})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && canManage && (
            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                onClick={handleToggleLock}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedExam.locked
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-[#FAF7F2] text-[#78716C] border-[#EFECE6] hover:bg-white'
                }`}
              >
                {selectedExam.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{selectedExam.locked ? 'Épreuve Verrouillée' : 'Verrouiller'}</span>
              </button>

              <button
                onClick={handleOpenBatchGrade}
                disabled={selectedExam.locked}
                className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Saisir les notes</span>
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#F4EDE2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Rechercher par élève ou matricule..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-[#16222F] placeholder:text-[#A8A29E] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#EFECE6]">
          {gradesLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#78716C]">
              <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
              <span className="text-sm font-medium">Chargement des notes MySQL...</span>
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#78716C]">
              Aucune note enregistrée pour cette épreuve.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2] font-bold text-[#78716C] uppercase">
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4 text-center">Note / {selectedExam?.maxScore || 20}</th>
                  <th className="py-3 px-4 text-center">Pondération (/20)</th>
                  <th className="py-3 px-4">Commentaire officiel</th>
                  <th className="py-3 px-4 text-right">Bulletin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2]">
                {filteredGrades.map((grade) => {
                  const student = students.find((s) => s.id === grade.studentId);
                  const maxScore = selectedExam?.maxScore || 20;
                  const normalized = (Number(grade.score) / maxScore) * 20;
                  return (
                    <tr key={grade.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#16222F]">
                        {student?.user?.firstName} {student?.user?.lastName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#78716C]">
                        {student?.studentNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-sm text-[#16222F]">
                          {Number(grade.score).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            normalized >= 14
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : normalized >= 10
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {normalized.toFixed(2)} / 20
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#78716C] italic">
                        {grade.comment || 'Saisie officielle'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenExportModal(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#EFECE6] bg-[#FAF7F2] hover:bg-white text-xs font-semibold text-[#16222F] transition-colors cursor-pointer"
                          title="Générer le bulletin pour cet élève"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Bulletin</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Générer un bulletin"
      >
        <form onSubmit={handleGenerateBulletinPdf} className="space-y-6 py-1">
          {exportModalError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{exportModalError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider">
              Élève *
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearchInModal}
                onChange={(e) => setStudentSearchInModal(e.target.value)}
                placeholder="Rechercher par nom ou matricule..."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#16222F] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            >
              <option value="">-- Sélectionner un élève --</option>
              {filteredStudentsForModal.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.firstName} {s.user?.lastName} — {s.studentNumber || 'STU-' + s.id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider">
              Période pédagogique *
            </label>
            <select
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            >
              <option value="Semestre 1">Semestre 1</option>
              <option value="Semestre 2">Semestre 2</option>
              <option value="Année complète">Année complète</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#78716C] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedStudentId || exportLoading}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-sm transition-all"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Génération du PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#C5A880]" />
                  <span>Générer le PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        title="Créer un nouvel examen / épreuve"
      >
        <form onSubmit={handleSubmitExam} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Titre de l'épreuve *</label>
            <input
              type="text"
              required
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              placeholder="Ex: Devoir Surveillé 1 - Algèbre"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Type d'évaluation</label>
              <select
                value={examForm.type}
                onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              >
                <option value="EXAM">Examen partiel</option>
                <option value="FINAL">Examen final</option>
                <option value="HOMEWORK">Devoir maison</option>
                <option value="PROJECT">Projet pratique</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Date de l'épreuve</label>
              <input
                type="date"
                required
                value={examForm.date}
                onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Barème max</label>
              <input
                type="number"
                min="1"
                required
                value={examForm.maxScore}
                onChange={(e) => setExamForm({ ...examForm, maxScore: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Coefficient</label>
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
