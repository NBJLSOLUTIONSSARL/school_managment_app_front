import { useState, useEffect, useCallback } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loader } from '@/components/ui/Loader'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { guardianService } from '../api/guardianService'
import { GuardianFormModal } from './GuardianFormModal'
import { GuardianDetailsModal } from './GuardianDetailsModal'

export function GuardianList() {
  const { toastError } = useToast()
  const { hasRole } = useAuth()
  const canCreate = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])

  const [guardians, setGuardians] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedGuardian, setSelectedGuardian] = useState(null)

  const loadGuardians = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        const res = await guardianService.searchGuardians({ query: debouncedSearch })
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setGuardians(res.data)
        } else {
          toastError(res.error?.message || 'Erreur lors du chargement des tuteurs.')
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

  const columns = [
    {
      key: 'id',
      label: '#',
      width: '60px',
      render: (val) => <span className="font-mono text-2xs text-slate-500">#{val}</span>,
    },
    {
      key: 'fullName',
      label: 'Nom & Prénom',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'P')[0]}${(u.lastName || 'A')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center text-[#9333EA] font-bold text-xs shrink-0 shadow-2xs">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-[#1E293B]">{name}</div>
              <div className="text-[11px] text-[#64748B]">{u.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '140px',
      render: (_, row) => (
        <span className="text-xs text-slate-700">{row.user?.phone || '-'}</span>
      ),
    },
    {
      key: 'profession',
      label: 'Profession',
      width: '160px',
      render: (val) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs text-slate-700">
          {val || 'Non renseignée'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '100px',
      render: (_, row) => (
        <StatusBadge status={row.user?.active ? 'ACTIVE' : 'INACTIVE'} showDot />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '90px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setSelectedGuardian(row)}
        >
          Détails
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none">
      <DocTypePageHead
        title="Tuteurs & Parents"
        count={guardians.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, email..."
        primaryAction={
          canCreate
            ? {
                label: 'Nouveau Tuteur',
                onClick: () => setIsCreateOpen(true),
              }
            : undefined
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : guardians.length === 0 ? (
        <EmptyState
          title="Aucun tuteur trouvé"
          description={
            searchTerm
              ? `Aucun tuteur ne correspond à "${searchTerm}".`
              : 'Commencez par ajouter un tuteur légal.'
          }
          action={
            canCreate
              ? {
                  label: 'Créer un tuteur',
                  onClick: () => setIsCreateOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={guardians}
          page={1}
          pageSize={guardians.length || 10}
          totalItems={guardians.length}
          totalPages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          isLoading={false}
          onRowClick={(row) => setSelectedGuardian(row)}
        />
      )}

      {isCreateOpen && (
        <GuardianFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => loadGuardians()}
        />
      )}

      {selectedGuardian && (
        <GuardianDetailsModal
          isOpen={Boolean(selectedGuardian)}
          onClose={() => setSelectedGuardian(null)}
          guardian={selectedGuardian}
        />
      )}
    </div>
  )
}

export default GuardianList
