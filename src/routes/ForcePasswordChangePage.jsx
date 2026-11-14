import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ForcePasswordChangeForm } from '@/features/auth/components/ForcePasswordChangeForm'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

const CURRENT_YEAR = new Date().getFullYear()

export function ForcePasswordChangePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true })
      } else if (!user?.firstLogin) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isLoading, isAuthenticated, user, navigate])

  if (isLoading || !isAuthenticated || !user?.firstLogin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 p-4 sm:p-6 select-none">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center shadow-xs">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.25" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-900">EduTrack</span>
        </div>
        <LanguageSwitcher size="xs" />
      </header>

      <main className="flex-1 flex items-center justify-center py-8">
        <ForcePasswordChangeForm />
      </main>

      <footer className="w-full max-w-6xl mx-auto text-center py-4 text-xs text-zinc-400">
        © {CURRENT_YEAR} EduTrack Platform · Tous droits réservés.
      </footer>
    </div>
  )
}

export default ForcePasswordChangePage
