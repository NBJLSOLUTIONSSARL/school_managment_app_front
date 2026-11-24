import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/utils/classNames'

export function LanguageSwitcher({ className = '', size = 'xs', variant = 'neutral' }) {
  const { language, setLanguage, languages, t } = useI18n()

  const isBlue = variant === 'blue' || variant === 'primary'

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs transition-colors',
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
              'rounded font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900',
              size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs',
              isBlue
                ? isActive
                  ? 'bg-[#5B5FC7] text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-[#5B5FC7] hover:bg-slate-50'
                : isActive
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
