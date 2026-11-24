import { Sparkles } from 'lucide-react'

export function SpecialOfferCard({
  title = 'Special Offer',
  description = 'Get 20% off for the first 3 month',
  buttonText = 'Claim Now',
  onClaim,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl p-4 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100 shadow-[0_2px_12px_-2px_rgba(91,95,199,0.06)] select-none ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
        <div className="w-5 h-5 rounded-lg bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
          <Sparkles className="w-3 h-3" />
        </div>
        <span>{title}</span>
      </div>

      <p className="text-2xs text-slate-500 font-medium mt-1.5 leading-relaxed">
        {description}
      </p>

      <button
        type="button"
        onClick={onClaim}
        className="w-full mt-3 py-1.5 px-3 bg-gradient-to-r from-[#5B5FC7] to-[#8B5CF6] hover:from-[#484BB5] hover:to-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer focus:outline-none"
      >
        {buttonText}
      </button>
    </div>
  )
}

export default SpecialOfferCard
