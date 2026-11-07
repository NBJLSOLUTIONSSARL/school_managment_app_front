import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const { success, error: toastError } = useToast()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('admin@school.edu')
  const [password, setPassword] = useState('password123')
  const [formError, setFormError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isLoading) return
    setFormError('')

    if (!email || !password) {
      setFormError(t('login.requiredFields'))
      return
    }

    try {
      await login({ email, password, role: 'admin', name: 'Administrateur' })
      success(t('login.success'))
      navigate(from, { replace: true })
    } catch {
      toastError(t('login.invalidCredentials'))
      setFormError(t('login.invalidCredentialsShort'))
    }
  }

  const handleQuickLogin = async (roleName, roleEmail, roleRole) => {
    if (isLoading) return

    try {
      await login({
        email: roleEmail,
        password: 'password123',
        role: roleRole,
        name: roleName,
      })
      success(t('login.connectedAs', { name: roleName }))
      navigate(from, { replace: true })
    } catch {
      toastError(t('login.quickError'))
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="mb-6 text-center">
          <div
            aria-hidden="true"
            className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded bg-slate-900 text-sm font-bold tracking-wider text-white shadow-2xs"
          >
            SD
          </div>
          <h1 className="text-base font-semibold tracking-tight text-slate-900">
            {t('login.title')}
          </h1>
          <p className="mt-1 text-2xs text-slate-500">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label={t('login.emailLabel')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('login.emailPlaceholder')}
            required
            autoComplete="username"
          />

          <Input
            label={t('login.passwordLabel')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            required
            autoComplete="current-password"
          />

          {formError && (
            <div
              role="alert"
              className="rounded border border-rose-200 bg-rose-50 p-2 text-2xs font-medium text-rose-700"
            >
              {formError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isLoading}
          >
            {t('login.submit')}
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t('login.quickAccounts')}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('Admin Principal', 'admin@school.edu', 'admin')}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              {t('roles.admin')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Prof. Martin', 'professeur@school.edu', 'teacher')}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              {t('roles.teacher')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Lucas Bernard', 'eleve@school.edu', 'student')}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              {t('roles.student')}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/showcase" className="text-2xs text-slate-500 underline hover:text-slate-800">
            {t('login.showcaseLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export const LoginPage = LoginForm
export default LoginForm
