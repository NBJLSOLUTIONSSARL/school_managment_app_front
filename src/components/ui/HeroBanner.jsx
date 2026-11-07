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
      className={`relative overflow-hidden bg-[#4361EE] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 ${className}`}
    >
      <div className="max-w-xl z-10">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed mt-2">
            {description}
          </p>
        )}
        {resolvedButtonText && (
          <div className="mt-4 sm:mt-5">
            <button
              type="button"
              onClick={handleButtonClick}
              className="bg-white text-[#4361EE] hover:bg-slate-50 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {ButtonIcon && <ButtonIcon className="w-4 h-4 stroke-[2.5]" />}
              <span>{resolvedButtonText}</span>
            </button>
          </div>
        )}
      </div>

      {RightIcon && (
        <div className="hidden md:flex items-center justify-center shrink-0">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/10 shadow-inner">
            <RightIcon className="w-12 h-12 lg:w-14 lg:h-14 text-white stroke-[1.8]" />
          </div>
        </div>
      )}
    </div>
  )
}

export default HeroBanner
