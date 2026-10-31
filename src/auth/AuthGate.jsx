import { useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import LoginPage from '../pages/LoginPage'

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
    <div className="min-h-svh bg-frappe-bg font-sans text-xs text-frappe-dark">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-frappe-border bg-frappe-surface px-6 py-2">
        <p className="break-all">{user.email}</p>
        <button type="button" onClick={() => { void logout() }} className="h-8 rounded border border-frappe-border bg-frappe-surface px-2.5 text-xs font-medium hover:bg-frappe-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frappe-dark">Se déconnecter</button>
      </header>
      <main ref={contentRef} tabIndex={-1} aria-label="Accueil" className="starter-home focus:outline-none">{children}</main>
    </div>
  )
}
