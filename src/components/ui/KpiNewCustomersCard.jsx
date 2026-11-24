import { useState } from 'react'

export function KpiNewCustomersCard({
  value = '6,345',
  title = 'New Customers This Month',
  heroesTitle = "Today's Heroes",
  counterText = '+26',
  heroes = null,
  onClick,
  className = '',
}) {
  const defaultHeroes = [
    {
      id: 'hero-1',
      name: 'Elena Rostova',
      ringColor: '#EA580C',
      bgGradient: 'from-rose-500 via-red-600 to-amber-600',
      imgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'hero-2',
      name: 'Malik Jordan',
      ringColor: '#F59E0B',
      bgGradient: 'from-amber-400 via-orange-500 to-yellow-600',
      imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'hero-3',
      name: 'Yuki Tanaka',
      ringColor: '#10B981',
      bgGradient: 'from-emerald-500 via-teal-600 to-green-700',
      imgUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'hero-4',
      name: 'Amara Diallo',
      ringColor: '#F97316',
      bgGradient: 'from-amber-400 via-orange-500 to-amber-700',
      imgUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    },
  ]

  const heroList = heroes || defaultHeroes
  const [imageErrors, setImageErrors] = useState({})

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      className={`group relative flex flex-col justify-between p-6 rounded-[28px] bg-[#232426] text-white border border-white/[0.04] shadow-lg shadow-black/20 select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:border-white/[0.1] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div>
        {/* Top Metric Header */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-4xl font-bold tracking-tight text-white leading-none">
            {value}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-sm font-normal text-zinc-400 mt-2 tracking-normal">
          {title}
        </p>
      </div>

      {/* Bottom Heroes Section */}
      <div className="mt-8 pt-1">
        <p className="text-sm font-medium text-zinc-400 mb-3.5 tracking-tight">
          {heroesTitle}
        </p>

        {/* Overlapping Avatars Cluster */}
        <div className="flex items-center -space-x-3">
          {heroList.map((hero) => {
            const hasError = imageErrors[hero.id]
            return (
              <div
                key={hero.id}
                title={hero.name}
                className="relative w-11 h-11 rounded-full ring-2 ring-[#232426] overflow-hidden shrink-0 transition-transform duration-200 hover:scale-110 hover:z-20 cursor-pointer"
                style={{ outlineColor: hero.ringColor }}
              >
                {!hasError && hero.imgUrl ? (
                  <img
                    src={hero.imgUrl}
                    alt={hero.name}
                    onError={() => handleImageError(hero.id)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-tr ${hero.bgGradient} flex items-center justify-center text-white`}
                  >
                    <svg
                      className="w-6 h-6 text-white/90"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}

          {/* Overflow count pill */}
          {counterText && (
            <div className="relative w-11 h-11 rounded-full bg-[#18191B] ring-2 ring-[#232426] flex items-center justify-center text-white text-xs font-semibold shrink-0 z-10 select-none">
              {counterText}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KpiNewCustomersCard
