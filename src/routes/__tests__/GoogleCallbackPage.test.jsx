import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GoogleCallbackPage } from '@/routes/GoogleCallbackPage'
import * as authHook from '@/hooks/useAuth'
import * as pkce from '@/features/auth/utils/pkce'

vi.mock('@/hooks/useAuth')
vi.mock('@/features/auth/utils/pkce')

describe('GoogleCallbackPage', () => {
  const mockLoginWithGoogle = vi.fn()
  const mockLinkGoogleAccount = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    authHook.useAuth.mockReturnValue({
      loginWithGoogle: mockLoginWithGoogle,
      linkGoogleAccount: mockLinkGoogleAccount,
    })
  })

  function renderPage(search = '?code=valid-auth-code&state=valid-state') {
    return render(
      <MemoryRouter initialEntries={[`/auth/google/callback${search}`]}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/dashboard" element={<div>Dashboard Mock</div>} />
          <Route path="/profile" element={<div>Profile Mock</div>} />
          <Route path="/login" element={<div>Login Mock</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('handles user cancellation with access_denied', () => {
    renderPage('?error=access_denied')
    expect(screen.getByText(/Opération annulée : vous avez refusé/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /retour à la page de connexion/i })).toBeInTheDocument()
  })

  it('validates state and completes standard login flow', async () => {
    pkce.consumePkceSession.mockReturnValueOnce({
      state: 'valid-state',
      codeVerifier: 'valid-verifier',
      nonce: 'mock-nonce-123',
      action: null,
      linkToken: null,
    })
    mockLoginWithGoogle.mockResolvedValueOnce(true)

    renderPage('?code=valid-auth-code&state=valid-state')

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledWith({
        code: 'valid-auth-code',
        codeVerifier: 'valid-verifier',
        state: 'valid-state',
        nonce: 'mock-nonce-123',
        redirectUri: 'http://localhost:3000/auth/google/callback',
      })
    })

    expect(await screen.findByText('Connexion réussie !')).toBeInTheDocument()
    expect(await screen.findByText('Dashboard Mock')).toBeInTheDocument()
  })

  it('completes account linking flow when action is link', async () => {
    pkce.consumePkceSession.mockReturnValueOnce({
      state: 'valid-state',
      codeVerifier: 'valid-verifier',
      nonce: 'mock-nonce-456',
      action: 'link',
      linkToken: 'valid-link-token',
    })
    mockLinkGoogleAccount.mockResolvedValueOnce(true)

    renderPage('?code=valid-auth-code&state=valid-state')

    await waitFor(() => {
      expect(mockLinkGoogleAccount).toHaveBeenCalledWith({
        code: 'valid-auth-code',
        codeVerifier: 'valid-verifier',
        state: 'valid-state',
        nonce: 'mock-nonce-456',
        redirectUri: 'http://localhost:3000/auth/google/callback',
        linkToken: 'valid-link-token',
      })
    })

    expect(await screen.findByText('Compte Google associé avec succès !')).toBeInTheDocument()
    expect(await screen.findByText('Profile Mock', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('displays exact error message when account exists but is not linked', async () => {
    pkce.consumePkceSession.mockReturnValueOnce({
      state: 'valid-state',
      codeVerifier: 'valid-verifier',
      action: null,
      linkToken: null,
    })
    const errorMsg = 'Un compte existe déjà avec cette adresse email. Connectez-vous avec votre mot de passe pour associer votre compte Google.'
    mockLoginWithGoogle.mockRejectedValueOnce(new Error(errorMsg))

    renderPage('?code=valid-auth-code&state=valid-state')

    expect(await screen.findByText(errorMsg)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /retour à la page de connexion/i })).toBeInTheDocument()
  })

  it('displays exact error message when Google account is unknown', async () => {
    pkce.consumePkceSession.mockReturnValueOnce({
      state: 'valid-state',
      codeVerifier: 'valid-verifier',
      action: null,
      linkToken: null,
    })
    const errorMsg = 'Aucun compte EduTrack n\'est associé à ce compte Google. Veuillez contacter l\'administrateur.'
    mockLoginWithGoogle.mockRejectedValueOnce(new Error(errorMsg))

    renderPage('?code=valid-auth-code&state=valid-state')

    expect(await screen.findByText(errorMsg)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /retour à la page de connexion/i })).toBeInTheDocument()
  })
})
