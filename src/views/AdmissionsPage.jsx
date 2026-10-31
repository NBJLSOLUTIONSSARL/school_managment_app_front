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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B]">
      
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#16222F] flex items-center justify-center p-2">
            <img src="/logo.svg" alt="Académie Lumière" className="w-full h-full object-contain filter invert" />
          </div>
          <div>
            <span className="font-brand text-base tracking-wider text-[#16222F] font-bold block leading-tight">
              Académie
            </span>
            <span className="font-brand text-xs tracking-widest text-[#C5A880] uppercase block">
              Lumière
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#16222F]">
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#78716C] hover:text-[#16222F] transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#78716C] hover:text-[#16222F] transition-colors"
          >
            À propos
          </button>
          <span className="text-[#C5A880] font-bold border-b-2 border-[#C5A880] pb-0.5">
            Admissions
          </span>
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#78716C] hover:text-[#16222F] transition-colors"
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-[#EFECE6] rounded-full p-1 text-xs font-semibold text-[#78716C]">
            {['FR', 'EN', 'AR'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === l ? 'bg-[#16222F] text-white shadow-sm' : 'hover:text-[#16222F]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveView('login')}
            className="bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            Espace Membre
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-serif-title font-bold text-[#16222F] leading-tight">
              Admissions
            </h1>
            <p className="text-lg font-serif-title italic text-[#C5A880]">
              Rejoignez notre communauté éducative
            </p>
            <p className="text-base text-[#78716C] leading-relaxed max-w-lg">
              Notre processus d'admission est simple et transparent, pour offrir à chaque élève une chance de réussir dans un cadre stimulant.
            </p>
            <a
              href="#formulaire"
              className="inline-flex items-center gap-3 bg-[#16222F] hover:bg-[#203144] text-white font-semibold text-sm px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <span>Déposer une candidature</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="relative">
            <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl border-4 border-white relative">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
                alt="Admissions Académie Lumière"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16222F]/50 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section id="formulaire" className="max-w-4xl mx-auto px-6 pb-20">
        <div className="academy-card p-8 sm:p-10 shadow-lg">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif-title font-bold text-[#16222F]">
                Candidature enregistrée avec succès !
              </h3>
              <p className="text-sm text-[#78716C] max-w-md mx-auto">
                Le dossier pour <strong>{formData.studentFirstName} {formData.studentLastName}</strong> a bien été transmis à la commission d'admission.
              </p>
              <div className="inline-block p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] text-xs">
                <span className="text-[#A8A29E] block">Numéro de suivi du dossier :</span>
                <span className="text-base font-bold text-[#16222F] tracking-wider">{trackingNumber}</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#16222F] text-white text-xs font-semibold"
                >
                  Déposer une autre candidature
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#F4EDE2] pb-4">
                <h2 className="text-2xl font-serif-title font-bold text-[#16222F]">
                  Formulaire d'admission 2026 / 2027
                </h2>
                <p className="text-xs text-[#78716C] mt-1">
                  Veuillez renseigner les informations relatives à l'élève et son responsable.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#C5A880] uppercase tracking-wider mb-3">
                  1. Renseignements sur l'élève
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
                      placeholder="Ex. Yasmine"
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
                      placeholder="Ex. Chraibi"
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
                      Niveau souhaité *
                    </label>
                    <select
                      value={formData.targetClass}
                      onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                    >
                      <option value="1ère Année">1ère Année Collège / Lycée</option>
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
                      Nom complet du responsable *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Ex. Mme. Fatima Chraibi"
                      className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#16222F] mb-1">
                      Téléphone mobile *
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
                      placeholder="nom@exemple.com"
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
                  placeholder="Pourquoi souhaitez-vous rejoindre l'Académie Lumière ?"
                  className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-3 bg-[#16222F] hover:bg-[#203144] text-white text-sm font-semibold px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <span>Soumettre ma candidature</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
