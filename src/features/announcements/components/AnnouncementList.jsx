import { useState, useEffect, useCallback } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
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

  // Filters
  const [targetRole, setTargetRole] = useState('ALL_FILTER')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadAnnouncements = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        const res = await announcementService.getAnnouncements({
          targetRole,
          page,
          size: pageSize,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          const rawItems = res.data.items || []
          const map = new Map()
          rawItems.forEach((item) => {
            if (item && item.id != null) {
              map.set(item.id, item)
            }
          })
          setAnnouncements(Array.from(map.values()))
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setAnnouncements([])
          setTotalItems(0)
          setTotalPages(0)
          if (!signal?.aborted) {
            toastError(res.error?.message || 'Impossible de charger les annonces.')
          }
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

  const columns = [
    {
      key: 'title',
      label: 'Titre de l’annonce',
      render: (val, row) => (
        <button
          type="button"
          onClick={() => setDetailItem(row)}
          className="text-start font-medium text-slate-900 hover:text-slate-600 hover:underline"
        >
          {val}
        </button>
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
          : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="xs" onClick={() => setDetailItem(row)}>
            Voir
          </Button>
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setEditingItem(row)
                  setIsFormOpen(true)
                }}
              >
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDeleteTarget(row)}
              >
                Supprimer
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none">
      <DocTypePageHead
        title="Annonces & Communications"
        count={totalItems}
        primaryAction={
          canManage
            ? {
                label: 'Nouvelle Annonce',
                onClick: () => {
                  setEditingItem(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 text-xs shadow-2xs">
        <div className="w-56">
          <Select
            value={targetRole}
            onChange={(val) => {
              setTargetRole(val)
              setPage(1)
            }}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="ml-auto text-2xs text-slate-400">
          {canManage
            ? 'Gestion active : Vous pouvez créer, modifier ou supprimer des annonces.'
            : 'Consultation : Annonces ciblées selon votre profil.'}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          title="Aucune annonce trouvée"
          description="Aucune annonce n'a été publiée pour ce public cible."
          action={
            canManage ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingItem(null)
                  setIsFormOpen(true)
                }}
              >
                Créer une première annonce
              </Button>
            ) : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={announcements}
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

      {/* Form Modal */}
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

      {/* Details Modal */}
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

      {/* Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer cette annonce ?"
          description={`Êtes-vous sûr de vouloir supprimer l'annonce "${deleteTarget.title}" ? Cette action est irréversible.`}
          confirmText={isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
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
