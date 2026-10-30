import React from 'react';

export function DocTimeline({ activities = [] }) {
  return (
    <div className="w-full space-y-4 pt-6 border-t border-slate-200 mt-8 text-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Activité & Historique
      </h3>
      <div className="relative pl-6 space-y-4 before:absolute before:bottom-0 before:top-2 before:left-2 before:w-px before:bg-slate-200">
        {activities.map((item, idx) => (
          <div key={idx} className="relative flex items-start gap-3">
            <div className="absolute -left-6 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-400 ring-2 ring-slate-100" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{item.user}</span>
                <span className="text-2xs text-slate-400">{item.time}</span>
              </div>
              <p className="mt-0.5 text-slate-600">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
