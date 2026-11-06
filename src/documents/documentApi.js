import { ApiError } from '../auth/api'

const endpoint = '/api/v1/documents'
const statuses = new Set(['PENDING', 'APPROVED', 'REJECTED'])
const optionalText = (value) => value == null || typeof value === 'string'

function documentSummary(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id <= 0 || !statuses.has(value.status)
    || !['documentTypeName', 'uploadedAt', 'expiresAt', 'rejectionReason'].every((key) => optionalText(value[key]))) {
    throw new ApiError(0)
  }
  // List state deliberately excludes signed URLs and owner/verifier details.
  return {
    id: value.id, documentTypeName: value.documentTypeName, status: value.status,
    uploadedAt: value.uploadedAt, expiresAt: value.expiresAt, rejectionReason: value.rejectionReason,
  }
}

export async function getMyDocuments(request) {
  const result = await request(`${endpoint}/my-documents`)
  if (!Array.isArray(result)) throw new ApiError(0)
  const documents = result.map(documentSummary)
  if (new Set(documents.map(({ id }) => id)).size !== documents.length) throw new ApiError(0)
  return documents
}

export function validateDocumentUrl(document, base = import.meta.env.VITE_API_BASE_URL || '') {
  const invalid = () => { throw new Error('Le lien du document est invalide ou expiré. Réessayez.') }
  if (typeof document?.downloadUrl !== 'string' || typeof document.fileKey !== 'string'
    || !/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(document.fileKey)) return invalid()
  const raw = document.downloadUrl
  if (raw !== raw.trim() || /[\\\s]/.test(raw) || raw.includes('%') || raw.includes('..') || raw.startsWith('//')) return invalid()
  let target
  let expected
  try {
    const apiBase = base.replace(/\/$/, '')
    expected = new URL(`${apiBase}${endpoint}/files/${document.fileKey}`, window.location.origin)
    target = new URL(raw, `${new URL(apiBase || '/', window.location.origin).origin}/`)
  } catch { return invalid() }
  if (!['http:', 'https:'].includes(target.protocol) || target.origin !== expected.origin
    || target.pathname !== expected.pathname || target.username || target.password || target.hash) return invalid()
  const params = target.searchParams
  if (params.size !== 2 || params.getAll('expires').length !== 1 || params.getAll('signature').length !== 1
    || !/^\d+$/.test(params.get('expires') || '') || !/^[A-Za-z0-9_-]+$/.test(params.get('signature') || '')) return invalid()
  const expires = Number(params.get('expires'))
  if (!Number.isSafeInteger(expires) || expires <= Date.now() + 5000) return invalid()
  return { href: target.href, expires }
}

export async function getDocumentAccess(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const document = await request(`${endpoint}/${id}`)
  documentSummary(document)
  if (document.id !== id) throw new ApiError(0)
  return validateDocumentUrl(document)
}

export function documentError(error) {
  const messages = {
    401: 'Votre session a expiré. Reconnectez-vous.',
    403: 'Vous ne disposez pas des autorisations nécessaires pour consulter ces documents.',
    404: 'Les documents demandés ne sont plus disponibles.',
    503: 'Le service est temporairement indisponible. Réessayez plus tard.',
  }
  return messages[error?.status] || 'Impossible de consulter les documents. Veuillez réessayer.'
}
