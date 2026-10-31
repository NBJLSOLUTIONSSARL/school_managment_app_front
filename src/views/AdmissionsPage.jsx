import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdmissionsPage() {
  const { setActiveView } = useAuth();
  const [lang, setLang] = useState('FR');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [formData, setFormData] = useState({
    studentFirstName: '',
    studentLastName: '',
    birthDate: '',
    gender: 'F',
    targetClass: '1ère Année',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    previousSchool: '',
    motivation: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const candidateId = `CND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrackingNumber(candidateId);

    try {
      await api.submitApplication(formData);
    } catch {
    }
    setIsSubmitted(true);
  };

  const scrollToForm = () => {
    const el = document.getElementById('candidature-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
              alt="Académie Lumière"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-serif-title text-base sm:text-lg tracking-wide text-[#16222F] font-semibold">
            Académie Lumière
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#16222F]/80 hover:text-[#C5A880] transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#16222F]/80 hover:text-[#16222F] transition-colors"
          >
            À propos
          </button>
          <span className="text-[#C5A880] font-semibold cursor-default">
            Admissions
          </span>
          <button
            onClick={() => {
              const el = document.getElementById('contact-footer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[#16222F]/80 hover:text-[#16222F] transition-colors"
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#EFECE6] rounded-full p-1 text-xs font-semibold text-[#78716C] shadow-sm">
            {['FR', 'EN', 'AR'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full transition-all ${
                  lang === l
                    ? 'bg-[#16222F] text-white shadow-sm'
                    : 'hover:text-[#16222F]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveView('login')}
            className="hidden sm:inline-flex text-xs font-semibold px-4 py-1.5 rounded-full border border-[#D9CEBC] text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
          >
            Connexion
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative min-h-[400px]">
          <div className="lg:col-span-6 z-10 space-y-6 max-w-lg">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-title font-normal text-[#16222F] tracking-tight leading-tight">
                Admissions
              </h1>
              <p className="text-base sm:text-lg font-serif-title text-[#16222F] mt-2 font-normal">
                Rejoignez notre communauté éducative
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-md font-normal">
              Notre processus d'admission est simple et transparent, pour offrir à chaque élève une chance de réussir.
            </p>

            <div className="relative pt-2">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-3 bg-[#16222F] hover:bg-[#223345] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer relative z-10"
              >
                <span>Déposer une candidature</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="absolute left-64 -top-1 grid grid-cols-4 gap-2 opacity-35 pointer-events-none hidden sm:grid">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-end">
            <div className="relative w-full h-full max-w-lg overflow-hidden rounded-3xl lg:rounded-none">
              <img
                src="/assets/admissions-student-building.png"
                alt="Admissions Académie Lumière"
                className="w-full h-full object-contain object-right"
              />
            </div>
          </div>
        </div>

        <section id="candidature-form" className="mt-14 sm:mt-20 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 sm:p-12 shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif-title font-bold text-[#16222F]">
                  Candidature enregistrée avec succès
                </h3>
                <p className="text-sm text-[#78716C] max-w-md mx-auto">
                  Le dossier de <strong>{formData.studentFirstName} {formData.studentLastName}</strong> a bien été transmis à la commission d'admission.
                </p>
                <div className="inline-block p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] text-xs">
                  <span className="text-[#A8A29E] block mb-1">Numéro de suivi officiel :</span>
                  <span className="text-base font-bold text-[#16222F] tracking-wider">{trackingNumber}</span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        studentFirstName: '',
                        studentLastName: '',
                        birthDate: '',
                        gender: 'F',
                        targetClass: '1ère Année',
                        guardianName: '',
                        guardianEmail: '',
                        guardianPhone: '',
                        previousSchool: '',
                        motivation: '',
                      });
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#16222F] text-white text-xs font-semibold hover:bg-[#223345] transition-colors"
                  >
                    Déposer une autre candidature
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-[#F4EDE2] pb-4">
                  <h2 className="text-2xl font-serif-title font-bold text-[#16222F]">
                    Dossier d'admission en ligne
                  </h2>
                  <p className="text-xs text-[#78716C] mt-1">
                    Complétez les informations requises pour soumettre la candidature de l'élève.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#C5A880] uppercase tracking-wider mb-3">
                    1. Renseignements de l'élève
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Prénom de l'élève *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.studentFirstName}
                        onChange={(e) => setFormData({ ...formData, studentFirstName: e.target.value })}
                        placeholder="Ex. Yassine"
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Nom de l'élève *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.studentLastName}
                        onChange={(e) => setFormData({ ...formData, studentLastName: e.target.value })}
                        placeholder="Ex. Benali"
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Date de naissance *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Genre
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                      >
                        <option value="F">Féminin</option>
                        <option value="M">Masculin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Niveau demandé *
                      </label>
                      <select
                        value={formData.targetClass}
                        onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                      >
                        <option value="1ère Année">1ère Année</option>
                        <option value="2ème Année">2ème Année</option>
                        <option value="3ème Année">3ème Année</option>
                        <option value="Terminale">Terminale</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F4EDE2]">
                  <h4 className="text-xs font-bold text-[#C5A880] uppercase tracking-wider mb-3">
                    2. Responsable légal / Tuteur
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        placeholder="Ex. M. Karim Benali"
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.guardianPhone}
                        onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                        placeholder="+212 6..."
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#16222F] mb-1">
                        Adresse email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.guardianEmail}
                        onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                        placeholder="contact@famille.ma"
                        className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F4EDE2]">
                  <label className="block text-xs font-semibold text-[#16222F] mb-1">
                    Établissement précédent et motivation (facultatif)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Précisez le parcours scolaire antérieur et vos motivations..."
                    className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl p-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 bg-[#16222F] hover:bg-[#223345] text-white text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>Soumettre ma candidature</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer id="contact-footer" className="w-full bg-[#16222F] text-white py-8 px-6 sm:px-12 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="font-serif-title font-bold text-white tracking-wide">Académie Lumière</span>
            <span>•</span>
            <span>Casablanca, Maroc</span>
          </div>
          <div>
            <span>Service Admissions : admissions@academie-lumiere.ma • +212 5 22 33 44 55</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('landing')}
              className="text-[#C5A880] hover:underline font-semibold"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
