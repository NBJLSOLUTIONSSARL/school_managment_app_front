import { useState, useEffect, useCallback, useMemo } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { notificationService } from '../api/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tous les types' },
  { value: 'INFO', label: 'Information' },
  { value: 'WARNING', label: 'Avertissement' },
  { value: 'SUCCESS', label: 'Succès' },
  { value: 'ERROR', label: 'Erreur' },
]

const READ_OPTIONS = [
  { value: 'ALL', label: 'Tous les états' },
  { value: 'UNREAD', label: 'Non lues uniquement' },
  { value: 'READ', label: 'Lues uniquement' },
]

export function NotificationList() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const userId = user?.id

  // State
  const [notifications, setNotifications] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [readFilter, setReadFilter] = useState('ALL')

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadNotifications = useCallback(
    async ({ signal } = {}) => {
      if (!userId) return
      setIsLoading(true)
      try {
        const res = await notificationService.getUserNotifications(userId, {
          page,
          size: pageSize,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setNotifications(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setNotifications([])
          setTotalItems(0)
          setTotalPages(0)
          if (!signal?.aborted) {
            toastError(res.error?.message || 'Impossible de charger les notifications.')
          }
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [userId, page, pageSize, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadNotifications({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadNotifications])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (typeFilter !== 'ALL' && n.type !== typeFilter) return false
      if (readFilter === 'UNREAD' && n.read) return false
      if (readFilter === 'READ' && !n.read) return false
      return true
    })
  }, [notifications, typeFilter, readFilter])

  const handleMarkAsRead = async (id) => {
    try {
      const res = await notificationService.markAsRead(id)
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
        success('Notification marquée comme lue.')
      } else {
        toastError(res.error?.message || 'Erreur lors de la mise à jour.')
      }
    } catch {
      toastError('Erreur de connexion.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await notificationService.deleteNotification(deleteTarget.id)
      if (res.success) {
        success('Notification supprimée.')
        setDeleteTarget(null)
        loadNotifications()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'type',
      label: 'Type',
      width: '120px',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'content',
      label: 'Notification',
      render: (val, row) => (
        <span className={row.read ? 'text-slate-600' : 'font-semibold text-slate-900'}>
          {val}
        </span>
      ),
    },
    {
      key: 'read',
      label: 'État',
      width: '100px',
      render: (val) => (
        <StatusBadge status={val ? 'Lu' : 'Non lu'} size="xs" />
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      width: '170px',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {!row.read && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => handleMarkAsRead(row.id)}
            >
              Marquer lu
            </Button>
          )}
          <Button
            variant="ghost"
            size="xs"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setDeleteTarget(row)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none">
      <DocTypePageHead
        title="Centre de Notifications"
        count={totalItems}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 text-xs shadow-2xs">
        <div className="w-48">
          <Select
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            options={TYPE_OPTIONS}
          />
        </div>
        <div className="w-44">
          <Select
            value={readFilter}
            onChange={(val) => setReadFilter(val)}
            options={READ_OPTIONS}
          />
        </div>
        <div className="ml-auto text-2xs text-slate-400">
          Notifications temps réel associées à votre compte
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          description="Vous n'avez aucune notification correspondant à ces critères."
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={filteredNotifications}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
          isLoading={isLoading}
        />
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer cette notification ?"
          message="Voulez-vous supprimer définitivement cette notification ?"
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer'}
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default NotificationList
