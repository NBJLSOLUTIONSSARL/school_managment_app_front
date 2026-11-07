import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { notificationService } from '../api/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/classNames'

const TYPE_ICONS = {
  INFO: 'ℹ️',
  WARNING: '⚠️',
  SUCCESS: '✅',
  ERROR: '❌',
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
        className="relative inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        aria-label="Centre de notifications"
        aria-expanded={isOpen}
      >
        <span aria-hidden="true" className="text-sm">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-2xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded border border-slate-200 bg-white shadow-lg text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="font-semibold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
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
                    !n.read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span className="shrink-0 text-sm">{TYPE_ICONS[n.type] || 'ℹ️'}</span>
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
                        className="shrink-0 text-[10px] text-blue-600 hover:underline"
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

          <div className="border-t border-slate-100 p-2 text-center bg-slate-50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-2xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
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
