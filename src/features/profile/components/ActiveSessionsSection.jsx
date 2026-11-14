import { useState, useCallback, useContext } from 'react'
import { Laptop, Smartphone, Globe, Trash2, RefreshCw, Loader2, AlertCircle, Shield } from 'lucide-react'
import { ToastContext } from '@/context/toastContext'
import { useI18n } from '@/hooks/useI18n'
import { getActiveSessions, revokeSession, revokeOtherSessions } from '@/features/auth/api/authApi'

export function ActiveSessionsSection() {
  const toastContext = useContext(ToastContext)
  const success = toastContext?.success || (() => {})
  const toastError = toastContext?.error || (() => {})
  const { t } = useI18n()

  const [hasLoaded, setHasLoaded] = useState(false)
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [revokingId, setRevokingId] = useState(null)
  const [isRevokingOthers, setIsRevokingOthers] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await getActiveSessions()
      const list = res?.data || []
      setSessions(Array.isArray(list) ? list : [])
      setHasLoaded(true)
    } catch (err) {
      setErrorMessage(err.message || t('profile.sessionsLoadError', 'Impossible de charger les sessions actives.'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  const handleRevokeSingle = async (sessionId) => {
    setRevokingId(sessionId)
    try {
      await revokeSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      success(t('profile.sessionRevokedSuccess', 'Session révoquée avec succès.'))
    } catch (err) {
      toastError(err.message || t('profile.sessionRevokeError', 'Impossible de révoquer cette session.'))
    } finally {
      setRevokingId(null)
    }
  }

  const handleRevokeOthers = async () => {
    setIsRevokingOthers(true)
    try {
      await revokeOtherSessions()
      setSessions((prev) => prev.filter((s) => s.current))
      success(t('profile.otherSessionsRevokedSuccess', 'Toutes les autres sessions ont été révoquées.'))
    } catch (err) {
      toastError(err.message || t('profile.otherSessionsRevokeError', 'Erreur lors de la révocation des autres sessions.'))
    } finally {
      setIsRevokingOthers(false)
    }
  }

  const otherSessionsCount = sessions.filter((s) => !s.current).length

  const getDeviceIcon = (deviceType) => {
    const dt = (deviceType || '').toLowerCase()
    if (dt.includes('mobile') || dt.includes('phone') || dt.includes('android') || dt.includes('iphone')) {
      return <Smartphone className="w-4 h-4 text-zinc-500" />
    }
    if (dt.includes('tablet') || dt.includes('ipad')) {
      return <Smartphone className="w-4 h-4 text-zinc-500" />
    }
    if (dt.includes('desktop') || dt.includes('mac') || dt.includes('windows') || dt.includes('linux')) {
      return <Laptop className="w-4 h-4 text-zinc-500" />
    }
    return <Globe className="w-4 h-4 text-zinc-500" />
  }

  const formatDate = (isoString) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <section aria-label="Sessions et appareils connectés" className="profile-card mt-6">
      <div className="profile-card-heading">
        <div className="profile-card-identity">
          <div className="flex items-center gap-2">
            <h2>{t('profile.sessionsHeading', 'Sessions actives & Appareils connectés')}</h2>
            {hasLoaded && (
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                {sessions.length} {sessions.length > 1 ? 'appareils' : 'appareil'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {t(
              'profile.sessionsSubtitle',
              'Consultez la liste des navigateurs et appareils ayant accédé à votre compte et révoquez les sessions suspectes.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasLoaded ? (
            <button
              type="button"
              onClick={fetchSessions}
              disabled={isLoading}
              className="text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 px-3 py-1.5 rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 text-zinc-500" />}
              <span>{t('profile.viewSessions', 'Consulter les sessions')}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={fetchSessions}
                disabled={isLoading}
                className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                aria-label="Actualiser les sessions"
                title="Actualiser"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {otherSessionsCount > 0 && (
                <button
                  type="button"
                  onClick={handleRevokeOthers}
                  disabled={isRevokingOthers}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-md border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isRevokingOthers && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('profile.revokeOtherSessions', 'Déconnecter les autres appareils')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {hasLoaded && (
        <div className="profile-details">
          {errorMessage && (
            <div role="alert" className="p-3 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading && sessions.length === 0 ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chargement des sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400">
              Aucune session active enregistrée.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-lg overflow-hidden bg-white">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/60">
                      {getDeviceIcon(sess.deviceType)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-900 truncate">
                          {[sess.browser, sess.os].filter(Boolean).join(' · ') || sess.deviceType || 'Appareil inconnu'}
                        </span>
                        {sess.current && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t('profile.currentSession', 'Cette session')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>IP : {sess.ipAddress || 'Inconnue'}</span>
                        <span>·</span>
                        <span>Dernière activité : {formatDate(sess.lastActivityAt || sess.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {!sess.current && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSingle(sess.id)}
                        disabled={revokingId === sess.id}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-60"
                        title={t('profile.revokeThisSession', 'Révoquer l’accès de cet appareil')}
                      >
                        {revokingId === sess.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>{t('common.revoke', 'Révoquer')}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default ActiveSessionsSection
