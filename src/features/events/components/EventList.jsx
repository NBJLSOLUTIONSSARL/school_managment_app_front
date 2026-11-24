import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
  Pencil,
  Trash2,
  MapPin,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EventFormModal } from './EventFormModal'
import { EventDetailsModal } from './EventDetailsModal'
import { eventService } from '../api/eventService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export function EventList() {
  const { hasRole } = useAuth()
  const { success, error: toastError } = useToast()

  const canManage = hasRole(['ROLE_ADMIN', 'admin'])

  // Pagination & items
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Filters: from & to, search
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadEvents = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const fromIso = fromDate ? `${fromDate}T00:00:00` : undefined
        const toIso = toDate ? `${toDate}T23:59:59` : undefined

        const res = await eventService.getEvents({
          from: fromIso,
          to: toIso,
          page,
          size: pageSize,
          signal,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setEvents(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setEvents([])
          setTotalItems(0)
          setTotalPages(0)
          const msg = res.error?.message || 'Impossible de charger les événements.'
          setLoadError(msg)
          if (!signal?.aborted) {
            toastError(msg)
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les événements.'
          setLoadError(msg)
          toastError(msg)
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [page, pageSize, fromDate, toDate, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadEvents({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadEvents])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await eventService.deleteEvent(deleteTarget.id)
      if (res.success) {
        success('Événement supprimé avec succès.')
        setDeleteTarget(null)
        loadEvents()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression de l’événement.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events
    const q = searchTerm.toLowerCase()
    return events.filter((e) =>
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
    )
  }, [events, searchTerm])

  const columns = [
    {
      key: 'title',
      label: 'Titre de l’événement',
      render: (val, row) => (
        <div className="min-w-0">
          <span className="font-semibold text-[#0F172A] text-xs block truncate">{val}</span>
          {row.description && (
            <span className="text-[11px] text-[#64748B] block truncate max-w-md">
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Lieu',
      width: '180px',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-[#475569]">
          <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          <span className="truncate">{val || 'Non spécifié'}</span>
        </div>
      ),
    },
    {
      key: 'startAt',
      label: 'Début',
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
      key: 'endAt',
      label: 'Fin',
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

  const hasActiveFilters = Boolean(fromDate || toDate)
  const activeFiltersCount = (fromDate ? 1 : 0) + (toDate ? 1 : 0)

  const filtersContent = (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Date de début
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Date de fin
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        />
      </div>
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
        addNewLabel="Nouvel événement"
        canAddNew={canManage}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par titre, lieu..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={() => {
          setFromDate('')
          setToDate('')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={filteredEvents}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadEvents}
        emptyTitle="Aucun événement trouvé"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucun événement ne correspond aux critères.'
            : 'Aucun événement planifié pour le moment.'
        }
        emptyAction={
          canManage
            ? {
                label: 'Nouvel événement',
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
        <EventFormModal
          key={editingItem?.id || 'new'}
          isOpen={isFormOpen}
          eventItem={editingItem}
          onClose={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSuccess={() => loadEvents()}
        />
      )}

      {detailItem && (
        <EventDetailsModal
          isOpen={Boolean(detailItem)}
          eventItem={detailItem}
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
          title="Supprimer cet événement ?"
          message={`Êtes-vous sûr de vouloir supprimer l'événement "${deleteTarget.title}" ? Cette action est irréversible.`}
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

export default EventList
