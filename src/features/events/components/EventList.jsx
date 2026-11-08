import { useState, useEffect, useCallback } from 'react'
import { List, Calendar } from 'lucide-react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EventFormModal } from './EventFormModal'
import { EventDetailsModal } from './EventDetailsModal'
import { EventCalendarView } from './EventCalendarView'
import { eventService } from '../api/eventService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/classNames'

export function EventList() {
  const { hasRole } = useAuth()
  const { success, error: toastError } = useToast()

  const canManage = hasRole(['ROLE_ADMIN', 'admin'])

  // Display mode
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'calendar'

  // Pagination & items
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Filters: from & to
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadEvents = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
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
          if (!signal?.aborted) {
            toastError(res.error?.message || 'Impossible de charger les événements.')
          }
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

  const columns = [
    {
      key: 'title',
      label: 'Titre de l’événement',
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
      key: 'location',
      label: 'Lieu',
      width: '180px',
      render: (val) => val || '-',
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
          : '-',
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
        title="Calendrier & Événements Scolaires"
        count={totalItems}
        primaryAction={
          canManage
            ? {
                label: 'Nouvel Événement',
                onClick: () => {
                  setEditingItem(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      {/* Filter and View bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B]">Du :</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/15 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B]">Au :</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/15 focus:outline-none"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate('')
                setToDate('')
                setPage(1)
              }}
              className="text-xs text-[#0F172A] hover:underline font-semibold cursor-pointer"
            >
              Effacer dates
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors cursor-pointer',
              activeTab === 'list'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>Liste</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors cursor-pointer',
              activeTab === 'calendar'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendrier</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : activeTab === 'calendar' ? (
        <EventCalendarView events={events} onSelectEvent={(ev) => setDetailItem(ev)} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Aucun événement trouvé"
          description="Aucun événement scolaire ne correspond à la période sélectionnée."
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
                Programmer un événement
              </Button>
            ) : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={events}
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
        <EventFormModal
          key={editingItem?.id || 'new'}
          isOpen={isFormOpen}
          event={editingItem}
          onClose={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSuccess={() => loadEvents()}
        />
      )}

      {/* Details Modal */}
      {detailItem && (
        <EventDetailsModal
          isOpen={Boolean(detailItem)}
          event={detailItem}
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
          title="Supprimer cet événement ?"
          message={`Êtes-vous sûr de vouloir supprimer l'événement "${deleteTarget.title}" ?`}
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
