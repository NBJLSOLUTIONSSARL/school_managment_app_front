import fr from '@/locales/fr.json'
import en from '@/locales/en.json'
import ar from '@/locales/ar.json'

export const DEFAULT_LANGUAGE = 'fr'

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'العربية', name: 'العربية' },
]

/**
 * Non-sensitive cookie name used to store temporary language choice prior to login.
 * Never use localStorage or sessionStorage for language preferences.
 */
export const LANGUAGE_COOKIE_KEY = 'edutrack_lang'

/**
 * Deprecated legacy key - kept only for reference/migration.
 * @deprecated
 */
export const LANGUAGE_STORAGE_KEY = 'school_app_language'

export const translations = {
  fr: {
    dir: 'ltr',
    locale: 'fr-FR',
    ...fr,
  },
  en: {
    dir: 'ltr',
    locale: 'en-US',
    ...en,
  },
  ar: {
    dir: 'rtl',
    locale: 'ar-MA',
    ...ar,
  },
}
