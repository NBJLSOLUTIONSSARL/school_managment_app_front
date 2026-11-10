import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserCheck,
  Clock,
  Award,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { TableToolbar } from '@/components/ui/TableToolbar'
import { StatCard } from '@/components/ui/StatCard'
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
  const { toastError, success } = useToast()
  const { hasRole } = useAuth()
  const canCreate = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])

  const [guardians, setGuardians] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('table')
  const [copiedId, setCopiedId] = useState(null)
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

  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    success(`Email ${text} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const columns = [
    {
      key: 'fullName',
      label: 'Tuteur / Responsable',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'P')[0]}${(u.lastName || 'A')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#111827] font-semibold text-xs shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[#111827] text-xs truncate">{name}</div>
              <div className="text-[11px] text-[#6B7280] truncate">{u.email || '-'}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'profession',
      label: 'Profession / Activité',
      render: (val) => (
        <div className="flex items-center justify-between gap-2 max-w-xs group cursor-pointer">
          <span className="text-xs text-[#4B5563] truncate">{val || 'Non renseignée'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#111827] shrink-0" />
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Coordonnées',
      width: '180px',
      render: (_, row) => {
        const email = row.user?.email || '-'
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#374151]">
            <span className="truncate">{email}</span>
            {email !== '-' && (
              <button
                type="button"
                onClick={(e) => handleCopy(email, row.id, e)}
                className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded transition cursor-pointer"
                title="Copier l'email"
              >
                {copiedId === row.id ? (
                  <Check className="w-3 h-3 text-[#059669]" />
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
      render: (_, row) => <span className="text-xs text-[#4B5563]">{row.user?.phone || '-'}</span>,
    },
    {
      key: 'children',
      label: 'Élèves Associés',
      width: '130px',
      render: (students) => {
        const count = Array.isArray(students) ? students.length : 0
        return (
          <span className="text-xs font-medium text-[#4B5563]">
            {count} {count > 1 ? 'enfants' : 'enfant'}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (_, row) => (
        <StatusBadge
          status={row.user?.active ? 'Complete' : 'To Contact'}
          label={row.user?.active ? 'Actif' : 'Inactif'}
          showPlus
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedGuardian(row)
            }}
          >
            Détails
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] min-h-screen">
      <DocTypePageHead
        icon={Users}
        title="Guardians"
        count={guardians.length}
        countLabel="tuteurs"
        primaryAction={
          canCreate
            ? {
                label: 'New guardian',
                onClick: () => setIsCreateOpen(true),
              }
            : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Active Opportunities"
          value={`${guardians.length || 38} active`}
          trendValue="↗ 3.5%"
          trendType="positive"
        />
        <StatCard
          icon={UserCheck}
          title="Deals Closed This Month"
          value="12 completed"
          trendValue="↘ 1.2%"
          trendType="negative"
        />
        <StatCard
          icon={Clock}
          title="Average Response Time"
          value="2.8 days"
          trendValue="↗ 0.8%"
          trendType="positive"
        />
        <StatCard
          icon={Award}
          title="Engagement Rate"
          value="89%"
          trendValue="↗ 8.34%"
          trendType="positive"
        />
      </div>

      <TableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, email, téléphone..."
        primaryActionLabel="New guardian"
        onPrimaryAction={canCreate ? () => setIsCreateOpen(true) : undefined}
        filters={[
          {
            label: 'Location',
            onClick: () => {},
          },
        ]}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
          <Loader size="md" />
        </div>
      ) : guardians.length === 0 ? (
        <EmptyState
          title="Aucun tuteur trouvé"
          description={
            searchTerm
              ? 'Aucun tuteur ne correspond à ce critère.'
              : 'Commencez par ajouter un nouveau tuteur.'
          }
          action={
            canCreate
              ? {
                  label: 'Nouveau Tuteur',
                  onClick: () => setIsCreateOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={guardians}
          totalItems={guardians.length}
          pageSize={20}
          isLoading={false}
          enableSelection
          onRowClick={(row) => setSelectedGuardian(row)}
        />
      )}

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
