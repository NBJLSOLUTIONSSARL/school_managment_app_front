import React from 'react';
import {
  GraduationCap,
  Users,
  Star,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EduTrackLogo from '../components/common/EduTrackLogo';

export default function LandingPage() {
  const { setActiveView } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col justify-between overflow-x-hidden select-none">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-7 pb-4 flex items-center justify-between">
        <div
          onClick={() => setActiveView('landing')}
          className="cursor-pointer"
        >
          <EduTrackLogo size="md" />
        </div>

        <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-[#64748B]">
          <button
            onClick={() => setActiveView('landing')}
            className="text-[#4361EE] hover:text-[#3451D1] transition"
          >
            Home
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('about-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#1E293B] transition"
          >
            About
          </button>
          <button
            onClick={() => setActiveView('admissions')}
            className="hover:text-[#1E293B] transition"
          >
            Admissions
          </button>
          <button
            onClick={() => setActiveView('login')}
            className="inline-flex text-xs font-semibold px-5 py-2 rounded-full bg-[#4361EE] hover:bg-[#3451D1] text-white shadow-xs transition"
          >
            Log in
          </button>
        </nav>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-8 sm:py-12 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[460px]">
          <div className="lg:col-span-6 space-y-6 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4361EE] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen School Management
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E293B] tracking-tight leading-[1.12]">
              Elevating Education Through Innovation
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              EduTrack connects administrators, faculty, students, and parents into one seamless, unified digital ecosystem.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveView('admissions')}
                className="inline-flex items-center gap-2 bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full shadow-sm transition active:scale-98 cursor-pointer"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('login')}
                className="inline-flex items-center text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full border border-[#E2E8F0] text-[#1E293B] bg-white hover:bg-slate-50 transition cursor-pointer"
              >
                Access Portal
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-[#F1F5F9]">
            <img
              src="/assets/auth-hero-figma.jpg"
              alt="EduTrack Campus"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/60 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  Global Academic Standards
                </p>
                <h3 className="text-lg font-bold">
                  Empowering 340+ Students Every Day
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 w-full">
          <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-xs py-6 px-4 sm:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#F1F5F9] gap-y-4 lg:gap-y-0">
              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">
                  Academic Excellence
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Real-time grades & curriculum
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">
                  Faculty Support
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Streamlined class schedules
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">
                  Secure Records
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Encrypted institutional data
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4 py-2">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-3">
                  <Star className="w-5 h-5 stroke-[2]" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">
                  Continuous Growth
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Integrated reporting & analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section
        id="about-section"
        className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-12 border-t border-[#F1F5F9] mt-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4361EE]">
              About EduTrack
            </span>
            <h3 className="text-2xl font-extrabold text-[#1E293B] mt-1">
              Engineered for Modern Academic Institutions
            </h3>
          </div>
          <div className="md:col-span-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
            <p>
              EduTrack provides complete end-to-end administration: student lifecycle management, digital grade recording, transparent financial accounting, class scheduling, and official PDF documents.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#1E2238] text-white py-8 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <EduTrackLogo variant="light" size="sm" />
            <span>•</span>
            <span>All rights reserved 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('login')}
              className="text-[#4361EE] hover:underline font-semibold"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
