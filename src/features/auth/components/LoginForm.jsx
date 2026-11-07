import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useI18n } from '@/hooks/useI18n'
import { EduTrackLogo } from '@/components/ui/EduTrackLogo'

const QUICK_ACCOUNTS = [
  {
    roleKey: 'roles.admin',
    defaultRole: 'Admin',
    name: 'Admin Principal',
    email: 'admin@school.edu',
    role: 'admin',
    badge: 'bg-[#EEF2FF] text-[#4361EE] border border-[#C7D2FE]',
  },
  {
    roleKey: 'roles.teacher',
    defaultRole: 'Enseignant',
    name: 'Prof. Martin',
    email: 'professeur@school.edu',
    role: 'teacher',
    badge: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
  },
  {
    roleKey: 'roles.student',
    defaultRole: 'Élève',
    name: 'Lucas Bernard',
    email: 'eleve@school.edu',
    role: 'student',
    badge: 'bg-[#EEF2FF] text-[#4361EE] border border-[#C7D2FE]',
  },
  {
    roleKey: 'roles.parent',
    defaultRole: 'Parent',
    name: 'Claire Johnson',
    email: 'parent@school.edu',
    role: 'parent',
    badge: 'bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]',
  },
  {
    roleKey: 'roles.staff',
    defaultRole: 'Personnel',
    name: 'Robert Dupont',
    email: 'staff@school.edu',
    role: 'staff',
    badge: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
  },
]

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const { success, error: toastError } = useToast()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('admin@school.edu')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [showQuickLogins, setShowQuickLogins] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isLoading) return
    setFormError('')

    if (!email || !password) {
      setFormError(t('login.requiredFields', 'Veuillez remplir tous les champs obligatoires.'))
      return
    }

    try {
      await login({ email: email.trim(), password })
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
    setPassword('password123')
    setFormError('')

    try {
      await login({
        email: acc.email,
        password: 'password123',
        role: acc.role,
        name: acc.name,
      })
      success(t('login.connectedAs', { name: acc.name }, `Connecté en tant que ${acc.name}`))
      navigate(from, { replace: true })
    } catch {
      toastError(t('login.quickError', 'Erreur de connexion rapide.'))
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white select-none">
      {/* Left Column (Figma Auth Hero Graphic & Steps) */}
      <div className="w-full lg:w-1/2 relative bg-[#0F172A] flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[460px] lg:min-h-screen overflow-hidden">
        {/* Background Image from Figma with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/auth-hero-figma.jpg"
            alt="EduTrack Campus"
            className="w-full h-full object-cover opacity-40 brightness-75 contrast-125"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/65 to-[#0B0F19]/40" />
        </div>

        {/* Top: Brand Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="cursor-pointer">
            <EduTrackLogo variant="light" size="md" />
          </Link>
        </div>

        {/* Middle: Hero Typography */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/15 mb-4">
            Academic Portal · {t('login.title', 'Espace Institutionnel')}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Start your journey
          </h1>
          <p className="text-sm sm:text-base text-white/80 mt-3 leading-relaxed">
            Accédez à votre espace scolaire unifié pour consulter les notes, emplois du temps, présences et dossiers administratifs.
          </p>
        </div>

        {/* Bottom: 3 Steps Cards matching Figma */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10">
          <div className="bg-white rounded-2xl p-4 text-[#1E293B] shadow-lg flex flex-col justify-between min-h-[90px]">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#4361EE] text-white text-xs font-bold flex items-center justify-center">
                01
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B]">Identifiants</p>
              <p className="text-[10px] text-[#64748B]">Connexion sécurisée</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white border border-white/10 flex flex-col justify-between min-h-[90px]">
            <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">
              02
            </span>
            <div>
              <p className="text-xs font-bold">Rôle & Droits</p>
              <p className="text-[10px] text-white/70">Vérification RBAC</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white border border-white/10 flex flex-col justify-between min-h-[90px]">
            <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">
              03
            </span>
            <div>
              <p className="text-xs font-bold">Tableau de Bord</p>
              <p className="text-[10px] text-white/70">Accès direct</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div>
            <span className="text-[11px] font-bold text-[#4361EE] uppercase tracking-wider">
              {t('app.name', 'EduTrack System')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight mt-1">
              {t('login.title', 'Connexion')}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              {t('login.subtitle', 'Entrez vos identifiants institutionnels pour accéder à votre espace.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} aria-label="Formulaire de connexion" className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                {t('login.emailLabel', 'Adresse email institutionnelle')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute start-3.5 text-[#94A3B8] pointer-events-none">
                  <Mail className="w-4 h-4 stroke-[2]" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder', 'exemple@school.edu')}
                  required
                  autoComplete="username"
                  className="w-full h-11 ps-10 pe-4 bg-white border border-[#E2E8F0] hover:border-slate-300 focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20 rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                {t('login.passwordLabel', 'Mot de passe')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute start-3.5 text-[#94A3B8] pointer-events-none">
                  <Lock className="w-4 h-4 stroke-[2]" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder', 'Votre mot de passe')}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 ps-10 pe-11 bg-white border border-[#E2E8F0] hover:border-slate-300 focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20 rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder:text-[#94A3B8] transition-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 text-[#94A3B8] hover:text-[#1E293B] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {formError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4361EE] hover:bg-[#3451D1] active:bg-[#2B44B8] text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t('login.submit', 'Continuer vers le tableau de bord')}</span>
            </button>
          </form>

          {/* Divider: OR */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-[#94A3B8] uppercase absolute">
              OU
            </span>
          </div>

          {/* Quick Demo Logins Toggle for all 6 Roles */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowQuickLogins(!showQuickLogins)}
              className="w-full text-center text-xs text-[#4361EE] hover:underline font-semibold cursor-pointer"
            >
              {showQuickLogins
                ? '▲ Masquer les comptes de test'
                : '▼ Connexion rapide 1-clic (5 rôles)'}
            </button>

            {showQuickLogins && (
              <div className="mt-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
                {QUICK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="text-start p-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#4361EE] hover:shadow-2xs transition-all cursor-pointer"
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${acc.badge} inline-block`}>
                      {t(acc.roleKey, acc.defaultRole)}
                    </span>
                    <p className="text-xs font-bold text-[#1E293B] mt-1 truncate">{acc.name}</p>
                    <p className="text-[10px] text-[#64748B] truncate">{acc.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legal / Terms */}
          <p className="text-[11px] text-center text-[#94A3B8] leading-relaxed pt-2">
            En vous connectant, vous confirmez accepter les{' '}
            <a href="#" className="underline hover:text-[#4361EE]">
              Conditions d&apos;utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="underline hover:text-[#4361EE]">
              Politique de confidentialité
            </a>{' '}
            d&apos;EduTrack.
          </p>
        </div>
      </div>
    </div>
  )
}

export const LoginPage = LoginForm
export default LoginForm
