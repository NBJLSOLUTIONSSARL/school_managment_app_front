import { useState } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Pagination } from '@/components/ui/Pagination'
import { Loader, Spinner, Skeleton } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import { parseProblemDetail, parseAiError } from '@/utils/apiHelpers'

export function ComponentShowcaseView() {
  const { success, error: toastError, warning, info } = useToast()

  // Tab
  const [activeTab, setActiveTab] = useState('buttons')

  // Modals state
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // Form state
  const [formValues, setFormValues] = useState({
    username: '',
    role: 'teacher',
    admissionDate: '2026-09-01',
  })
  const [showFormErrors, setShowFormErrors] = useState(false)

  // Pagination state demo
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // AI & ProblemDetail tester state
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [problemDetailResult, setProblemDetailResult] = useState(null)

  // Table sample data
  const sampleTableData = [
    {
      id: '1',
      doc: 'INV-2026-0001',
      student: 'Léa Moreau',
      amount: '€450',
      status: 'Paid',
      date: '2026-10-12',
    },
    {
      id: '2',
      doc: 'INV-2026-0002',
      student: 'Thomas Petit',
      amount: '€520',
      status: 'Pending',
      date: '2026-10-14',
    },
    {
      id: '3',
      doc: 'INV-2026-0003',
      student: 'Hugo Laurent',
      amount: '€380',
      status: 'Overdue',
      date: '2026-10-01',
    },
    {
      id: '4',
      doc: 'INV-2026-0004',
      student: 'Emma Dubois',
      amount: '€600',
      status: 'Draft',
      date: '2026-10-20',
    },
    {
      id: '5',
      doc: 'INV-2026-0005',
      student: 'Maxime Simon',
      amount: '€450',
      status: 'Submitted',
      date: '2026-10-22',
    },
    {
      id: '6',
      doc: 'INV-2026-0006',
      student: 'Sarah Garcia',
      amount: '€450',
      status: 'Active',
      date: '2026-10-25',
    },
  ]

  const tableColumns = [
    {
      key: 'doc',
      label: 'Référence',
      width: '130px',
      render: (val) => <span className="font-mono text-caption font-semibold">{val}</span>,
    },
    { key: 'student', label: 'Élève', sortable: true },
    {
      key: 'amount',
      label: 'Montant',
      align: 'right',
      render: (val) => <span className="font-mono font-medium">{val}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (val) => <StatusBadge status={val} showDot />,
    },
    { key: 'date', label: 'Date', width: '110px' },
  ]

  const handleRunAiDemo = async (simulateError) => {
    setAiLoading(true)
    setAiResult(null)
    if (simulateError) {
      const sampleAiPayload = {
        response: {
          data: {
            error: {
              code: 'AI_RATE_LIMIT_EXCEEDED',
              message: 'Quota horaire de requêtes IA dépassé pour l\'établissement.',
            },
          },
        },
      }
      const parsedAi = parseAiError(sampleAiPayload)
      setAiResult({ type: 'error', error: parsedAi })
      toastError(parsedAi.userFriendlyMessage)
      setAiLoading(false)
      return
    }

    const res = await exampleService.generateStudentReportAi(
      'Générer appréciation pour Terminale S1',
      false
    )
    setAiLoading(false)
    if (res.success) {
      setAiResult({ type: 'success', data: res.data })
      success('Réponse IA reçue avec succès.')
    } else {
      setAiResult({ type: 'error', error: res.error })
      toastError(res.error?.message || 'Erreur IA')
    }
  }

  const handleRunProblemDetailDemo = () => {
    const rawError = {
      response: {
        status: 400,
        data: {
          type: 'https://school.edu/errors/validation',
          title: 'Validation Failed (ProblemDetail RFC 7807)',
          status: 400,
          detail: '2 champs sont non conformes dans la requête.',
          instance: '/api/students',
          invalidParams: [
            { name: 'email', reason: 'Email invalide (nom de domaine interdit)' },
            { name: 'birthDate', reason: 'La date de naissance doit être antérieure à 2018' },
          ],
        },
      },
    }
    const parsed = parseProblemDetail(rawError)
    setProblemDetailResult(parsed)
    toastError(`ProblemDetail détecté: ${parsed.title}`)
  }

  const handleTest401 = () => {
    // Simulates what happens when a 401 is returned
    warning('Simulation 401 : purge des tokens et redirection vers /login')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      window.location.href = '/login?redirect=/showcase'
    }, 1000)
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--paper)]">
      <DocTypePageHead
        breadcrumbs={['Desk', 'Documentation', 'Composants']}
        title="Catalogue des Composants Réutilisables"
        docstatus="Completed"
        primaryAction="Ouvrir Modale"
        onPrimaryAction={() => setIsBasicModalOpen(true)}
        secondaryActions={[
          {
            label: 'Tester Toast',
            onClick: () => success('Notification Frappe Desk opérationnelle.'),
          },
        ]}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] overflow-x-auto pb-1 text-caption">
          {[
            { id: 'buttons', label: '1. Boutons' },
            { id: 'forms', label: '2. Formulaires (Input/Select/Date)' },
            { id: 'badges', label: '3. Badges de Statut' },
            { id: 'modals', label: '4. Modales & Confirm' },
            { id: 'tables', label: '5. Table & Pagination' },
            { id: 'feedbacks', label: '6. Toasts & Loaders' },
            { id: 'api-errors', label: '7. Helpers API & Erreurs' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-tight font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--surface)] border border-[var(--border-subtle)] border-b-[var(--surface)] -mb-px text-[var(--ink)] font-semibold'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--muted)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Buttons */}
        {activeTab === 'buttons' && (
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Variantes de Button
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary">Primary (Desk Save)</Button>
                <Button variant="secondary">Secondary (Default)</Button>
                <Button variant="subtle">Subtle</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="dangerSubtle">Danger Subtle</Button>
                <Button variant="success">Success</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Tailles & États de Chargement
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs" variant="primary">
                  Taille XS
                </Button>
                <Button size="sm" variant="primary">
                  Taille SM (Standard)
                </Button>
                <Button size="md" variant="primary">
                  Taille MD
                </Button>
                <Button size="lg" variant="primary">
                  Taille LG
                </Button>
                <Button variant="primary" isLoading loadingText="Enregistrement...">
                  Chargement
                </Button>
                <Button variant="secondary" disabled>
                  Désactivé
                </Button>
                <Button variant="secondary" leftIcon={<span>📎</span>}>
                  Avec Icône
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Forms */}
        {activeTab === 'forms' && (
          <Card className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-card-title font-display font-semibold text-[var(--ink)]">
                  Composants de Formulaire Compacts
                </h3>
                <p className="text-caption text-[var(--ink-muted)]">
                  Input, Select et DatePicker conformes à la grille Desk
                </p>
              </div>
              <Button
                size="xs"
                variant={showFormErrors ? 'secondary' : 'dangerSubtle'}
                onClick={() => setShowFormErrors((prev) => !prev)}
              >
                {showFormErrors ? 'Masquer les erreurs' : 'Afficher les erreurs de validation'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nom complet de l'élève"
                placeholder="Ex: Alexandre Dumas"
                value={formValues.username}
                onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                error={showFormErrors ? 'Le champ est obligatoire' : undefined}
                helperText="Identité légale pour le registre"
                required
              />

              <Select
                label="Profil d'accès / Rôle"
                value={formValues.role}
                onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
                options={[
                  { value: 'admin', label: 'Administrateur Principal' },
                  { value: 'teacher', label: 'Professeur Titulaire' },
                  { value: 'student', label: 'Élève / Étudiant' },
                  { value: 'parent', label: 'Responsable Légal' },
                ]}
                error={showFormErrors ? 'Sélectionnez un rôle valide' : undefined}
                required
              />

              <DatePicker
                label="Date d'admission"
                value={formValues.admissionDate}
                onChange={(e) => setFormValues({ ...formValues, admissionDate: e.target.value })}
                quickToday
                error={showFormErrors ? 'Date invalide' : undefined}
                required
              />
            </div>
          </Card>
        )}

        {/* Tab 3: Badges */}
        {activeTab === 'badges' && (
          <Card className="space-y-6">
            <div>
              <h3 className="text-card-title font-display font-semibold text-[var(--ink)]">
                Badges de Statut (StatusBadge)
              </h3>
              <p className="text-caption text-[var(--ink-muted)]">
                Pillules de statut standardisées pour les DocTypes et entités métier
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-caption font-semibold text-[var(--ink-muted)] block mb-2">
                  Statuts de documents (Docstatus) :
                </span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="Draft" />
                  <StatusBadge status="Submitted" />
                  <StatusBadge status="Completed" />
                  <StatusBadge status="Pending" />
                  <StatusBadge status="Cancelled" />
                  <StatusBadge status="Overdue" />
                </div>
              </div>

              <div>
                <span className="text-caption font-semibold text-[var(--ink-muted)] block mb-2">
                  Avec puce colorée (showDot) :
                </span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="Active" showDot />
                  <StatusBadge status="Paid" showDot />
                  <StatusBadge status="Pending" showDot />
                  <StatusBadge status="Warning" showDot />
                  <StatusBadge status="Suspended" showDot />
                  <StatusBadge status="Inactive" showDot />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 4: Modals */}
        {activeTab === 'modals' && (
          <Card className="space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-card-title font-display font-semibold text-[var(--ink)]">
                Modales & Dialogues de Confirmation
              </h3>
              <p className="text-caption text-[var(--ink-muted)]">
                Fenêtres modales accessibles, contrôlées par le clavier (touche Échap) et clics d'arrière-plan.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="primary" onClick={() => setIsBasicModalOpen(true)}>
                Ouvrir Modale Standard (Modal)
              </Button>
              <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                Ouvrir Confirmation (ConfirmDialog)
              </Button>
            </div>
          </Card>
        )}

        {/* Tab 5: Tables */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <h3 className="text-card-title font-display font-semibold text-[var(--ink)]">
                    Table Paginée Réutilisable (PaginatedTable)
                  </h3>
                  <p className="text-caption text-[var(--ink-muted)]">
                    Tri par colonne, sélection de taille de page, et mise en page compacte
                  </p>
                </div>
              </div>

              <PaginatedTable
                columns={tableColumns}
                data={sampleTableData}
                page={page}
                pageSize={pageSize}
                totalItems={sampleTableData.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />

              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-caption font-semibold text-[var(--ink-muted)] block mb-2">
                  Composant Pagination Standalone (120 éléments) :
                </span>
                <div className="rounded-card border border-[var(--border-subtle)] overflow-hidden">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={120}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  État Vide Réutilisable (EmptyState)
                </h3>
              </div>
              <EmptyState
                title="Aucune facture enregistrée"
                description="Toutes les cotisations scolaires pour cette classe ont été soldées."
                action={{
                  label: '+ Nouvelle facture',
                  onClick: () => success('Action du bouton EmptyState déclenchée'),
                }}
              />
            </Card>
          </div>
        )}

        {/* Tab 6: Feedbacks */}
        {activeTab === 'feedbacks' && (
          <Card className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-card-title font-display font-semibold text-[var(--ink)]">
                Notifications Toast & Indicateurs de Chargement
              </h3>
              <p className="text-caption text-[var(--ink-muted)]">
                Retours d'information immédiats pour l'utilisateur
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-caption font-semibold text-[var(--ink-muted)] block mb-2">
                  Déclencher des Toasts :
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => success('Opération complétée avec succès.')}
                  >
                    Toast Succès
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => toastError('Une erreur critique est survenue.')}
                  >
                    Toast Erreur
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => warning('Attention : cette action affecte 25 élèves.')}
                  >
                    Toast Avertissement
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => info('Information : synchronisation en cours.')}
                  >
                    Toast Information
                  </Button>
                </div>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-4">
                <span className="text-caption font-semibold text-[var(--ink-muted)] block mb-3">
                  Loaders & Squelettes :
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Spinner size="xs" color="text-[var(--blue-core)]" />
                    <span className="text-caption text-[var(--ink-muted)]">XS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" color="text-[var(--blue-core)]" />
                    <span className="text-caption text-[var(--ink-muted)]">SM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="md" color="text-[var(--blue-core)]" />
                    <span className="text-caption text-[var(--ink-muted)]">MD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="lg" color="text-[var(--blue-core)]" />
                    <span className="text-caption text-[var(--ink-muted)]">LG</span>
                  </div>
                  <Loader text="Chargement..." />
                </div>

                <div className="mt-4 space-y-2 max-w-md">
                  <span className="text-caption text-[var(--ink-muted)]">Exemple Skeleton :</span>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 7: API & Errors */}
        {activeTab === 'api-errors' && (
          <Card className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-card-title font-display font-semibold text-[var(--ink)]">
                Validation des Helpers API & Parsers d'Erreurs
              </h3>
              <p className="text-caption text-[var(--ink-muted)]">
                Vérification des parsers ProblemDetail RFC 7807 (invalidParams), erreurs IA (
                {'{ code, message }'}), et intercepteur 401
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Demo ProblemDetail */}
              <Card className="space-y-3 bg-[var(--muted)]/50">
                <div className="font-semibold text-caption text-[var(--ink)]">
                  1. ProblemDetail (invalidParams)
                </div>
                <p className="text-caption text-[var(--ink-muted)]">
                  Extrait automatiquement les champs invalides pour surligner les inputs correspondants.
                </p>
                <Button size="xs" variant="secondary" onClick={handleRunProblemDetailDemo}>
                  Simuler Erreur ProblemDetail
                </Button>
                {problemDetailResult && (
                  <div className="rounded-tight bg-[var(--surface)] p-2 border border-[var(--border-subtle)] text-caption font-mono overflow-auto max-h-40">
                    <div>
                      <strong>Title:</strong> {problemDetailResult.title}
                    </div>
                    <div>
                      <strong>Status:</strong> {problemDetailResult.status}
                    </div>
                    <div>
                      <strong>InvalidParams:</strong>
                    </div>
                    <pre>{JSON.stringify(problemDetailResult.invalidParams, null, 2)}</pre>
                  </div>
                )}
              </Card>

              {/* Demo AI Error */}
              <Card className="space-y-3 bg-[var(--muted)]/50">
                <div className="font-semibold text-caption text-[var(--ink)]">
                  2. Erreur Format IA ({'{ code, message }'})
                </div>
                <p className="text-caption text-[var(--ink-muted)]">
                  Parse les codes spécifiques comme AI_RATE_LIMIT_EXCEEDED en messages clairs.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant="primary"
                    isLoading={aiLoading}
                    onClick={() => handleRunAiDemo(false)}
                  >
                    Succès IA
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    isLoading={aiLoading}
                    onClick={() => handleRunAiDemo(true)}
                  >
                    Erreur IA
                  </Button>
                </div>
                {aiResult && (
                  <div className="rounded-tight bg-[var(--surface)] p-2 border border-[var(--border-subtle)] text-caption font-mono overflow-auto max-h-40">
                    <pre>{JSON.stringify(aiResult, null, 2)}</pre>
                  </div>
                )}
              </Card>

              {/* Demo 401 Interceptor */}
              <Card className="space-y-3 bg-[var(--muted)]/50">
                <div className="font-semibold text-caption text-[var(--ink)]">
                  3. Intercepteur Axios 401
                </div>
                <p className="text-caption text-[var(--ink-muted)]">
                  Purge les tokens d'accès/rafraîchissement et redirige immédiatement vers /login avec returnUrl.
                </p>
                <Button size="xs" variant="dangerSubtle" onClick={handleTest401}>
                  Déclencher 401 Unauthorized
                </Button>
              </Card>
            </div>
          </Card>
        )}
      </div>

      {/* Basic Demo Modal */}
      <Modal
        isOpen={isBasicModalOpen}
        onClose={() => setIsBasicModalOpen(false)}
        title="Modale de Démonstration Desk"
        subtitle="Appuyez sur Échap ou cliquez sur le fond pour fermer"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsBasicModalOpen(false)}>
              Fermer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                success('Action confirmée depuis la modale.')
                setIsBasicModalOpen(false)
              }}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-body text-[var(--ink-muted)]">
          <p>
            Cette boîte de dialogue respecte le principe <strong>Keyboard-First</strong> et les
            tokens de design de Frappe / ERPNext.
          </p>
          <div className="rounded-tight bg-[var(--muted)] p-3 border border-[var(--border-subtle)]">
            <span className="font-semibold text-[var(--ink)]">Raccourcis intégrés :</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-caption text-[var(--ink-muted)]">
              <li>
                <kbd className="font-mono bg-[var(--surface)] px-1 border border-[var(--border-subtle)] rounded-tight">Échap</kbd> : Ferme la
                modale immédiatement
              </li>
              <li>
                <kbd className="font-mono bg-[var(--surface)] px-1 border border-[var(--border-subtle)] rounded-tight">Tab</kbd> : Navigation
                séquentielle accessible
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet élément ? L'opération sera journalisée dans la timeline DocTimeline."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="danger"
        isLoading={isConfirmLoading}
        onConfirm={() => {
          setIsConfirmLoading(true)
          setTimeout(() => {
            setIsConfirmLoading(false)
            setIsConfirmOpen(false)
            success('Élément supprimé avec succès.')
          }, 600)
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}

// Mock service for demo
const exampleService = {
  async generateStudentReportAi() {
    return { success: true, data: { report: 'Appréciation générée avec succès.' } }
  }
}

export const ComponentShowcasePage = ComponentShowcaseView
export default ComponentShowcaseView