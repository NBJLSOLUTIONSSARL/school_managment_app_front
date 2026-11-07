import { useState, useEffect, useCallback, useMemo } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
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
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [detailStaff, setDetailStaff] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch departments for filter dropdown
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

  // Local search filter (name, email, position, deptName)
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
          : 'Le membre du personnel'
        success(`${name} a été supprimé avec succès.`)
        setDeleteTarget(null)
        loadStaff()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const departmentFilterOptions = [
    { value: 'ALL', label: 'Tous les départements' },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ]

  const columns = [
    {
      key: 'fullName',
      label: 'Personnel',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'S')[0]}${(u.lastName || 'T')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] font-bold text-xs shrink-0 shadow-2xs">
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
      key: 'position',
      label: 'Poste / Rôle',
      width: '180px',
      render: (val) => (
        <span className="font-medium text-slate-800">{val || 'Non spécifié'}</span>
      ),
    },
    {
      key: 'department',
      label: 'Département',
      width: '180px',
      render: (dept) => (
        <span className="font-medium text-slate-700">{dept?.name || 'Non rattaché'}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '130px',
      render: (_, row) => <span className="text-xs text-slate-600">{row.user?.phone || '-'}</span>,
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
      width: '170px',
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
    <div className="p-6 sm:p-8 space-y-6 select-none">
      <DocTypePageHead
        title="Personnel Administratif"
        count={filteredStaff.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, fonction..."
        primaryAction={
          canCreate
            ? {
                label: 'Nouveau Personnel',
                onClick: () => {
                  setEditingStaff(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 text-xs shadow-2xs">
        <div className="w-72">
          <Select
            label=""
            value={selectedDepartment}
            onChange={(val) => setSelectedDepartment(val)}
            options={departmentFilterOptions}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          title="Aucun membre du personnel"
          description={
            searchTerm || selectedDepartment !== 'ALL'
              ? 'Aucun résultat ne correspond à vos filtres.'
              : 'Commencez par ajouter un membre du personnel administratif.'
          }
          action={
            canCreate
              ? {
                  label: 'Créer un membre',
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
          page={1}
          pageSize={filteredStaff.length || 10}
          totalItems={filteredStaff.length}
          totalPages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          isLoading={false}
          onRowClick={(row) => setDetailStaff(row)}
        />
      )}

      {isFormOpen && (
        <StaffFormModal
          key={editingStaff?.id || 'new'}
          isOpen={isFormOpen}
          staff={editingStaff}
          onClose={() => {
            setIsFormOpen(false)
            setEditingStaff(null)
          }}
          onSuccess={() => loadStaff()}
        />
      )}

      {detailStaff && (
        <StaffDetailsModal
          isOpen={Boolean(detailStaff)}
          staff={detailStaff}
          onClose={() => setDetailStaff(null)}
          onOpenEdit={(stf) => {
            setDetailStaff(null)
            setEditingStaff(stf)
            setIsFormOpen(true)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer ce membre ?"
          message={`Êtes-vous sûr de vouloir supprimer ${deleteTarget.user ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}` : 'ce membre'} ? Cette action est irréversible.`}
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

export default StaffList
