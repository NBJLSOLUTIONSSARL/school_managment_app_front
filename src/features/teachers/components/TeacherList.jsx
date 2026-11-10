import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  UserCheck,
  BookOpen,
  Users,
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
  const [activeView, setActiveView] = useState('table')
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

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

  // Fetch teachers
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

  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    success(`Email ${text} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Local search filter
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

  const columns = [
    {
      key: 'fullName',
      label: 'Enseignant',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'P')[0]}${(u.lastName || 'R')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] font-bold text-xs shrink-0 shadow-2xs">
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
      key: 'specialization',
      label: 'Spécialité / Matière',
      render: (val) => (
        <div className="flex items-center justify-between gap-2 max-w-xs group cursor-pointer">
          <span className="text-xs text-[#4B5563] truncate">{val || 'Enseignement Général'}</span>
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
          <span className="truncate">{dept?.name || 'Département Général'}</span>
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] min-h-screen">
      <DocTypePageHead
        icon={UserCheck}
        title="Teachers"
        count={filteredTeachers.length}
        countLabel="professeurs"
        primaryAction={
          canCreate
            ? {
                label: 'New teacher',
                onClick: () => {
                  setEditingTeacher(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          title="Active Opportunities"
          value={`${teachers.length || 24} active`}
          trendValue="↗ 3.5%"
          trendType="positive"
        />
        <StatCard
          icon={BookOpen}
          title="Deals Closed This Month"
          value="18 completed"
          trendValue="↘ 1.2%"
          trendType="negative"
        />
        <StatCard
          icon={Users}
          title="Average Response Time"
          value="2.4 days"
          trendValue="↗ 0.8%"
          trendType="positive"
        />
        <StatCard
          icon={Award}
          title="Engagement Rate"
          value="95%"
          trendValue="↗ 8.34%"
          trendType="positive"
        />
      </div>

      <TableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search teacher by name or subject..."
        primaryActionLabel="New teacher"
        onPrimaryAction={
          canCreate
            ? () => {
                setEditingTeacher(null)
                setIsFormOpen(true)
              }
            : undefined
        }
        filters={[
          {
            label: selectedDepartment === 'ALL' ? 'Department' : departments.find((d) => String(d.id) === selectedDepartment)?.name || 'Department',
            onClick: () => {
              // Cycle through departments
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
      ) : filteredTeachers.length === 0 ? (
        <EmptyState
          title="Aucun enseignant trouvé"
          description={
            searchTerm || selectedDepartment !== 'ALL'
              ? 'Aucun enseignant ne correspond à ces critères.'
              : 'Commencez par ajouter un nouvel enseignant.'
          }
          action={
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
      ) : (
        <PaginatedTable
          columns={columns}
          data={filteredTeachers}
          totalItems={filteredTeachers.length}
          pageSize={20}
          isLoading={false}
          enableSelection
          onRowClick={(row) => setDetailTeacher(row)}
        />
      )}

      {isFormOpen && (
        <TeacherFormModal
          isOpen={isFormOpen}
          teacher={editingTeacher}
          departments={departments}
          onClose={() => {
            setIsFormOpen(false)
            setEditingTeacher(null)
          }}
          onSuccess={() => {
            setIsFormOpen(false)
            setEditingTeacher(null)
            loadTeachers()
          }}
        />
      )}

      {detailTeacher && (
        <TeacherDetailsModal
          isOpen={Boolean(detailTeacher)}
          teacher={detailTeacher}
          onClose={() => setDetailTeacher(null)}
          onEdit={() => {
            setEditingTeacher(detailTeacher)
            setDetailTeacher(null)
            setIsFormOpen(true)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer l'enseignant"
          message={`Êtes-vous sûr de vouloir supprimer ${
            deleteTarget.user
              ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
              : 'cet enseignant'
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

export default TeacherList
