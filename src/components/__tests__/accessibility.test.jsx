import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { Modal } from '../common/Modal'
import { Pagination } from '../common/Pagination'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Accessibility contracts', () => {
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
    document.body.style.overflow = ''
  })

  it('links Input errors to the field with aria-invalid and aria-describedby', () => {
    act(() => {
      root.render(
        <Input
          label="Email"
          value="invalid"
          error="Adresse email invalide"
          helperText="Ce texte ne doit pas être annoncé"
          onChange={() => {}}
        />
      )
    })

    const input = container.querySelector('input')
    const error = container.querySelector('p[role="alert"]')
    const label = container.querySelector('label')

    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe(error.id)
    expect(error.id).toBeTruthy()
    expect(label.getAttribute('for')).toBe(input.id)
  })

  it('exposes aria-describedby for helper text when there is no error', () => {
    act(() => {
      root.render(
        <Input label="Téléphone" helperText="Format international" onChange={() => {}} />
      )
    })

    const input = container.querySelector('input')
    const helper = container.querySelector('p')

    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBe(helper.id)
    expect(helper.id).toBeTruthy()
  })

  it('marks required Select controls and links validation errors', () => {
    act(() => {
      root.render(
        <Select
          label="Classe"
          required
          error="La classe est obligatoire"
          options={[{ value: 'TS1', label: 'Terminale S1' }]}
          onChange={() => {}}
        />
      )
    })

    const select = container.querySelector('select')
    const error = container.querySelector('p[role="alert"]')

    expect(select.getAttribute('aria-required')).toBe('true')
    expect(select.getAttribute('aria-invalid')).toBe('true')
    expect(select.getAttribute('aria-describedby')).toBe(error.id)
  })

  it('labels the dialog from its title and exposes a close label', () => {
    act(() => {
      root.render(
        <Modal isOpen title="Modifier l'élève" subtitle="Formulaire">
          <p>Contenu</p>
        </Modal>
      )
    })

    const dialog = document.querySelector('[role="dialog"]')
    const heading = dialog.querySelector('h3')

    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id)
    expect(heading.id).toBeTruthy()
    expect(dialog.querySelector('button[aria-label="Fermer"]')).not.toBeNull()
  })

  it('exposes aria-current on the active pagination page', () => {
    act(() => {
      root.render(<Pagination page={2} pageSize={10} totalItems={45} totalPages={5} />)
    })

    const current = container.querySelector('[aria-current="page"]')

    expect(current).not.toBeNull()
    expect(current.textContent).toBe('2')
    expect(container.querySelector('nav[aria-label]')).not.toBeNull()
  })

  it('announces loading buttons with aria-busy', () => {
    act(() => {
      root.render(<Button isLoading>Enregistrer</Button>)
    })

    const button = container.querySelector('button')
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.disabled).toBe(true)
  })
})
