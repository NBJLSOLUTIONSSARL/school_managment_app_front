import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { ToastProvider } from '@/context/ToastProvider'
import * as authHook from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/features/notifications', () => ({
  NotificationDropdown: () => <div data-testid="notifications-dropdown" />,
}))

function renderWithProviders(ui) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        {ui}
      </MemoryRouter>
    </ToastProvider>
  )
}

describe('PrivateLayout & Sidebar Permission-Based Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays Observations in the sidebar when user has role and PERM_READ_OBSERVATION', () => {
    authHook.useAuth.mockReturnValue({
      user: { id: 2, name: 'Claire Martin', roles: ['ROLE_TEACHER'], permissions: ['PERM_READ_OBSERVATION'] },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      hasRole: vi.fn((roles) => roles.includes('ROLE_TEACHER') || roles.includes('teacher')),
      hasPermission: vi.fn((perm) => perm === 'PERM_READ_OBSERVATION'),
    })

    renderWithProviders(<PrivateLayout />)

    expect(screen.getByRole('link', { name: /observations/i })).toBeInTheDocument()
  })

  it('does NOT display Observations in the sidebar when PERM_READ_OBSERVATION is missing', () => {
    authHook.useAuth.mockReturnValue({
      user: { id: 2, name: 'Claire Martin', roles: ['ROLE_TEACHER'], permissions: [] },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      hasRole: vi.fn((roles) => roles.includes('ROLE_TEACHER') || roles.includes('teacher')),
      hasPermission: vi.fn(() => false),
    })

    renderWithProviders(<PrivateLayout />)

    expect(screen.queryByRole('link', { name: /observations/i })).not.toBeInTheDocument()
  })

  it('does NOT display Observations in the sidebar when role does not permit it (e.g. ROLE_STUDENT)', () => {
    authHook.useAuth.mockReturnValue({
      user: { id: 3, name: 'Leo Leroy', roles: ['ROLE_STUDENT'], permissions: ['PERM_READ_ANALYSIS'] },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      hasRole: vi.fn((roles) => roles.includes('ROLE_STUDENT') || roles.includes('student')),
      hasPermission: vi.fn((perm) => perm === 'PERM_READ_ANALYSIS'),
    })

    renderWithProviders(<PrivateLayout />)

    expect(screen.queryByRole('link', { name: /observations/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /analyses/i })).toBeInTheDocument()
  })

  it('displays Consents when user has role and PERM_READ_CONSENT, and hides when permission is missing', () => {
    authHook.useAuth.mockReturnValue({
      user: { id: 7, name: 'Alain Leroy', roles: ['ROLE_PARENT'], permissions: ['PERM_READ_CONSENT'] },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      hasRole: vi.fn((roles) => roles.includes('ROLE_PARENT') || roles.includes('parent')),
      hasPermission: vi.fn((perm) => perm === 'PERM_READ_CONSENT'),
    })

    const { rerender } = render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <PrivateLayout />
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getByRole('link', { name: /consentements/i })).toBeInTheDocument()

    // Without permission
    authHook.useAuth.mockReturnValue({
      user: { id: 7, name: 'Alain Leroy', roles: ['ROLE_PARENT'], permissions: [] },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      hasRole: vi.fn((roles) => roles.includes('ROLE_PARENT') || roles.includes('parent')),
      hasPermission: vi.fn(() => false),
    })

    rerender(
      <ToastProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <PrivateLayout />
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.queryByRole('link', { name: /consentements/i })).not.toBeInTheDocument()
  })
})

describe('RoleGuard with Permission Guarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows access when user has required role and permission', () => {
    authHook.useAuth.mockReturnValue({
      user: { id: 1, roles: ['ROLE_ADMIN'], permissions: ['PERM_READ_OBSERVATION'] },
      isAuthenticated: true,
      isLoading: false,
      hasRole: vi.fn(() => true),
      hasPermission: vi.fn((perm) => perm === 'PERM_READ_OBSERVATION'),
    })

    render(
      <MemoryRouter initialEntries={['/observations']}>
        <RoleGuard allowedRoles={['ROLE_ADMIN']} requiredPermission="PERM_READ_OBSERVATION">
          <div>Protected Content</div>
        </RoleGuard>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /403 when requiredPermission is missing', () => {
    authHook.useAuth.mockReturnValue({
      user: { id: 1, roles: ['ROLE_ADMIN'], permissions: [] },
      isAuthenticated: true,
      isLoading: false,
      hasRole: vi.fn(() => true),
      hasPermission: vi.fn(() => false),
    })

    render(
      <MemoryRouter initialEntries={['/observations']}>
        <Routes>
          <Route
            path="/observations"
            element={
              <RoleGuard allowedRoles={['ROLE_ADMIN']} requiredPermission="PERM_READ_OBSERVATION">
                <div>Protected Content</div>
              </RoleGuard>
            }
          />
          <Route path="/403" element={<div>Access Denied 403</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Access Denied 403')).toBeInTheDocument()
  })
})
