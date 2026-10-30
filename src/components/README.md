# Catalogue des Composants Réutilisables — ERPNext Desk UI

Ce répertoire regroupe les composants réutilisables du système de gestion scolaire, conçus selon la spécification **Frappe / ERPNext Desk UI** :
- **Data-Dense & Clean** : espacements compacts, bordures subtiles (`border-slate-200`) plutôt que des ombres excessives.
- **Typographie Fonctionnelle** : du `text-2xs` (11px) pour les labels et statuts jusqu'au `text-sm` (13px/14px).
- **Keyboard-First** : raccourcis clavier (`Échap` pour fermer les modales, `Tab` pour la navigation).
- **Immutabilité** : gestion d'état React respectant l'immutabilité stricte.

---

## 1. Button

Bouton compact avec gestion des variantes, tailles, icônes et état de chargement.

### Usage
```jsx
import { Button } from '@/components/common/Button'

// Variante primaire (Action principale Desk)
<Button variant="primary" size="sm" onClick={handleSave}>
  Enregistrer
</Button>

// Avec indicateur de chargement
<Button variant="primary" isLoading loadingText="Sauvegarde...">
  Enregistrer
</Button>

// Variante danger (suppression)
<Button variant="danger" size="sm" onClick={handleDelete}>
  Supprimer
</Button>

// Avec icône à gauche
<Button variant="secondary" leftIcon={<span>📎</span>}>
  Joindre un fichier
</Button>
```

### Props
| Prop | Type | Défaut | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'subtle' \| 'danger' \| 'dangerSubtle' \| 'success' \| 'ghost' \| 'outline'` | `'secondary'` | Style visuel |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Hauteur (xs: 24px, sm: 32px, md: 36px, lg: 40px) |
| `isLoading` | `boolean` | `false` | Affiche un spinner et désactive le bouton |
| `loadingText` | `string` | `undefined` | Texte optionnel affiché pendant le chargement |
| `leftIcon` / `rightIcon` | `ReactNode` | `undefined` | Éléments visuels insérés avant/après le libellé |
| `disabled` | `boolean` | `false` | État désactivé |

---

## 2. Input

Champ de saisie compact avec support des libellés, erreurs de validation, préfixes/suffixes et icônes.

### Usage
```jsx
import { Input } from '@/components/common/Input'

<Input
  label="Email académique"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="identifiant@school.edu"
  error={fieldErrors.email}
  required
  helperText="Format institutionnel requis"
/>
```

---

## 3. Select

Menu déroulant stylisé Desk.

### Usage
```jsx
import { Select } from '@/components/common/Select'

<Select
  label="Classe"
  value={selectedClass}
  onChange={(e) => setSelectedClass(e.target.value)}
  options={[
    { value: 'TS1', label: 'Terminale S1' },
    { value: '1A', label: 'Première A' },
    { value: '2B', label: 'Seconde B' },
  ]}
  required
/>
```

---

## 4. DatePicker

Sélecteur de date compact avec bouton d'action rapide "Aujourd'hui".

### Usage
```jsx
import { DatePicker } from '@/components/common/DatePicker'

<DatePicker
  label="Date de naissance"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
  quickToday
  required
/>
```

---

## 5. Modal

Fenêtre modale accessible avec contrôle du clavier (`Échap`), fond flouté et structure Header/Body/Footer.

### Usage
```jsx
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Édition de l'élève"
  subtitle="Modifiez les informations administratives"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
      <Button variant="primary" onClick={handleSave}>Valider</Button>
    </>
  }
>
  <p className="text-xs text-slate-600">Contenu du formulaire...</p>
</Modal>
```

---

## 6. ConfirmDialog

Boîte de dialogue de confirmation d'action critique (suppression, validation finale).

### Usage
```jsx
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

<ConfirmDialog
  isOpen={isConfirmOpen}
  title="Supprimer la classe"
  description="Cette opération est irréversible et retirera tous les élèves associés."
  confirmText="Supprimer définitivement"
  confirmVariant="danger"
  isLoading={isDeleting}
  onConfirm={handleDelete}
  onCancel={() => setIsConfirmOpen(false)}
/>
```

---

## 7. StatusBadge

Pillule de statut standardisée pour documents et entités.

### Usage
```jsx
import { StatusBadge } from '@/components/common/StatusBadge'

<StatusBadge status="Draft" />
<StatusBadge status="Submitted" />
<StatusBadge status="Completed" />
<StatusBadge status="Pending" />
<StatusBadge status="Cancelled" />
<StatusBadge status="Overdue" />
<StatusBadge status="Active" showDot />
```

---

## 8. PaginatedTable & Pagination

Tableau paginé data-dense avec tri interactif, sélection du nombre de lignes par page et intégration fluide des états de chargement / état vide.

### Usage
```jsx
import { PaginatedTable } from '@/components/common/PaginatedTable'

const columns = [
  { key: 'matricule', label: 'Matricule', width: '120px' },
  { key: 'fullName', label: 'Nom & Prénom', sortable: true },
  { key: 'className', label: 'Classe' },
  {
    key: 'status',
    label: 'Statut',
    render: (val) => <StatusBadge status={val} showDot />,
  },
]

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
```

---

## 9. Toast / Notification

Système global de notifications via `useToast()`.

### Usage
```jsx
import { useToast } from '@/hooks/useToast'

function MonComposant() {
  const { success, error, warning, info } = useToast()

  const handleAction = () => {
    success('Élève inscrit avec succès !')
    // ou error('Impossible de contacter le serveur.')
    // ou warning('Attention aux quotas.')
    // ou info('Sauvegarde automatique effectuée.')
  }
}
```

---

## 10. Loader, Spinner & Skeleton

Indicateurs de chargement modulaires.

### Usage
```jsx
import { Spinner, Loader, Skeleton, PageLoader } from '@/components/common/Loader'

// Spinner inline
<Spinner size="sm" />

// Loader avec message textuel
<Loader text="Chargement des résultats..." />

// Skeleton placeholder pour table ou carte
<Skeleton className="h-4 w-48 mb-2" />

// Page loader plein écran
<PageLoader message="Initialisation de l'espace scolaire..." />
```

---

## 11. EmptyState

Affichage d'un état sans données avec illustration et bouton d'action.

### Usage
```jsx
import { EmptyState } from '@/components/common/EmptyState'

<EmptyState
  title="Aucun cours assigné"
  description="Cet élève n'a pas encore de matières enregistrées pour le semestre en cours."
  action={{
    label: '+ Assigner un cours',
    onClick: handleAssignCourse,
    variant: 'primary',
  }}
/>
```
