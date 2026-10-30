import { useState } from 'react'
import { DocTypePageHead } from '@/components/erpnext/DocTypePageHead'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { DatePicker } from '@/components/common/DatePicker'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PaginatedTable } from '@/components/common/PaginatedTable'
import { Pagination } from '@/components/common/Pagination'
import { Loader, Spinner, Skeleton } from '@/components/common/Loader'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/hooks/useToast'
import { exampleService } from '@/services/exampleService'
import { parseProblemDetail, parseAiError } from '@/utils/apiHelpers'

export function ComponentShowcasePage() {
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
      amount: '450 €',
      status: 'Paid',
      date: '2026-10-12',
    },
    {
      id: '2',
      doc: 'INV-2026-0002',
      student: 'Thomas Petit',
      amount: '520 €',
      status: 'Pending',
      date: '2026-10-14',
    },
    {
      id: '3',
      doc: 'INV-2026-0003',
      student: 'Hugo Laurent',
      amount: '380 €',
      status: 'Overdue',
      date: '2026-10-01',
    },
    {
      id: '4',
      doc: 'INV-2026-0004',
      student: 'Emma Dubois',
      amount: '600 €',
      status: 'Draft',
      date: '2026-10-20',
    },
    {
      id: '5',
      doc: 'INV-2026-0005',
      student: 'Maxime Simon',
      amount: '450 €',
      status: 'Submitted',
      date: '2026-10-22',
    },
    {
      id: '6',
      doc: 'INV-2026-0006',
      student: 'Sarah Garcia',
      amount: '450 €',
      status: 'Active',
      date: '2026-10-25',
    },
  ]

  const tableColumns = [
    {
      key: 'doc',
      label: 'Référence',
      width: '130px',
      render: (val) => <span className="font-mono text-2xs font-semibold">{val}</span>,
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
              message: 'Quota horaire de requêtes IA dépassé pour l’établissement.',
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
    <div className="flex-1 flex flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={['Desk', 'Documentation', 'Composants']}
        title="Catalogue des Composants Réutilisables"
        docstatus="Completed"
        primaryAction="Ouvrir Modale"
        onPrimaryAction={() => setIsBasicModalOpen(true)}
        secondaryActions={[
          {
            label: 'Tester Toast',
            onClick: () => success('Notification Frappe Desk opérationnelle !'),
          },
        ]}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
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
              className={`px-3 py-2 rounded-t font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white border border-b-white -mb-px text-slate-900 border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Buttons */}
        {activeTab === 'buttons' && (
          <div className="space-y-6">
            <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Variantes de Button
              </h3>
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
            </div>

            <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tailles & États de Chargement
              </h3>
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
            </div>
          </div>
        )}

        {/* Tab 2: Forms */}
        {activeTab === 'forms' && (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Composants de Formulaire Compacts
                </h3>
                <p className="text-2xs text-slate-500">
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
          </div>
        )}

        {/* Tab 3: Badges */}
        {activeTab === 'badges' && (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Badges de Statut (StatusBadge)
              </h3>
              <p className="text-2xs text-slate-500">
                Pillules de statut standardisées pour les DocTypes et entités métier
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-2xs font-semibold text-slate-500 block mb-2">
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
                <span className="text-2xs font-semibold text-slate-500 block mb-2">
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
          </div>
        )}

        {/* Tab 4: Modals */}
        {activeTab === 'modals' && (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Modales & Dialogues de Confirmation
            </h3>
            <p className="text-2xs text-slate-500">
              Fenêtres modales accessibles, contrôlées par le clavier (touche Échap) et clics
              d'arrière-plan.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="primary" onClick={() => setIsBasicModalOpen(true)}>
                Ouvrir Modale Standard (Modal)
              </Button>
              <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                Ouvrir Confirmation (ConfirmDialog)
              </Button>
            </div>
          </div>
        )}

        {/* Tab 5: Tables */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Table Paginée Réutilisable (PaginatedTable)
                  </h3>
                  <p className="text-2xs text-slate-500">
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

              <div className="pt-3 border-t border-slate-100">
                <span className="text-2xs font-semibold text-slate-500 block mb-2">
                  Composant Pagination Standalone (120 éléments) :
                </span>
                <div className="rounded border border-slate-200 overflow-hidden">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={120}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              </div>
            </div>

            <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                État Vide Réutilisable (EmptyState)
              </h3>
              <EmptyState
                title="Aucune facture enregistrée"
                description="Toutes les cotisations scolaires pour cette classe ont été soldées."
                action={{
                  label: '+ Nouvelle facture',
                  onClick: () => success('Action du bouton EmptyState déclenchée'),
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 6: Feedbacks */}
        {activeTab === 'feedbacks' && (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifications Toast & Indicateurs de Chargement
              </h3>
              <p className="text-2xs text-slate-500">
                Retours d'information immédiats pour l'utilisateur
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-2xs font-semibold text-slate-500 block mb-2">
                  Déclencher des Toasts :
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => success('Opération complétée avec succès !')}
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
                    variant="subtle"
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

              <div className="border-t border-slate-100 pt-4">
                <span className="text-2xs font-semibold text-slate-500 block mb-3">
                  Loaders & Squelettes :
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Spinner size="xs" />
                    <span className="text-2xs text-slate-500">XS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-2xs text-slate-500">SM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="md" />
                    <span className="text-2xs text-slate-500">MD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="lg" />
                    <span className="text-2xs text-slate-500">LG</span>
                  </div>
                  <Loader text="Chargement..." />
                </div>

                <div className="mt-4 space-y-2 max-w-md">
                  <span className="text-2xs text-slate-400">Exemple Skeleton :</span>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: API & Errors */}
        {activeTab === 'api-errors' && (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Validation des Helpers API & Parsers d'Erreurs
              </h3>
              <p className="text-2xs text-slate-500">
                Vérification des parsers ProblemDetail RFC 7807 (invalidParams), erreurs IA (
                {'{ code, message }'}), et intercepteur 401
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Demo ProblemDetail */}
              <div className="rounded border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="font-semibold text-xs text-slate-800">
                  1. ProblemDetail (invalidParams)
                </div>
                <p className="text-2xs text-slate-500">
                  Extrait automatiquement les champs invalides pour surligner les inputs
                  correspondants.
                </p>
                <Button size="xs" variant="secondary" onClick={handleRunProblemDetailDemo}>
                  Simuler Erreur ProblemDetail
                </Button>
                {problemDetailResult && (
                  <div className="rounded bg-white p-2 border border-slate-200 text-[11px] font-mono overflow-auto max-h-40">
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
              </div>

              {/* Demo AI Error */}
              <div className="rounded border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="font-semibold text-xs text-slate-800">
                  2. Erreur Format IA ({'{ code, message }'})
                </div>
                <p className="text-2xs text-slate-500">
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
                  <div className="rounded bg-white p-2 border border-slate-200 text-[11px] font-mono overflow-auto max-h-40">
                    <pre>{JSON.stringify(aiResult, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Demo 401 Interceptor */}
              <div className="rounded border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="font-semibold text-xs text-slate-800">
                  3. Intercepteur Axios 401
                </div>
                <p className="text-2xs text-slate-500">
                  Purge les tokens d'accès/rafraîchissement et redirige immédiatement vers /login
                  avec returnUrl.
                </p>
                <Button size="xs" variant="dangerSubtle" onClick={handleTest401}>
                  Déclencher 401 Unauthorized
                </Button>
              </div>
            </div>
          </div>
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
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Cette boîte de dialogue respecte le principe <strong>Keyboard-First</strong> et les
            tokens de design de Frappe / ERPNext.
          </p>
          <div className="rounded bg-slate-50 p-3 border border-slate-200">
            <span className="font-semibold text-slate-800">Raccourcis intégrés :</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-2xs text-slate-500">
              <li>
                <kbd className="font-mono bg-white px-1 border rounded">Échap</kbd> : Ferme la
                modale immédiatement
              </li>
              <li>
                <kbd className="font-mono bg-white px-1 border rounded">Tab</kbd> : Navigation
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

export default ComponentShowcasePage
