import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ForcePasswordChangeForm } from '../ForcePasswordChangeForm'
import { AuthContext } from '@/features/auth/context/AuthContext'
import * as authApi from '@/features/auth/api/authApi'

vi.mock('@/features/auth/api/authApi', () => ({
  completeFirstLogin: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ForcePasswordChangeForm', () => {
  const updateSessionUser = vi.fn()
  const logout = vi.fn()

  const authValue = {
    user: { id: 1, email: 'user@school.com', firstLogin: true },
    isAuthenticated: true,
    updateSessionUser,
    logout,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <ForcePasswordChangeForm />
        </AuthContext.Provider>
      </MemoryRouter>
    )

  it('renders forced password change heading and form fields', () => {
    renderComponent()
    expect(screen.getByText('Changement de mot de passe obligatoire')).toBeInTheDocument()
    expect(screen.getByLabelText(/Mot de passe actuel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nouveau mot de passe/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirmer le nouveau mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enregistrer et accéder à mon espace/i })).toBeDisabled()
  })

  it('enforces password criteria before allowing submission', async () => {
    renderComponent()

    const currentPwdInput = screen.getByLabelText(/Mot de passe actuel/i)
    const newPwdInput = screen.getByLabelText(/^Nouveau mot de passe/i)
    const confirmPwdInput = screen.getByLabelText(/Confirmer le nouveau mot de passe/i)
    const submitBtn = screen.getByRole('button', { name: /Enregistrer et accéder à mon espace/i })

    fireEvent.change(currentPwdInput, { target: { value: 'OldPassword123!' } })
    fireEvent.change(newPwdInput, { target: { value: 'simple' } })
    fireEvent.change(confirmPwdInput, { target: { value: 'simple' } })
    expect(submitBtn).toBeDisabled()

    // Valid compliant password meeting all criteria
    fireEvent.change(newPwdInput, { target: { value: 'NewCompliantPassword123!' } })
    fireEvent.change(confirmPwdInput, { target: { value: 'NewCompliantPassword123!' } })

    expect(submitBtn).not.toBeDisabled()
  })

  it('calls completeFirstLogin and navigates to /dashboard on success', async () => {
    authApi.completeFirstLogin.mockResolvedValueOnce({ success: true })
    renderComponent()

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), { target: { value: 'OldPassword123!' } })
    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe/i), { target: { value: 'NewSecurePwd123#' } })
    fireEvent.change(screen.getByLabelText(/Confirmer le nouveau mot de passe/i), { target: { value: 'NewSecurePwd123#' } })

    fireEvent.click(screen.getByRole('button', { name: /Enregistrer et accéder à mon espace/i }))

    await waitFor(() => {
      expect(authApi.completeFirstLogin).toHaveBeenCalledWith({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewSecurePwd123#',
        confirmPassword: 'NewSecurePwd123#',
      })
      expect(updateSessionUser).toHaveBeenCalledWith({ firstLogin: false })
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })
})
