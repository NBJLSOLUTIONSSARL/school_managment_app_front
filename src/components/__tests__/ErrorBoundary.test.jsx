import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '../common/ErrorBoundary'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function Boom() {
  throw new Error('Test rendering failure')
}

describe('ErrorBoundary', () => {
  let container = null
  let root = null
  let consoleSpy = null

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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
    consoleSpy?.mockRestore()
  })

  it('renders children when no error occurs', () => {
    act(() => {
      root.render(
        <ErrorBoundary>
          <span>Contenu sain</span>
        </ErrorBoundary>
      )
    })

    expect(container.textContent).toContain('Contenu sain')
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })

  it('renders a recoverable fallback when a child throws', () => {
    act(() => {
      root.render(
        <ErrorBoundary
          title="Erreur applicative"
          message="Le contenu n'a pas pu être affiché."
          reloadLabel="Recharger"
          homeLabel="Tableau de bord"
        >
          <Boom />
        </ErrorBoundary>
      )
    })

    const alert = container.querySelector('[role="alert"]')
    expect(alert).not.toBeNull()
    expect(alert.textContent).toContain('Erreur applicative')
    expect(alert.textContent).toContain("Le contenu n'a pas pu être affiché.")
    expect(alert.textContent).toContain('Recharger')
    expect(alert.querySelector('a[href="/dashboard"]')).not.toBeNull()
  })
})
