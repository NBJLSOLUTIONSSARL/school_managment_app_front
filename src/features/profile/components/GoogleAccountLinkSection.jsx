import { useState } from 'react'
import { CheckCircle2, ShieldCheck, Unlink, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useI18n } from '@/hooks/useI18n'
import { getGoogleAuthConfig } from '@/features/auth/api/authApi'
import {
  generateCodeChallenge,
  generateRandomString,
  storePkceSession,
} from '@/features/auth/utils/pkce'

export function GoogleAccountLinkSection() {
  const { user, initiateGoogleLink, unlinkGoogleAccount } = useAuth()
  const { t } = useI18n()
  const isLinked = Boolean(user?.googleLinked)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [feedbackNotice, setFeedbackNotice] = useState('')

  const handleOpenLinkModal = () => {
    setPassword('')
    setErrorMessage('')
    setFeedbackNotice('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isLoading) return
    setIsModalOpen(false)
    setPassword('')
    setErrorMessage('')
  }

  const handleConfirmIdentityAndStartOAuth = async (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setErrorMessage('Veuillez saisir votre mot de passe EduTrack.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const confirmRes = await initiateGoogleLink({ password: password.trim() })
      const linkToken = confirmRes?.data?.linkToken

      if (!linkToken) {
        throw new Error('Impossible d\'obtenir le jeton d\'autorisation de liaison.')
      }

      const configRes = await getGoogleAuthConfig()
      const googleConfig = configRes?.data

      if (!googleConfig?.enabled || !googleConfig?.clientId) {
        throw new Error(
          'L\'authentification Google Sign-In n\'est pas encore configurée sur le serveur. Veuillez définir GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.'
        )
      }

      const state = generateRandomString(32)
      const nonce = generateRandomString(32)
      const codeVerifier = generateRandomString(64)
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      storePkceSession({
        state,
        codeVerifier,
        nonce,
        action: 'link',
        linkToken,
      })

      const redirectUri = `${window.location.origin}/auth/google/callback`
      const params = new URLSearchParams({
        client_id: googleConfig.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
        nonce,
        prompt: 'select_account',
      })

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    } catch (err) {
      setErrorMessage(err.message || 'Échec de vérification du mot de passe.')
      setIsLoading(false)
    }
  }

  const handleUnlink = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir dissocier votre compte Google ? Vous devrez utiliser votre mot de passe pour vos prochaines connexions.')) {
      return
    }

    setIsUnlinking(true)
    setFeedbackNotice('')
    setErrorMessage('')

    try {
      await unlinkGoogleAccount()
      setFeedbackNotice('Compte Google dissocié avec succès.')
    } catch (err) {
      setErrorMessage(err.message || 'Impossible de dissocier le compte Google.')
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <section aria-label={t('profile.googleSection.title', 'Paramètres de sécurité Google')} className="profile-card mt-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              {t('profile.googleSection.title', 'Authentification Google')}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isLinked
                ? t('profile.googleSection.linkedDescription', 'Votre compte Google est associé à votre compte EduTrack.')
                : t('profile.googleSection.unlinkedDescription', 'Associez votre compte Google pour vous connecter rapidement.')}
            </p>
          </div>
        </div>

        <div>
          {isLinked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('profile.googleSection.linkedBadge', 'Compte Google associé')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              {t('profile.googleSection.notLinkedBadge', 'Non associé')}
            </span>
          )}
        </div>
      </div>

      {feedbackNotice && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {errorMessage && !isModalOpen && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/80 p-4 rounded-xl border border-zinc-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 shadow-2xs flex items-center justify-center shrink-0">
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
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900">{t('profile.googleSection.title', 'Connexion Google Sign-In')}</p>
            <p className="text-2xs text-zinc-500">
              {isLinked
                ? t('profile.googleSection.linkedDescription', 'Votre compte Google est lié. Vous pouvez l’utiliser directement sur l\'écran de connexion.')
                : t('profile.googleSection.unlinkedDescription', 'Aucun compte Google n\'est actuellement rattaché à votre compte.')}
            </p>
          </div>
        </div>

        <div>
          {isLinked ? (
            <button
              type="button"
              onClick={handleUnlink}
              disabled={isUnlinking}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUnlinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
              <span>{t('profile.googleSection.unlinkButton', 'Dissocier le compte Google')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t('profile.googleSection.linkButton', 'Associer mon compte Google')}</span>
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-identity-title"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 id="confirm-identity-title" className="text-base font-bold text-zinc-900">
                  {t('profile.googleSection.modalTitle', 'Confirmer votre identité')}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {t('profile.googleSection.modalSubtitle', 'Étape obligatoire avant d\'associer votre compte Google.')}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200/60">
              {t('profile.googleSection.modalSubtitle', 'Pour des raisons de sécurité, veuillez saisir votre mot de passe EduTrack actuel. Vous serez ensuite redirigé vers Google pour autoriser l\'association.')}
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConfirmIdentityAndStartOAuth} className="space-y-4 pt-1">
              <div>
                <label
                  htmlFor="confirm-password-input"
                  className="block text-xs font-medium text-zinc-700 mb-1"
                >
                  {t('profile.googleSection.passwordLabel', 'Mot de passe actuel EduTrack')}
                </label>
                <div className="relative">
                  <input
                    id="confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('profile.googleSection.passwordPlaceholder', 'Entrez votre mot de passe')}
                    disabled={isLoading}
                    autoFocus
                    required
                    className="w-full h-10 px-3 pe-10 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute end-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !password.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('profile.googleSection.verifying', 'Vérification...')}</span>
                    </>
                  ) : (
                    <span>{t('profile.googleSection.confirmButton', 'Continuer avec Google')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default GoogleAccountLinkSection
