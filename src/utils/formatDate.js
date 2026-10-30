/**
 * Format an ISO date string into a readable French date.
 * @param {string|Date|number} dateInput
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '-'
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return '-'
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }
    return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(date)
  } catch {
    return '-'
  }
}

/**
 * Format a number as currency (EUR / XOF / MAD).
 * @param {number} amount
 * @param {string} [currency='EUR']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'EUR') {
  if (amount === null || amount === undefined || isNaN(amount)) return '-'
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}
