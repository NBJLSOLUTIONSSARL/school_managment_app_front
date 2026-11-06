import { AuthProvider } from '@/context/AuthProvider'
import { ToastProvider } from '@/context/ToastProvider'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { I18nProvider } from '@/i18n/I18nProvider'
import { useI18n } from '@/hooks/useI18n'
import { AppRoutes } from '@/routes/AppRoutes'

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

export function App() {
  return (
    <I18nProvider>
      <LayoutErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </LayoutErrorBoundary>
    </I18nProvider>
  )
}

export default App

