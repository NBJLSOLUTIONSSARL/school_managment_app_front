import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginAs, selectUser, setActiveView } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [lang, setLang] = useState('FR');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginAs(email || 'direction@academie-lumiere.ma');
    }, 400);
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
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-full transition-all ${
                lang === l ? 'bg-[#16222F] text-white shadow-sm' : 'hover:text-[#16222F]'
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif-title font-bold text-[#16222F]">
              Bienvenue
            </h1>
            <p className="text-sm text-[#78716C] mt-1.5">
              Connectez-vous à votre espace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail ou téléphone"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#16222F]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#78716C]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#EFECE6] text-[#16222F] focus:ring-[#C5A880]"
                />
                <span>Se souvenir de moi</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Instructions de réinitialisation envoyées par email.')}
                className="text-[#78716C] hover:text-[#16222F] font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white font-semibold text-sm py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
              >
                <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative py-2 flex items-center justify-center">
              <div className="border-t border-[#EFECE6] w-full" />
              <span className="bg-white px-3 text-xs text-[#A8A29E] uppercase font-bold absolute">
                ou
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => loginAs('directeur')}
                title="Google Login"
                className="w-11 h-11 rounded-full border border-[#EFECE6] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors shadow-sm font-bold text-sm text-red-500"
              >
                G
              </button>
              <button
                type="button"
                onClick={() => loginAs('directeur')}
                title="Microsoft Login"
                className="w-11 h-11 rounded-full border border-[#EFECE6] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors shadow-sm font-bold text-sm text-sky-600"
              >
                MS
              </button>
              <button
                type="button"
                onClick={() => loginAs('directeur')}
                title="Apple Login"
                className="w-11 h-11 rounded-full border border-[#EFECE6] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors shadow-sm font-bold text-sm text-[#16222F]"
              >
                
              </button>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t border-[#F4EDE2] text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#C5A880] mb-2.5">
              Comptes Démo à tester en 1 clic :
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => selectUser('admin')}
                className="text-xs bg-[#FAF7F2] hover:bg-[#F4EDE2] text-[#16222F] px-3 py-1.5 rounded-full border border-[#EFECE6] font-semibold transition-colors"
              >
                Directeur (Dr. Martin)
              </button>
              <button
                type="button"
                onClick={() => selectUser('student')}
                className="text-xs bg-[#FAF7F2] hover:bg-[#F4EDE2] text-[#16222F] px-3 py-1.5 rounded-full border border-[#EFECE6] font-semibold transition-colors"
              >
                Élève (Inès Belkacem)
              </button>
              <button
                type="button"
                onClick={() => selectUser('teacher')}
                className="text-xs bg-[#FAF7F2] hover:bg-[#F4EDE2] text-[#16222F] px-3 py-1.5 rounded-full border border-[#EFECE6] font-semibold transition-colors"
              >
                Enseignant (Dr. Sarah)
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-[#A8A29E]">
        © 2026 Académie Lumière • Système de gestion scolaire sécurisé
      </footer>
    </div>
  );
}
