import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('admin@school.edu')
  const [password, setPassword] = useState('password123')
  const [formError, setFormError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!email || !password) {
      setFormError('Veuillez renseigner votre email et votre mot de passe.')
      return
    }

    try {
      await login({ email, password, role: 'admin', name: 'Administrateur' })
      success('Connexion réussie. Bienvenue sur SchoolDesk !')
      navigate(from, { replace: true })
    } catch {
      toastError('Identifiants incorrects ou service indisponible.')
      setFormError('Identifiants incorrects.')
    }
  }

  const handleQuickLogin = async (roleName, roleEmail, roleRole) => {
    try {
      await login({
        email: roleEmail,
        password: 'password123',
        role: roleRole,
        name: roleName,
      })
      success(`Connecté en tant que ${roleName}`)
      navigate(from, { replace: true })
    } catch {
      toastError('Erreur de connexion rapide.')
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-2xs">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded bg-slate-900 text-white font-bold text-sm tracking-wider mb-2 shadow-2xs">
            SD
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Connexion au Desk Scolaire
          </h2>
          <p className="mt-1 text-2xs text-slate-500">
            Accédez à votre espace de gestion pédagogique et administratif
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email académique"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="identifiant@school.edu"
            required
            autoComplete="username"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {formError && (
            <div className="rounded border border-rose-200 bg-rose-50 p-2 text-2xs text-rose-700 font-medium">
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
            Se connecter
          </Button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">
            Comptes de démonstration rapide
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('Admin Principal', 'admin@school.edu', 'admin')}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Prof. Martin', 'professeur@school.edu', 'teacher')}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              Enseignant
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('Lucas Bernard', 'eleve@school.edu', 'student')}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              Élève
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/showcase" className="text-2xs text-slate-500 hover:text-slate-800 underline">
            Voir le catalogue de composants sans connexion →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
