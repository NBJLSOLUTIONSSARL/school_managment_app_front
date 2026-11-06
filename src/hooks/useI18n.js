import { useContext } from 'react'
import { I18nContext } from '@/i18n/i18nContext'
import { translate } from '@/i18n/translate'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, translations } from '@/i18n/translations'

const fallback = {
  language: DEFAULT_LANGUAGE,
  dir: translations[DEFAULT_LANGUAGE].dir,
  locale: translations[DEFAULT_LANGUAGE].locale,
  isRTL: false,
  languages: SUPPORTED_LANGUAGES,
  setLanguage: () => {},
  t: (key, vars) => translate(DEFAULT_LANGUAGE, key, vars),
}

/**
 * Access the current language, direction and translation helper.
 * Falls back to French when used outside of an I18nProvider
 * (useful for isolated component tests and storybooks).
 */
export function useI18n() {
  return useContext(I18nContext) || fallback
}

export default useI18n
