let currentLocale = 'fr-FR'

/**
 * Update the locale used by date and currency formatting.
 * Called by the I18nProvider when the active language changes.
 * @param {string} locale
 */
export function setFormatLocale(locale) {
  if (locale) currentLocale = locale
}

/**
 * @returns {string} The currently active formatting locale.
 */
export function getFormatLocale() {
  return currentLocale
}

/**
 * Format an ISO date string into a readable date for the active locale.
 * @param {string|Date|number} dateInput
 * @param {Intl.DateTimeFormatOptions} [options]
 * @param {string} [locale]
 * @returns {string}
 */
export function formatDate(dateInput, options = {}, locale = currentLocale) {
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
    return new Intl.DateTimeFormat(locale || currentLocale, defaultOptions).format(date)
  } catch {
    return '-'
  }
}

/**
 * Format a number as currency (EUR / XOF / MAD).
 * @param {number} amount
 * @param {string} [currency='EUR']
 * @param {string} [locale]
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'EUR', locale = currentLocale) {
  if (amount === null || amount === undefined || isNaN(amount)) return '-'
  try {
    return new Intl.NumberFormat(locale || currentLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}
