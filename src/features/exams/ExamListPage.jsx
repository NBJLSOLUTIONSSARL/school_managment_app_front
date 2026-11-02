import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocTypePageHead } from '@/components/erpnext/DocTypePageHead'
import { PaginatedTable } from '@/components/common/PaginatedTable'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { examService } from '@/services/examService'
import { formatDate } from '@/utils/formatDate'
import { paginateLocal, teacherDisplayName } from '@/utils/academic'

export function ExamListPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canManage = hasRole([
    'admin',
    'ROLE_ADMIN',
    'teacher',
    'ROLE_TEACHER',
    'staff',
    'ROLE_STAFF',
  ])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])

  const [exams, setExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lockingId, setLockingId] = useState(null)

  const loadExams = useCallback(async () => {
    const result = await examService.getAllExams()
    setIsLoading(false)

    if (result.success) {
      setExams(Array.isArray(result.data) ? result.data : [])
      setLoadError(null)
    } else {
      setLoadError(result.error)
      toastError(result.error?.message || 'Impossible de charger les examens.')
    }
  }, [toastError])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async loader updates state after awaiting
    loadExams()
  }, [loadExams])

  const handleRefresh = () => {
    setIsLoading(true)
    loadExams()
  }

  const examTypes = useMemo(() => {
    const values = new Set(exams.map((exam) => exam.type).filter(Boolean))
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [exams])

  const filteredExams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return exams
      .filter((exam) => {
        const matchesSearch =
          !query ||
          [exam.title, exam.type, exam.teacherName, exam.id]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'locked' && exam.locked) ||
          (statusFilter === 'open' && !exam.locked)

        const matchesType = typeFilter === 'all' || exam.type === typeFilter

        return matchesSearch && matchesStatus && matchesType
      })
      .sort((a, b) => {
        const left = a[sortBy] ?? ''
        const right = b[sortBy] ?? ''
        if (left === right) return 0
        const comparison = String(left).localeCompare(String(right), 'fr', { numeric: true })
        return sortDirection === 'asc' ? comparison : -comparison
      })
  }, [exams, searchTerm, statusFilter, typeFilter, sortBy, sortDirection])

  const paginated = useMemo(
    () => paginateLocal(filteredExams, page, pageSize),
    [filteredExams, page, pageSize]
  )

  const stats = useMemo(
    () => [
      { label: 'Examens', value: exams.length },
      { label: 'Ouverts', value: exams.filter((exam) => !exam.locked).length },
      { label: 'Verrouillés', value: exams.filter((exam) => exam.locked).length },
    ],
    [exams]
  )

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  const handleLockToggle = async (exam) => {
    setLockingId(exam.id)
    const result = await examService.setExamLock(exam.id, !exam.locked)
    setLockingId(null)

    if (result.success) {
      setExams((previous) =>
        previous.map((item) => (item.id === exam.id ? { ...item, ...result.data } : item))
      )
      success(result.message || `Examen ${result.data?.locked ? 'verrouillé' : 'déverrouillé'}.`)
    } else {
      toastError(result.error?.message || 'Impossible de modifier le verrouillage de l’examen.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await examService.deleteExam(deleteTarget.id)
    setIsDeleting(false)

    if (result.success) {
      setExams((previous) => previous.filter((exam) => exam.id !== deleteTarget.id))
      setDeleteTarget(null)
      success('Examen supprimé avec succès.')
    } else {
      toastError(result.error?.message || 'Impossible de supprimer cet examen.')
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Examen',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-2xs text-slate-400">
            {row.type || 'Type non renseigné'} · #{row.id}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: '140px',
      render: (value) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs text-slate-700">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      width: '130px',
      sortable: true,
      render: (value) => <span className="text-xs text-slate-700">{formatDate(value)}</span>,
    },
    {
      key: 'teacherName',
      label: 'Enseignant',
      width: '170px',
      sortable: true,
      render: (value, row) => (
        <span className="text-xs text-slate-700">
          {value || teacherDisplayName({ id: row.teacherId })}
        </span>
      ),
    },
    {
      key: 'maxScore',
      label: 'Barème',
      width: '120px',
      align: 'center',
      sortable: true,
      render: (value, row) => (
        <span className="font-mono text-2xs text-slate-700">
          {value ?? 20} pts · coef. {row.coefficient ?? 1}
        </span>
      ),
    },
    {
      key: 'locked',
      label: 'Statut',
      width: '110px',
      render: (value) => (
        <StatusBadge status={value ? 'Locked' : 'Open'} showDot />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '190px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/exams/${row.id}`)
            }}
          >
            Ouvrir
          </Button>
          {canManage && (
            <Button
              variant="ghost"
              size="xs"
              isLoading={lockingId === row.id}
              onClick={(event) => {
                event.stopPropagation()
                handleLockToggle(row)
              }}
            >
              {row.locked ? 'Déverrouiller' : 'Verrouiller'}
            </Button>
          )}
          {canDelete && !row.locked && (
            <Button
              variant="ghost"
              size="xs"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={(event) => {
                event.stopPropagation()
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
    <div className="flex-1 flex flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={['Desk', 'Examens']}
        title="Gestion des examens"
        docstatus="Active"
        primaryAction={canManage ? '+ Nouvel examen' : undefined}
        onPrimaryAction={() => navigate('/exams/new')}
        secondaryActions={[{ label: 'Actualiser', onClick: handleRefresh }]}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs"
            >
              <div className="text-2xs font-medium uppercase tracking-wider text-slate-500">
                {stat.label}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:max-w-3xl">
            <Input
              label="Rechercher"
              placeholder="Titre, type, enseignant..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setPage(1)
              }}
              size="sm"
            />
            <Select
              label="Statut"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'open', label: 'Ouverts' },
                { value: 'locked', label: 'Verrouillés' },
              ]}
              placeholder=""
            />
            <Select
              label="Type"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'Tous les types' },
                ...examTypes.map((type) => ({ value: type, label: type })),
              ]}
              placeholder=""
            />
          </div>

          <div className="text-2xs text-slate-500">
            {paginated.totalItems} examen(s) affiché(s) sur {exams.length}
          </div>
        </div>

        {loadError && exams.length === 0 && !isLoading ? (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
            <EmptyState
              title="Examens indisponibles"
              description={loadError.message}
              action={{ label: 'Réessayer', onClick: handleRefresh }}
            />
          </div>
        ) : (
          <PaginatedTable
            columns={columns}
            data={paginated.items}
            page={paginated.page}
            pageSize={pageSize}
            totalItems={paginated.totalItems}
            totalPages={paginated.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={(row) => navigate(`/exams/${row.id}`)}
            isLoading={isLoading}
            emptyTitle="Aucun examen"
            emptyDescription="Aucun examen ne correspond aux filtres sélectionnés."
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Supprimer l’examen"
        description={`Supprimer définitivement « ${deleteTarget?.title || ''} » ? Cette action est refusée par le backend si l’examen est verrouillé.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ExamListPage
