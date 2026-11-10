import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { consumePkceSession } from '@/features/auth/utils/pkce'

export function GoogleCallbackPage() {
  const { t, language, dir } = useI18n()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithGoogle, linkGoogleAccount } = useAuth()

  const googleError = searchParams.get('error')
  const initialError = (() => {
    if (googleError === 'access_denied') {
      return t('auth.googleCallback.canceled', 'Opération annulée : vous avez refusé la demande d’accès Google.')
    }
    if (googleError) {
      return `${t('auth.googleCallback.genericGoogleError', 'Erreur lors de la communication avec Google.')} (${googleError})`
    }
    if (!searchParams.get('code')) {
      return t('auth.googleCallback.missingCode', 'Code d’autorisation absent de la réponse Google.')
    }
    return null
  })()

  const [status, setStatus] = useState(initialError ? 'error' : 'processing')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(() => t('auth.googleCallback.successLogin', 'Connexion réussie !'))
  const [isLinkingFlow, setIsLinkingFlow] = useState(false)
  const processedRef = useRef(false)
  const displayedError = initialError || errorMessage

  useEffect(() => {
    if (initialError || processedRef.current) return
    processedRef.current = true

    async function processCallback() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const { state: savedState, codeVerifier, nonce, action, linkToken } = consumePkceSession()

      const isLink = action === 'link'
      setIsLinkingFlow(isLink)

      if (!savedState || savedState !== state) {
        setStatus('error')
        setErrorMessage(t('auth.googleCallback.invalidState', 'Échec de validation de sécurité : paramètre d’état (state) invalide ou expiré.'))
        return
      }

      if (!codeVerifier) {
        setStatus('error')
        setErrorMessage(t('auth.googleCallback.missingVerifier', 'Échec de validation de sécurité : vérificateur PKCE introuvable.'))
        return
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`

      try {
        if (isLink) {
          if (!linkToken) {
            setStatus('error')
            setErrorMessage(t('auth.googleCallback.missingLinkToken', 'Jeton de confirmation d’identité absent ou expiré. Veuillez confirmer à nouveau votre mot de passe.'))
            return
          }
          await linkGoogleAccount({
            code,
            codeVerifier,
            state,
            nonce,
            redirectUri,
            linkToken,
          })
          setStatus('success')
          setSuccessMessage(t('auth.googleCallback.successLink', 'Compte Google associé avec succès !'))
          setTimeout(() => {
            navigate('/profile', { replace: true })
          }, 600)
        } else {
          const ok = await loginWithGoogle({
            code,
            codeVerifier,
            state,
            nonce,
            redirectUri,
          })
          if (ok) {
            setStatus('success')
            setSuccessMessage(t('auth.googleCallback.successLogin', 'Connexion réussie !'))
            setTimeout(() => {
              navigate('/dashboard', { replace: true })
            }, 800)
          } else {
            setStatus('error')
            setErrorMessage(t('auth.googleCallback.finalizeError', 'Impossible de finaliser l’authentification Google.'))
          }
        }
      } catch (err) {
        setStatus('error')
        setErrorMessage(err.message || t('auth.googleCallback.authRefused', 'Authentification Google refusée. Vérifiez que votre compte scolaire est autorisé.'))
      }
    }

    processCallback()
  }, [initialError, searchParams, loginWithGoogle, linkGoogleAccount, navigate, t])

  return (
    <div dir={dir} lang={language} className="min-h-screen relative flex items-center justify-center bg-zinc-50 p-6 select-none">
      <div className="absolute top-4 end-4 z-20">
        <LanguageSwitcher size="xs" />
      </div>

      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#1d4ed8] flex items-center justify-center text-white">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.25" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-base font-bold text-zinc-900 tracking-tight">EduTrack</span>
        </div>

        {status === 'processing' && (
          <div className="space-y-4 py-4">
            <Loader2 className="w-10 h-10 text-[#1d4ed8] animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                {isLinkingFlow
                  ? t('auth.googleCallback.linkingTitle', 'Association du compte Google')
                  : t('auth.googleCallback.verifyingTitle', 'Vérification auprès de Google')}
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                {isLinkingFlow
                  ? t('auth.googleCallback.linkingSubtitle', 'Validation cryptographique de votre compte Google et enregistrement sécurisé...')
                  : t('auth.googleCallback.verifyingSubtitle', "Validation du jeton d'identité et initialisation sécurisée de votre session scolaire...")}
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{successMessage}</h3>
              <p className="text-xs text-zinc-500 mt-1.5">
                {isLinkingFlow
                  ? t('auth.googleCallback.redirectProfile', 'Redirection vers les paramètres de votre profil...')
                  : t('auth.googleCallback.redirectDashboard', 'Redirection vers votre tableau de bord EduTrack...')}
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                {isLinkingFlow
                  ? t('auth.googleCallback.linkErrorTitle', 'Échec de la liaison Google')
                  : t('auth.googleCallback.errorTitle', 'Authentification refusée')}
              </h3>
              <p className="text-xs text-rose-700 mt-2 p-3.5 bg-rose-50/70 rounded-lg border border-rose-200 text-start leading-relaxed">
                {displayedError}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to={isLinkingFlow ? '/profile' : '/login'}
                className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{isLinkingFlow ? t('auth.googleCallback.backToProfile', 'Retour à mon profil') : t('auth.googleCallback.backToLogin', 'Retour à la page de connexion')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoogleCallbackPage
