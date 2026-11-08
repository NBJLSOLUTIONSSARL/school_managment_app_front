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
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/30 cursor-pointer"
        aria-label="Centre de notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute 1.5 -top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white shadow-2xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl text-xs overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3 bg-white">
            <span className="font-bold text-[#0F172A]">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#0F172A]">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center text-[#94A3B8]">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-[#94A3B8]">
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-3 transition-colors',
                    !n.read ? 'bg-[#F1F5F9]/60 hover:bg-[#F1F5F9]' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <NotificationTypeIcon type={n.type} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-xs text-[#1E293B]', !n.read && 'font-semibold')}>
                          {n.content}
                        </p>
                        <span className="text-[10px] text-[#94A3B8]">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="shrink-0 text-[11px] font-semibold text-[#0F172A] hover:underline cursor-pointer"
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

          <div className="border-t border-[#E2E8F0] p-2.5 text-center bg-slate-50/50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#0F172A] hover:underline"
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
