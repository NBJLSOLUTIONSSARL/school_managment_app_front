import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { getCookie } from '@/lib/i18n/cookieUtils'
import { useI18n } from '@/hooks/useI18n'
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE_KEY } from '@/lib/i18n/translations'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function Probe() {
  const i18n = useI18n()

  return (
    <div>
      <span data-testid="label">{i18n.t('nav.dashboard')}</span>
      <span data-testid="dir">{i18n.dir}</span>
      <span data-testid="language">{i18n.language}</span>
      <span data-testid="rtl">{String(i18n.isRTL)}</span>
      <span data-testid="summary">
        {i18n.t('pagination.summary', { start: 1, end: 10, total: 42 })}
      </span>
      <button type="button" onClick={() => i18n.setLanguage('ar')}>
        AR
      </button>
      <button type="button" onClick={() => i18n.setLanguage('unknown')}>
        Invalid
      </button>
    </div>
  )
}

describe('I18nProvider', () => {
  let container = null
  let root = null

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie = `${LANGUAGE_COOKIE_KEY}=; path=/; max-age=0`
    document.documentElement.lang = 'fr'
    document.documentElement.dir = 'ltr'

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

  it('defaults to French and exposes translation helpers', () => {
    act(() => {
      root.render(
        <I18nProvider>
          <Probe />
        </I18nProvider>
      )
    })

    expect(container.querySelector('[data-testid="label"]').textContent).toBe('Tableau de bord')
    expect(container.querySelector('[data-testid="dir"]').textContent).toBe('ltr')
    expect(document.documentElement.lang).toBe(DEFAULT_LANGUAGE)
    expect(container.querySelector('[data-testid="rtl"]').textContent).toBe('false')
  })

  it('switches to Arabic, applies RTL and persists in non-sensitive cookie without localStorage/sessionStorage', () => {
    act(() => {
      root.render(
        <I18nProvider>
          <Probe />
        </I18nProvider>
      )
    })

    act(() => {
      container.querySelectorAll('button')[0].click()
    })

    expect(container.querySelector('[data-testid="label"]').textContent).toBe('لوحة التحكم')
    expect(container.querySelector('[data-testid="dir"]').textContent).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(container.querySelector('[data-testid="rtl"]').textContent).toBe('true')

    // Must NEVER store in localStorage or sessionStorage
    expect(localStorage.getItem('school_app_language')).toBeNull()
    expect(localStorage.getItem('academie_lang')).toBeNull()
    expect(sessionStorage.getItem('school_app_language')).toBeNull()
    expect(sessionStorage.getItem('academie_lang')).toBeNull()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)

    // Stored in non-sensitive cookie
    expect(getCookie(LANGUAGE_COOKIE_KEY)).toBe('ar')
  })

  it('falls back to French for unsupported languages', () => {
    act(() => {
      root.render(
        <I18nProvider>
          <Probe />
        </I18nProvider>
      )
    })

    act(() => {
      container.querySelectorAll('button')[1].click()
    })

    expect(container.querySelector('[data-testid="language"]').textContent).toBe(
      DEFAULT_LANGUAGE
    )
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('interpolates translation variables', () => {
    act(() => {
      root.render(
        <I18nProvider>
          <Probe />
        </I18nProvider>
      )
    })

    const message = container.querySelector('[data-testid="summary"]').textContent
    expect(message).toBe('Affichage de 1 à 10 sur 42 résultats')
  })
})
