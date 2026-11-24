import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ToastContext } from '@/context/toastContext'
import { useI18n } from '@/hooks/useI18n'
import { completeFirstLogin } from '@/features/auth/api/authApi'

export function ForcePasswordChangeForm() {
  const { updateSessionUser, logout } = useAuth()
  const toastContext = useContext(ToastContext)
  const success = toastContext?.success || (() => {})
  const toastError = toastContext?.error || (() => {})
  const { t } = useI18n()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const passwordRules = [
    { label: t('auth.ruleMinLength', 'Au moins 8 caractères'), valid: newPassword.length >= 8 },
    { label: t('auth.ruleUpper', 'Au moins une lettre majuscule'), valid: /[A-Z]/.test(newPassword) },
    { label: t('auth.ruleLower', 'Au moins une lettre minuscule'), valid: /[a-z]/.test(newPassword) },
    { label: t('auth.ruleDigit', 'Au moins un chiffre'), valid: /[0-9]/.test(newPassword) },
    { label: t('auth.ruleSpecial', 'Au moins un caractère spécial (@$!%*?&#)'), valid: /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) },
  ]

  const isPasswordValid = passwordRules.every((r) => r.valid)
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError(t('auth.allFieldsRequired', 'Veuillez remplir tous les champs.'))
      return
    }

    if (!isPasswordValid) {
      setFormError(t('auth.passwordCriteriaNotMet', 'Le nouveau mot de passe ne respecte pas les critères de sécurité.'))
      return
    }

    if (!isMatch) {
      setFormError(t('auth.passwordsDoNotMatch', 'Les mots de passe ne correspondent pas.'))
      return
    }

    setIsLoading(true)
    try {
      await completeFirstLogin({ currentPassword, newPassword, confirmPassword })
      if (updateSessionUser) {
        updateSessionUser({ firstLogin: false })
      }
      success(t('auth.passwordChangedSuccess', 'Mot de passe modifié avec succès. Bienvenue sur votre espace !'))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.message || t('auth.passwordChangeFailed', 'Échec du changement de mot de passe.')
      setFormError(msg)
      toastError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div data-contract="force-pwd-form" className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          {t('auth.firstLoginTitle', 'Changement de mot de passe obligatoire')}
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {t(
            'auth.firstLoginSubtitle',
            'Il s’agit de votre première connexion. Pour sécuriser votre compte, veuillez définir un nouveau mot de passe personnel.'
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="first-login-current-pwd" className="block text-xs font-semibold text-zinc-700 mb-1.5">
            {t('auth.currentPassword', 'Mot de passe actuel / temporaire')}
          </label>
          <div className="relative flex items-center">
            <input
              id="first-login-current-pwd"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="w-full h-10 ps-3.5 pe-10 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute end-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="first-login-new-pwd" className="block text-xs font-semibold text-zinc-700 mb-1.5">
            {t('auth.newPassword', 'Nouveau mot de passe')}
          </label>
          <div className="relative flex items-center">
            <input
              id="first-login-new-pwd"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="new-password"
              className="w-full h-10 ps-3.5 pe-10 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute end-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="first-login-confirm-pwd" className="block text-xs font-semibold text-zinc-700 mb-1.5">
            {t('auth.confirmPassword', 'Confirmer le nouveau mot de passe')}
          </label>
          <div className="relative flex items-center">
            <input
              id="first-login-confirm-pwd"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="new-password"
              className="w-full h-10 ps-3.5 pe-10 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute end-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg space-y-1.5">
          <p className="text-[11px] font-semibold text-zinc-600">Exigences de sécurité :</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
            {passwordRules.map((rule, idx) => (
              <div key={idx} className={`flex items-center gap-1.5 ${rule.valid ? 'text-emerald-700 font-medium' : 'text-zinc-400'}`}>
                <CheckCircle2 className={`w-3 h-3 shrink-0 ${rule.valid ? 'text-emerald-600' : 'text-zinc-300'}`} />
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        {formError && (
          <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid || !isMatch}
          className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{t('auth.savePasswordAndContinue', 'Enregistrer et accéder à mon espace')}</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
          >
            {t('auth.logoutOtherAccount', 'Se déconnecter et utiliser un autre compte')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ForcePasswordChangeForm
