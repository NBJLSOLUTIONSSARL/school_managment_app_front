export function EduTrackLogo({ size = 'md', variant = 'dark', className = '' }) {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      <div
        className={`${
          iconSizes[size] || iconSizes.md
        } bg-[#0F172A] flex items-center justify-center shrink-0 shadow-xs`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.2" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span
          className={`${
            textSizes[size] || textSizes.md
          } font-bold tracking-tight leading-tight ${
            variant === 'light' ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          EduTrack
        </span>
        <span className="text-[10px] font-semibold text-[#94A3B8] tracking-wider uppercase leading-none mt-0.5">
          School Management
        </span>
      </div>
    </div>
  )
}

export default EduTrackLogo
