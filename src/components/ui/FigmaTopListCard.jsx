import { Utensils, Award, BookOpen, Sparkles } from 'lucide-react'

export function FigmaTopListCard({
  title = 'Most Ordered Food',
  subtitle = 'Adipiscing elit, sed do eiusmod tempor',
  items = null,
  className = '',
}) {
  const defaultItems = [
    {
      id: '1',
      name: 'Fresh Salad Bowl',
      category: 'Healthy Food & Diet',
      price: 'IDR 45.000',
      icon: Sparkles,
      avatarBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: '2',
      name: 'Chicken Noodles',
      category: 'Spicy Noodle Soup',
      price: 'IDR 75.000',
      icon: Utensils,
      avatarBg: 'bg-amber-100 text-amber-600',
    },
    {
      id: '3',
      name: 'Smoothie Fruits',
      category: 'Fresh Juice Drinks',
      price: 'IDR 45.000',
      icon: Award,
      avatarBg: 'bg-rose-100 text-rose-600',
    },
    {
      id: '4',
      name: 'Hot Chicken Wings',
      category: 'Crispy Snack Bites',
      price: 'IDR 45.000',
      icon: BookOpen,
      avatarBg: 'bg-indigo-100 text-indigo-600',
    },
  ]

  const list = items && items.length > 0 ? items : defaultItems

  return (
    <div
      className={`figma-card bg-white p-5 sm:p-6 rounded-2xl border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-2xs text-slate-400 font-normal mt-0.5 leading-relaxed">{subtitle}</p>
      </div>

      {/* List */}
      <div className="space-y-3 my-2 flex-1 flex flex-col justify-center">
        {list.map((item) => {
          const Icon = item.icon || Sparkles
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-[#F8F9FD] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white shadow-2xs ${
                    item.avatarBg || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#5B5FC7] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.category}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-800 shrink-0 tabular-nums">
                {item.price}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400 font-medium">
        <span>Articles suivis</span>
        <span className="text-[#5B5FC7] font-semibold cursor-pointer hover:underline">
          Voir le catalogue
        </span>
      </div>
    </div>
  )
}

export default FigmaTopListCard
