import React from 'react';
import {
  GraduationCap,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { setActiveView } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7EFE4] text-[#1E293B] flex flex-col justify-between overflow-x-hidden selection:bg-[#E8DFC9] selection:text-[#16222F]">
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

        <nav className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-[#16222F]">
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#16222F] font-semibold hover:text-[#C5A880] transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('apropos-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[#16222F]/80 hover:text-[#16222F] transition-colors"
          >
            À propos
          </button>
          <button
            onClick={() => setActiveView('admissions')}
            className="text-[#16222F]/80 hover:text-[#16222F] transition-colors"
          >
            Admissions
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('contact-footer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[#16222F]/80 hover:text-[#16222F] transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => setActiveView('login')}
            className="hidden sm:inline-flex text-xs font-semibold px-4 py-1.5 rounded-full border border-[#D9CEBC] text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
          >
            Connexion
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-6 sm:py-10 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative min-h-[420px]">
          <div className="lg:col-span-6 z-10 space-y-6 max-w-lg">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-title text-[#16222F] font-normal tracking-tight leading-[1.14]">
              <span className="block font-bold">Apprendre</span>
              <span className="block italic font-normal text-[#16222F]/90 mt-1">
                dans un lieu qui inspire
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-md font-normal">
              Une plateforme moderne pour une éducation d'excellence, au service de chaque élève.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveView('admissions')}
                className="inline-flex items-center gap-3 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Découvrir notre école</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('apropos-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center text-xs sm:text-sm font-medium px-6 py-3.5 rounded-full border border-[#D9CEBC] text-[#16222F] bg-transparent hover:bg-white/50 transition-all cursor-pointer"
              >
                En savoir plus
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[400px] lg:h-[440px] flex items-center justify-end">
            <div className="relative w-full h-full max-w-lg overflow-hidden rounded-3xl lg:rounded-none">
              <img
                src="/assets/landing-hero-full.png"
                alt="Campus Académie Lumière"
                className="w-full h-full object-cover object-left"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 w-full">
          <div className="bg-[#FFFFFF]/90 backdrop-blur-sm rounded-3xl border border-[#EFECE6] shadow-sm py-5 px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#EFECE6] gap-y-4 lg:gap-y-0">
              <div className="flex flex-col items-center text-center px-4 py-1">
                <div className="mb-2 text-[#16222F]">
                  <GraduationCap className="w-5 h-5 stroke-[1.4]" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Excellence
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Académique
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-1">
                <div className="mb-2 text-[#16222F]">
                  <Users className="w-5 h-5 stroke-[1.4]" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Accompagnement
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Personnalisé
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-1">
                <div className="mb-2 text-[#16222F]">
                  <svg
                    className="w-5 h-5 stroke-[1.4] text-[#16222F]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 11 12 14 15 11" />
                    <line x1="12" y1="8" x2="12" y2="14" />
                  </svg>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Environnement
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Sécurisé
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-1">
                <div className="mb-2 text-[#16222F]">
                  <Star className="w-5 h-5 stroke-[1.4]" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Innovation
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#16222F] leading-tight">
                  Pédagogique
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="apropos-section" className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-10 border-t border-[#E8DFC9] mt-8">
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
              L'Académie Lumière offre un cadre d'exception associant rigueur pédagogique, développement humain et infrastructures modernes au cœur de Casablanca.
            </p>
          </div>
        </div>
      </section>

      <footer id="contact-footer" className="w-full bg-[#16222F] text-white py-8 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="font-serif-title font-bold text-white tracking-wide">Académie Lumière</span>
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
