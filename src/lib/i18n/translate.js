import { DEFAULT_LANGUAGE, translations } from './translations'

function resolve(dictionary, key) {
  if (!dictionary || typeof dictionary !== 'object') return undefined
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
 * @param {Record<string, unknown> | string} [varsOrFallback]
 * @param {string} [optionalFallback]
 * @returns {string}
 */
export function translate(language, key, varsOrFallback, optionalFallback) {
  const dictionary = translations[language] || translations[DEFAULT_LANGUAGE]
  const fallbackDict = translations[DEFAULT_LANGUAGE]

  const resolvedValue = resolve(dictionary, key) ?? resolve(fallbackDict, key)

  const hasVars = varsOrFallback && typeof varsOrFallback === 'object' && !Array.isArray(varsOrFallback)
  const fallbackStr = typeof varsOrFallback === 'string' ? varsOrFallback : optionalFallback

  if (typeof resolvedValue !== 'string') {
    return fallbackStr || key
  }

  if (!hasVars) return resolvedValue

  return resolvedValue.replace(/\{(\w+)\}/g, (match, name) =>
    varsOrFallback[name] === undefined || varsOrFallback[name] === null
      ? match
      : String(varsOrFallback[name])
  )
}

export default translate
