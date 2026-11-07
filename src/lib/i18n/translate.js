import { DEFAULT_LANGUAGE, translations } from './translations'

function resolve(dictionary, key) {
  return key.split('.').reduce((accumulator, part) => {
    if (accumulator && typeof accumulator === 'object' && part in accumulator) {
      return accumulator[part]
    }
    return undefined
  }, dictionary)
}

/**
 * Resolve a dot-notated translation key for a given language with FR fallback.
 *
 * @param {string} language
 * @param {string} key
 * @param {Record<string, unknown>} [vars]
 * @returns {string}
 */
export function translate(language, key, vars) {
  const dictionary = translations[language] || translations[DEFAULT_LANGUAGE]
  const fallback = translations[DEFAULT_LANGUAGE]

  const value = resolve(dictionary, key) ?? resolve(fallback, key)

  if (typeof value !== 'string') return key

  if (!vars) return value

  return value.replace(/\{(\w+)\}/g, (match, name) =>
    vars[name] === undefined || vars[name] === null ? match : String(vars[name])
  )
}

export default translate
