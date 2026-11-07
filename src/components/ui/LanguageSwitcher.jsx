import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/utils/classNames'

export function LanguageSwitcher({ className = '', size = 'sm' }) {
  const { language, setLanguage, languages, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center rounded-full border border-[#E2E8F0] bg-white p-0.5 shadow-2xs',
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
              'rounded-full font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/30',
              size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
              isActive
                ? 'bg-[#4361EE] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100'
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
