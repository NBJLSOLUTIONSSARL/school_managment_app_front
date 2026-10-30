import React from 'react';

const statusVariants = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function DocTypePageHead({
  breadcrumbs = [],
  title,
  docstatus = 'Draft',
  primaryAction,
  onPrimaryAction,
  secondaryActions = [],
  onMenuAction,
}) {
  return (
    <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Fil d'Ariane & Titre */}
      <div className="flex items-center gap-3">
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400">/</span>}
              <span className="hover:text-slate-800 cursor-pointer font-normal">{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
        <span className="hidden md:inline text-slate-300">|</span>
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h1>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${
            statusVariants[docstatus] || statusVariants.Draft
          }`}
        >
          {docstatus}
        </span>
      </div>

      {/* Barre d'Actions */}
      <div className="flex items-center gap-2">
        {secondaryActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className="inline-flex h-8 items-center rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300"
          >
            {action.label}
          </button>
        ))}

        {primaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex h-8 items-center rounded bg-slate-900 px-3.5 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          >
            {primaryAction}
          </button>
        )}

        {onMenuAction && (
          <button
            type="button"
            onClick={onMenuAction}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 focus:outline-hidden"
            title="Options supplémentaires"
          >
            •••
          </button>
        )}
      </div>
    </div>
  );
}
