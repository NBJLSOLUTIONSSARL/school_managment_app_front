import { useCallback, useEffect, useMemo, useState } from 'react'
import { setFormatLocale } from '@/utils/formatDate'
import { I18nContext } from './i18nContext'
import { translate } from './translate'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  translations,
} from './translations'

function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored && translations[stored]) return stored
  } catch {
    // Ignore storage access errors (private mode, blocked cookies, ...).
  }

  return DEFAULT_LANGUAGE
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  const dir = translations[language]?.dir || 'ltr'
  const locale = translations[language]?.locale || 'fr-FR'

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
      document.documentElement.dir = dir
    }

    setFormatLocale(locale)

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Persisting the preference is best-effort only.
    }
  }, [language, dir, locale])

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(translations[nextLanguage] ? nextLanguage : DEFAULT_LANGUAGE)
  }, [])

  const t = useCallback((key, vars) => translate(language, key, vars), [language])

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
