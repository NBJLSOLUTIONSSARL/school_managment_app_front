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
import { teacherService } from '../api/teacherService'
import { departmentService } from '@/features/departments/api/departmentService'
import { TeacherFormModal } from './TeacherFormModal'
import { TeacherDetailsModal } from './TeacherDetailsModal'

export function TeacherList() {
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canCreate = hasRole(['admin', 'ROLE_ADMIN'])
  const canEdit = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN'])

  const [teachers, setTeachers] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [detailTeacher, setDetailTeacher] = useState(null)
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

  // Fetch teachers (backend supports departmentId filter)
  const loadTeachers = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        const deptId = selectedDepartment !== 'ALL' ? Number(selectedDepartment) : undefined
        const res = await teacherService.getTeachers({ departmentId: deptId })
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setTeachers(res.data)
        } else {
          toastError(res.error?.message || 'Erreur lors du chargement des enseignants.')
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
    const pending = Promise.resolve().then(() => loadTeachers({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadTeachers])

  // Local search filter (name, email, specialization)
  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers
    const term = searchTerm.toLowerCase()
    return teachers.filter((t) => {
      const u = t.user || {}
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
      const email = (u.email || '').toLowerCase()
      const spec = (t.specialization || '').toLowerCase()
      const deptName = (t.department?.name || '').toLowerCase()
      return (
        fullName.includes(term) ||
        email.includes(term) ||
        spec.includes(term) ||
        deptName.includes(term)
      )
    })
  }, [teachers, searchTerm])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await teacherService.deleteTeacher(deleteTarget.id)
      if (res.success) {
        const name = deleteTarget.user
          ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
          : 'L’enseignant'
        success(`${name} a été supprimé avec succès.`)
        setDeleteTarget(null)
        loadTeachers()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression de l’enseignant.')
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
      label: 'Enseignant',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        return (
          <div>
            <div className="font-medium text-slate-900">{name}</div>
            <div className="text-2xs text-slate-400">{u.email}</div>
          </div>
        )
      },
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
      key: 'specialization',
      label: 'Spécialité',
      width: '160px',
      render: (val) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs text-slate-700">
          {val || 'Général'}
        </span>
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
              setDetailTeacher(row)
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
                setEditingTeacher(row)
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
    <div className="space-y-4">
      <DocTypePageHead
        title="Corps Professoral"
        count={filteredTeachers.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, matière..."
        primaryAction={
          canCreate
            ? {
                label: 'Nouvel Enseignant',
                onClick: () => {
                  setEditingTeacher(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white p-3 text-xs shadow-2xs">
        <div className="w-64">
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
      ) : filteredTeachers.length === 0 ? (
        <EmptyState
          title="Aucun enseignant trouvé"
          description={
            searchTerm || selectedDepartment !== 'ALL'
              ? 'Aucun enseignant ne correspond à vos filtres.'
              : 'Commencez par ajouter un premier enseignant.'
          }
          action={
            canCreate
              ? {
                  label: 'Créer un enseignant',
                  onClick: () => {
                    setEditingTeacher(null)
                    setIsFormOpen(true)
                  },
                }
              : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={filteredTeachers}
          page={1}
          pageSize={filteredTeachers.length || 10}
          totalItems={filteredTeachers.length}
          totalPages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          isLoading={false}
          onRowClick={(row) => setDetailTeacher(row)}
        />
      )}

      {isFormOpen && (
        <TeacherFormModal
          key={editingTeacher?.id || 'new'}
          isOpen={isFormOpen}
          teacher={editingTeacher}
          onClose={() => {
            setIsFormOpen(false)
            setEditingTeacher(null)
          }}
          onSuccess={() => loadTeachers()}
        />
      )}

      {detailTeacher && (
        <TeacherDetailsModal
          isOpen={Boolean(detailTeacher)}
          teacher={detailTeacher}
          onClose={() => setDetailTeacher(null)}
          onOpenEdit={(tch) => {
            setDetailTeacher(null)
            setEditingTeacher(tch)
            setIsFormOpen(true)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer cet enseignant ?"
          message={`Êtes-vous sûr de vouloir supprimer ${deleteTarget.user ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}` : 'cet enseignant'} ? Cette action est irréversible.`}
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

export default TeacherList
