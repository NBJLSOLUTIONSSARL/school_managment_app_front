export function DocTimeline({ activities = [] }) {
  return (
    <div className="w-full space-y-4 pt-4 border-t border-slate-200 text-xs">
      <h3 className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
        Activité & Historique
      </h3>
      <div className="space-y-3">
        {activities.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-slate-400 mt-1.5" />
              {idx !== activities.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{item.user}</span>
                <span className="text-2xs text-slate-400">{item.time}</span>
              </div>
              <p className="text-slate-600 text-2xs mt-0.5">{item.content}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-2xs text-slate-400 italic">Aucune activité enregistrée</p>
        )}
      </div>
    </div>
  )
}

export default DocTimeline
