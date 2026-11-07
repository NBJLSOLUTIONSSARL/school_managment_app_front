import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Eye,
  Plus,
  RefreshCw,
  Clock,
  Check,
  X,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  User,
  FileSpreadsheet,
  Copy,
  Database,
  ArrowRight,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import EduTrackLogo from '../components/common/EduTrackLogo';
import HeroBanner from '../components/common/HeroBanner';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';

const AVATAR_COLORS = [
  'bg-[#DBEAFE] text-[#1D4ED8]',
  'bg-[#DCFCE7] text-[#15803D]',
  'bg-[#FEF3C7] text-[#B45309]',
  'bg-[#EDE9FE] text-[#6D28D9]',
  'bg-[#FFE4E6] text-[#E11D48]',
  'bg-[#E0E7FF] text-[#4361EE]',
];

export default function AdmissionsPage() {
  const { currentUser, setActiveView, hasAnyRole } = useAuth();
  const isInsideApp = Boolean(currentUser);
  const canManage = isInsideApp && (currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_STAFF'));

  const [activeTab, setActiveTab] = useState(canManage ? 'all' : 'form'); // 'all' | 'table' | 'form'
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SUBMITTED, ACCEPTED, REJECTED, CONVERTED
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const successTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    studentFirstName: '',
    studentLastName: '',
    birthDate: '',
    gender: 'F',
    targetClass: '1ère Année / CP',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianProfession: '',
    previousSchool: '',
    motivation: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCandidateData, setSubmittedCandidateData] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const loadApplications = async () => {
    if (!canManage) return;
    setLoadingApps(true);
    try {
      const res = await applicationService.getApplications();
      const list = res.content || (Array.isArray(res) ? res : []);
      setApplications(list);
    } catch (err) {
      console.warn('Failed to load applications from MySQL:', err.message);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (canManage) {
      loadApplications();
    }
  }, [canManage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const fullName = `${formData.studentFirstName} ${formData.studentLastName}`.trim();

    try {
      const payload = {
        candidateName: fullName,
        candidateBirthDate: formData.birthDate,
        targetClass: formData.targetClass,
        gender: formData.gender,
        guardianFullName: formData.guardianName,
        guardianPhoneNumber: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        guardianProfession: formData.guardianProfession || 'Parent',
        previousSchool: formData.previousSchool,
        motivation: formData.motivation,
      };

      const formDataToSend = new FormData();
      const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      formDataToSend.append('data', jsonBlob);

      const res = await applicationService.submitPublicApplication(formDataToSend);
      const assignedTracking = res?.candidateNumber || res?.id || `CND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setTrackingNumber(assignedTracking);

      const newApp = {
        id: res?.id || Date.now(),
        candidateName: fullName,
        candidateBirthDate: formData.birthDate,
        targetClass: formData.targetClass,
        gender: formData.gender,
        guardianFullName: formData.guardianName,
        guardianPhoneNumber: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        guardianProfession: formData.guardianProfession,
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED',
        previousSchool: formData.previousSchool,
        motivation: formData.motivation,
        studentId: null,
      };

      if (canManage) {
        setApplications((prev) => [newApp, ...prev]);
      }
      setSubmittedCandidateData(newApp);
      setIsSubmitted(true);

      setSuccessAction(`Nouvelle candidature enregistrée dans MySQL : ${fullName}`);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessAction(''), 5000);
    } catch (err) {
      setFormError(err.message || 'Erreur lors de l’enregistrement de la candidature.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordDecision = async (appId, decision) => {
    if (!canManage) return;
    try {
      await applicationService.recordDecision(appId, {
        status: decision,
        decisionNote: `Dossier ${
          decision === 'ACCEPTED' ? 'accepté' : 'ajourné'
        } lors de la commission d'admission.`,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, status: decision }
            : app
        )
      );

      if (selectedApplication?.id === appId) {
        setSelectedApplication((prev) => (prev ? { ...prev, status: decision } : null));
      }

      setSuccessAction(
        `Décision enregistrée dans MySQL : dossier ${
          decision === 'ACCEPTED' ? 'Accepté' : 'Refusé'
        }.`
      );
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessAction(''), 4000);
    } catch (err) {
      alert(err.message || 'Impossible d’enregistrer la décision.');
    }
  };

  const handleConvertStudent = async (appId) => {
    if (!canManage) return;
    try {
      const res = await applicationService.convertToStudent(appId);
      const assignedStudentId = res?.studentId || res?.id || Math.floor(100 + Math.random() * 900);

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, studentId: assignedStudentId, status: 'CONVERTED' }
            : app
        )
      );

      if (selectedApplication?.id === appId) {
        setSelectedApplication((prev) =>
          prev ? { ...prev, studentId: assignedStudentId, status: 'CONVERTED' } : null
        );
      }

      setSuccessAction('Candidat converti avec succès en élève actif dans la table MySQL !');
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessAction(''), 4000);
    } catch (err) {
      alert(err.message || 'Erreur lors de la conversion en élève.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedTracking(false), 2000);
  };

  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (statusFilter === 'SUBMITTED' && app.status !== 'SUBMITTED') return false;
    if (statusFilter === 'ACCEPTED' && app.status !== 'ACCEPTED') return false;
    if (statusFilter === 'REJECTED' && app.status !== 'REJECTED') return false;
    if (statusFilter === 'CONVERTED' && !app.studentId && app.status !== 'CONVERTED') return false;

    // Search query
    if (!localSearch.trim()) return true;
    const term = localSearch.toLowerCase().trim();
    const name = (app.candidateName || '').toLowerCase();
    const guard = (app.guardianFullName || '').toLowerCase();
    const phone = (app.guardianPhoneNumber || '').toLowerCase();
    const email = (app.guardianEmail || '').toLowerCase();
    const st = (app.status || '').toLowerCase();
    const target = (app.targetClass || '').toLowerCase();
    return (
      name.includes(term) ||
      guard.includes(term) ||
      phone.includes(term) ||
      email.includes(term) ||
      st.includes(term) ||
      target.includes(term)
    );
  });

  const submittedCount = applications.filter((a) => a.status === 'SUBMITTED').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;
  const convertedCount = applications.filter((a) => a.studentId || a.status === 'CONVERTED').length;

  const content = (
    <div className="space-y-6 pb-10">
      {/* EduTrack Hero Banner */}
      <HeroBanner
        title="Admissions & Candidatures"
        description="Gestion complète des candidatures enregistrées dans la base de données MySQL et formulaire de dépôt de dossier en ligne."
        buttonText={canManage ? (activeTab === 'form' ? 'Voir le tableau MySQL' : '+ Nouvelle candidature') : undefined}
        buttonIcon={canManage ? (activeTab === 'form' ? Database : Plus) : undefined}
        onButtonClick={canManage ? () => setActiveTab(activeTab === 'form' ? 'table' : 'form') : undefined}
        icon={FileCheck}
      />

      {/* Action / Success Banner */}
      {successAction && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successAction}</span>
          </div>
          <button
            onClick={() => setSuccessAction('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs (for Managers) */}
      {canManage && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#EEF2FF] text-[#4361EE] shadow-2xs font-bold'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Vue complète (Tableau & Formulaire)</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-[#EEF2FF] text-[#4361EE] shadow-2xs font-bold'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Candidatures dans MySQL</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'table' ? 'bg-[#4361EE] text-white' : 'bg-slate-100 text-[#64748B]'
                }`}
              >
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-[#EEF2FF] text-[#4361EE] shadow-2xs font-bold'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Formulaire de candidature</span>
            </button>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[11px] font-medium text-[#64748B] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Table MySQL : <strong className="text-[#1E293B]">applications</strong></span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: TABLE OF CANDIDATURES DANS MYSQL (ADMIN/STAFF)*/}
      {/* ======================================================== */}
      {canManage && (activeTab === 'all' || activeTab === 'table') && (
        <div className="space-y-4">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="edutrack-card bg-white p-4 sm:p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
                  {applications.length}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-[#64748B] mt-2">Total dans MySQL</p>
              <p className="text-[11px] text-[#94A3B8]">Dossiers enregistrés</p>
            </div>

            <div className="edutrack-card bg-white p-4 sm:p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#B45309]">
                  {submittedCount}
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-[#64748B] mt-2">En attente</p>
              <p className="text-[11px] text-[#94A3B8]">À évaluer</p>
            </div>

            <div className="edutrack-card bg-white p-4 sm:p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#15803D]">
                  {acceptedCount}
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-[#64748B] mt-2">Acceptées</p>
              <p className="text-[11px] text-[#94A3B8]">Admissions validées</p>
            </div>

            <div className="edutrack-card bg-white p-4 sm:p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#4361EE]">
                  {convertedCount}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-[#64748B] mt-2">Convertis en élèves</p>
              <p className="text-[11px] text-[#94A3B8]">Inscrits dans MySQL</p>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="edutrack-card bg-white rounded-2xl border border-[#F1F5F9] shadow-xs overflow-hidden">
            {/* Table Header & Controls */}
            <div className="p-5 sm:p-6 border-b border-[#F1F5F9] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                    Candidatures enregistrées dans MySQL
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4361EE] text-xs font-bold">
                    {filteredApplications.length}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Consultation, validation des dossiers et conversion vers la table des élèves.
                </p>
              </div>

              {/* Search & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Filtrer candidat, tuteur, statut..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-9 pr-8 py-2 text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                  />
                  {localSearch && (
                    <button
                      onClick={() => setLocalSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  onClick={loadApplications}
                  disabled={loadingApps}
                  title="Actualiser les données MySQL"
                  className="p-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:text-[#4361EE] hover:bg-[#EEF2FF] transition cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingApps ? 'animate-spin text-[#4361EE]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="px-5 sm:px-6 py-2.5 bg-[#F8FAFC]/60 border-b border-[#F1F5F9] flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mr-1">
                Filtre :
              </span>
              {[
                { id: 'ALL', label: 'Toutes' },
                { id: 'SUBMITTED', label: 'En attente' },
                { id: 'ACCEPTED', label: 'Acceptées' },
                { id: 'REJECTED', label: 'Refusées' },
                { id: 'CONVERTED', label: 'Converties' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    statusFilter === f.id
                      ? 'bg-[#4361EE] text-white shadow-2xs'
                      : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Applications Table */}
            {loadingApps && applications.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#64748B]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4361EE]" />
                <span className="text-xs sm:text-sm font-medium">
                  Chargement des candidatures depuis MySQL...
                </span>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
                  <Search className="w-8 h-8 opacity-40" />
                  <p className="font-semibold text-sm text-[#64748B]">
                    Aucune candidature trouvée
                  </p>
                  <p className="text-xs max-w-sm">
                    {localSearch
                      ? `Aucun résultat pour "${localSearch}". Essayez un autre mot-clé ou effacez le filtre.`
                      : 'Aucun dossier ne correspond au filtre sélectionné.'}
                  </p>
                  {localSearch && (
                    <button
                      onClick={() => setLocalSearch('')}
                      className="mt-2 text-xs text-[#4361EE] hover:underline font-semibold cursor-pointer"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider bg-white">
                      <th className="py-3.5 px-5 font-semibold">Candidat</th>
                      <th className="py-3.5 px-5 font-semibold">Classe & Âge</th>
                      <th className="py-3.5 px-5 font-semibold">Tuteur Légal & Contact</th>
                      <th className="py-3.5 px-5 font-semibold">Date de Dépôt</th>
                      <th className="py-3.5 px-5 font-semibold">Statut MySQL</th>
                      <th className="py-3.5 px-5 text-right font-semibold">Actions & Décisions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {filteredApplications.map((app, idx) => {
                      const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      const [first = '', ...rest] = (app.candidateName || '').split(' ');
                      const initials = `${first[0] || 'C'}${rest[0]?.[0] || 'N'}`.toUpperCase();

                      let age = null;
                      if (app.candidateBirthDate) {
                        const birth = new Date(app.candidateBirthDate);
                        if (!isNaN(birth.getTime())) {
                          const diff = Date.now() - birth.getTime();
                          age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                        }
                      }

                      return (
                        <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                          {/* Candidat */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${colorClass}`}
                              >
                                {initials}
                              </div>
                              <div>
                                <span className="font-bold text-[#1E293B] block">
                                  {app.candidateName}
                                </span>
                                <span className="text-[11px] text-[#94A3B8] font-mono">
                                  {app.candidateNumber || `CND-2026-${String(app.id).padStart(4, '0')}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Classe & Âge */}
                          <td className="py-3.5 px-5">
                            <div className="space-y-0.5">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#1E293B] font-semibold text-[11px]">
                                {app.targetClass || '1ère Année / CP'}
                              </span>
                              <div className="text-[11px] text-[#64748B]">
                                {app.candidateBirthDate || '-'}
                                {age !== null && (
                                  <span className="text-[#94A3B8] ml-1">({age} ans)</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Tuteur & Contact */}
                          <td className="py-3.5 px-5">
                            <div>
                              <span className="font-semibold text-[#1E293B] block">
                                {app.guardianFullName || 'Tuteur'}
                              </span>
                              <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                                {app.guardianPhoneNumber && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#94A3B8]" />
                                    {app.guardianPhoneNumber}
                                  </span>
                                )}
                                {app.guardianProfession && (
                                  <span className="text-[#94A3B8] text-[10px]">
                                    • {app.guardianProfession}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Date de dépôt */}
                          <td className="py-3.5 px-5 text-[#64748B]">
                            {app.submittedAt ? (
                              <div className="space-y-0.5">
                                <span className="block font-medium text-[#1E293B]">
                                  {new Date(app.submittedAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span className="text-[10px] text-[#94A3B8]">
                                  {new Date(app.submittedAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* Statut MySQL */}
                          <td className="py-3.5 px-5">
                            {app.studentId || app.status === 'CONVERTED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4361EE] border border-[#C7D2FE]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4361EE]"></span>
                                <span>Élève inscrit (ID: #{app.studentId || 101})</span>
                              </span>
                            ) : app.status === 'ACCEPTED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Accepté</span>
                              </span>
                            ) : app.status === 'REJECTED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span>Refusé</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>En attente</span>
                              </span>
                            )}
                          </td>

                          {/* Actions & Décision */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedApplication(app)}
                                title="Voir les détails du dossier"
                                className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#4361EE] hover:bg-[#EEF2FF] transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Pending actions */}
                              {app.status === 'SUBMITTED' && (
                                <>
                                  <button
                                    onClick={() => handleRecordDecision(app.id, 'ACCEPTED')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>Accepter</span>
                                  </button>
                                  <button
                                    onClick={() => handleRecordDecision(app.id, 'REJECTED')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                                  >
                                    <X className="w-3 h-3 stroke-[2.5]" />
                                    <span>Refuser</span>
                                  </button>
                                </>
                              )}

                              {/* Accepted action: Convert to student */}
                              {app.status === 'ACCEPTED' && !app.studentId && (
                                <button
                                  onClick={() => handleConvertStudent(app.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4361EE] hover:bg-[#3451D1] text-white rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-2xs active:scale-95"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>Convertir en élève</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: FORM OF CANDIDATURE (SOPHISTICATED)           */}
      {/* ======================================================== */}
      {(!canManage || activeTab === 'all' || activeTab === 'form') && (
        <div className="space-y-4 pt-2">
          {canManage && activeTab === 'all' && (
            <div className="flex items-center gap-3 pt-4">
              <div className="h-px bg-[#E2E8F0] flex-1"></div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-[#E2E8F0] shadow-2xs">
                Formulaire d’admission
              </span>
              <div className="h-px bg-[#E2E8F0] flex-1"></div>
            </div>
          )}

          <div className="edutrack-card bg-white rounded-2xl border border-[#F1F5F9] p-6 sm:p-10 shadow-xs max-w-4xl mx-auto w-full">
            {isSubmitted ? (
              /* Success confirmation state */
              <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold">
                    Candidature enregistrée avec succès dans MySQL
                  </span>
                  <h3 className="text-2xl font-bold text-[#1E293B]">
                    Dossier d’admission transmis !
                  </h3>
                  <p className="text-sm text-[#64748B] max-w-lg mx-auto leading-relaxed">
                    Les informations ont été inscrites directement dans la base de données de l’établissement et sont prêtes à être examinées par l’administration.
                  </p>
                </div>

                {/* Tracking Code Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] inline-flex flex-col sm:flex-row items-center gap-4 text-left shadow-2xs">
                  <div>
                    <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                      Numéro de dossier officiel
                    </span>
                    <span className="text-lg font-mono font-bold text-[#1E293B]">
                      {trackingNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(trackingNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#1E293B] hover:bg-[#F1F5F9] transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{copiedTracking ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                {/* Candidate Summary */}
                {submittedCandidateData && (
                  <div className="max-w-md mx-auto p-4 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]/50 text-xs text-[#64748B] space-y-1 text-left">
                    <p>
                      <strong>Élève :</strong> {submittedCandidateData.candidateName} (
                      {submittedCandidateData.targetClass})
                    </p>
                    <p>
                      <strong>Tuteur légal :</strong> {submittedCandidateData.guardianFullName} (
                      {submittedCandidateData.guardianPhoneNumber})
                    </p>
                    <p>
                      <strong>Date de dépôt :</strong>{' '}
                      {new Date().toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  {canManage && (
                    <button
                      onClick={() => {
                        setActiveTab('table');
                        setIsSubmitted(false);
                      }}
                      className="px-6 py-2.5 bg-[#4361EE] hover:bg-[#3451D1] text-white rounded-full text-xs font-semibold shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Database className="w-4 h-4" />
                      <span>Voir dans le tableau MySQL</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        studentFirstName: '',
                        studentLastName: '',
                        birthDate: '',
                        gender: 'F',
                        targetClass: '1ère Année / CP',
                        guardianName: '',
                        guardianEmail: '',
                        guardianPhone: '',
                        guardianProfession: '',
                        previousSchool: '',
                        motivation: '',
                      });
                    }}
                    className="px-6 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-full text-xs font-semibold transition cursor-pointer"
                  >
                    Déposer une autre candidature
                  </button>
                </div>
              </div>
            ) : (
              /* Actual Sophisticated Form */
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#1E293B]">
                        Formulaire de candidature en ligne
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Enregistrement direct dans la table MySQL des admissions
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-medium self-start sm:self-auto">
                    <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" />
                    Année scolaire 2026-2027
                  </span>
                </div>

                {formError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Candidate Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                    <User className="w-4 h-4 text-[#4361EE]" />
                    <span>1. Informations sur le candidat (Élève)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Prénom de l'élève <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Emma"
                        value={formData.studentFirstName}
                        onChange={(e) =>
                          setFormData({ ...formData, studentFirstName: e.target.value })
                        }
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Nom de l'élève <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Johnson"
                        value={formData.studentLastName}
                        onChange={(e) =>
                          setFormData({ ...formData, studentLastName: e.target.value })
                        }
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Date de naissance <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Genre
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      >
                        <option value="F">Féminin</option>
                        <option value="M">Masculin</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Classe demandée <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.targetClass}
                        onChange={(e) =>
                          setFormData({ ...formData, targetClass: e.target.value })
                        }
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      >
                        <option value="Maternelle">Maternelle</option>
                        <option value="1ère Année / CP">1ère Année / CP</option>
                        <option value="CE1">CE1</option>
                        <option value="CE2">CE2</option>
                        <option value="CM1">CM1</option>
                        <option value="CM2">CM2</option>
                        <option value="6ème Collège">6ème Collège</option>
                        <option value="5ème Collège">5ème Collège</option>
                        <option value="4ème Collège">4ème Collège</option>
                        <option value="3ème Collège">3ème Collège</option>
                        <option value="Seconde Générale">Seconde Générale</option>
                        <option value="Première">Première</option>
                        <option value="Terminale">Terminale</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Établissement scolaire d'origine
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: École Primaire Jean Moulin"
                      value={formData.previousSchool}
                      onChange={(e) =>
                        setFormData({ ...formData, previousSchool: e.target.value })
                      }
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Section 2: Guardian Info */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-[#4361EE]" />
                    <span>2. Responsable légal / Tuteur</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Nom complet du tuteur <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Marc Johnson"
                        value={formData.guardianName}
                        onChange={(e) =>
                          setFormData({ ...formData, guardianName: e.target.value })
                        }
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Téléphone de contact <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: +33 6 12 34 56 78"
                        value={formData.guardianPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, guardianPhone: e.target.value })
                        }
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Adresse e-mail
                      </label>
                      <input
                        type="email"
                        placeholder="Ex: parent@example.com"
                        value={formData.guardianEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, guardianEmail: e.target.value })
                        }
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Profession du responsable
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Enseignant, Cadre, Médecin..."
                        value={formData.guardianProfession}
                        onChange={(e) =>
                          setFormData({ ...formData, guardianProfession: e.target.value })
                        }
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Motivation */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#4361EE]" />
                    <span>3. Projet pédagogique & Motivation</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Motivation ou remarques particulières pour la commission
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Précisez ici les attentes, compétences particulières ou le parcours souhaité..."
                      value={formData.motivation}
                      onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Submit Row */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F1F5F9]">
                  <p className="text-[11px] text-[#94A3B8]">
                    Les données soumises sont stockées et protégées conformément au RGPD.
                  </p>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          studentFirstName: '',
                          studentLastName: '',
                          birthDate: '',
                          gender: 'F',
                          targetClass: '1ère Année / CP',
                          guardianName: '',
                          guardianEmail: '',
                          guardianPhone: '',
                          guardianProfession: '',
                          previousSchool: '',
                          motivation: '',
                        })
                      }
                      className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition cursor-pointer"
                    >
                      Effacer
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 sm:flex-none px-7 py-2.5 bg-[#4361EE] hover:bg-[#3451D1] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enregistrement dans MySQL...</span>
                        </>
                      ) : (
                        <>
                          <span>Soumettre la candidature</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Candidate File Detail Modal */}
      {selectedApplication && (
        <Modal
          isOpen={Boolean(selectedApplication)}
          onClose={() => setSelectedApplication(null)}
          title={`Dossier d’admission : ${selectedApplication.candidateName}`}
          subtitle={`Numéro de suivi : ${
            selectedApplication.candidateNumber || `CND-2026-${selectedApplication.id}`
          }`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Statut actuel dans MySQL
                </span>
                <span className="text-sm font-bold text-[#1E293B]">
                  {selectedApplication.studentId
                    ? `Converti en élève actif (ID #${selectedApplication.studentId})`
                    : selectedApplication.status}
                </span>
              </div>

              <div>
                {selectedApplication.studentId ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EEF2FF] text-[#4361EE]">
                    Élève Inscrit
                  </span>
                ) : selectedApplication.status === 'ACCEPTED' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                    Accepté
                  </span>
                ) : selectedApplication.status === 'REJECTED' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                    Refusé
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                    En attente
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#94A3B8] font-medium">Classe demandée</span>
                <p className="font-bold text-[#1E293B]">
                  {selectedApplication.targetClass || '1ère Année / CP'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#94A3B8] font-medium">Date de naissance</span>
                <p className="font-bold text-[#1E293B]">
                  {selectedApplication.candidateBirthDate || '-'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#94A3B8] font-medium">Tuteur légal</span>
                <p className="font-bold text-[#1E293B]">
                  {selectedApplication.guardianFullName || '-'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#94A3B8] font-medium">Téléphone du tuteur</span>
                <p className="font-bold text-[#1E293B]">
                  {selectedApplication.guardianPhoneNumber || '-'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#94A3B8] font-medium">Email</span>
                <p className="font-bold text-[#1E293B]">
                  {selectedApplication.guardianEmail || 'Non spécifié'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#94A3B8] font-medium">Profession</span>
                <p className="font-bold text-[#1E293B]">
                  {selectedApplication.guardianProfession || '-'}
                </p>
              </div>
            </div>

            {/* Motivation */}
            {selectedApplication.motivation && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Motivation / Notes de dossier
                </span>
                <p className="text-xs text-[#1E293B] leading-relaxed">
                  {selectedApplication.motivation}
                </p>
              </div>
            )}

            {/* Decision Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
              {canManage && selectedApplication.status === 'SUBMITTED' && (
                <>
                  <button
                    onClick={() => handleRecordDecision(selectedApplication.id, 'ACCEPTED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Valider & Accepter</span>
                  </button>
                  <button
                    onClick={() => handleRecordDecision(selectedApplication.id, 'REJECTED')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Ajourner / Refuser</span>
                  </button>
                </>
              )}

              {canManage && selectedApplication.status === 'ACCEPTED' && !selectedApplication.studentId && (
                <button
                  onClick={() => handleConvertStudent(selectedApplication.id)}
                  className="px-5 py-2 bg-[#4361EE] hover:bg-[#3451D1] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Convertir directement en élève actif</span>
                </button>
              )}

              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  // If viewed inside the authenticated app, render directly in layout
  if (isInsideApp) {
    return content;
  }

  // If viewed as standalone public admissions page (e.g. from LandingPage)
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col justify-between selection:bg-[#EEF2FF] selection:text-[#4361EE]">
      {/* Sleek Top Navbar inspired by LandingPage */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-5 flex items-center justify-between border-b border-[#F1F5F9] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div onClick={() => setActiveView('landing')} className="cursor-pointer">
          <EduTrackLogo size="md" />
        </div>

        <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-[#64748B]">
          <button
            onClick={() => setActiveView('landing')}
            className="hover:text-[#1E293B] transition cursor-pointer"
          >
            Accueil
          </button>
          <span className="text-[#4361EE] font-bold cursor-default">
            Admissions
          </span>
          <button
            onClick={() => setActiveView('login')}
            className="inline-flex text-xs font-semibold px-5 py-2 rounded-full bg-[#4361EE] hover:bg-[#3451D1] text-white shadow-2xs transition cursor-pointer"
          >
            Connexion
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-8">
        {content}
      </main>

      <footer className="text-center py-6 text-xs text-[#94A3B8] border-t border-[#F1F5F9] bg-white">
        EduTrack • Système officiel d'admission & gestion scolaire
      </footer>
    </div>
  );
}
