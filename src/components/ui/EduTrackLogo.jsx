export function EduTrackLogo({ size = 'md', variant = 'dark', className = '' }) {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-9 h-9 rounded-xl',
  }

  const textSizes = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-lg font-bold',
  }

  return (
    <div className={`flex items-center gap-2.5 tracking-tight select-none ${className}`}>
      <div
        className={`${
          iconSizes[size] || iconSizes.md
        } bg-gradient-to-tr from-[#5b5fc7] to-[#7c80e8] flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(91,95,199,0.35)]`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-white fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.2" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span
            className={`${
              textSizes[size] || textSizes.md
            } tracking-tight leading-tight ${
              variant === 'light' ? 'text-white' : 'text-slate-900'
            }`}
          >
            EduTrack
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5b5fc7]" />
        </div>
        <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase leading-none mt-0.5">
          Gestion scolaire
        </span>
      </div>
    </div>
  )
}

export default EduTrackLogo
