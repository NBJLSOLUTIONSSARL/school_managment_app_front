import { useEffect, useRef } from 'react'
import { useAuth } from '@/features/auth'
import LoginPage from '@/features/auth/components/AlternateLoginForm'
import ProfileShell from '@/features/profile/components/ProfileShell'

export function AuthGate({ children }) {
  const { user, isAuthenticated, logout } = useAuth()
  const contentRef = useRef(null)
  useEffect(() => {
    if (isAuthenticated) {
      window.history.replaceState(null, '', '/')
      contentRef.current?.focus()
    }
  }, [isAuthenticated])
  if (!isAuthenticated) return <LoginPage />
  return (
    <ProfileShell user={user} logout={logout}>
      <main ref={contentRef} tabIndex={-1} aria-label="Accueil" className="starter-home focus:outline-none">{children}</main>
    </ProfileShell>
  )
}
