import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Phone, User, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EduTrackLogo from '../components/common/EduTrackLogo';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', name: 'Marc Dupont', email: 'admin@school.com', badge: 'bg-[#EEF2FF] text-[#4361EE]' },
  { role: 'Secretary', name: 'Lucas Petit', email: 'lucas.petit@school.com', badge: 'bg-[#DBEAFE] text-[#1D4ED8]' },
  { role: 'Librarian', name: 'Fatima-Zahra', email: 'librarian@school.com', badge: 'bg-[#FEF3C7] text-[#B45309]' },
  { role: 'Teacher', name: 'Claire Martin', email: 'claire.martin@school.com', badge: 'bg-[#DCFCE7] text-[#15803D]' },
  { role: 'Parent', name: 'Alain Leroy', email: 'alain.leroy@parent.com', badge: 'bg-[#F3E8FF] text-[#7E22CE]' },
  { role: 'Student', name: 'Léo Leroy', email: 'leo.leroy@student.com', badge: 'bg-[#E0E7FF] text-[#4338CA]' },
];

export default function LoginPage() {
  const { login, setActiveView } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+374 0000 00 00');
  const [fullName, setFullName] = useState('Juliette Karapetyan');
  const [username, setUsername] = useState('juliettex');
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('Password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQuickLogins, setShowQuickLogins] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const loginEmail = email.trim() || `${username.trim()}@school.com`;
      await login(loginEmail, password);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your email/password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123');
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(demoEmail.trim(), 'Password123');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white select-none">
      {/* Left Column (50% on Desktop) - Classroom Photo with Dark Overlay & 3 Steps */}
      <div className="w-full md:w-1/2 relative bg-[#0F172A] flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[480px] md:min-h-screen overflow-hidden">
        {/* Background Image from Figma */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/auth-hero-figma.jpg"
            alt="EduTrack Campus"
            className="w-full h-full object-cover opacity-40 brightness-75 contrast-125"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-[#0B0F19]/40" />
        </div>

        {/* Top: EduTrack Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={() => setActiveView('landing')}
            className="cursor-pointer"
          >
            <EduTrackLogo variant="light" size="md" />
          </div>
        </div>

        {/* Middle: Start Your Journey Headings */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/15 mb-4">
            Academic Portal · {isRegisterMode ? 'Join Us' : 'Welcome Back'}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Start your journey
          </h1>
          <p className="text-sm sm:text-base text-white/80 mt-3 leading-relaxed">
            Follow these simple steps to set up your institutional account and access your academic desk.
          </p>
        </div>

        {/* Bottom: 3 Progress Steps from Figma */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
          {/* Step 1: Active */}
          <div className="bg-white rounded-2xl p-4 text-[#1E293B] shadow-lg flex flex-col justify-between min-h-[90px]">
            <div className="w-6 h-6 rounded-full bg-[#4361EE] text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <p className="text-xs font-bold mt-2">
              Register your account
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white/80 flex flex-col justify-between min-h-[90px]">
            <div className="w-6 h-6 rounded-full bg-white/10 text-white/80 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <p className="text-xs font-medium mt-2">
              Set up profile information
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white/80 flex flex-col justify-between min-h-[90px]">
            <div className="w-6 h-6 rounded-full bg-white/10 text-white/80 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <p className="text-xs font-medium mt-2">
              Verify identity & role
            </p>
          </div>
        </div>
      </div>

      {/* Right Column (50% on Desktop) - Clean White Form matching Figma */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
              {isRegisterMode ? 'Join Us' : 'Log in to EduTrack'}
            </h2>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number Field from Figma */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                />
              </div>
            </div>

            {/* Full Name & Username / Email Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                  Email / Username
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-tight">
                At least 8 characters, uppercase letters, lowercase letters, numbers, and symbols.
              </p>
            </div>

            {/* Continue Primary Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4361EE] hover:bg-[#3451D1] text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Continue</span>
              </button>
            </div>

            {/* Already have an account link */}
            <div className="text-center text-xs text-[#64748B]">
              <span>{isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}</span>
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-[#4361EE] font-bold hover:underline cursor-pointer"
              >
                {isRegisterMode ? 'Log in' : 'Join Us'}
              </button>
            </div>

            {/* Divider: OR */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-[#94A3B8] uppercase absolute">
                OR
              </span>
            </div>

            {/* Sign up with Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#1E293B] py-2.5 px-4 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isRegisterMode ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </button>

            {/* Quick Demo Logins Toggle (Convenient 1-click login for testing MySQL accounts) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowQuickLogins(!showQuickLogins)}
                className="w-full text-center text-[11px] text-[#4361EE] hover:underline font-semibold cursor-pointer"
              >
                {showQuickLogins ? '▲ Hide Quick Demo Logins' : '▼ Quick 1-Click Login (6 Roles)'}
              </button>

              {showQuickLogins && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 animate-in fade-in">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickLogin(acc.email)}
                      className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-[#4361EE] hover:shadow-2xs transition cursor-pointer"
                    >
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${acc.badge} block w-fit`}>
                        {acc.role}
                      </span>
                      <p className="text-xs font-semibold text-[#1E293B] mt-1 truncate">{acc.name}</p>
                      <p className="text-[10px] text-[#64748B] truncate">{acc.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Legal terms footer */}
            <p className="text-[10px] text-center text-[#94A3B8] leading-relaxed pt-2">
              By signing up I confirm that I carefully have read and agree to the EduTrack{' '}
              <a href="#" className="underline hover:text-[#4361EE]">Privacy Policy</a> and{' '}
              <a href="#" className="underline hover:text-[#4361EE]">Terms of Service</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
