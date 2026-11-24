import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Check,
  Trash2,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
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
  const [loadError, setLoadError] = useState(null)

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [readFilter, setReadFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadNotifications = useCallback(
    async ({ signal } = {}) => {
      if (!userId) return
      setIsLoading(true)
      setLoadError(null)
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
          const msg = res.error?.message || 'Impossible de charger les notifications.'
          setLoadError(msg)
          if (!signal?.aborted) {
            toastError(msg)
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les notifications.'
          setLoadError(msg)
          toastError(msg)
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

  const filteredNotifications = useMemo(() => {
    let list = notifications

    if (typeFilter !== 'ALL') {
      list = list.filter((n) => n.type === typeFilter)
    }

    if (readFilter === 'UNREAD') {
      list = list.filter((n) => !n.read)
    } else if (readFilter === 'READ') {
      list = list.filter((n) => n.read)
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter((n) =>
        n.content?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q)
      )
    }

    return list
  }, [notifications, typeFilter, readFilter, searchTerm])

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
        <span className={row.read ? 'text-[#64748B] text-xs' : 'font-semibold text-[#0F172A] text-xs'}>
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
      width: '160px',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <EntityTableActions
          row={row}
          actions={[
            {
              label: 'Marquer comme lu',
              icon: Check,
              hidden: row.read,
              onClick: () => handleMarkAsRead(row.id),
            },
            {
              label: 'Supprimer',
              icon: Trash2,
              variant: 'danger',
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters = typeFilter !== 'ALL' || readFilter !== 'ALL'
  const activeFiltersCount = (typeFilter !== 'ALL' ? 1 : 0) + (readFilter !== 'ALL' ? 1 : 0)

  const filtersContent = (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Type
        </label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          État de lecture
        </label>
        <select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          {READ_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher une notification..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={() => {
          setTypeFilter('ALL')
          setReadFilter('ALL')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={filteredNotifications}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadNotifications}
        emptyTitle="Aucune notification"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucune notification ne correspond aux critères.'
            : 'Vous n’avez aucune notification pour le moment.'
        }
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
      />

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer cette notification ?"
          message="Voulez-vous vraiment effacer cette notification ?"
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
