import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/utils/classNames'

export function LanguageSwitcher({ className = '', size = 'sm' }) {
  const { language, setLanguage, languages, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center rounded border border-slate-200 bg-white p-0.5',
        className
      )}
    >
      {languages.map((item) => {
        const isActive = language === item.code

        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            aria-pressed={isActive}
            title={item.name}
            lang={item.code}
            dir={item.code === 'ar' ? 'rtl' : 'ltr'}
            className={cn(
              'rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1',
              size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-2xs',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export default LanguageSwitcher
