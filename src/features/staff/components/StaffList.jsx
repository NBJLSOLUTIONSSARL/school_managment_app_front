import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Briefcase,
  Users,
  Clock,
  Award,
  ChevronRight,
  Copy,
  MapPin,
  Check,
} from 'lucide-react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { TableToolbar } from '@/components/ui/TableToolbar'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loader } from '@/components/ui/Loader'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { staffService } from '../api/staffService'
import { departmentService } from '@/features/departments/api/departmentService'
import { StaffFormModal } from './StaffFormModal'
import { StaffDetailsModal } from './StaffDetailsModal'

export function StaffList() {
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canCreate = hasRole(['admin', 'ROLE_ADMIN'])
  const canEdit = hasRole(['admin', 'ROLE_ADMIN', 'staff', 'ROLE_STAFF'])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN'])

  const [staffList, setStaffList] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('table')
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [detailStaff, setDetailStaff] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch departments
  useEffect(() => {
    async function loadDepts() {
      const res = await departmentService.getDepartments()
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data)
      }
    }
    loadDepts()
  }, [])

  // Fetch staff
  const loadStaff = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        const deptId = selectedDepartment !== 'ALL' ? Number(selectedDepartment) : undefined
        const res = await staffService.getStaff({ departmentId: deptId })
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setStaffList(res.data)
        } else {
          toastError(res.error?.message || 'Erreur lors du chargement du personnel.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [selectedDepartment, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => loadStaff({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadStaff])

  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    success(`Email ${text} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Local search filter
  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staffList
    const term = searchTerm.toLowerCase()
    return staffList.filter((s) => {
      const u = s.user || {}
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      const email = (u.email || '').toLowerCase()
      const pos = (s.position || '').toLowerCase()
      const deptName = (s.department?.name || '').toLowerCase()
      return (
        fullName.includes(term) ||
        email.includes(term) ||
        pos.includes(term) ||
        deptName.includes(term)
      )
    })
  }, [staffList, searchTerm])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await staffService.deleteStaff(deleteTarget.id)
      if (res.success) {
        const name = deleteTarget.user
          ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
          : 'Le membre'
        success(`${name} a été supprimé avec succès.`)
        setDeleteTarget(null)
        loadStaff()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression du membre.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'fullName',
      label: 'Personnel / Membre',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'P')[0]}${(u.lastName || 'E')[0]}`.toUpperCase()
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
      key: 'position',
      label: 'Fonction / Poste',
      render: (val) => (
        <div className="flex items-center justify-between gap-2 max-w-xs group cursor-pointer">
          <span className="text-xs text-[#4B5563] truncate">{val || 'Administration Générale'}</span>
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
      key: 'department',
      label: 'Département',
      width: '160px',
      render: (dept) => (
        <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
          <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
          <span className="truncate">{dept?.name || 'Direction'}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '130px',
      render: (_, row) => <span className="text-xs text-[#4B5563]">{row.user?.phone || '-'}</span>,
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
      width: '160px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation()
              setDetailStaff(row)
            }}
          >
            Détails
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setEditingStaff(row)
                setIsFormOpen(true)
              }}
            >
              Modifier
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="xs"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteTarget(row)
              }}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] min-h-screen">
      <DocTypePageHead
        icon={Briefcase}
        title="Staff"
        count={filteredStaff.length}
        countLabel="membres"
        primaryAction={
          canCreate
            ? {
                label: 'New staff',
                onClick: () => {
                  setEditingStaff(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          title="Active Opportunities"
          value={`${staffList.length || 12} active`}
          trendValue="↗ 3.5%"
          trendType="positive"
        />
        <StatCard
          icon={Users}
          title="Deals Closed This Month"
          value="8 completed"
          trendValue="↘ 1.2%"
          trendType="negative"
        />
        <StatCard
          icon={Clock}
          title="Average Response Time"
          value="1.5 days"
          trendValue="↗ 0.8%"
          trendType="positive"
        />
        <StatCard
          icon={Award}
          title="Engagement Rate"
          value="91%"
          trendValue="↗ 8.34%"
          trendType="positive"
        />
      </div>

      <TableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, rôle..."
        primaryActionLabel="New staff"
        onPrimaryAction={
          canCreate
            ? () => {
                setEditingStaff(null)
                setIsFormOpen(true)
              }
            : undefined
        }
        filters={[
          {
            label: selectedDepartment === 'ALL' ? 'Department' : departments.find((d) => String(d.id) === selectedDepartment)?.name || 'Department',
            onClick: () => {
              if (departments.length === 0) return
              const idx = departments.findIndex((d) => String(d.id) === selectedDepartment)
              if (idx === -1 || idx === departments.length - 1) {
                setSelectedDepartment('ALL')
              } else {
                setSelectedDepartment(String(departments[idx + 1].id))
              }
            },
          },
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
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          title="Aucun membre du personnel trouvé"
          description={
            searchTerm || selectedDepartment !== 'ALL'
              ? 'Aucun membre ne correspond à vos filtres.'
              : 'Commencez par ajouter un membre au personnel.'
          }
          action={
            canCreate
              ? {
                  label: 'Nouveau Membre',
                  onClick: () => {
                    setEditingStaff(null)
                    setIsFormOpen(true)
                  },
                }
              : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={filteredStaff}
          totalItems={filteredStaff.length}
          pageSize={20}
          isLoading={false}
          enableSelection
          onRowClick={(row) => setDetailStaff(row)}
        />
      )}

      {isFormOpen && (
        <StaffFormModal
          isOpen={isFormOpen}
          staff={editingStaff}
          departments={departments}
          onClose={() => {
            setIsFormOpen(false)
            setEditingStaff(null)
          }}
          onSuccess={() => {
            setIsFormOpen(false)
            setEditingStaff(null)
            loadStaff()
          }}
        />
      )}

      {detailStaff && (
        <StaffDetailsModal
          isOpen={Boolean(detailStaff)}
          staff={detailStaff}
          onClose={() => setDetailStaff(null)}
          onEdit={() => {
            setEditingStaff(detailStaff)
            setDetailStaff(null)
            setIsFormOpen(true)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer le membre"
          message={`Êtes-vous sûr de vouloir supprimer ${
            deleteTarget.user
              ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
              : 'ce membre'
          } ? Cette action est irréversible.`}
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer'}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default StaffList
