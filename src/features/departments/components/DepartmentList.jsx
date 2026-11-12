import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Building2,
  Users,
  Clock,
  Award,
  ChevronRight,
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
import { departmentService } from '../api/departmentService'
import { DepartmentFormModal } from './DepartmentFormModal'

export function DepartmentList() {
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canCreate = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])
  const canEdit = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN'])

  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('table')

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadDepartments = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        const res = await departmentService.getDepartments()
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setDepartments(res.data)
        } else {
          toastError(res.error?.message || 'Erreur lors du chargement des départements.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => loadDepartments({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadDepartments])

  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departments
    const term = searchTerm.toLowerCase()
    return departments.filter((d) => d.name?.toLowerCase().includes(term))
  }, [departments, searchTerm])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await departmentService.deleteDepartment(deleteTarget.id)
      if (res.success) {
        success(`Département "${deleteTarget.name}" supprimé avec succès.`)
        setDeleteTarget(null)
        loadDepartments()
      } else {
        toastError(
          res.error?.message ||
            'Impossible de supprimer ce département car des enseignants ou du personnel y sont rattachés.'
        )
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Département / Unité',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-bold text-xs text-[#111827] shrink-0">
            {val ? val.slice(0, 2).toUpperCase() : 'DP'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-[#111827] text-xs truncate block">{val}</span>
            <span className="text-[11px] text-[#6B7280]">Département #{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teachersCount',
      label: 'Corps Professoral',
      width: '160px',
      render: (val) => (
        <div className="flex items-center justify-between gap-2 max-w-xs group cursor-pointer">
          <span className="text-xs text-[#4B5563]">
            {val || 0} {(val || 0) > 1 ? 'professeurs' : 'professeur'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#111827] shrink-0" />
        </div>
      ),
    },
    {
      key: 'staffCount',
      label: 'Personnel Admin',
      width: '160px',
      render: (val) => (
        <span className="text-xs text-[#4B5563]">
          {val || 0} {(val || 0) > 1 ? 'membres' : 'membre'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: () => <StatusBadge status="Complete" label="Actif" showPlus />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {canEdit && (
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setEditingDepartment(row)
                setIsModalOpen(true)
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
        icon={Building2}
        title="Departments"
        count={filteredDepartments.length}
        countLabel="départements"
        primaryAction={
          canCreate
            ? {
                label: 'New department',
                onClick: () => {
                  setEditingDepartment(null)
                  setIsModalOpen(true)
                },
              }
            : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          title="Active Opportunities"
          value={`${departments.length || 8} active`}
          trendValue="↗ 3.5%"
          trendType="positive"
        />
        <StatCard
          icon={Users}
          title="Deals Closed This Month"
          value="6 completed"
          trendValue="↘ 1.2%"
          trendType="negative"
        />
        <StatCard
          icon={Clock}
          title="Average Response Time"
          value="1.8 days"
          trendValue="↗ 0.8%"
          trendType="positive"
        />
        <StatCard
          icon={Award}
          title="Engagement Rate"
          value="94%"
          trendValue="↗ 8.34%"
          trendType="positive"
        />
      </div>

      <TableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filtrer par nom de département..."
        primaryActionLabel="New department"
        onPrimaryAction={
          canCreate
            ? () => {
                setEditingDepartment(null)
                setIsModalOpen(true)
              }
            : undefined
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
          <Loader size="md" />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <EmptyState
          title="Aucun département trouvé"
          description={
            searchTerm
              ? 'Aucun département ne correspond à ce critère.'
              : 'Commencez par ajouter un nouveau département.'
          }
          action={
            canCreate
              ? {
                  label: 'Nouveau Département',
                  onClick: () => {
                    setEditingDepartment(null)
                    setIsModalOpen(true)
                  },
                }
              : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={filteredDepartments}
          totalItems={filteredDepartments.length}
          pageSize={20}
          isLoading={false}
          enableSelection
        />
      )}

      {isModalOpen && (
        <DepartmentFormModal
          isOpen={isModalOpen}
          department={editingDepartment}
          onClose={() => {
            setIsModalOpen(false)
            setEditingDepartment(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingDepartment(null)
            loadDepartments()
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer le département"
          message={`Êtes-vous sûr de vouloir supprimer le département "${deleteTarget.name}" ? Cette action est irréversible.`}
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer'}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default DepartmentList
