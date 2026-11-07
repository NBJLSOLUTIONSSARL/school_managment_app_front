import { AuthProvider } from '@/context/AuthProvider'
import { ToastProvider } from '@/context/ToastProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { useI18n } from '@/hooks/useI18n'

function LayoutErrorBoundary({ children }) {
  const { t } = useI18n()

  return (
    <ErrorBoundary
      title={t('errors.crashTitle')}
      message={t('errors.crashMessage')}
      reloadLabel={t('errors.reload')}
      homeLabel={t('common.dashboard')}
      homeHref="/dashboard"
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Global App Providers:
 * - I18nProvider (internationalization: French default, Arabic RTL, English)
 * - ErrorBoundary (top-level crash resilience)
 * - AuthProvider (JWT authentication & RBAC)
 * - ToastProvider (application notification toasts)
 */
export function AppProviders({ children }) {
  return (
    <I18nProvider>
      <LayoutErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </LayoutErrorBoundary>
    </I18nProvider>
  )
}

export default AppProviders
