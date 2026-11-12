import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/utils/classNames'

export function LanguageSwitcher({ className = '', size = 'sm', variant = 'blue' }) {
  const { language, setLanguage, languages, t } = useI18n()

  const isBlue = variant === 'blue' || variant === 'primary'

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center rounded-full border bg-white p-0.5 shadow-2xs transition-colors',
        isBlue ? 'border-blue-200 bg-white' : 'border-[#E2E8F0] bg-white',
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
              'rounded-full font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2',
              size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
              isBlue
                ? isActive
                  ? 'bg-[#1d4ed8] text-white shadow-xs focus-visible:ring-[#1d4ed8]/40'
                  : 'text-zinc-600 hover:text-[#1d4ed8] hover:bg-blue-50/80 focus-visible:ring-[#1d4ed8]/30'
                : isActive
                  ? 'bg-[#0F172A] text-white shadow-xs focus-visible:ring-[#0F172A]/40'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 focus-visible:ring-[#0F172A]/30'
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
