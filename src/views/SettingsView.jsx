import React, { useState } from 'react';
import {
  User,
  Lock,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function SettingsView() {
  const { currentUser, language, setLanguage } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      setSuccess('Mot de passe mis à jour avec succès.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Impossible de changer le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Sécurité & Compte
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Paramètres du Compte
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Gérez vos informations de profil, vos préférences et votre mot de passe
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Settings"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="academy-card p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-[#F4EDE2]">
            <img
              src={currentUser?.photoUrl || defaultAvatar}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C5A880] shadow-sm shrink-0"
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
            />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#16222F] truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </h2>
              <p className="text-xs text-[#78716C] truncate">{currentUser?.email}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {currentUser?.roles?.map((role, i) => (
                  <span
                    key={i}
                    className="inline-block text-[10px] font-bold bg-[#FAF7F2] text-[#C5A880] px-2 py-0.5 rounded-full border border-[#EFECE6]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#16222F] uppercase tracking-wider">
              Langue & Accessibilité
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'FR', label: 'Français' },
                { code: 'EN', label: 'English' },
                { code: 'AR', label: 'العربية (RTL)' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    language === item.code
                      ? 'bg-[#16222F] text-white border-[#16222F] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#16222F] border-[#EFECE6] hover:bg-white'
                  }`}
                >
                  <span className="block text-sm mb-0.5">{item.code}</span>
                  <span className="text-[10px] opacity-80 block truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 academy-card p-6">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#F4EDE2]">
            <Lock className="w-5 h-5 text-[#C5A880]" />
            <div>
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Modifier le mot de passe
              </h2>
              <p className="text-xs text-[#78716C]">
                Sécurisez votre compte utilisateur enregistré dans la base de données
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Mot de passe actuel *
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Votre mot de passe actuel"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Confirmer le nouveau mot de passe *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le nouveau mot de passe"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enregistrer le nouveau mot de passe</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
