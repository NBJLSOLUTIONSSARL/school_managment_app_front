import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { getCookie } from '@/lib/i18n/cookieUtils'
import { AuthProvider } from '@/features/auth'
import { ToastProvider } from '@/context/ToastProvider'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'
import { GoogleCallbackPage } from '@/routes/GoogleCallbackPage'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { LANGUAGE_COOKIE_KEY } from '@/lib/i18n/translations'
import { clearTokens } from '@/utils/tokenStorage'
import * as authApi from '@/features/auth/api/authApi'

vi.mock('@/features/auth/api/authApi', async () => {
  const actual = await vi.importActual('@/features/auth/api/authApi')
  return {
    ...actual,
    getGoogleAuthConfig: vi.fn().mockResolvedValue({ data: { enabled: true, clientId: 'mock-id' } }),
    updateUserLanguage: vi.fn().mockResolvedValue({ success: true }),
    requestForgotPassword: vi.fn().mockResolvedValue({ success: true }),
    resetPassword: vi.fn().mockResolvedValue({ success: true }),
    getMe: vi.fn().mockResolvedValue({
      success: true,
      data: {
        id: 1,
        email: 'teacher@school.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        language: 'fr',
        active: true,
        roles: ['ROLE_TEACHER'],
        permissions: [],
      },
    }),
  }
})

import { useAuth } from '@/hooks/useAuth'

function AuthObserver() {
  const { user } = useAuth()
  return <div data-testid="auth-user-loaded">{user ? user.email : 'none'}</div>
}

describe('Language Selection & Internationalization Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    clearTokens()
    document.cookie = `${LANGUAGE_COOKIE_KEY}=; path=/; max-age=0`
    document.cookie = 'edutrack_session=; path=/; max-age=0'
    document.documentElement.lang = 'fr'
    document.documentElement.dir = 'ltr'
    vi.clearAllMocks()
  })

  it('allows changing language on the login page before authentication without localStorage/sessionStorage', async () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <LoginForm />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </MemoryRouter>
    )

    // Initially French
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('fr')
    expect(document.documentElement.dir).toBe('ltr')

    // Switch to English
    const enButton = screen.getByRole('button', { name: 'EN' })
    fireEvent.click(enButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
      expect(document.documentElement.lang).toBe('en')
      expect(document.documentElement.dir).toBe('ltr')
      expect(getCookie(LANGUAGE_COOKIE_KEY)).toBe('en')
      // Must NEVER write to localStorage or sessionStorage
      expect(localStorage.getItem('school_app_language')).toBeNull()
      expect(sessionStorage.getItem('school_app_language')).toBeNull()
      expect(localStorage.length).toBe(0)
    })

    // Switch to Arabic
    const arButton = screen.getByRole('button', { name: 'العربية' })
    fireEvent.click(arButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'تسجيل الدخول' })).toBeInTheDocument()
      expect(document.documentElement.lang).toBe('ar')
      expect(document.documentElement.dir).toBe('rtl')
      expect(getCookie(LANGUAGE_COOKIE_KEY)).toBe('ar')
      expect(localStorage.getItem('school_app_language')).toBeNull()
      expect(sessionStorage.getItem('school_app_language')).toBeNull()
      expect(localStorage.length).toBe(0)
    })
  })

  it('renders LanguageSwitcher with FR, EN, AR options', () => {
    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    )

    expect(screen.getByRole('button', { name: 'FR' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'العربية' })).toBeInTheDocument()
  })

  it('synchronizes user language preference to backend when changing language while logged in', async () => {
    // Simulate active session indicator
    document.cookie = 'edutrack_session=1; path=/'

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <AuthObserver />
              <LanguageSwitcher />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </MemoryRouter>
    )

    // Wait for initial session restoration from getMe() to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-user-loaded').textContent).toBe('teacher@school.com')
    })

    // Language switcher click EN
    const enButton = screen.getByRole('button', { name: 'EN' })
    fireEvent.click(enButton)

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('en')
      expect(authApi.updateUserLanguage).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'en' })
      )
      // Must NEVER write to localStorage or sessionStorage
      expect(localStorage.getItem('school_app_language')).toBeNull()
      expect(sessionStorage.getItem('school_app_language')).toBeNull()
      expect(localStorage.getItem('school_app_current_user')).toBeNull()
      expect(localStorage.length).toBe(0)
    })
  })

  it('persists selected language across page reloads via non-sensitive cookie edutrack_lang', () => {
    document.cookie = `${LANGUAGE_COOKIE_KEY}=ar; path=/; max-age=3600`

    render(
      <MemoryRouter>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <LoginForm />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </MemoryRouter>
    )

    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(screen.getByRole('button', { name: 'تسجيل الدخول' })).toBeInTheDocument()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })

  it('renders ForgotPasswordForm entirely in Arabic with RTL when Arabic is active', async () => {
    document.cookie = `${LANGUAGE_COOKIE_KEY}=ar; path=/; max-age=3600`

    render(
      <MemoryRouter>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <ForgotPasswordForm />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </MemoryRouter>
    )

    // Hero branding column
    expect(screen.getByText('الأمان والاستعادة · EduTrack')).toBeInTheDocument()
    expect(screen.getByText('طلب عبر البريد')).toBeInTheDocument()
    expect(screen.getByText('استلام الرابط')).toBeInTheDocument()

    // Right column Form
    expect(screen.getByRole('heading', { name: 'نسيت كلمة المرور؟' })).toBeInTheDocument()
    expect(screen.getByText('البريد الإلكتروني')).toBeInTheDocument()
    const submitBtn = screen.getByRole('button', { name: 'إرسال رابط إعادة التعيين' })
    expect(submitBtn).toBeInTheDocument()
    expect(screen.getByText('العودة إلى تسجيل الدخول')).toBeInTheDocument()

    // Submit form to test confirmation screen
    const emailInput = screen.getByLabelText('البريد الإلكتروني')
    fireEvent.change(emailInput, { target: { value: 'student@school.com' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'تحقق من صندوق بريدك' })).toBeInTheDocument()
      expect(screen.getByText('🛡️ معلومات هامة:')).toBeInTheDocument()
      expect(screen.getByText(/الرابط آمن، مخصص للاستخدام لمرة واحدة/)).toBeInTheDocument()
      expect(screen.getByText('إدخال عنوان بريد إلكتروني آخر')).toBeInTheDocument()
    })
  })

  it('renders ResetPasswordForm entirely in Arabic with RTL and criteria checklist', async () => {
    document.cookie = `${LANGUAGE_COOKIE_KEY}=ar; path=/; max-age=3600`

    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-test-token']}>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <ResetPasswordForm />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </MemoryRouter>
    )

    // Hero column in Arabic
    expect(screen.getByText('الأمان والاستعادة · EduTrack')).toBeInTheDocument()

    // Form title in Arabic
    expect(screen.getByRole('heading', { name: 'إعادة تعيين كلمة المرور' })).toBeInTheDocument()
    expect(screen.getByText('كلمة المرور الجديدة')).toBeInTheDocument()
    expect(screen.getByText('تأكيد كلمة المرور')).toBeInTheDocument()

    // Criteria checklist in Arabic
    expect(screen.getByText('معايير الأمان المطلوبة:')).toBeInTheDocument()
    expect(screen.getByText('من 8 إلى 64 حرفًا')).toBeInTheDocument()
    expect(screen.getByText('حرف كبير واحد على الأقل')).toBeInTheDocument()
    expect(screen.getByText('حرف صغير واحد على الأقل')).toBeInTheDocument()
    expect(screen.getByText('رقم واحد على الأقل')).toBeInTheDocument()
    expect(screen.getByText('رمز خاص واحد على الأقل')).toBeInTheDocument()
    expect(screen.getByText('كلمتا المرور متطابقتان')).toBeInTheDocument()

    // Submit valid password to test success state
    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••••••')
    fireEvent.change(passwordInputs[0], { target: { value: 'StrongP@ssw0rd!' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'StrongP@ssw0rd!' } })

    const submitBtn = screen.getByRole('button', { name: 'حفظ كلمة المرور الجديدة' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'تم تحديث كلمة المرور!' })).toBeInTheDocument()
      expect(screen.getByText('تسجيل الدخول بكلمة المرور الجديدة')).toBeInTheDocument()
    })
  })

  it('renders GoogleCallbackPage with translated Arabic texts and RTL layout', () => {
    document.cookie = `${LANGUAGE_COOKIE_KEY}=ar; path=/; max-age=3600`

    render(
      <MemoryRouter initialEntries={['/auth/google/callback?error=access_denied']}>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <GoogleCallbackPage />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'تم رفض المصادقة' })).toBeInTheDocument()
    expect(screen.getByText('العودة إلى صفحة تسجيل الدخول')).toBeInTheDocument()
    expect(screen.getByText('تم إلغاء العملية: قمت برفض طلب الوصول من Google.')).toBeInTheDocument()
  })

  it('preserves and initializes language from URL search parameter lang=ar', () => {
    delete window.location
    window.location = new URL('http://localhost:3000/login?lang=ar')

    render(
      <MemoryRouter>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <LoginForm />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </MemoryRouter>
    )

    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(getCookie(LANGUAGE_COOKIE_KEY)).toBe('ar')
  })
})
