import { translations, DEFAULT_LANGUAGE, LANGUAGE_COOKIE_KEY } from './translations'

export function getCookie(name) {
  if (typeof document === 'undefined') return null
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[2]) : null
  } catch {
    return null
  }
}

export function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return
  try {
    const maxAge = days * 24 * 60 * 60
    const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:'
    const secureFlag = isHttps ? '; Secure' : ''
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`
  } catch {
  }
}

export function purgeLegacyLanguageStorage() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage?.removeItem('school_app_language')
    window.localStorage?.removeItem('academie_lang')
    window.sessionStorage?.removeItem('school_app_language')
    window.sessionStorage?.removeItem('academie_lang')
  } catch {
  }
}

export function getInitialLanguage() {
  purgeLegacyLanguageStorage()
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  try {
    const params = new URLSearchParams(window.location.search)
    const urlLang = params.get('lang')
    if (urlLang && translations[urlLang]) {
      setCookie(LANGUAGE_COOKIE_KEY, urlLang)
      return urlLang
    }
  } catch {
  }

  try {
    const cookieLang = getCookie(LANGUAGE_COOKIE_KEY)
    if (cookieLang && translations[cookieLang]) return cookieLang
  } catch {
  }

  return DEFAULT_LANGUAGE
}
