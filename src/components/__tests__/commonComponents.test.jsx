import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner, Loader, Skeleton } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ToastItem } from '@/components/ui/Toast'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Reusable Common Components', () => {
  let container = null
  let root = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    container = null
  })

  describe('Button', () => {
    it('renders label and handles click', () => {
      let clicked = false
      act(() => {
        root.render(<Button onClick={() => (clicked = true)}>Enregistrer</Button>)
      })
      const btn = container.querySelector('button')
      expect(btn).not.toBeNull()
      expect(btn.textContent).toBe('Enregistrer')

      act(() => {
        btn.click()
      })
      expect(clicked).toBe(true)
    })

    it('handles isLoading state by showing spinner and disabling button', () => {
      let clicked = false
      act(() => {
        root.render(
          <Button isLoading loadingText="Sauvegarde..." onClick={() => (clicked = true)}>
            Enregistrer
          </Button>
        )
      })
      const btn = container.querySelector('button')
      expect(btn.disabled).toBe(true)
      expect(btn.textContent).toContain('Sauvegarde...')

      act(() => {
        btn.click()
      })
      expect(clicked).toBe(false)
    })
  })

  describe('Input', () => {
    it('renders label, input, and displays validation error', () => {
      act(() => {
        root.render(
          <Input
            label="Email"
            value="test@school.edu"
            error="Email déjà utilisé"
            onChange={() => {}}
          />
        )
      })
      const label = container.querySelector('label')
      expect(label.textContent).toBe('Email')

      const input = container.querySelector('input')
      expect(input.value).toBe('test@school.edu')

      const err = container.querySelector('p')
      expect(err.textContent).toBe('Email déjà utilisé')
    })
  })

  describe('Select', () => {
    it('renders options and selects given value', () => {
      const options = [
        { value: 'TS1', label: 'Terminale S1' },
        { value: '1A', label: 'Première A' },
      ]
      act(() => {
        root.render(<Select label="Classe" value="TS1" options={options} onChange={() => {}} />)
      })
      const select = container.querySelector('select')
      expect(select.value).toBe('TS1')
      // Includes default placeholder option + 2 items
      expect(select.options.length).toBe(3)
      expect(select.options[0].text).toBe('Sélectionner...')
      expect(select.options[1].text).toBe('Terminale S1')
    })

    it('normalizes object value and supports onChange with JSON serialization safety', () => {
      const options = [
        { value: 'TS1', label: 'Terminale S1' },
        { value: '1A', label: 'Première A' },
      ]
      let capturedEvent = null
      act(() => {
        root.render(
          <Select
            label="Classe"
            value={{ value: '1A' }}
            options={options}
            onChange={(e) => {
              capturedEvent = e
            }}
          />
        )
      })
      const select = container.querySelector('select')
      expect(select.value).toBe('1A')

      // Trigger change
      act(() => {
        select.value = 'TS1'
        select.dispatchEvent(new Event('change', { bubbles: true }))
      })

      expect(capturedEvent).not.toBeNull()
      expect(capturedEvent.value).toBe('TS1')
      expect(JSON.stringify({ selected: capturedEvent })).toBe('{"selected":"TS1"}')
    })
  })

  describe('DatePicker', () => {
    it('renders date input and triggers quickToday', () => {
      let chosenValue = ''
      act(() => {
        root.render(
          <DatePicker
            label="Date d'inscription"
            value="2026-09-01"
            quickToday
            onChange={(e) => (chosenValue = e.target.value)}
          />
        )
      })
      const input = container.querySelector('input')
      expect(input.value).toBe('2026-09-01')

      const todayBtn = container.querySelector('button')
      expect(todayBtn).not.toBeNull()
      act(() => {
        todayBtn.click()
      })
      const expectedToday = new Date().toISOString().split('T')[0]
      expect(chosenValue).toBe(expectedToday)
    })
  })

  describe('Modal', () => {
    it('does not render when isOpen is false', () => {
      act(() => {
        root.render(
          <Modal isOpen={false} title="Titre">
            Contenu
          </Modal>
        )
      })
      expect(document.querySelector('[role="dialog"]')).toBeNull()
    })

    it('renders title, content, footer and handles close', () => {
      let closed = false
      act(() => {
        root.render(
          <Modal
            isOpen={true}
            onClose={() => (closed = true)}
            title="Modifier l'élève"
            footer={<button id="test-submit">Valider</button>}
          >
            <p id="modal-body">Corps du formulaire</p>
          </Modal>
        )
      })
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).not.toBeNull()
      expect(dialog.textContent).toContain("Modifier l'élève")
      expect(document.getElementById('modal-body').textContent).toBe('Corps du formulaire')
      expect(document.getElementById('test-submit')).not.toBeNull()

      const closeBtn = dialog.querySelector('button[aria-label="Fermer"]')
      act(() => {
        closeBtn.click()
      })
      expect(closed).toBe(true)
    })
  })

  describe('ConfirmDialog', () => {
    it('renders confirmation text and confirms', () => {
      let confirmed = false
      let cancelled = false
      act(() => {
        root.render(
          <ConfirmDialog
            isOpen={true}
            title="Confirmation de suppression"
            description="Voulez-vous supprimer cet élève ?"
            onConfirm={() => (confirmed = true)}
            onCancel={() => (cancelled = true)}
          />
        )
      })
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog.textContent).toContain('Confirmation de suppression')
      expect(dialog.textContent).toContain('Voulez-vous supprimer cet élève ?')

      const buttons = dialog.querySelectorAll('button')
      // Cancel is first footer button, confirm is second
      const cancelBtn = Array.from(buttons).find((b) => b.textContent.includes('Annuler'))
      const confirmBtn = Array.from(buttons).find((b) => b.textContent.includes('Confirmer'))

      act(() => {
        confirmBtn.click()
      })
      expect(confirmed).toBe(true)

      act(() => {
        cancelBtn.click()
      })
      expect(cancelled).toBe(true)
    })
  })

  describe('StatusBadge', () => {
    it('renders standard Frappe docstatus badge', () => {
      act(() => {
        root.render(<StatusBadge status="Submitted" showDot />)
      })
      expect(container.textContent).toContain('Submitted')
      expect(container.querySelector('span.rounded-full')).not.toBeNull()
    })
  })

  describe('Pagination', () => {
    it('renders summary and navigates pages', () => {
      let changedPage = 1
      act(() => {
        root.render(
          <Pagination
            page={2}
            pageSize={10}
            totalItems={45}
            totalPages={5}
            onPageChange={(p) => (changedPage = p)}
          />
        )
      })
      expect(container.textContent).toContain('Affichage de 11 à 20 sur 45 résultats')

      // Click Next
      const nextBtn = container.querySelector('button[title="Page suivante"]')
      act(() => {
        nextBtn.click()
      })
      expect(changedPage).toBe(3)

      // Click Prev
      const prevBtn = container.querySelector('button[title="Page précédente"]')
      act(() => {
        prevBtn.click()
      })
      expect(changedPage).toBe(1)
    })
  })

  describe('Loader', () => {
    it('renders Spinner and Skeleton without throwing', () => {
      act(() => {
        root.render(
          <div>
            <Spinner size="md" />
            <Loader text="Chargement..." />
            <Skeleton className="h-4 w-20" />
          </div>
        )
      })
      expect(container.textContent).toContain('Chargement...')
      expect(container.querySelector('[role="status"]')).not.toBeNull()
    })
  })

  describe('EmptyState', () => {
    it('renders empty illustration, title, and action', () => {
      let actionClicked = false
      act(() => {
        root.render(
          <EmptyState
            title="Aucun élève trouvé"
            description="Ajoutez un élève pour commencer."
            action={{
              label: '+ Ajouter',
              onClick: () => (actionClicked = true),
            }}
          />
        )
      })
      expect(container.textContent).toContain('Aucun élève trouvé')
      expect(container.textContent).toContain('Ajoutez un élève pour commencer.')

      const actionBtn = container.querySelector('button')
      act(() => {
        actionBtn.click()
      })
      expect(actionClicked).toBe(true)
    })
  })

  describe('ToastItem', () => {
    it('renders toast message and handles dismiss', () => {
      let closedId = null
      const toast = {
        id: 99,
        type: 'success',
        title: 'Inscription réussie',
        message: 'Élève bien enregistré.',
      }
      act(() => {
        root.render(<ToastItem toast={toast} onClose={(id) => (closedId = id)} />)
      })
      expect(container.textContent).toContain('Inscription réussie')
      expect(container.textContent).toContain('Élève bien enregistré.')

      const closeBtn = container.querySelector('button[aria-label="Fermer"]')
      act(() => {
        closeBtn.click()
      })
      expect(closedId).toBe(99)
    })
  })

  describe('DocTypePageHead and Child Resilience', () => {
    it('supports object-shaped primaryAction with label and onClick', () => {
      let created = false
      act(() => {
        root.render(
          <DocTypePageHead
            title="Gestion des Élèves"
            count={24}
            primaryAction={{
              label: 'Nouvel Élève',
              onClick: () => (created = true),
            }}
          />
        )
      })
      expect(container.textContent).toContain('Gestion des Élèves')
      expect(container.textContent).toContain('24')
      expect(container.textContent).toContain('Nouvel Élève')

      const primaryBtn = container.querySelector('button')
      act(() => {
        primaryBtn.click()
      })
      expect(created).toBe(true)
    })

    it('supports string primaryAction with onPrimaryAction callback', () => {
      let saved = false
      act(() => {
        root.render(
          <DocTypePageHead
            title="Examen #42"
            docstatus="Draft"
            primaryAction="Enregistrer"
            onPrimaryAction={() => (saved = true)}
          />
        )
      })
      expect(container.textContent).toContain('Examen #42')
      expect(container.textContent).toContain('Enregistrer')

      const btn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Enregistrer'
      )
      act(() => {
        btn.click()
      })
      expect(saved).toBe(true)
    })

    it('renders secondary actions and breadcrumb objects safely', () => {
      let refreshed = false
      act(() => {
        root.render(
          <DocTypePageHead
            title="Bulletins"
            breadcrumbs={['Desk', { label: 'Notes', to: '/grades' }, 'Trimestre 1']}
            secondaryActions={[{ label: 'Actualiser', onClick: () => (refreshed = true) }]}
          />
        )
      })
      expect(container.textContent).toContain('Desk')
      expect(container.textContent).toContain('Notes')
      expect(container.textContent).toContain('Trimestre 1')
      expect(container.textContent).toContain('Actualiser')

      const secondaryBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Actualiser'
      )
      act(() => {
        secondaryBtn.click()
      })
      expect(refreshed).toBe(true)
    })

    it('Button safely extracts label and onClick from object children', () => {
      let clicked = false
      act(() => {
        root.render(<Button>{{ label: 'Action Objet', onClick: () => (clicked = true) }}</Button>)
      })
      const btn = container.querySelector('button')
      expect(btn.textContent).toBe('Action Objet')
      act(() => {
        btn.click()
      })
      expect(clicked).toBe(true)
    })

    it('StatusBadge safely extracts label from object status', () => {
      act(() => {
        root.render(<StatusBadge status={{ label: 'Payé', status: 'Paid' }} />)
      })
      expect(container.textContent).toContain('Payé')
    })

    it('Input and Select safely display error objects without crashing', () => {
      act(() => {
        root.render(
          <div>
            <Input label="Nom" error={{ message: 'Champ obligatoire' }} />
            <Select label="Rôle" error={{ message: 'Sélectionnez un rôle' }} options={[]} />
          </div>
        )
      })
      expect(container.textContent).toContain('Champ obligatoire')
      expect(container.textContent).toContain('Sélectionnez un rôle')
    })
  })
})
