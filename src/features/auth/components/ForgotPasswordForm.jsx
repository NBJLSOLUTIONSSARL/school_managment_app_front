import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { requestForgotPassword } from '@/features/auth/api/authApi'
import { useI18n } from '@/hooks/useI18n'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function ForgotPasswordForm() {
  const { t, language, dir } = useI18n()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return
    setErrorMessage('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(t('auth.forgotPassword.invalidEmail', 'Veuillez saisir une adresse e-mail valide.'))
      return
    }

    setIsLoading(true)
    try {
      await requestForgotPassword(cleanEmail)
      setSubmittedEmail(cleanEmail)
      setIsSubmitted(true)
    } catch (err) {
      if (err.status === 429) {
        setErrorMessage(
          t('auth.forgotPassword.rateLimited', 'Trop de demandes effectuées. Veuillez patienter 15 minutes avant de réessayer.')
        )
      } else {
        setErrorMessage(
          err.message || t('auth.forgotPassword.genericError', 'Impossible de traiter votre demande. Veuillez réessayer plus tard.')
        )
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
            {t('auth.forgotPassword.securityBadge', 'Sécurité & Récupération · EduTrack')}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            {t('auth.forgotPassword.heroTitle', 'Mot de passe oublié')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300/90 mt-3.5 leading-relaxed font-normal">
            {t('auth.forgotPassword.heroSubtitle', "Récupérez l'accès à votre portail académique. Un lien de vérification sécurisé et chiffré à usage unique vous sera envoyé par e-mail.")}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 text-zinc-900 shadow-xl flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <p className="text-xs font-semibold text-zinc-900 mt-3 leading-snug">
              {t('auth.forgotPassword.step1', 'Demande par e-mail')}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-white border border-white/10 flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-white/15 text-white/80 text-xs font-semibold flex items-center justify-center">
              2
            </div>
            <p className="text-xs font-medium text-zinc-300 mt-3 leading-snug">
              {t('auth.forgotPassword.step2', 'Réception du lien')}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-white border border-white/10 flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-white/15 text-white/80 text-xs font-semibold flex items-center justify-center">
              3
            </div>
            <p className="text-xs font-medium text-zinc-300 mt-3 leading-snug">
              {t('auth.forgotPassword.step3', 'Nouveau mot de passe')}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[53%] relative flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="absolute top-4 end-4 z-20">
          <LanguageSwitcher size="xs" />
        </div>

        <div className="w-full max-w-[400px] space-y-6">
          {!isSubmitted ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
                  {t('auth.forgotPassword.title', 'Mot de passe oublié ?')}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
                  {t('auth.forgotPassword.subtitle', 'Saisissez votre adresse e-mail institutionnelle pour recevoir les instructions de réinitialisation.')}
                </p>
              </div>

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
                  <label htmlFor="recovery-email" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t('auth.forgotPassword.emailLabel', 'Adresse e-mail')}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.forgotPassword.emailPlaceholder', 'nom@school.com')}
                      required
                      autoComplete="email"
                      autoFocus
                      className="w-full h-11 ps-3.5 pe-10 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
                    />
                    <Mail className="absolute end-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-[#1e3a8a] text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t('auth.forgotPassword.submit', 'Envoyer le lien de réinitialisation')}</span>
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{t('auth.forgotPassword.backToLogin', 'Retour à la connexion')}</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {t('auth.forgotPassword.checkEmailTitle', 'Consultez votre boîte e-mail')}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                  {t('auth.forgotPassword.checkEmailText', { email: submittedEmail }, `Si un compte est associé à l'adresse ${submittedEmail}, un e-mail contenant votre lien de réinitialisation vient de vous être envoyé.`)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs text-start leading-relaxed space-y-2">
                <p className="font-semibold text-zinc-900">{t('auth.forgotPassword.importantInfoTitle', '🛡️ Informations importantes :')}</p>
                <ul className="list-disc list-inside space-y-1 text-zinc-600">
                  <li>{t('auth.forgotPassword.importantInfo1', 'Le lien est sécurisé, à usage unique et expire dans 30 minutes.')}</li>
                  <li>{t('auth.forgotPassword.importantInfo2', 'Pensez à vérifier votre dossier Courrier indésirable (Spam) si vous ne le trouvez pas dans votre boîte de réception.')}</li>
                  <li>{t('auth.forgotPassword.importantInfo3', 'Toutes les sessions actives seront automatiquement révoquées lors du changement de mot de passe.')}</li>
                </ul>
              </div>

              <div className="pt-3 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t('auth.forgotPassword.backToLogin', 'Retour à la connexion')}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-10 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  {t('auth.forgotPassword.tryAnotherEmail', 'Saisir une autre adresse e-mail')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
