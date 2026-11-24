export function HeroBanner({
  title,
  description,
  buttonText,
  onButtonClick,
  buttonIcon: ButtonIcon,
  icon: RightIcon,
  className = '',
}) {
  const isButtonObject = typeof buttonText === 'object' && buttonText !== null
  const resolvedButtonText = isButtonObject ? buttonText.label : buttonText
  const handleButtonClick = isButtonObject ? buttonText.onClick || onButtonClick : onButtonClick

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/40 rounded-2xl p-5 sm:p-6 text-slate-900 border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4 select-none ${className}`}
    >
      <div className="max-w-xl z-10">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1 font-normal">
            {description}
          </p>
        )}
        {resolvedButtonText && (
          <div className="mt-3 sm:mt-4">
            <button
              type="button"
              onClick={handleButtonClick}
              className="bg-[#5B5FC7] text-white hover:bg-[#484BB5] active:bg-[#3E41A1] font-semibold text-xs px-4 py-2 rounded-xl shadow-[0_3px_10px_rgba(91,95,199,0.25)] transition-all inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FC7]/20"
            >
              {ButtonIcon && <ButtonIcon className="w-3.5 h-3.5" strokeWidth={1.75} />}
              <span>{resolvedButtonText}</span>
            </button>
          </div>
        )}
      </div>

      {RightIcon && (
        <div className="hidden md:flex items-center justify-center shrink-0">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#EDF0F8] flex items-center justify-center text-[#5B5FC7] shadow-[0_4px_12px_rgba(91,95,199,0.08)]">
            <RightIcon className="w-6 h-6 text-[#5B5FC7]" strokeWidth={1.75} />
          </div>
        </div>
      )}
    </div>
  )
}

export default HeroBanner
