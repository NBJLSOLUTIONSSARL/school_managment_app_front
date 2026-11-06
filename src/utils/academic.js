export function userDisplayName(user, fallback = '-') {
  if (!user) return fallback
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || user.email || fallback
}

export function studentDisplayName(student, fallback = '-') {
  if (!student) return fallback
  return userDisplayName(student.user, student.studentNumber || fallback)
}

export function teacherDisplayName(teacher, fallback = '-') {
  if (!teacher) return fallback
  return userDisplayName(teacher.user, teacher.specialization || `Enseignant #${teacher.id}`)
}

export function formatScore(value, maxScore) {
  if (value === null || value === undefined || value === '') return '-'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '-'
  const formatted = numeric.toFixed(2).replace(/\.?0+$/, '')
  return maxScore ? `${formatted} / ${maxScore}` : formatted
}

export function toNumericValue(value) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

export function paginateLocal(items, page, pageSize) {
  const list = Array.isArray(items) ? items : []
  const totalItems = list.length
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const start = (safePage - 1) * pageSize

  return {
    items: list.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  }
}
