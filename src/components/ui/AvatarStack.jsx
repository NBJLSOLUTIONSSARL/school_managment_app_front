export function AvatarStack({
  avatars = [
    { name: 'Sarah Connor', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&auto=format&fit=crop&crop=face' },
    { name: 'Alex Rivera', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&auto=format&fit=crop&crop=face' },
    { name: 'Elena Rostova', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&auto=format&fit=crop&crop=face' },
    { name: 'David Kim', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&auto=format&fit=crop&crop=face' },
  ],
  extraCount = 9,
  size = 'sm',
  className = '',
}) {
  const sizeMap = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-7 h-7 text-xs',
  }

  const currentSize = sizeMap[size] || sizeMap.sm

  return (
    <div className={`flex items-center -space-x-1.5 select-none ${className}`} aria-label="Membres de l'équipe">
      {avatars.slice(0, 4).map((av, idx) => (
        <div
          key={idx}
          className={`relative rounded-full ring-2 ring-white overflow-hidden bg-gray-200 shrink-0 ${currentSize}`}
          title={av.name}
        >
          {av.img ? (
            <img
              src={av.img}
              alt={av.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-gray-700 bg-gray-100">
              {av.name ? av.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      ))}
      {extraCount > 0 && (
        <div
          className={`relative rounded-full ring-2 ring-white bg-[#F3F4F6] text-[#374151] font-semibold flex items-center justify-center shrink-0 ${currentSize}`}
        >
          +{extraCount}
        </div>
      )}
    </div>
  )
}

export default AvatarStack
