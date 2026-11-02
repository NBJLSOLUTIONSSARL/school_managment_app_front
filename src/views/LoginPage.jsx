import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, setActiveView, language, setLanguage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMessage(err.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] flex flex-col justify-between relative overflow-hidden select-none">
      <header className="max-w-7xl w-full mx-auto px-8 py-6 flex items-center justify-between z-10">
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

        <div className="flex items-center bg-white border border-[#EFECE6] rounded-full p-1 text-xs font-semibold text-[#78716C] shadow-sm">
          {['FR', 'EN', 'AR'].map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === l ? 'bg-[#16222F] text-white shadow-sm' : 'hover:text-[#16222F]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <div className="absolute left-6 bottom-12 w-64 opacity-25 pointer-events-none hidden lg:block">
        <div className="space-y-3">
          <div className="h-20 w-44 bg-[#C5A880]/20 rounded-2xl transform -rotate-3" />
          <div className="h-16 w-52 bg-[#C5A880]/15 rounded-2xl transform rotate-2" />
        </div>
      </div>

      <div className="absolute right-0 top-1/4 bottom-0 w-80 opacity-20 pointer-events-none hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
          alt="School Architecture"
          className="w-full h-full object-cover rounded-l-[4rem]"
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-[#EFECE6] p-8 sm:p-10 relative">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif-title font-bold text-[#16222F]">
              Bienvenue
            </h1>
            <p className="text-sm text-[#78716C] mt-1.5">
              Connectez-vous à votre espace sécurisé
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail"
                  className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#16222F] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl pl-11 pr-11 py-3 text-sm text-[#16222F] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#16222F] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#78716C] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D9D2C7] text-[#16222F] focus:ring-[#C5A880]"
                />
                <span>Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Veuillez contacter l'administrateur scolaire pour réinitialiser votre mot de passe.")}
                className="hover:text-[#16222F] transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#16222F] hover:bg-[#203144] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F4EDE2]">
            <p className="text-[11px] font-semibold text-[#78716C] text-center uppercase tracking-wider mb-2.5">
              Comptes de test MySQL
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@school.com')}
                className="p-2 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] hover:bg-[#F4EDE2] text-left transition-colors cursor-pointer"
              >
                <span className="block font-bold text-[#16222F]">Directeur</span>
                <span className="block text-[10px] text-[#78716C] truncate">admin@school.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('claire.martin@school.com')}
                className="p-2 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] hover:bg-[#F4EDE2] text-left transition-colors cursor-pointer"
              >
                <span className="block font-bold text-[#16222F]">Enseignante</span>
                <span className="block text-[10px] text-[#78716C] truncate">claire.martin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('leo.leroy@student.com')}
                className="p-2 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] hover:bg-[#F4EDE2] text-left transition-colors cursor-pointer"
              >
                <span className="block font-bold text-[#16222F]">Élève</span>
                <span className="block text-[10px] text-[#78716C] truncate">leo.leroy</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('alain.leroy@parent.com')}
                className="p-2 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] hover:bg-[#F4EDE2] text-left transition-colors cursor-pointer"
              >
                <span className="block font-bold text-[#16222F]">Parent</span>
                <span className="block text-[10px] text-[#78716C] truncate">alain.leroy</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-[#78716C] z-10">
        Académie Lumière • Année Scolaire 2026-2027
      </footer>
    </div>
  );
}
