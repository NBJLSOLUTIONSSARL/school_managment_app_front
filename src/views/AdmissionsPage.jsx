import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Loader2, UserCheck, Eye, Sparkles, FileCheck } from 'lucide-react';
import EduTrackLogo from '../components/common/EduTrackLogo';
import HeroBanner from '../components/common/HeroBanner';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';

export default function AdmissionsPage() {
  const { setActiveView, hasAnyRole, language, setLanguage } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  const [formData, setFormData] = useState({
    studentFirstName: '',
    studentLastName: '',
    birthDate: '2012-05-15',
    gender: 'F',
    targetClass: '1ère Année',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianProfession: 'Cadre',
    previousSchool: '',
    motivation: '',
  });

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const loadApplications = async () => {
    if (!canManage) return;
    setLoadingApps(true);
    try {
      const res = await applicationService.getApplications();
      const list = res.content || (Array.isArray(res) ? res : []);
      setApplications(list);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [canManage]);

  const filteredApplications = applications.filter((app) => {
    if (!localSearch.trim()) return true;
    const term = localSearch.toLowerCase().trim();
    const name = (app.candidateName || '').toLowerCase();
    const guard = (app.guardianFullName || '').toLowerCase();
    const st = (app.status || '').toLowerCase();
    return name.includes(term) || guard.includes(term) || st.includes(term);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        candidateName: `${formData.studentFirstName} ${formData.studentLastName}`.trim(),
        candidateBirthDate: formData.birthDate,
        guardianFullName: formData.guardianName,
        guardianPhoneNumber: formData.guardianPhone,
        guardianProfession: formData.guardianProfession || 'Parent',
      };

      const formDataToSend = new FormData();
      const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      formDataToSend.append('data', jsonBlob);

      const res = await applicationService.submitPublicApplication(formDataToSend);
      const id = res?.id || `CND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setTrackingNumber(id);
      setIsSubmitted(true);
      if (canManage) await loadApplications();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la candidature.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDecision = async (appId, decision) => {
    try {
      await applicationService.recordDecision(appId, {
        status: decision,
        decisionNote: `Dossier ${decision === 'ACCEPTED' ? 'accepté' : 'ajourné'} lors de la commission d'admission.`,
      });
      setSuccessAction('Décision enregistrée avec succès.');
      setTimeout(() => setSuccessAction(''), 3000);
      await loadApplications();
    } catch (err) {
      alert(err.message || 'Impossible d\'enregistrer la décision.');
    }
  };

  const handleConvertStudent = async (appId) => {
    try {
      await applicationService.convertToStudent(appId);
      setSuccessAction('Candidat converti avec succès en élève actif dans MySQL.');
      setTimeout(() => setSuccessAction(''), 4000);
      await loadApplications();
    } catch (err) {
      alert(err.message || 'Erreur lors de la conversion en élève.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF5EB] text-[#1E293B] flex flex-col justify-between overflow-x-hidden selection:bg-[#E8DFC9] selection:text-[#16222F]">
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-7 pb-3 flex items-center justify-between">
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="EduTrack"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-serif-title text-base sm:text-lg tracking-wide text-[#16222F] font-semibold">
            EduTrack
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#16222F]/80 hover:text-[#4361EE] transition-colors cursor-pointer"
          >
            Accueil
          </button>
          <span className="text-[#4361EE] font-semibold cursor-default">
            Admissions
          </span>
          <button
            onClick={() => setActiveView('login')}
            className="text-[#16222F]/80 hover:text-[#16222F] transition-colors cursor-pointer"
          >
            Espace Sécurisé
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#EFECE6] rounded-full p-1 text-xs font-semibold text-[#78716C] shadow-sm">
            {['FR', 'EN', 'AR'].map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  language === l
                    ? 'bg-[#4361EE] text-white shadow-sm'
                    : 'hover:text-[#16222F]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveView('login')}
            className="inline-flex text-xs font-semibold px-4 py-2 rounded-full border border-[#D9CEBC] text-[#16222F] hover:bg-white transition-colors cursor-pointer"
          >
            Se connecter
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-8 flex flex-col gap-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5 max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-serif-title text-[#16222F] font-normal tracking-tight">
              <span className="block font-bold">Admissions 2026-2027</span>
              <span className="block italic text-[#16222F]/90 mt-1">
                Rejoignez notre communauté éducative
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-normal">
              Notre processus d'admission est direct, transparent et entièrement dématérialisé pour offrir à chaque élève une chance de réussir.
            </p>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
                alt="Admissions"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>

        {canManage && applications.length > 0 && (
          <div className="academy-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-title font-bold text-lg text-[#16222F]">
                  Candidatures enregistrées dans MySQL ({applications.length})
                </h3>
                <p className="text-xs text-[#78716C]">
                  Administration des dossiers d'admission reçus en ligne
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Filtrer candidat, statut..."
                  className="bg-white border border-[#EFECE6] rounded-full px-3.5 py-1.5 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                />
                {successAction && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold shrink-0">
                    {successAction}
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#F4EDE2] bg-white text-[#78716C] font-bold">
                    <th className="py-3 px-4">Candidat</th>
                    <th className="py-3 px-4">Date de naissance</th>
                    <th className="py-3 px-4">Tuteur légal</th>
                    <th className="py-3 px-4">Date de dépôt</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Décision / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EDE2]">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/60">
                      <td className="py-3 px-4 font-bold text-[#16222F]">{app.candidateName}</td>
                      <td className="py-3 px-4 text-[#78716C]">{app.candidateBirthDate || '-'}</td>
                      <td className="py-3 px-4 text-[#78716C]">{app.guardianFullName || 'Tuteur'}</td>
                      <td className="py-3 px-4 text-[#78716C]">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {app.status === 'SUBMITTED' && (
                          <>
                            <button
                              onClick={() => handleRecordDecision(app.id, 'ACCEPTED')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleRecordDecision(app.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {app.status === 'ACCEPTED' && !app.studentId && (
                          <button
                            onClick={() => handleConvertStudent(app.id)}
                            className="px-3 py-1 bg-[#4361EE] text-white rounded-lg text-[10px] font-bold hover:bg-[#3451D1] cursor-pointer"
                          >
                            Convertir en élève
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 sm:p-12 shadow-xl max-w-3xl mx-auto w-full">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif-title font-bold text-[#16222F]">
                Candidature enregistrée avec succès !
              </h2>
              <p className="text-sm text-[#78716C] max-w-md mx-auto">
                Votre dossier a été transmis directement au secrétariat de l'EduTrack.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-[#EFECE6] inline-block">
                <span className="text-xs text-[#78716C] block">Numéro de dossier :</span>
                <span className="text-base font-mono font-bold text-[#16222F]">{trackingNumber}</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-[#4361EE] text-white rounded-full text-xs font-semibold cursor-pointer"
                >
                  Déposer une autre candidature
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif-title font-bold text-[#16222F]">
                  Formulaire de candidature en ligne
                </h2>
                <p className="text-xs text-[#78716C] mt-1">
                  Les informations saisies sont enregistrées directement dans la base de données.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16222F] mb-1">Prénom de l'élève *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentFirstName}
                    onChange={(e) => setFormData({ ...formData, studentFirstName: e.target.value })}
                    className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#16222F] mb-1">Nom de l'élève *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentLastName}
                    onChange={(e) => setFormData({ ...formData, studentLastName: e.target.value })}
                    className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16222F] mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#16222F] mb-1">Nom complet du tuteur *</label>
                  <input
                    type="text"
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16222F] mb-1">Téléphone du tuteur *</label>
                  <input
                    type="text"
                    required
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#16222F] mb-1">Profession du tuteur</label>
                  <input
                    type="text"
                    value={formData.guardianProfession}
                    onChange={(e) => setFormData({ ...formData, guardianProfession: e.target.value })}
                    className="w-full bg-white border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4361EE] hover:bg-[#3451D1] disabled:opacity-50 text-white font-semibold text-sm py-3.5 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmission au serveur...</span>
                  </>
                ) : (
                  <>
                    <span>Soumettre ma candidature</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[#78716C]">
        EduTrack • Système officiel d'admission
      </footer>
    </div>
  );
}
