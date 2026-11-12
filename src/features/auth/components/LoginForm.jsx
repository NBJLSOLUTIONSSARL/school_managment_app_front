import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useI18n } from '@/hooks/useI18n'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { getGoogleAuthConfig } from '@/features/auth/api/authApi'
import { generateRandomString, generateCodeChallenge, storePkceSession } from '@/features/auth/utils/pkce'

const QUICK_ACCOUNTS = [
  {
    roleKey: 'roles.admin',
    defaultRole: 'Admin',
    name: 'Marc Dupont (Admin)',
    email: 'admin@school.com',
    role: 'admin',
    badge: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
  },
  {
    roleKey: 'roles.teacher',
    defaultRole: 'Enseignant',
    name: 'Claire Martin (Prof)',
    email: 'claire.martin@school.com',
    role: 'teacher',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  {
    roleKey: 'roles.student',
    defaultRole: 'Élève',
    name: 'Léo Leroy (Élève)',
    email: 'leo.leroy@student.com',
    role: 'student',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  {
    roleKey: 'roles.parent',
    defaultRole: 'Parent',
    name: 'Alain Leroy (Parent)',
    email: 'alain.leroy@parent.com',
    role: 'parent',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  {
    roleKey: 'roles.staff',
    defaultRole: 'Personnel',
    name: 'Marie Robert (Staff)',
    email: 'marie.robert@school.com',
    role: 'staff',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
]

export function LoginForm() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const { success, error: toastError } = useToast()
  const { t, language, dir } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('admin@school.com')
  const [password, setPassword] = useState('Password123')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [showQuickLogins, setShowQuickLogins] = useState(false)
  const [infoNotice, setInfoNotice] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const searchParams = new URLSearchParams(location.search)
  const redirectParam = searchParams.get('redirect')
  let from = '/dashboard'

  if (location.state?.from?.pathname && !location.state.from.pathname.startsWith('/login')) {
    from = location.state.from.pathname + (location.state.from.search || '')
  } else if (
    redirectParam &&
    !redirectParam.startsWith('/login') &&
    !redirectParam.startsWith('http://') &&
    !redirectParam.startsWith('https://') &&
    !redirectParam.startsWith('//')
  ) {
    from = redirectParam
  }

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  const handleGoogleSignIn = async () => {
    if (isLoading || isGoogleLoading) return
    setFormError('')
    setInfoNotice('')
    setIsGoogleLoading(true)

    try {
      const configRes = await getGoogleAuthConfig()
      const googleConfig = configRes?.data

      if (!googleConfig?.enabled || !googleConfig?.clientId) {
        setFormError(
          t(
            'login.googleNotConfigured',
            'L’authentification Google Sign-In n’est pas encore configurée sur le serveur. Veuillez définir GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans les variables d’environnement.'
          )
        )
        setIsGoogleLoading(false)
        return
      }

      const state = generateRandomString(32)
      const nonce = generateRandomString(32)
      const codeVerifier = generateRandomString(64)
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      storePkceSession({ state, codeVerifier, nonce })

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
      setFormError(err.message || t('login.googleInitError', 'Impossible d’initialiser l’authentification Google.'))
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isLoading) return
    setFormError('')
    setInfoNotice('')

    if (!email || !password) {
      setFormError(t('login.requiredFields', 'Veuillez remplir tous les champs obligatoires.'))
      return
    }

    try {
      const ok = await login({ email: email.trim(), password })
      if (ok === false) return
      success(t('login.success', 'Connexion réussie.'))
      navigate(from, { replace: true })
    } catch {
      toastError(t('login.invalidCredentials', 'Identifiants incorrects.'))
      setFormError(t('login.invalidCredentialsShort', 'Identifiants incorrects.'))
    }
  }

  const handleQuickLogin = async (acc) => {
    if (isLoading) return
    setEmail(acc.email)
    setPassword('Password123')
    setFormError('')
    setInfoNotice('')

    try {
      const ok = await login({
        email: acc.email,
        password: 'Password123',
        role: acc.role,
        name: acc.name,
      })
      if (ok === false) return
      success(t('login.connectedAs', { name: acc.name }, `Connecté en tant que ${acc.name}`))
      navigate(from, { replace: true })
    } catch {
      toastError(t('login.quickError', 'Erreur de connexion rapide.'))
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
            {t('login.portalBadge', 'Portail Académique · Connexion')}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            {t('login.welcomeTitle', 'Bienvenue')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300/90 mt-3.5 leading-relaxed font-normal">
            {t('login.welcomeSubtitle', 'Accédez en toute sécurité à vos services académiques, vos emplois du temps et vos résultats scolaires.')}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 text-zinc-900 shadow-xl flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <p className="text-xs font-semibold text-zinc-900 mt-3 leading-snug">
              {t('login.step1', 'Authentification sécurisée')}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-white border border-white/10 flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-white/15 text-white/80 text-xs font-semibold flex items-center justify-center">
              2
            </div>
            <p className="text-xs font-medium text-zinc-300 mt-3 leading-snug">
              {t('login.step2', 'Validation des rôles')}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-white border border-white/10 flex flex-col justify-between min-h-[96px]">
            <div className="w-6 h-6 rounded-full bg-white/15 text-white/80 text-xs font-semibold flex items-center justify-center">
              3
            </div>
            <p className="text-xs font-medium text-zinc-300 mt-3 leading-snug">
              {t('login.step3', 'Accès au bureau Desk')}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[53%] relative flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="absolute top-4 end-4 z-20">
          <LanguageSwitcher size="xs" />
        </div>

        <div className="w-full max-w-[400px] space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
              {t('login.title', 'Connexion')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} aria-label={t('login.title', 'Formulaire de connexion')} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                {t('login.emailLabel', 'Identifiant ou Email')}
              </label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder', 'nom@school.edu')}
                required
                autoComplete="username"
                className="w-full h-11 px-3.5 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-zinc-700">
                  {t('login.passwordLabel', 'Mot de passe')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#1d4ed8] hover:underline cursor-pointer"
                >
                  {t('login.forgotPassword', 'Mot de passe oublié ?')}
                </Link>
              </div>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder', '••••••••••••••••')}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 ps-3.5 pe-10 bg-[#fcfcfd] border border-zinc-200 hover:border-zinc-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? t('auth.hidePassword', 'Masquer le mot de passe') : t('auth.showPassword', 'Afficher le mot de passe')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {infoNotice && (
              <div
                role="status"
                className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-center gap-2 animate-in fade-in"
              >
                <Info className="w-4 h-4 shrink-0 text-blue-600" />
                <span>{infoNotice}</span>
              </div>
            )}

            {formError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-[#1e3a8a] text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t('login.submit', 'Se connecter')}</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider absolute">
              {t('common.or', 'OU')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 bg-white border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 text-zinc-700 font-medium text-xs sm:text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span>{t('login.googleSignIn', 'Continuer avec Google')}</span>
          </button>

          <p className="text-[11px] text-center text-zinc-400 leading-relaxed pt-2">
            {t('login.termsDisclaimer', 'En vous connectant, vous acceptez la charte d\'utilisation et la politique de confidentialité de l\'établissement EduTrack.')}
          </p>

          <div className="pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setShowQuickLogins(!showQuickLogins)}
              className="w-full text-center text-[11px] text-zinc-400 hover:text-zinc-600 font-medium cursor-pointer"
            >
              {showQuickLogins
                ? t('login.quickAccountsHide', '▲ Masquer les comptes de test')
                : t('login.quickAccountsShow', '▼ Remplissage rapide (comptes de test)')}
            </button>

            {showQuickLogins && (
              <div className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
                {QUICK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="text-start p-2.5 rounded-lg bg-white border border-zinc-200 hover:border-[#1d4ed8] hover:shadow-2xs transition-all cursor-pointer"
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${acc.badge} inline-block`}>
                      {t(acc.roleKey, acc.defaultRole)}
                    </span>
                    <p className="text-xs font-semibold text-zinc-900 mt-1 truncate">{acc.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{acc.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const LoginPage = LoginForm
export default LoginForm
