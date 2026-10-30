import { useState, useEffect, useCallback } from 'react'
import { DocTypePageHead } from '@/components/erpnext/DocTypePageHead'
import { PaginatedTable } from '@/components/common/PaginatedTable'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { DatePicker } from '@/components/common/DatePicker'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useToast } from '@/hooks/useToast'
import { useDebounce } from '@/hooks/useDebounce'
import { exampleService } from '@/services/exampleService'

export function StudentListPage() {
  const { success, error: toastError } = useToast()

  // State
  const [students, setStudents] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    matricule: 'STU-2026-9999',
    className: 'Terminale S1',
    birthDate: '2008-05-14',
  })

  // Delete Confirm Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch students
  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await exampleService.getStudentsSpringPage({
        page,
        size: pageSize,
        search: debouncedSearch,
      })

      if (res.success && res.data) {
        setStudents(res.data.items)
        setTotalItems(res.data.totalItems)
        setTotalPages(res.data.totalPages)
      } else {
        toastError(res.error?.message || 'Erreur lors du chargement des élèves.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, debouncedSearch, toastError])

  useEffect(() => {
    let ignore = false
    exampleService
      .getStudentsSpringPage({
        page,
        size: pageSize,
        search: debouncedSearch,
      })
      .then((res) => {
        if (ignore) return
        if (res.success && res.data) {
          setStudents(res.data.items)
          setTotalItems(res.data.totalItems)
          setTotalPages(res.data.totalPages)
        } else {
          toastError(res.error?.message || 'Erreur lors du chargement des élèves.')
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [page, pageSize, debouncedSearch, toastError])

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Handle Create Student
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFieldErrors({})

    const res = await exampleService.createStudentWithValidation(formData)

    setIsSubmitting(false)
    if (res.success) {
      success(`Élève ${res.data.firstName} ${res.data.lastName} créé avec succès.`)
      setIsCreateModalOpen(false)
      loadStudents()
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        matricule: 'STU-2026-9999',
        className: 'Terminale S1',
        birthDate: '2008-05-14',
      })
    } else {
      toastError(res.error?.message || 'Erreur lors de la validation du formulaire.')
      if (res.error?.fieldErrors) {
        setFieldErrors(res.error.fieldErrors)
      }
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setTimeout(() => {
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setTotalItems((prev) => Math.max(0, prev - 1))
      setIsDeleting(false)
      setDeleteTarget(null)
      success(`Élève ${deleteTarget.fullName} supprimé.`)
    }, 400)
  }

  const columns = [
    {
      key: 'matricule',
      label: 'Matricule',
      width: '130px',
      render: (val) => (
        <span className="font-mono text-2xs font-semibold text-slate-800">{val}</span>
      ),
    },
    {
      key: 'fullName',
      label: 'Nom et Prénom',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-medium text-slate-900">{val}</div>
          <div className="text-2xs text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'className',
      label: 'Classe',
      width: '140px',
      render: (val) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs text-slate-700">{val}</span>
      ),
    },
    {
      key: 'averageGrade',
      label: 'Moyenne / 20',
      width: '110px',
      align: 'center',
      render: (val) => (
        <span className="font-mono text-xs font-medium text-slate-800">
          {val ? `${val} / 20` : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '100px',
      render: (val) => <StatusBadge status={val} showDot />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteTarget(row)
          }}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          Supprimer
        </Button>
      ),
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={['Desk', 'Élèves']}
        title="Liste des Élèves (Spring Page)"
        docstatus="Submitted"
        primaryAction="+ Nouvel Élève"
        onPrimaryAction={() => setIsCreateModalOpen(true)}
        secondaryActions={[{ label: 'Actualiser', onClick: loadStudents }]}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded border border-slate-200 shadow-2xs">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Rechercher par nom, email, matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2 text-2xs text-slate-500">
            <span>Normalisation active :</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
              Spring Data Page&lt;T&gt;
            </span>
          </div>
        </div>

        {/* Table */}
        <PaginatedTable
          columns={columns}
          data={students}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
        />
      </div>

      {/* Create Student Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Inscrire un nouvel élève"
        subtitle="Formulaire validé avec gestion des erreurs ProblemDetail RFC 7807 (invalidParams)"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateSubmit}
              isLoading={isSubmitting}
            >
              Enregistrer l&apos;élève
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={fieldErrors.firstName}
              placeholder="Ex: Lucas"
              required
            />
            <Input
              label="Nom de famille"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={fieldErrors.lastName}
              placeholder="Ex: Bernard"
              required
            />
          </div>

          <Input
            label="Email institutionnel"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={fieldErrors.email}
            placeholder="lucas.bernard@school.edu"
            helperText="Pour tester l'erreur ProblemDetail, saisissez un texte sans @"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Numéro de Matricule"
              value={formData.matricule}
              onChange={(e) => handleInputChange('matricule', e.target.value)}
              error={fieldErrors.matricule}
              placeholder="STU-2026-XXXX"
              required
            />

            <Select
              label="Classe assignée"
              value={formData.className}
              onChange={(e) => handleInputChange('className', e.target.value)}
              options={[
                { value: 'Terminale S1', label: 'Terminale S1' },
                { value: 'Première A', label: 'Première A' },
                { value: 'Seconde B', label: 'Seconde B' },
                { value: '3ème C', label: '3ème C' },
              ]}
              required
            />
          </div>

          <DatePicker
            label="Date de naissance"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            quickToday
          />
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Supprimer l'élève"
        description={`Êtes-vous sûr de vouloir supprimer l'élève ${deleteTarget?.fullName} (${deleteTarget?.matricule}) ? Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default StudentListPage
