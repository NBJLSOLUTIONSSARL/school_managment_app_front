import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Copy,
  Check,
  Eye,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { guardianService } from '../api/guardianService'
import { GuardianFormModal } from './GuardianFormModal'
import { GuardianDetailsModal } from './GuardianDetailsModal'

export function GuardianList() {
  const { toastError, success } = useToast()
  const { hasRole } = useAuth()
  const canCreate = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])

  const [guardians, setGuardians] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [copiedId, setCopiedId] = useState(null)
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedGuardian, setSelectedGuardian] = useState(null)

  const loadGuardians = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await guardianService.searchGuardians({ query: debouncedSearch })
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setGuardians(res.data)
        } else {
          const msg = res.error?.message || 'Erreur lors du chargement des tuteurs.'
          setLoadError(msg)
          toastError(msg)
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les tuteurs.'
          setLoadError(msg)
          toastError(msg)
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [debouncedSearch, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => loadGuardians({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadGuardians])

  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    success(`Email ${text} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered guardians
  const filteredGuardians = useMemo(() => {
    if (statusFilter === 'ALL') return guardians
    const wantActive = statusFilter === 'ACTIVE'
    return guardians.filter((g) => Boolean(g.user?.active) === wantActive)
  }, [guardians, statusFilter])

  const paginatedGuardians = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredGuardians.slice(start, start + pageSize)
  }, [filteredGuardians, page, pageSize])

  const columns = [
    {
      key: 'fullName',
      label: 'Tuteur / Responsable',
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'P')[0]}${(u.lastName || 'A')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[#0F172A] text-xs truncate">{name}</div>
              <div className="text-[11px] text-[#64748B] truncate">{u.email || '-'}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'profession',
      label: 'Profession / Activité',
      render: (val) => (
        <span className="text-xs text-[#475569] truncate block max-w-xs">{val || 'Non renseignée'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Coordonnées',
      width: '180px',
      render: (_, row) => {
        const email = row.user?.email || '-'
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#334155]">
            <span className="truncate">{email}</span>
            {email !== '-' && (
              <button
                type="button"
                onClick={(e) => handleCopy(email, row.id, e)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded transition-colors cursor-pointer"
                title="Copier l'email"
              >
                {copiedId === row.id ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        )
      },
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '130px',
      render: (_, row) => <span className="text-xs text-[#475569]">{row.user?.phone || '-'}</span>,
    },
    {
      key: 'children',
      label: 'Élèves Associés',
      width: '140px',
      render: (students) => {
        const count = Array.isArray(students) ? students.length : 0
        return (
          <span className="text-xs font-medium text-[#334155]">
            {count} {count > 1 ? 'enfants' : 'enfant'}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Statut',
      width: '110px',
      render: (_, row) => (
        <StatusBadge
          status={row.user?.active ? 'Complete' : 'To Contact'}
          label={row.user?.active ? 'Actif' : 'Inactif'}
        />
      ),
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
              onClick: () => setSelectedGuardian(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters = statusFilter !== 'ALL'

  const filtersContent = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
        Statut
      </label>
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value)
          setPage(1)
        }}
        className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
      >
        <option value="ALL">Tous les statuts</option>
        <option value="ACTIVE">Actifs uniquement</option>
        <option value="INACTIVE">Inactifs uniquement</option>
      </select>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={canCreate ? () => setIsCreateOpen(true) : undefined}
        addNewLabel="Nouveau tuteur"
        canAddNew={canCreate}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par nom, email, téléphone..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={hasActiveFilters ? 1 : 0}
        onClearFilters={() => {
          setStatusFilter('ALL')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={paginatedGuardians}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadGuardians}
        emptyTitle="Aucun tuteur trouvé"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucun tuteur ne correspond à vos filtres.'
            : 'Commencez par ajouter un tuteur légal.'
        }
        emptyAction={
          canCreate
            ? {
                label: 'Nouveau tuteur',
                onClick: () => setIsCreateOpen(true),
              }
            : undefined
        }
        page={page}
        pageSize={pageSize}
        totalItems={filteredGuardians.length}
        totalPages={Math.max(1, Math.ceil(filteredGuardians.length / pageSize))}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        onRowClick={(row) => setSelectedGuardian(row)}
      />

      {isCreateOpen && (
        <GuardianFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false)
            loadGuardians()
          }}
        />
      )}

      {selectedGuardian && (
        <GuardianDetailsModal
          isOpen={Boolean(selectedGuardian)}
          guardian={selectedGuardian}
          onClose={() => setSelectedGuardian(null)}
        />
      )}
    </div>
  )
}

export default GuardianList
