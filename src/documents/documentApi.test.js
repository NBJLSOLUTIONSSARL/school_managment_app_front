import { afterEach, describe, expect, it, vi } from 'vitest'
import { getDocumentAccess, getMyDocuments, validateDocumentUrl } from './documentApi'

const signed = (overrides = {}) => ({
  id: 7, status: 'PENDING', fileKey: 'abc-123.pdf',
  downloadUrl: `/api/v1/documents/files/abc-123.pdf?expires=${Date.now() + 900000}&signature=abc_DEF-123`,
  ...overrides,
})

afterEach(() => vi.unstubAllEnvs())

describe('document API contracts', () => {
  it('reads the raw array and excludes signed links from list state', async () => {
    const request = vi.fn().mockResolvedValue([signed()])
    const list = await getMyDocuments(request)
    expect(request).toHaveBeenCalledWith('/api/v1/documents/my-documents')
    expect(list[0].id).toBe(7)
    expect(list[0]).not.toHaveProperty('downloadUrl')
    expect(list[0]).not.toHaveProperty('fileKey')
  })

  it.each([{ data: [] }, null, [{}], [signed({ status: 'UNKNOWN' })], [signed(), signed()]])('rejects malformed list response %#', async (body) => {
    await expect(getMyDocuments(vi.fn().mockResolvedValue(body))).rejects.toThrow()
  })

  it('always requests fresh metadata before preparing access', async () => {
    const request = vi.fn().mockResolvedValue(signed())
    const result = await getDocumentAccess(request, 7)
    expect(request).toHaveBeenCalledWith('/api/v1/documents/7')
    expect(result.href).toContain('/api/v1/documents/files/abc-123.pdf?')
  })

  it('rejects mismatched metadata and invalid IDs', async () => {
    const request = vi.fn().mockResolvedValue(signed({ id: 8 }))
    await expect(getDocumentAccess(request, 7)).rejects.toThrow()
    request.mockClear()
    await expect(getDocumentAccess(request, '../7')).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it('resolves signed relative URLs against the configured backend origin', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.school.test')
    expect(validateDocumentUrl(signed()).href).toMatch(/^https:\/\/api.school.test\/api\/v1\/documents\/files\//)
    expect(validateDocumentUrl(signed({ downloadUrl: `https://api.school.test${signed().downloadUrl}` })).href).toContain('https://api.school.test/')
  })

  it.each([
    'https://evil.test/api/v1/documents/files/abc-123.pdf',
    '//evil.test/api/v1/documents/files/abc-123.pdf',
    'javascript:alert(1)',
    '/api/v1/documents/files/other.pdf',
    '/api/v1/documents/files/../files/abc-123.pdf',
    '/api/v1/documents/files/%61bc-123.pdf',
    '/api/v1/documents/files/abc-123.pdf#fragment',
    '/api/v1/documents/files/abc-123.pdf?expires=1&signature=abc',
    '/api/v1/documents/files/abc-123.pdf?expires=9999999999999',
    '/api/v1/documents/files/abc-123.pdf?expires=9999999999999&signature=abc&redirect=evil',
    '/api/v1/documents/files/abc-123.pdf?expires=9999999999999&signature=abc&signature=def',
    'https://name:secret@api.school.test/api/v1/documents/files/abc-123.pdf?expires=9999999999999&signature=abc',
    '/api/v1/documents/files\\abc-123.pdf',
  ])('rejects unsafe or expired URL: %s', (downloadUrl) => {
    expect(() => validateDocumentUrl(signed({ downloadUrl }), 'https://api.school.test')).toThrow()
  })
})
