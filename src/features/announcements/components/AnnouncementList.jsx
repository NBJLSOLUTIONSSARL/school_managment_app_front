import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AnnouncementFormModal } from './AnnouncementFormModal'
import { AnnouncementDetailsModal } from './AnnouncementDetailsModal'
import { announcementService } from '../api/announcementService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const ROLE_OPTIONS = [
  { value: 'ALL_FILTER', label: 'Toutes les audiences' },
  { value: 'ALL', label: 'Tout le monde (ALL)' },
  { value: 'STUDENT', label: 'Élèves' },
  { value: 'TEACHER', label: 'Enseignants' },
  { value: 'GUARDIAN', label: 'Parents / Tuteurs' },
  { value: 'STAFF', label: 'Personnel' },
]

const ROLE_LABELS = {
  ALL: 'Tout le monde',
  STUDENT: 'Élèves',
  TEACHER: 'Enseignants',
  GUARDIAN: 'Parents',
  STAFF: 'Personnel',
}

export function AnnouncementList() {
  const { hasRole } = useAuth()
  const { success, error: toastError } = useToast()

  const canManage = hasRole(['ROLE_ADMIN', 'admin'])

  // Pagination & items
  const [announcements, setAnnouncements] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Filters & search
  const [targetRole, setTargetRole] = useState('ALL_FILTER')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadAnnouncements = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await announcementService.getAnnouncements({
          targetRole,
          page,
          size: pageSize,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setAnnouncements(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setAnnouncements([])
          setTotalItems(0)
          setTotalPages(0)
          const msg = res.error?.message || 'Impossible de charger les annonces.'
          setLoadError(msg)
          if (!signal?.aborted) {
            toastError(msg)
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les annonces.'
          setLoadError(msg)
          toastError(msg)
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [page, pageSize, targetRole, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadAnnouncements({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadAnnouncements])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await announcementService.deleteAnnouncement(deleteTarget.id)
      if (res.success) {
        success('Annonce supprimée avec succès.')
        setDeleteTarget(null)
        loadAnnouncements()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression de l’annonce.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredAnnouncements = useMemo(() => {
    if (!searchTerm.trim()) return announcements
    const q = searchTerm.toLowerCase()
    return announcements.filter((a) =>
      a.title?.toLowerCase().includes(q) ||
      a.content?.toLowerCase().includes(q)
    )
  }, [announcements, searchTerm])

  const columns = [
    {
      key: 'title',
      label: 'Titre de l’annonce',
      render: (val, row) => (
        <div className="min-w-0">
          <span className="font-semibold text-[#0F172A] text-xs block truncate">{val}</span>
          {row.content && (
            <span className="text-[11px] text-[#64748B] block truncate max-w-md">
              {row.content}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'targetRole',
      label: 'Audience',
      width: '160px',
      render: (val) => <StatusBadge status={ROLE_LABELS[val] || val || 'ALL'} size="xs" />,
    },
    {
      key: 'publishedAt',
      label: 'Date de publication',
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
              label: 'Détails',
              icon: Eye,
              onClick: () => setDetailItem(row),
            },
            {
              label: 'Modifier',
              icon: Pencil,
              hidden: !canManage,
              onClick: () => {
                setEditingItem(row)
                setIsFormOpen(true)
              },
            },
            {
              label: 'Supprimer',
              icon: Trash2,
              variant: 'danger',
              hidden: !canManage,
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters = targetRole !== 'ALL_FILTER'

  const filtersContent = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
        Audience ciblée
      </label>
      <select
        value={targetRole}
        onChange={(e) => {
          setTargetRole(e.target.value)
          setPage(1)
        }}
        className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={
          canManage
            ? () => {
                setEditingItem(null)
                setIsFormOpen(true)
              }
            : undefined
        }
        addNewLabel="Nouvelle annonce"
        canAddNew={canManage}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher une annonce..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={hasActiveFilters ? 1 : 0}
        onClearFilters={() => {
          setTargetRole('ALL_FILTER')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={filteredAnnouncements}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadAnnouncements}
        emptyTitle="Aucune annonce trouvée"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucune annonce ne correspond aux filtres.'
            : 'Aucune annonce publiée pour le moment.'
        }
        emptyAction={
          canManage
            ? {
                label: 'Nouvelle annonce',
                onClick: () => {
                  setEditingItem(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
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
        onRowClick={(row) => setDetailItem(row)}
      />

      {isFormOpen && (
        <AnnouncementFormModal
          key={editingItem?.id || 'new'}
          isOpen={isFormOpen}
          announcement={editingItem}
          onClose={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSuccess={() => loadAnnouncements()}
        />
      )}

      {detailItem && (
        <AnnouncementDetailsModal
          isOpen={Boolean(detailItem)}
          announcement={detailItem}
          onClose={() => setDetailItem(null)}
          onOpenEdit={
            canManage
              ? (item) => {
                  setDetailItem(null)
                  setEditingItem(item)
                  setIsFormOpen(true)
                }
              : undefined
          }
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer cette annonce ?"
          message={`Êtes-vous sûr de vouloir supprimer l'annonce "${deleteTarget.title}" ? Cette action est irréversible.`}
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default AnnouncementList
