import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  Download,
  Edit2,
  X,
  Check,
  ChevronDown,
  Info,
  RotateCcw,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { timetableService } from '../services/timetableService';
import { departmentService } from '../services/departmentService';
import { downloadTimetablePdf } from '../services/timetablePdfService';

const SUBJECT_COLORS = {
  Mathématiques: 'bg-[#E3EFFD] text-[#1E429F] border-[#BFDBFE]',
  Français: 'bg-[#FEECE0] text-[#9A3412] border-[#FED7AA]',
  Sciences: 'bg-[#E1F7EC] text-[#065F46] border-[#A7F3D0]',
  Anglais: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
  Arabe: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
  Sport: 'bg-[#E3EFFD] text-[#1E429F] border-[#BFDBFE]',
  Musique: 'bg-[#FEECE0] text-[#9A3412] border-[#FED7AA]',
  'Arts Plastiques': 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
  Histoire: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
  Informatique: 'bg-[#E1F7EC] text-[#065F46] border-[#A7F3D0]',
};

const DEFAULT_SUBJECT_COLOR = 'bg-[#FAF7F2] text-[#1E293B] border-[#E2E8F0]';

const TIME_ROWS = [
  '08h – 09h',
  '09h – 10h',
  '10h – 11h',
  '11h – 12h',
  '14h – 15h'
];

const DAYS_LIST = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function TimetableView() {
  const [viewState, setViewState] = useState('generator');
  const [progress, setProgress] = useState(0);
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [timetablesList, setTimetablesList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('1ère A');
  const [selectedWeek, setSelectedWeek] = useState('2026 – 2027');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  useEffect(() => {
    let ignore = false;
    timetableService.getTimetables().then((tts) => {
      if (ignore) return;
      const list = Array.isArray(tts) ? tts : [tts];
      setTimetablesList(list);
      if (list.length > 0) {
        setCurrentTimetable(list[0]);
        if (list[0].className) setSelectedClass(list[0].className);
        if (list[0].academicYear) setSelectedWeek(list[0].academicYear);
      }
    }).catch(() => {});

    departmentService.getDepartments().then((depts) => {
      if (ignore) return;
      const deptList = Array.isArray(depts) ? depts : (depts?.data || []);
      setDepartments(deptList);
    }).catch(() => {});

    timetableService.getClassrooms().then((rooms) => {
      if (ignore) return;
      setClassrooms(rooms || []);
    }).catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const handleClassChange = (newClassName) => {
    setSelectedClass(newClassName);
    const found = timetablesList.find((t) => t.className === newClassName);
    if (found) {
      setCurrentTimetable(found);
      if (found.academicYear) setSelectedWeek(found.academicYear);
    } else {
      setCurrentTimetable((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          className: newClassName,
          title: 'Emploi du temps - ' + newClassName,
        };
      });
    }
  };

  const handleLaunchGeneration = () => {
    setViewState('generating');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setViewState('success');
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 6;
        const next = Math.min(prev + step, 100);
        if (next === 100) {
          clearInterval(interval);
          setViewState('success');
        }
        return next;
      });
    }, 140);

    timetableService.generate({
      className: selectedClass,
      academicYear: selectedWeek,
      semester: 'Semestre 1',
    }).then((res) => {
      if (res) {
        setCurrentTimetable(res);
      }
    });
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      setExportNotice('');
      const dataToExport = {
        schoolName: 'Académie Lumière',
        className: selectedClass || currentTimetable?.className || '1ère A',
        academicYear: selectedWeek || currentTimetable?.academicYear || '2026 – 2027',
        semester: currentTimetable?.semester || 'Semestre 1',
        slots: currentTimetable?.slots || [],
        daysList: DAYS_LIST,
        timeRows: TIME_ROWS,
      };
      await downloadTimetablePdf(dataToExport);
      setExportNotice('Emploi du temps téléchargé avec succès.');
      setTimeout(() => setExportNotice(''), 4500);
    } catch {
      setExportNotice('Erreur lors du téléchargement du PDF.');
      setTimeout(() => setExportNotice(''), 4500);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot({ ...slot });
    setIsEditModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!editingSlot || !currentTimetable) return;
    try {
      await timetableService.updateSlot(currentTimetable.id, editingSlot.id, editingSlot);
      setCurrentTimetable((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.id === editingSlot.id ? editingSlot : s)),
      }));
      setIsEditModalOpen(false);
      setEditingSlot(null);
    } catch {
      setCurrentTimetable((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.id === editingSlot.id ? editingSlot : s)),
      }));
      setIsEditModalOpen(false);
      setEditingSlot(null);
    }
  };

  const getSlot = (day, timeLabel) => {
    if (!currentTimetable?.slots) return null;
    return currentTimetable.slots.find(
      (s) => s.dayOfWeek.toLowerCase() === day.toLowerCase() && s.timeSlotLabel === timeLabel
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 font-sans">
      {viewState !== 'official' && (
        <div className="bg-white rounded-3xl border border-[#E9E4DB] shadow-sm overflow-hidden relative mb-8">
          <div className="p-6 sm:p-8 flex items-center justify-between border-b border-[#F4EFE6] relative">
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEBD8] border border-[#F4DFC6] flex items-center justify-center text-[#0E1E2E] shadow-xs">
                <Calendar className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="h-9 w-px bg-[#E5E0D5]"></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0E1E2E] tracking-tight">
                  {viewState === 'success' ? 'Résultat de la Génération' : 'Emplois du Temps'}
                </h1>
                <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
                  {viewState === 'success'
                    ? 'Vos emplois du temps ont été générés avec succès'
                    : 'Générez automatiquement les emplois du temps de votre établissement'}
                </p>
              </div>
            </div>

            {viewState === 'success' ? (
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-80 pointer-events-none overflow-hidden">
                <div className="w-full h-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80"
                    alt="Campus"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent"></div>
                  <div className="absolute inset-0 bg-[#FBF7F0]/30 mix-blend-multiply"></div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-72 pointer-events-none opacity-90 overflow-hidden">
                <svg viewBox="0 0 300 100" className="w-full h-full preserve-3d" fill="none">
                  <path
                    d="M 50,0 C 130,50 200,20 300,80 L 300,0 Z"
                    fill="#F7EDE1"
                  />
                  <path
                    d="M 120,0 C 180,60 230,30 300,95 L 300,0 Z"
                    fill="#0E1E2E"
                    opacity="0.88"
                  />
                </svg>
              </div>
            )}
          </div>

          {viewState === 'generator' && (
            <div className="p-8 sm:p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="relative mb-8 flex items-center justify-center">
                <div className="w-48 h-36 bg-[#162738] rounded-2xl shadow-xl border border-[#2B3E52] p-2 relative flex flex-col justify-between">
                  <div className="flex justify-between items-center px-3 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                  </div>
                  <div className="bg-white rounded-xl p-3 flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-4 gap-1.5 opacity-70">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-2 rounded bg-[#E2E8F0]"></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white border-4 border-[#0E1E2E] shadow-xl flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-[#0E1E2E] stroke-[2.2]" />
                  </div>
                </div>

                <div className="absolute -top-3 -left-6 w-10 h-10 rounded-full bg-[#FAF0E6] opacity-60 -z-10 blur-sm"></div>
                <div className="absolute -bottom-6 -left-8 w-16 h-16 rounded-full bg-[#EBF1FB] opacity-80 -z-10 blur-sm"></div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E1E2E] tracking-tight">
                Générer les emplois du temps
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-2 max-w-lg mx-auto leading-relaxed">
                Cliquez sur le bouton pour générer automatiquement les emplois du temps de toutes vos classes
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={handleLaunchGeneration}
                  className="px-8 py-4 rounded-full bg-[#0E1E2E] hover:bg-[#1B2F45] active:scale-[0.98] text-white font-medium text-sm sm:text-base flex items-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <Sparkles className="w-5 h-5 text-[#DFC2A0] group-hover:rotate-12 transition-transform" />
                  <span>Générer les emplois du temps</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
                {currentTimetable && (
                  <button
                    type="button"
                    onClick={() => setViewState('success')}
                    className="px-6 py-4 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#CBD5E1] text-[#0E1E2E] font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#0E1E2E]" />
                    <span>Consulter l'emploi du temps</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {viewState === 'generating' && (
            <div className="p-8 sm:p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="relative mb-8 flex items-center justify-center">
                <div className="w-48 h-36 bg-[#162738] rounded-2xl shadow-xl border border-[#2B3E52] p-2 relative flex flex-col justify-between">
                  <div className="flex justify-between items-center px-3 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                  </div>
                  <div className="bg-white rounded-xl p-3 flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-4 gap-1.5 opacity-70">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-2 rounded bg-[#E2E8F0]"></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white border-4 border-[#0E1E2E] shadow-xl flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#E2E8F0] border-t-[#0E1E2E] border-r-[#0E1E2E] animate-spin"></div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E1E2E] tracking-tight">
                Génération en cours...
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-2 max-w-lg mx-auto leading-relaxed">
                Veuillez patienter pendant que nous calculons les emplois du temps pour toutes vos classes.
              </p>

              <div className="mt-8 w-full max-w-lg flex items-center gap-4">
                <div className="flex-1 h-3.5 bg-[#EAE6DF] rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full bg-[#0E1E2E] rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-[#0E1E2E] w-12 text-right">
                  {progress}%
                </span>
              </div>

              <div className="mt-8 px-5 py-2.5 rounded-full bg-[#EBF1FB] text-[#2C4B78] text-xs font-medium flex items-center gap-2 border border-[#D3E2F8]">
                <Info className="w-4 h-4 text-[#2C4B78] shrink-0" />
                <span>Cette opération peut prendre quelques minutes.</span>
              </div>
            </div>
          )}

          {viewState === 'success' && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-[#EAF7EE] border border-[#CEEAD6] flex items-center gap-3.5 text-[#137333]">
                <div className="w-7 h-7 rounded-full bg-[#137333] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F5132]">
                    Génération réussie !
                  </h3>
                  <p className="text-xs text-[#137333]">
                    Les emplois du temps sont prêts à être consultés.
                  </p>
                </div>
              </div>

              {exportNotice && (
                <div className="p-4 rounded-2xl bg-[#EAF7EE] border border-[#CEEAD6] flex items-center gap-3 text-[#137333] animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0" />
                  <span className="text-xs font-semibold">{exportNotice}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0E1E2E] text-white flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0E1E2E]">
                    Classe : {selectedClass}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0E1E2E] focus:outline-none focus:border-[#0E1E2E] cursor-pointer shadow-xs"
                    >
                      <option value="1ère A">Classe : 1ère A</option>
                      <option value="1ère B">Classe : 1ère B</option>
                      <option value="Terminale S">Classe : Terminale S</option>
                      <option value="Terminale L">Classe : Terminale L</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0E1E2E] shadow-xs cursor-pointer">
                      <Calendar className="w-3.5 h-3.5 text-[#78716C]" />
                      <span>Semaine : {selectedWeek}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-center">
                    <thead>
                      <tr className="bg-[#0E2135] text-white">
                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider w-32 border-r border-[#1B324D]/60">
                          Horaire
                        </th>
                        {DAYS_LIST.map((day) => (
                          <th
                            key={day}
                            className="py-3 px-3 text-xs font-semibold uppercase tracking-wider border-r border-[#1B324D]/60 last:border-r-0"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] bg-white">
                      {TIME_ROWS.map((timeLabel) => (
                        <tr key={timeLabel} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="py-3 px-4 border-r border-[#EFECE6] align-middle">
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-[#FDEEDC] text-[#8D4B26] text-xs font-semibold">
                              {timeLabel}
                            </span>
                          </td>
                          {DAYS_LIST.map((day) => {
                            const slot = getSlot(day, timeLabel);
                            const subjectName = slot?.subject || 'Libre';
                            const badgeStyle = SUBJECT_COLORS[subjectName] || DEFAULT_SUBJECT_COLOR;

                            return (
                              <td
                                key={day}
                                className="p-2 border-r border-[#EFECE6] last:border-r-0 align-middle"
                              >
                                {slot ? (
                                  <div
                                    onClick={() => handleOpenEdit(slot)}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer hover:shadow-xs active:scale-[0.98] ${badgeStyle}`}
                                  >
                                    <span>{slot.subject}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-300 italic font-normal">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F4EFE6]">
                <button
                  type="button"
                  onClick={() => setViewState('generator')}
                  className="text-xs font-medium text-[#78716C] hover:text-[#0E1E2E] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nouvelle planification</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentTimetable?.slots?.[0]) {
                        handleOpenEdit(currentTimetable.slots[0]);
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-[#0E1E2E] border border-[#CBD5E1] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#0E1E2E]" />
                    <span>Modifier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewState('official')}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-[#0E1E2E] border border-[#CBD5E1] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0E1E2E]" />
                    <span>Aperçu officiel</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleExportPDF}
                    className="px-6 py-2.5 rounded-full bg-[#0E1E2E] hover:bg-[#1B2F45] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>{isExporting ? 'Génération...' : 'Exporter en PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewState === 'official' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="print:hidden flex items-center justify-between pb-4 border-b border-[#E9E4DB]">
            <button
              onClick={() => setViewState('success')}
              className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0E1E2E] flex items-center gap-2 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la grille</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportPDF}
                className="px-6 py-2.5 rounded-full bg-[#0E1E2E] hover:bg-[#1B2F45] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 text-[#DFC2A0] animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-[#DFC2A0]" />
                )}
                <span>{isExporting ? 'Génération...' : 'Exporter en PDF'}</span>
              </button>
            </div>
          </div>

          {exportNotice && (
            <div className="p-4 rounded-2xl bg-[#EAF7EE] border border-[#CEEAD6] flex items-center gap-3 text-[#137333] animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0" />
              <span className="text-xs font-semibold">{exportNotice}</span>
            </div>
          )}

          <div
            id="official-navy-gold-timetable"
            className="bg-white p-8 sm:p-12 rounded-3xl border border-[#C5A880]/40 shadow-xl text-[#0E1E2E] max-w-5xl mx-auto print:border-none print:shadow-none print:m-0 print:p-4"
          >
            <div className="flex items-start justify-between pb-6 relative">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#C5A880]" fill="currentColor">
                    <path d="M 50 15 C 30 15 15 35 15 55 C 15 75 30 90 50 90 C 70 90 85 75 85 55 C 85 35 70 15 50 15 Z" fill="none" stroke="#C5A880" strokeWidth="2.5" />
                    <path d="M 50 25 C 42 25 35 32 35 40 C 35 46 39 51 44 53 L 44 60 L 56 60 L 56 53 C 61 51 65 46 65 40 C 65 32 58 25 50 25 Z" fill="#0E1E2E" />
                    <path d="M 28 45 C 24 38 20 45 22 55 C 24 65 30 72 35 77" fill="none" stroke="#C5A880" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 72 45 C 76 38 80 45 78 55 C 76 65 70 72 65 77" fill="none" stroke="#C5A880" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E1E2E] tracking-tight">
                    Académie Lumière
                  </h1>
                  <p className="text-xs font-serif italic text-[#78716C] mt-0.5 tracking-wide">
                    Apprendre • Réussir • Grandir
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-[#FAF7F2] border border-[#E9E4DB] flex items-center gap-2 text-xs font-semibold text-[#0E1E2E] shadow-2xs">
                  <Calendar className="w-4 h-4 text-[#C5A880]" />
                  <span>Année scolaire : {selectedWeek}</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#FAF7F2] border border-[#E9E4DB] flex items-center gap-2 text-xs font-semibold text-[#0E1E2E] shadow-2xs">
                  <span>Période : {currentTimetable?.semester || 'Semestre 1'}</span>
                </div>
              </div>

              <div className="absolute right-0 top-0 w-80 h-24 overflow-hidden pointer-events-none rounded-2xl opacity-20 hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80"
                  alt="Campus Header"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="my-6 flex flex-col items-center justify-center text-center">
              <div className="relative inline-flex items-center gap-3 px-10 py-3 rounded-full bg-[#0E1E2E] border-2 border-[#C5A880] text-white shadow-md">
                <Calendar className="w-5 h-5 text-[#DFC2A0]" />
                <span className="text-xl sm:text-2xl font-serif font-bold tracking-wide">
                  Emploi du Temps
                </span>
              </div>

              <div className="mt-3 flex items-center gap-4 w-full max-w-md justify-center">
                <div className="flex-1 h-px bg-[#C5A880]/60"></div>
                <div className="px-6 py-1.5 rounded-full border border-[#C5A880] bg-[#FAF7F2] text-[#0E1E2E] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0E1E2E]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                  <span>Classe : {selectedClass}</span>
                </div>
                <div className="flex-1 h-px bg-[#C5A880]/60"></div>
              </div>
            </div>

            <div className="my-6 rounded-2xl overflow-hidden border border-[#CBD5E1]">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="bg-[#0E1E2E] text-white">
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-36 border-r border-[#243547]">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#DFC2A0]" />
                        <span>Horaire</span>
                      </div>
                    </th>
                    {DAYS_LIST.map((day) => (
                      <th
                        key={day}
                        className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-[#243547] last:border-r-0"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {TIME_ROWS.map((timeLabel, idx) => (
                    <React.Fragment key={timeLabel}>
                      {idx === 4 && (
                        <tr className="bg-[#FFF8EC] border-y-2 border-[#DFC2A0]/80">
                          <td className="py-2.5 px-4 font-bold text-xs text-[#8D4B26] bg-[#FCEBD8] border-r border-[#DFC2A0]">
                            12h – 14h
                          </td>
                          <td
                            colSpan={DAYS_LIST.length}
                            className="py-2.5 px-4 text-xs font-bold text-[#8D4B26] tracking-widest uppercase font-serif"
                          >
                            ☕ Pause Déjeuner
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-xs text-[#0E1E2E] bg-[#FFF8EC] border-r border-[#E2E8F0]">
                          {timeLabel}
                        </td>
                        {DAYS_LIST.map((day) => {
                          const slot = getSlot(day, timeLabel);
                          return (
                            <td
                              key={day}
                              className="py-3 px-3 text-xs bg-white border-r border-[#E2E8F0] last:border-r-0 align-middle"
                            >
                              {slot && slot.subject && slot.subject !== '—' && slot.subject.toLowerCase() !== 'libre' ? (
                                <div className="space-y-1">
                                  <div className="font-bold text-xs text-[#0E1E2E]">
                                    {slot.subject}
                                  </div>
                                  {slot.teacherName && (
                                    <div className="text-[11px] text-[#475569] font-medium">
                                      👤 {slot.teacherName}
                                    </div>
                                  )}
                                  {slot.classroomName && (
                                    <div className="text-[10px] text-[#64748B]">
                                      📍 {slot.classroomName}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300 italic font-normal">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#C5A880]/40">
              <div className="w-40 hidden sm:block opacity-70">
                <svg viewBox="0 0 150 40" fill="none">
                  <path d="M 0 35 C 50 10 100 40 150 15" stroke="#C5A880" strokeWidth="2" />
                  <path d="M 20 40 C 70 15 110 35 150 25" stroke="#0E1E2E" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="text-center">
                <span className="font-serif italic text-base sm:text-lg text-[#0E1E2E]">
                  Bonne année scolaire !
                </span>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-serif font-bold text-[#0E1E2E]">
                  Le Directeur
                </span>
                <div className="w-32 h-0.5 bg-[#0E1E2E] mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 bg-[#0E1E2E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9E4DB] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
              <h3 className="font-serif font-bold text-lg text-[#0E1E2E]">
                Modifier le créneau
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0E1E2E] mb-1">
                  Matière
                </label>
                <input
                  type="text"
                  value={editingSlot.subject}
                  onChange={(e) => setEditingSlot({ ...editingSlot, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#0E1E2E] focus:outline-none focus:border-[#0E1E2E]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0E1E2E] mb-1">
                    Jour
                  </label>
                  <select
                    value={editingSlot.dayOfWeek}
                    onChange={(e) => setEditingSlot({ ...editingSlot, dayOfWeek: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#0E1E2E]"
                  >
                    {DAYS_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0E1E2E] mb-1">
                    Horaire
                  </label>
                  <select
                    value={editingSlot.timeSlotLabel}
                    onChange={(e) => setEditingSlot({ ...editingSlot, timeSlotLabel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#0E1E2E]"
                  >
                    {TIME_ROWS.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0E1E2E] mb-1">
                  Enseignant
                </label>
                <input
                  type="text"
                  value={editingSlot.teacherName || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, teacherName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#0E1E2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0E1E2E] mb-1">
                  Salle
                </label>
                <select
                  value={editingSlot.classroomName || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, classroomName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#0E1E2E]"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EFE6]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E1E2E] text-white text-xs font-semibold hover:bg-[#1B2F45] cursor-pointer shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
