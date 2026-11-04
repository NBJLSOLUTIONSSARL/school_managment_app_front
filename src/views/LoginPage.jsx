import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', category: 'admin', name: 'Marc Dupont', email: 'admin@school.com', badgeColor: 'bg-[#16222F] text-[#DFC2A0]' },
  { role: 'Secrétaire', category: 'staff', name: 'Lucas Petit', email: 'lucas.petit@school.com', badgeColor: 'bg-blue-100 text-blue-800' },
  { role: 'Secrétaire', category: 'staff', name: 'Marie Robert', email: 'marie.robert@school.com', badgeColor: 'bg-blue-100 text-blue-800' },
  { role: 'Bibliothécaire', category: 'librarian', name: 'Fatima-Zahra El Amrani', email: 'librarian@school.com', badgeColor: 'bg-amber-100 text-amber-800' },
  { role: 'Enseignante', category: 'teacher', name: 'Claire Martin (Maths)', email: 'claire.martin@school.com', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { role: 'Enseignant', category: 'teacher', name: 'Thomas Bernard (Français)', email: 'thomas.bernard@school.com', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { role: 'Enseignante', category: 'teacher', name: 'Sophie Dubois (Sciences)', email: 'sophie.dubois@school.com', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { role: 'Parent', category: 'parent', name: 'Alain Leroy (Parent de Léo)', email: 'alain.leroy@parent.com', badgeColor: 'bg-purple-100 text-purple-800' },
  { role: 'Parent', category: 'parent', name: 'Isabelle Moreau (Parent d\'Emma)', email: 'isabelle.moreau@parent.com', badgeColor: 'bg-purple-100 text-purple-800' },
  { role: 'Parent', category: 'parent', name: 'David Simon (Parent d\'Hugo)', email: 'david.simon@parent.com', badgeColor: 'bg-purple-100 text-purple-800' },
  { role: 'Élève', category: 'student', name: 'Léo Leroy', email: 'leo.leroy@student.com', badgeColor: 'bg-sky-100 text-sky-800' },
  { role: 'Élève', category: 'student', name: 'Emma Moreau', email: 'emma.moreau@student.com', badgeColor: 'bg-sky-100 text-sky-800' },
  { role: 'Élève', category: 'student', name: 'Hugo Simon', email: 'hugo.simon@student.com', badgeColor: 'bg-sky-100 text-sky-800' },
];

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'admin', label: 'Admin' },
  { id: 'staff', label: 'Secrétariat' },
  { id: 'librarian', label: 'Bibliothèque' },
  { id: 'teacher', label: 'Profs' },
  { id: 'parent', label: 'Parents' },
  { id: 'student', label: 'Élèves' },
];

export default function LoginPage() {
  const { login, setActiveView, language, setLanguage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Identifiants invalides. Veuillez réessayer.');
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
      setErrorMessage(err.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAccounts = activeCategory === 'all'
    ? DEMO_ACCOUNTS
    : DEMO_ACCOUNTS.filter((acc) => acc.category === activeCategory);

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
        <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-[#EFECE6] p-6 sm:p-8 relative">
          <div className="text-center mb-5">
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
              Bienvenue
            </h1>
            <p className="text-sm text-[#78716C] mt-1">
              Connectez-vous à votre espace sécurisé
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
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

            <div className="flex items-center justify-between text-xs text-[#78716C] pt-0.5">
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
              className="w-full bg-[#16222F] hover:bg-[#203144] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
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

          <div className="mt-5 pt-4 border-t border-[#F4EDE2]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#16222F] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Comptes de test MySQL (1-clic)</span>
              </div>
              <span className="text-[10px] text-[#78716C]">
                {filteredAccounts.length} compte(s)
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2.5 pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#16222F] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#78716C] hover:bg-[#F4EDE2] hover:text-[#16222F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  className="w-full p-2 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] hover:bg-[#F4EDE2] text-left transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#16222F] truncate">
                        {acc.name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${acc.badgeColor}`}>
                        {acc.role}
                      </span>
                    </div>
                    <span className="block text-[10px] text-[#78716C] truncate">
                      {acc.email}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#C5A880] shrink-0">
                    Connexion →
                  </span>
                </button>
              ))}
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
