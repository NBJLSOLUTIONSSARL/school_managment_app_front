import { useCallback, useEffect, useMemo, useState } from 'react'
import { setFormatLocale } from '@/utils/formatDate'
import { I18nContext } from './i18nContext'
import { translate } from './translate'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_KEY,
  SUPPORTED_LANGUAGES,
  translations,
} from './translations'
import {
  setCookie,
  purgeLegacyLanguageStorage,
  getInitialLanguage,
} from './cookieUtils'

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  const dir = translations[language]?.dir || 'ltr'
  const locale = translations[language]?.locale || 'fr-FR'

  useEffect(() => {
    purgeLegacyLanguageStorage()
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
      document.documentElement.dir = dir
    }

    setFormatLocale(locale)

    try {
      setCookie(LANGUAGE_COOKIE_KEY, language)
    } catch {
    }
  }, [language, dir, locale])

  useEffect(() => {
    function handleLocationSync() {
      try {
        const params = new URLSearchParams(window.location.search)
        const urlLang = params.get('lang')
        if (urlLang && translations[urlLang]) {
          setLanguageState((curr) => (curr !== urlLang ? urlLang : curr))
        }
      } catch {
      }
    }

    window.addEventListener('popstate', handleLocationSync)
    return () => window.removeEventListener('popstate', handleLocationSync)
  }, [])

  const setLanguage = useCallback((nextLanguage) => {
    const valid = translations[nextLanguage] ? nextLanguage : DEFAULT_LANGUAGE
    setLanguageState(valid)
    setCookie(LANGUAGE_COOKIE_KEY, valid)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('edutrack:language-change', { detail: { language: valid } })
      )
    }
  }, [])

  const t = useCallback((key, vars, fb) => translate(language, key, vars, fb), [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dir,
      isRTL: dir === 'rtl',
      locale,
      languages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, dir, locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export default I18nProvider
