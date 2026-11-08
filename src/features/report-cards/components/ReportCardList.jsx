import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { AsyncLinkField } from '@/components/ui/AsyncLinkField'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
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
  const [refreshToken, setRefreshToken] = useState(0)

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
  const [previewLoadingId, setPreviewLoadingId] = useState(null)
  const [preview, setPreview] = useState(null)
  const previewUrlRef = useRef(null)
  const previewFrameRef = useRef(null)

  const searchStudentOptions = useCallback(async (query) => {
    const result = await directoryService.searchStudents(query, { size: 20 })
    if (!result.success) return []

    return result.data.map((student) => ({
      value: String(student.id),
      label: studentDisplayName(student),
      subtitle: student.studentNumber || student.user?.email || '',
    }))
  }, [])

  useEffect(() => {
    let active = true

    reportCardService.getReportCards(activeQuery).then((result) => {
      if (!active) return
      setIsLoading(false)

      if (result.success) {
        setReportCards(Array.isArray(result.data) ? result.data : [])
        setLoadError(null)
      } else {
        setLoadError(result.error)
        toastError(result.error?.message || 'Impossible de charger les bulletins.')
      }
    })

    return () => {
      active = false
    }
  }, [activeQuery, refreshToken, toastError])

  useEffect(() => {
    if (!canGenerate) return undefined

    let active = true

    directoryService.getAllTeachers().then((result) => {
      if (!active) return
      if (result.success) {
        setTeachers(Array.isArray(result.data) ? result.data : [])
      }
    })

    return () => {
      active = false
    }
  }, [canGenerate])

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
    },
    []
  )

  const teacherOptions = useMemo(
    () =>
      teachers.map((teacher) => ({
        value: String(teacher.id),
        label:
          [teacher.user?.firstName, teacher.user?.lastName].filter(Boolean).join(' ') ||
          teacher.user?.email ||
          `Enseignant #${teacher.id}`,
      })),
    [teachers]
  )

  const filteredCards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return reportCards

    return reportCards.filter((card) =>
      [
        card.studentName,
        card.studentNumber,
        card.term,
        card.academicYear,
        card.mention,
        card.decision,
        card.teacherName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [reportCards, searchTerm])

  const paginated = useMemo(
    () => paginateLocal(filteredCards, page, pageSize),
    [filteredCards, page, pageSize]
  )

  const stats = useMemo(() => {
    const students = new Set(reportCards.map((card) => card.studentId))
    const lastGeneratedAt = reportCards.reduce((latest, card) => {
      if (!card.generatedAt) return latest
      return !latest || new Date(card.generatedAt) > new Date(latest) ? card.generatedAt : latest
    }, null)

    return {
      total: reportCards.length,
      students: students.size,
      lastGeneratedAt,
    }
  }, [reportCards])

  const handleApplyFilters = () => {
    const term = termFilter.trim()
    const academicYear = yearFilter.trim()
    const studentId = studentFilter?.value || ''

    if (!studentId && Boolean(term) !== Boolean(academicYear)) {
      warning(
        'Sans élève sélectionné, le backend n’applique le filtre que si la période et l’année académique sont toutes les deux renseignées.'
      )
      return
    }

    setActiveQuery({ term, academicYear, studentId })
    setRefreshToken((previous) => previous + 1)
    setPage(1)
    setSearchTerm('')
  }

  const handleResetFilters = () => {
    setTermFilter('')
    setYearFilter('')
    setStudentFilter(null)
    setActiveQuery(EMPTY_QUERY)
    setRefreshToken((previous) => previous + 1)
    setPage(1)
    setSearchTerm('')
  }

  const openGenerateModal = () => {
    setGenerateForm({
      term: termFilter || activeQuery.term || '',
      academicYear: yearFilter || activeQuery.academicYear || '',
      student: studentFilter,
      teacherId: '',
    })
    setGenerateErrors({})
    setGenerateOpen(true)
  }

  const handleGenerate = async () => {
    const term = generateForm.term.trim()
    const academicYear = generateForm.academicYear.trim()
    const errors = {}

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
      label: 'Élève',
      render: (value, row) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-2xs text-slate-400">
            {row.studentNumber || `Élève #${row.studentId}`}
          </div>
        </div>
      ),
    },
    {
      key: 'term',
      label: 'Période',
      width: '160px',
      render: (value, row) => (
        <div>
          <div className="text-xs text-slate-800">{value || '-'}</div>
          <div className="text-2xs text-slate-400">{row.academicYear || '-'}</div>
        </div>
      ),
    },
    {
      key: 'average',
      label: 'Moyenne',
      width: '100px',
      align: 'center',
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {value === null || value === undefined ? '-' : `${Number(value).toFixed(2)} / 20`}
        </span>
      ),
    },
    {
      key: 'rank',
      label: 'Rang',
      width: '80px',
      align: 'center',
      render: (value) => (
        <span className="font-mono text-2xs text-slate-700">
          {value === null || value === undefined ? '-' : `${value}${value === 1 ? 'er' : 'e'}`}
        </span>
      ),
    },
    {
      key: 'mention',
      label: 'Mention / Décision',
      width: '190px',
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
      render: (value) => <span className="text-2xs text-slate-700">{value || '-'}</span>,
    },
    {
      key: 'generatedAt',
      label: 'Généré le',
      width: '140px',
      render: (value) => (
        <span className="text-2xs text-slate-600">
          {formatDate(value, { hour: '2-digit', minute: '2-digit' })}
        </span>
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
            onClick={() => handlePreview(row)}
            isLoading={previewLoadingId === row.id}
          >
            Aperçu
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleDownload(row)}
            isLoading={downloadingId === row.id}
          >
            PDF
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC]">
      <DocTypePageHead
        breadcrumbs={['Desk', 'Bulletins']}
        title="Bulletins scolaires"
        docstatus="Active"
        primaryAction={canGenerate ? '+ Générer les bulletins' : undefined}
        onPrimaryAction={openGenerateModal}
        secondaryActions={[
          {
            label: 'Actualiser',
            onClick: () => setRefreshToken((previous) => previous + 1),
          },
        ]}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-6 select-none bg-[#F8FAFC]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] px-5 py-4 text-xs leading-relaxed text-[#0F172A]">
          <span className="font-bold">Calcul backend :</span> les moyennes pondérées, rangs,
          mentions et décisions sont calculés exclusivement par le backend. L’API ne fournit pas le
          détail par matière ni d’appréciation libre en dehors du PDF officiel.
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <Input
              label="Période"
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              placeholder="Ex: Trimestre 1"
              maxLength={50}
            />
            <Input
              label="Année académique"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              placeholder="Ex: 2025-2026"
              maxLength={20}
            />
            <AsyncLinkField
              label="Élève (facultatif)"
              value={studentFilter}
              onChange={setStudentFilter}
              search={searchStudentOptions}
              placeholder="Tous les élèves"
              doctype="Élève"
            />
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                Filtrer
              </Button>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Réinitialiser
              </Button>
            </div>
          </div>
          <p className="text-2xs text-slate-500">
            Sans élève sélectionné, le backend n’applique le filtre période / année que lorsque les
            deux champs sont renseignés. Avec un élève, les deux filtres sont appliqués
            individuellement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="text-2xs uppercase tracking-wider text-slate-500">Bulletins affichés</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="text-2xs uppercase tracking-wider text-slate-500">Élèves couverts</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{stats.students}</div>
          </div>
          <div className="rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="text-2xs uppercase tracking-wider text-slate-500">
              Dernière génération
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-900">
              {formatDate(stats.lastGeneratedAt, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {loadError && reportCards.length === 0 && !isLoading ? (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
            <EmptyState
              title="Bulletins indisponibles"
              description={loadError.message}
              action={{
                label: 'Réessayer',
                onClick: () => setRefreshToken((previous) => previous + 1),
              }}
            />
          </div>
        ) : (
          <PaginatedTable
            toolbar={
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="w-full sm:max-w-sm">
                  <Input
                    label="Rechercher dans les résultats"
                    placeholder="Élève, période, mention..."
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <div className="text-2xs text-slate-500">
                  {filteredCards.length} bulletin(s) correspondant(s)
                </div>
              </div>
            }
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
            isLoading={isLoading}
            emptyTitle="Aucun bulletin"
            emptyDescription="Aucun bulletin ne correspond aux critères. Générez les bulletins ou modifiez les filtres."
          />
        )}
      </div>

      <Modal
        isOpen={generateOpen}
        onClose={isGenerating ? undefined : () => setGenerateOpen(false)}
        title="Générer les bulletins"
        size="md"
        closeOnBackdrop={!isGenerating}
        closeOnEsc={!isGenerating}
        footer={
          <>
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
              onClick={handleGenerate}
              isLoading={isGenerating}
            >
              Lancer la génération
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-2xs text-amber-800">
            La génération calcule les moyennes et rangs côté backend, puis génère un PDF par élève.
            Sans élève sélectionné, tous les élèves seront traités.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Période"
              value={generateForm.term}
              onChange={(event) => {
                setGenerateForm((previous) => ({ ...previous, term: event.target.value }))
                setGenerateErrors((previous) => ({ ...previous, term: undefined }))
              }}
              error={generateErrors.term}
              placeholder="Ex: Trimestre 1"
              maxLength={50}
              required
            />
            <Input
              label="Année académique"
              value={generateForm.academicYear}
              onChange={(event) => {
                setGenerateForm((previous) => ({
                  ...previous,
                  academicYear: event.target.value,
                }))
                setGenerateErrors((previous) => ({ ...previous, academicYear: undefined }))
              }}
              error={generateErrors.academicYear}
              placeholder="Ex: 2025-2026"
              maxLength={20}
              required
            />
          </div>

          <AsyncLinkField
            label="Élève (facultatif)"
            value={generateForm.student}
            onChange={(value) => setGenerateForm((previous) => ({ ...previous, student: value }))}
            search={searchStudentOptions}
            placeholder="Tous les élèves"
            helperText="Laisser vide pour générer les bulletins de tous les élèves."
            doctype="Élève"
          />

          <Select
            label="Enseignant principal (facultatif)"
            value={generateForm.teacherId}
            onChange={(event) =>
              setGenerateForm((previous) => ({ ...previous, teacherId: event.target.value }))
            }
            options={teacherOptions}
            placeholder="Non renseigné"
          />
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(preview)}
        onClose={closePreview}
        title={
          preview
            ? `Bulletin — ${preview.card.studentName || `Élève #${preview.card.studentId}`}`
            : 'Bulletin'
        }
        subtitle={
          preview
            ? `${preview.card.term} · ${preview.card.academicYear} · moyenne ${
                preview.card.average !== null && preview.card.average !== undefined
                  ? Number(preview.card.average).toFixed(2)
                  : '-'
              } / 20`
            : undefined
        }
        size="full"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closePreview}>
              Fermer
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePrintPreview}>
              Imprimer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                preview && downloadBlob(preview.blob, preview.filename)
              }
            >
              Télécharger le PDF
            </Button>
          </>
        }
      >
        {preview && (
          <iframe
            ref={previewFrameRef}
            title={`Aperçu du bulletin de ${preview.card.studentName || preview.card.studentId}`}
            src={preview.url}
            className="h-[70vh] w-full rounded border border-slate-200 bg-white"
          />
        )}
      </Modal>
    </div>
  )
}

export const ReportCardListPage = ReportCardList
export default ReportCardList
