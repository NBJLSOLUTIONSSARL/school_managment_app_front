import React from 'react';
import {
  GraduationCap,
  Users,
  Shield,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { setActiveView } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] flex flex-col justify-between overflow-x-hidden">
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-8 pb-4 flex items-center justify-between">
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-9 h-9 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Académie Lumière"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-brand text-lg tracking-wide text-[#16222F] font-bold">
            Académie Lumière
          </span>
        </div>

        <nav className="flex items-center gap-6 sm:gap-10 text-sm font-medium text-[#16222F]">
          <button
            onClick={() => setActiveView('landing')}
            className="hover:text-[#C5A880] transition-colors font-semibold"
          >
            Accueil
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('apropos-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[#78716C] hover:text-[#16222F] transition-colors"
          >
            À propos
          </button>
          <button
            onClick={() => setActiveView('admissions')}
            className="text-[#78716C] hover:text-[#16222F] transition-colors"
          >
            Admissions
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('contact-footer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[#78716C] hover:text-[#16222F] transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => setActiveView('login')}
            className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-full border border-[#D9CEBC] text-[#16222F] hover:bg-[#F4EDE2] transition-colors"
          >
            Connexion
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-6 sm:py-10 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative min-h-[460px]">
          <div className="lg:col-span-6 z-10 space-y-6 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-title text-[#16222F] font-normal tracking-tight leading-[1.12]">
              <span className="block font-bold">Apprendre</span>
              <span className="block italic text-[#16222F]/90 font-normal mt-1">
                dans un lieu qui inspire
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-md font-normal">
              Une plateforme moderne pour une éducation d'excellence, au service de chaque élève.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveView('admissions')}
                className="inline-flex items-center gap-3 bg-[#16222F] hover:bg-[#223345] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Découvrir notre école</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('apropos-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center text-xs sm:text-sm font-medium px-6 py-3.5 rounded-full border border-[#D9CEBC] text-[#16222F] bg-transparent hover:bg-white/60 transition-all cursor-pointer"
              >
                En savoir plus
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative w-full h-[340px] sm:h-[420px] lg:h-[480px]">
            <div className="absolute inset-0 pointer-events-none hidden lg:block">
              <svg
                viewBox="0 0 600 500"
                className="w-full h-full overflow-visible"
                fill="none"
              >
                <circle
                  cx="320"
                  cy="250"
                  r="270"
                  stroke="#E8DFC9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <circle
                  cx="320"
                  cy="250"
                  r="230"
                  stroke="#D9CEBC"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>
            </div>

            <div
              className="relative w-full h-full overflow-hidden shadow-2xl transition-all duration-300"
              style={{
                borderTopLeftRadius: '14rem',
                borderBottomLeftRadius: '2rem',
                borderTopRightRadius: '2rem',
                borderBottomRightRadius: '2rem'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80"
                alt="Campus Académie Lumière"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 w-full">
          <div className="bg-white rounded-3xl border border-[#EFECE6] shadow-sm py-6 px-4 sm:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#EFECE6] gap-y-6 lg:gap-y-0">
              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="mb-3 text-[#16222F]">
                  <GraduationCap className="w-6 h-6 stroke-[1.6]" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Excellence
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Académique
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="mb-3 text-[#16222F]">
                  <Users className="w-6 h-6 stroke-[1.6]" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Accompagnement
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Personnalisé
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="mb-3 text-[#16222F]">
                  <Shield className="w-6 h-6 stroke-[1.6]" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Environnement
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Sécurisé
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="mb-3 text-[#16222F]">
                  <Star className="w-6 h-6 stroke-[1.6]" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Innovation
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F]">
                  Pédagogique
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="apropos-section" className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-12 border-t border-[#EFECE6]/80 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="md:col-span-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
              Notre Institution
            </span>
            <h3 className="text-2xl font-serif-title font-bold text-[#16222F] mt-1">
              Une tradition d'excellence tournée vers l'avenir
            </h3>
          </div>
          <div className="md:col-span-2 text-sm text-[#78716C] leading-relaxed">
            <p>
              L'Académie Lumière offre un environnement d'apprentissage d'exception, associant rigueur pédagogique, développement humain et infrastructures modernes au cœur de Casablanca.
            </p>
          </div>
        </div>
      </section>

      <footer id="contact-footer" className="w-full bg-[#16222F] text-white py-8 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-white tracking-wide">Académie Lumière</span>
            <span>•</span>
            <span>Casablanca, Maroc</span>
          </div>
          <div>
            <span>Contact : contact@academie-lumiere.ma • +212 5 22 33 44 55</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('login')}
              className="text-[#C5A880] hover:underline font-semibold"
            >
              Espace Intranet
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
