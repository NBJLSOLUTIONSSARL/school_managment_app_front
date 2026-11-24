export function FigmaRatingCard({
  title = 'Your Rating',
  subtitle = 'Lorem ipsum dolor sit amet, consectetur',
  ratings = [
    { label: 'Hygiene', percent: '85%', color: 'purple' },
    { label: 'Food Taste', percent: '85%', color: 'orange' },
    { label: 'Packaging', percent: '92%', color: 'cyan' },
  ],
  className = '',
}) {
  return (
    <div
      className={`figma-card bg-white p-5 sm:p-6 rounded-2xl border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-2xs text-slate-400 font-normal mt-1 leading-relaxed">{subtitle}</p>
      </div>

      {/* Overlapping Frosted Bubbles Display */}
      <div className="relative h-48 sm:h-52 my-3 flex items-center justify-center">
        {/* Decorative background grid/ambient circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-44 h-44 rounded-full border border-dashed border-slate-200" />
        </div>

        {/* Bubble 1: Purple / Violet (Top-Left) */}
        <div className="absolute top-2 start-6 sm:start-10 z-10">
          <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#818CF8] shadow-[0_8px_20px_rgba(99,102,241,0.25)] flex flex-col items-center justify-center text-white border-2 border-white/80 transition-transform duration-300 hover:scale-105 cursor-pointer">
            <span className="text-base sm:text-lg font-bold tracking-tight">
              {ratings[0]?.percent || '85%'}
            </span>
            <span className="text-[10px] font-medium text-white/90 -mt-0.5">
              {ratings[0]?.label || 'Hygiene'}
            </span>
          </div>
        </div>

        {/* Bubble 2: Warm Orange / Amber with concentric ring (Center-Right) */}
        <div className="absolute top-6 end-4 sm:end-8 z-20">
          {/* Outer fine ring */}
          <div className="p-1.5 rounded-full border border-[#FB923C]/50 flex items-center justify-center">
            <div className="w-26 h-26 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FB923C] shadow-[0_10px_24px_rgba(245,158,11,0.3)] flex flex-col items-center justify-center text-white border-2 border-white/80 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                {ratings[1]?.percent || '85%'}
              </span>
              <span className="text-[11px] font-medium text-white/90 -mt-0.5">
                {ratings[1]?.label || 'Food Taste'}
              </span>
            </div>
          </div>
        </div>

        {/* Bubble 3: Cyan / Sky (Bottom-Left) */}
        <div className="absolute bottom-1 start-10 sm:start-16 z-30">
          <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#38BDF8] shadow-[0_8px_20px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center text-white border-2 border-white/80 transition-transform duration-300 hover:scale-105 cursor-pointer">
            <span className="text-base sm:text-lg font-bold tracking-tight">
              {ratings[2]?.percent || '92%'}
            </span>
            <span className="text-[10px] font-medium text-white/90 -mt-0.5">
              {ratings[2]?.label || 'Packaging'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Indicators */}
      <div className="flex items-center justify-between text-2xs text-slate-400 font-medium pt-2 border-t border-slate-100">
        <span>Satisfaction globale</span>
        <span className="font-semibold text-slate-700">4.8 / 5.0 ★</span>
      </div>
    </div>
  )
}

export default FigmaRatingCard
