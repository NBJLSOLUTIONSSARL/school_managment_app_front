import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FileText,
  Download,
  Eye,
  Printer,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { AsyncLinkField } from '@/components/ui/AsyncLinkField'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { reportCardService } from '@/features/report-cards/api/reportCardService'
import { directoryService } from '@/features/students'
import { formatDate } from '@/utils/formatDate'
import { downloadBlob } from '@/utils/download'
import { paginateLocal, studentDisplayName } from '@/utils/academic'

const EMPTY_QUERY = { term: '', academicYear: '', studentId: '' }

function mentionStatus(mention) {
  if (mention === 'Très Bien' || mention === 'Bien') return 'Submitted'
  if (mention === 'Assez Bien' || mention === 'Passable') return 'Pending'
  return 'Cancelled'
}

function decisionStatus(decision) {
  return decision === 'Admis' ? 'Submitted' : 'Cancelled'
}

export function ReportCardList() {
  const { success, error: toastError, warning } = useToast()
  const { hasRole } = useAuth()

  const canGenerate = hasRole([
    'admin',
    'ROLE_ADMIN',
    'staff',
    'ROLE_STAFF',
    'teacher',
    'ROLE_TEACHER',
  ])

  const [reportCards, setReportCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [activeQuery, setActiveQuery] = useState(EMPTY_QUERY)

  const [termFilter, setTermFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [studentFilter, setStudentFilter] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [teachers, setTeachers] = useState([])

  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    term: '',
    academicYear: '',
    student: null,
    teacherId: '',
  })
  const [generateErrors, setGenerateErrors] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)

  const [downloadingId, setDownloadingId] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewLoadingId, setPreviewLoadingId] = useState(null)
  const previewUrlRef = useRef(null)
  const previewFrameRef = useRef(null)

  useEffect(() => {
    let active = true

    async function loadTeachers() {
      const result = await directoryService.listTeachers()
      if (active && result.success && Array.isArray(result.data)) {
        setTeachers(result.data)
      }
    }

    loadTeachers()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const loadReportCards = useCallback(async () => {
    setIsLoading(true)
    const result = await reportCardService.queryReportCards(activeQuery)
    setIsLoading(false)

    if (result.success) {
      setReportCards(Array.isArray(result.data) ? result.data : [])
      setLoadError(null)
    } else {
      setLoadError(result.error)
      toastError(result.error?.message || 'Impossible de charger les bulletins.')
    }
  }, [activeQuery, toastError])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async loader updates state after awaiting
    loadReportCards()
  }, [loadReportCards])

  const searchStudentOptions = useCallback(async (query) => {
    const result = await directoryService.searchStudents(query)
    if (!result.success || !Array.isArray(result.data)) return []
    return result.data.map((student) => ({
      value: String(student.id),
      label: studentDisplayName(student),
      description: student.studentNumber || student.gradeLevel || '',
    }))
  }, [])

  const handleApplyFilters = () => {
    const nextQuery = {
      term: termFilter.trim(),
      academicYear: yearFilter.trim(),
      studentId: studentFilter?.value ? String(studentFilter.value) : '',
    }
    setActiveQuery(nextQuery)
    setPage(1)
  }

  const handleResetFilters = () => {
    setTermFilter('')
    setYearFilter('')
    setStudentFilter(null)
    setActiveQuery(EMPTY_QUERY)
    setPage(1)
  }

  const filteredReportCards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return reportCards

    return reportCards.filter((card) =>
      [card.studentName, card.term, card.academicYear, card.mention, card.decision, card.teacherName]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(query))
    )
  }, [reportCards, searchTerm])

  const paginated = useMemo(
    () => paginateLocal(filteredReportCards, page, pageSize),
    [filteredReportCards, page, pageSize]
  )

  const openGenerateModal = () => {
    setGenerateForm({
      term: termFilter.trim(),
      academicYear: yearFilter.trim(),
      student: studentFilter,
      teacherId: '',
    })
    setGenerateErrors({})
    setGenerateOpen(true)
  }

  const handleGenerateSubmit = async () => {
    const errors = {}
    const term = generateForm.term.trim()
    const academicYear = generateForm.academicYear.trim()

    if (!term) errors.term = 'La période est obligatoire.'
    else if (term.length > 50) errors.term = 'La période ne doit pas dépasser 50 caractères.'

    if (!academicYear) errors.academicYear = 'L’année académique est obligatoire.'
    else if (academicYear.length > 20) {
      errors.academicYear = 'L’année académique ne doit pas dépasser 20 caractères.'
    }

    if (Object.keys(errors).length > 0) {
      setGenerateErrors(errors)
      return
    }

    setIsGenerating(true)
    const result = await reportCardService.generateReportCards({
      term,
      academicYear,
      studentId: generateForm.student?.value ? Number(generateForm.student.value) : null,
      teacherId: generateForm.teacherId ? Number(generateForm.teacherId) : null,
    })
    setIsGenerating(false)

    if (result.success) {
      const summary = result.data || {}
      const generated = Array.isArray(summary.reportCards) ? summary.reportCards : []
      setReportCards(generated)
      setLoadError(null)
      setGenerateOpen(false)
      setPage(1)

      if ((summary.totalGenerated ?? generated.length) > 0) {
        success(
          `${summary.totalGenerated ?? generated.length} bulletin(s) généré(s) pour ${summary.term} · ${summary.academicYear}.`,
          'Bulletins'
        )
      } else {
        warning('Aucun bulletin n’a été généré pour ces critères.', 'Bulletins')
      }
    } else {
      toastError(result.error?.message || 'Impossible de générer les bulletins.')
      if (result.error?.fieldErrors && Object.keys(result.error.fieldErrors).length > 0) {
        setGenerateErrors(result.error.fieldErrors)
      }
    }
  }

  const handleDownload = async (card) => {
    setDownloadingId(card.id)
    const result = await reportCardService.downloadReportCardPdf(card.id)
    setDownloadingId(null)

    if (result.success) {
      downloadBlob(result.data.blob, result.data.filename)
      success('Téléchargement du bulletin lancé.', 'Bulletins')
    } else {
      toastError(result.error?.message || 'Impossible de télécharger ce bulletin.')
    }
  }

  const closePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreview(null)
  }

  const handlePreview = async (card) => {
    if (previewLoadingId) return

    setPreviewLoadingId(card.id)
    const result = await reportCardService.downloadReportCardPdf(card.id)
    setPreviewLoadingId(null)

    if (result.success) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
      const url = URL.createObjectURL(result.data.blob)
      previewUrlRef.current = url
      setPreview({
        card,
        blob: result.data.blob,
        filename: result.data.filename,
        url,
      })
    } else {
      toastError(result.error?.message || 'Impossible d’afficher ce bulletin.')
    }
  }

  const handlePrintPreview = () => {
    const frame = previewFrameRef.current
    try {
      frame?.contentWindow?.focus()
      frame?.contentWindow?.print()
    } catch {
      if (preview?.url) {
        window.open(preview.url, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const columns = [
    {
      key: 'studentName',
      label: 'Élève / Identité',
      render: (value, row) => (
        <div className="min-w-0">
          <div className="font-semibold text-[#0F172A] text-xs truncate">{value || '—'}</div>
          <div className="text-[11px] text-[#64748B] truncate">
            {row.studentNumber || `Élève #${row.studentId}`}
          </div>
        </div>
      ),
    },
    {
      key: 'term',
      label: 'Période / Année',
      width: '160px',
      render: (value, row) => (
        <div>
          <div className="text-xs text-[#0F172A]">{value || '—'}</div>
          <div className="text-[11px] text-[#64748B]">{row.academicYear || '—'}</div>
        </div>
      ),
    },
    {
      key: 'average',
      label: 'Moyenne',
      width: '110px',
      align: 'center',
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-[#0F172A]">
          {value === null || value === undefined ? '—' : `${Number(value).toFixed(2)} / 20`}
        </span>
      ),
    },
    {
      key: 'rank',
      label: 'Rang',
      width: '80px',
      align: 'center',
      render: (value) => (
        <span className="font-mono text-2xs text-[#475569]">
          {value === null || value === undefined ? '—' : `${value}${value === 1 ? 'er' : 'e'}`}
        </span>
      ),
    },
    {
      key: 'mention',
      label: 'Mention / Décision',
      width: '200px',
      render: (value, row) => (
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge
            status={mentionStatus(value)}
            label={value || 'Non renseignée'}
            size="xs"
            showDot
          />
          <StatusBadge
            status={decisionStatus(row.decision)}
            label={row.decision || 'Non renseignée'}
            size="xs"
          />
        </div>
      ),
    },
    {
      key: 'teacherName',
      label: 'Enseignant',
      width: '150px',
      render: (value) => <span className="text-xs text-[#475569]">{value || '—'}</span>,
    },
    {
      key: 'generatedAt',
      label: 'Généré le',
      width: '130px',
      render: (value) => (
        <span className="text-xs text-[#64748B]">
          {formatDate(value, { hour: '2-digit', minute: '2-digit' })}
        </span>
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
              label: 'Aperçu',
              icon: Eye,
              disabled: previewLoadingId === row.id,
              onClick: () => handlePreview(row),
            },
            {
              label: 'Télécharger PDF',
              icon: Download,
              disabled: downloadingId === row.id,
              onClick: () => handleDownload(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters = Boolean(activeQuery.term || activeQuery.academicYear || activeQuery.studentId)
  const activeFiltersCount =
    (activeQuery.term ? 1 : 0) +
    (activeQuery.academicYear ? 1 : 0) +
    (activeQuery.studentId ? 1 : 0)

  const filtersContent = (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Période
        </label>
        <Input
          value={termFilter}
          onChange={(event) => setTermFilter(event.target.value)}
          placeholder="Ex: Trimestre 1"
          maxLength={50}
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Année académique
        </label>
        <Input
          value={yearFilter}
          onChange={(event) => setYearFilter(event.target.value)}
          placeholder="Ex: 2025-2026"
          maxLength={20}
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Élève (facultatif)
        </label>
        <AsyncLinkField
          value={studentFilter}
          onChange={setStudentFilter}
          search={searchStudentOptions}
          placeholder="Tous les élèves"
          doctype="Élève"
        />
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <Button variant="primary" size="xs" onClick={handleApplyFilters}>
          Appliquer
        </Button>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={canGenerate ? openGenerateModal : undefined}
        addNewLabel="Générer les bulletins"
        canAddNew={canGenerate}
        addNewIcon={FileText}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Élève, période, mention..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleResetFilters}
      />

      <EntityDataTable
        columns={columns}
        data={paginated.items}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadReportCards}
        emptyTitle="Aucun bulletin disponible"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucun bulletin ne correspond aux critères sélectionnés.'
            : 'Générez des bulletins pour afficher les relevés académiques.'
        }
        emptyAction={
          canGenerate
            ? {
                label: 'Générer les bulletins',
                onClick: openGenerateModal,
              }
            : undefined
        }
        page={paginated.page}
        pageSize={pageSize}
        totalItems={paginated.totalItems}
        totalPages={paginated.totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        onRowClick={(row) => handlePreview(row)}
      />

      {/* Generate Report Cards Modal */}
      <Modal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Générer les bulletins de notes"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGenerateOpen(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateSubmit}
              isLoading={isGenerating}
            >
              Lancer la génération
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <Input
            label="Période / Trimestre / Semestre"
            value={generateForm.term}
            onChange={(event) =>
              setGenerateForm((prev) => ({ ...prev, term: event.target.value }))
            }
            placeholder="Ex: Trimestre 1"
            error={generateErrors.term}
            required
            maxLength={50}
          />

          <Input
            label="Année académique"
            value={generateForm.academicYear}
            onChange={(event) =>
              setGenerateForm((prev) => ({ ...prev, academicYear: event.target.value }))
            }
            placeholder="Ex: 2025-2026"
            error={generateErrors.academicYear}
            required
            maxLength={20}
          />

          <AsyncLinkField
            label="Élève cible (laisser vide pour toute la cohorte)"
            value={generateForm.student}
            onChange={(option) =>
              setGenerateForm((prev) => ({ ...prev, student: option }))
            }
            search={searchStudentOptions}
            placeholder="Rechercher un élève..."
            doctype="Élève"
          />

          <Select
            label="Enseignant signataire (facultatif)"
            value={generateForm.teacherId}
            onChange={(event) =>
              setGenerateForm((prev) => ({ ...prev, teacherId: event.target.value }))
            }
            options={[
              { value: '', label: 'Aucun signataire spécifique' },
              ...teachers.map((teacher) => ({
                value: String(teacher.id),
                label: `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.trim() || `Professeur #${teacher.id}`,
              })),
            ]}
          />
        </div>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={Boolean(preview)}
        onClose={closePreview}
        title={preview ? `Bulletin · ${preview.card.studentName || 'Élève'} (${preview.card.term || ''})` : 'Aperçu'}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-2xs text-slate-500 truncate">
              {preview?.filename}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintPreview}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Imprimer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => preview?.card && handleDownload(preview.card)}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Télécharger
              </Button>
            </div>
          </div>
        }
      >
        <div className="h-[70vh] w-full rounded border border-slate-200 bg-slate-100 overflow-hidden">
          {preview?.url ? (
            <iframe
              ref={previewFrameRef}
              src={preview.url}
              title="Aperçu du bulletin"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              Chargement du PDF...
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ReportCardList
