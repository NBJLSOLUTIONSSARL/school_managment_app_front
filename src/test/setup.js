import '@testing-library/jest-dom/vitest'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

const origGetAllByRole = screen.getAllByRole
screen.getAllByRole = (role, options) => {
  let results = origGetAllByRole(role, options)
  if (options?.title) {
    results = results.filter((el) => {
      const t = el.getAttribute('title') || ''
      return options.title instanceof RegExp ? options.title.test(t) : t === options.title
    })
  }
  return results
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
