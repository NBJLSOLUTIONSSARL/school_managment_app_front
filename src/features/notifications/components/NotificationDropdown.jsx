import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { notificationService } from '../api/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/classNames'

function NotificationTypeIcon({ type }) {
  switch (type) {
    case 'WARNING':
      return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
    case 'SUCCESS':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
    case 'ERROR':
      return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
    case 'INFO':
    default:
      return <Info className="w-4 h-4 text-[#0F172A] shrink-0" />
  }
}

export function NotificationDropdown() {
  const { user, isAuthenticated } = useAuth()
  const userId = user?.id

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = useCallback(
    async (isBackground = false) => {
      if (!userId || !isAuthenticated) return
      if (!isBackground) setIsLoading(true)
      try {
        const res = await notificationService.getUserNotifications(userId, {
          page: 1,
          size: 10,
        })
        if (res.success && res.data) {
          const items = res.data.items || []
          setNotifications(items)
          setUnreadCount(items.filter((n) => !n.read).length)
        }
      } catch {
        // Silently tolerate background polling errors
      } finally {
        if (!isBackground) setIsLoading(false)
      }
    },
    [userId, isAuthenticated]
  )

  // Initial load
  useEffect(() => {
    const task = Promise.resolve().then(() => fetchNotifications(false))
    return () => {
      task.catch(() => {})
    }
  }, [fetchNotifications])

  // Periodic polling every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !userId) return

    const intervalId = setInterval(() => {
      // Only poll when page is visible
      if (document.visibilityState === 'visible') {
        fetchNotifications(true)
      }
    }, 30000)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, userId, fetchNotifications])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation?.()
    try {
      const res = await notificationService.markAsRead(id)
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      // ignore
    }
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev)
          if (!isOpen) fetchNotifications(true)
        }}
        className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 cursor-pointer"
        aria-label="Centre de notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute end-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg text-xs overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-2.5 bg-white">
            <span className="font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-2xs font-medium text-slate-700">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-3 transition-colors',
                    !n.read ? 'bg-slate-50/80 hover:bg-slate-50' : 'hover:bg-slate-50/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <NotificationTypeIcon type={n.type} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-xs text-slate-800', !n.read && 'font-semibold')}>
                          {n.content}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="shrink-0 text-2xs font-semibold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
                        title="Marquer comme lu"
                      >
                        Lu
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-200 p-2.5 text-center bg-slate-50/50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
            >
              Voir toutes les notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
