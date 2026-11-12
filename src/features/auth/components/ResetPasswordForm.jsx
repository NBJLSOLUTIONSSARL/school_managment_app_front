import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, Check, ShieldCheck } from 'lucide-react'
import { resetPassword } from '@/features/auth/api/authApi'
import { useI18n } from '@/hooks/useI18n'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function ResetPasswordForm() {
  const { t, language, dir } = useI18n()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const checks = useMemo(() => {
    return {
      length: newPassword.length >= 8 && newPassword.length <= 64,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[-@$!%*?&_#~+=<>;:,./]/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
    }
  }, [newPassword, confirmPassword])

  const isFormValid =
    token &&
    checks.length &&
    checks.uppercase &&
    checks.lowercase &&
    checks.number &&
    checks.special &&
    checks.match

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setErrorMessage(t('auth.resetPassword.missingToken', 'Le jeton de sécurité est absent du lien. Veuillez effectuer une nouvelle demande.'))
      return
    }
    if (!isFormValid || isLoading) return
    setErrorMessage('')
    setIsLoading(true)

    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      })
      setIsSuccess(true)
    } catch (err) {
      if (err.status === 400) {
        setErrorMessage(err.message || t('auth.resetPassword.invalidToken', 'Le lien de réinitialisation est invalide, déjà utilisé ou expiré.'))
      } else {
        setErrorMessage(err.message || t('auth.resetPassword.genericError', 'Impossible de réinitialiser le mot de passe. Veuillez demander un nouveau lien.'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div dir={dir} lang={language} className="min-h-screen flex flex-col lg:flex-row bg-white select-none">
      <div className="w-full lg:w-[47%] relative bg-zinc-950 flex flex-col justify-between p-8 sm:p-12 lg:p-14 min-h-[480px] lg:min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/auth-graduate.jpg"
            alt="EduTrack Graduate"
            className="w-full h-full object-cover object-top sm:object-center brightness-95 contrast-105"
            onError={(e) => {
              e.currentTarget.src = '/assets/auth-classroom.jpg'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-slate-950/35" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.25" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide text-white">EduTrack</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md my-auto py-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/15 mb-4">
            {t('auth.resetPassword.securityBadge', 'Sécurité & Récupération · EduTrack')}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            {t('auth.resetPassword.heroTitle', 'Nouveau mot de passe')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300/90 mt-3.5 leading-relaxed font-normal">
            {t('auth.resetPassword.heroSubtitle', 'Définissez un mot de passe robuste pour protéger vos identifiants académiques et vos données sur le portail EduTrack.')}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-white border border-white/10 flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-white/15 text-white/80 text-xs font-semibold flex items-center justify-center">
              1
            </div>
            <p className="text-xs font-medium text-zinc-300 mt-3 leading-snug">
              {t('auth.resetPassword.step1', 'Demande par e-mail')}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-white border border-white/10 flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-white/15 text-white/80 text-xs font-semibold flex items-center justify-center">
              2
            </div>
            <p className="text-xs font-medium text-zinc-300 mt-3 leading-snug">
              {t('auth.resetPassword.step2', 'Lien reçu')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-4 text-zinc-900 shadow-xl flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <p className="text-xs font-semibold text-zinc-900 mt-3 leading-snug">
              {t('auth.resetPassword.step3', 'Nouveau mot de passe')}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[53%] relative flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="absolute top-4 end-4 z-20">
          <LanguageSwitcher size="xs" />
        </div>

        <div className="w-full max-w-[420px] space-y-6">
          {!isSuccess ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
                  {t('auth.resetPassword.title', 'Réinitialiser le mot de passe')}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
                  {t('auth.resetPassword.subtitle', 'Entrez votre nouveau mot de passe ci-dessous en respectant les critères de sécurité.')}
                </p>
              </div>

              {!token && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{t('auth.resetPassword.noTokenAlert', "Jeton de réinitialisation absent de l'URL. Veuillez demander un nouveau lien.")}</span>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t('auth.resetPassword.newPasswordLabel', 'Nouveau mot de passe')}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      required
                      autoComplete="new-password"
                      disabled={!token}
                      className="w-full h-11 ps-3.5 pe-10 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute end-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                      aria-label={showNewPassword ? t('auth.hidePassword', 'Masquer le mot de passe') : t('auth.showPassword', 'Afficher le mot de passe')}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t('auth.resetPassword.confirmPasswordLabel', 'Confirmer le mot de passe')}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      required
                      autoComplete="new-password"
                      disabled={!token}
                      className="w-full h-11 ps-3.5 pe-10 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? t('auth.hidePassword', 'Masquer le mot de passe') : t('auth.showPassword', 'Afficher le mot de passe')}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5 text-xs text-zinc-600">
                  <p className="font-semibold text-zinc-700 text-[11px] uppercase tracking-wider mb-2">
                    {t('auth.resetPassword.rulesTitle', 'Critères de sécurité requis :')}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                      {checks.length ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 text-center">•</span>}
                      <span>{t('auth.resetPassword.ruleLength', '8 à 64 caractères')}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checks.uppercase ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                      {checks.uppercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 text-center">•</span>}
                      <span>{t('auth.resetPassword.ruleUppercase', '1 lettre majuscule')}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checks.lowercase ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                      {checks.lowercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 text-center">•</span>}
                      <span>{t('auth.resetPassword.ruleLowercase', '1 lettre minuscule')}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checks.number ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                      {checks.number ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 text-center">•</span>}
                      <span>{t('auth.resetPassword.ruleNumber', '1 chiffre')}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checks.special ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                      {checks.special ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 text-center">•</span>}
                      <span>{t('auth.resetPassword.ruleSpecial', '1 symbole spécial')}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checks.match ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                      {checks.match ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 text-center">•</span>}
                      <span>{t('auth.resetPassword.ruleMatch', 'Mots de passe identiques')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-[#1e3a8a] text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t('auth.resetPassword.submit', 'Enregistrer le nouveau mot de passe')}</span>
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#1d4ed8] hover:underline"
                >
                  {t('auth.resetPassword.requestNewLink', 'Demander un nouveau lien de réinitialisation')}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {t('auth.resetPassword.successTitle', 'Mot de passe mis à jour !')}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                  {t('auth.resetPassword.successText', 'Votre mot de passe a été modifié avec succès. Par mesure de sécurité, toutes vos anciennes sessions ont été révoquées et un e-mail de confirmation vous a été envoyé.')}
                </p>
              </div>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t('auth.resetPassword.goToLogin', 'Se connecter avec le nouveau mot de passe')}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
