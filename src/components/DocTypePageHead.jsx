const statusVariants = {
  Draft: 'border-slate-200 bg-slate-100 text-slate-700',
  Submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  Overdue: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function DocTypePageHead({
  title,
  breadcrumbs = [],
  docstatus = 'Draft',
  primaryAction,
  onPrimaryAction,
  secondaryActions = [],
  onMenuAction,
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center gap-3 border-b border-frappe-border bg-frappe-surface px-4 py-3 sm:px-6">
      <nav aria-label="Fil d’Ariane" className="hidden md:flex items-center gap-1.5 text-2xs text-frappe-muted">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="truncate max-w-[200px]">
            {idx > 0 && <span className="text-frappe-dark mx-0.5">/</span>}
            {crumb}
          </span>
        ))}
      </nav>
      {breadcrumbs.length > 0 && <span className="hidden md:block text-frappe-dark">|</span>}
      <h1 className="text-base font-semibold text-frappe-dark">{title}</h1>
      <span
        className={`rounded border px-2 py-0.5 text-2xs font-medium ${statusVariants[docstatus] || statusVariants.Draft}`}
      >
        {docstatus}
      </span>

      <div className="flex items-center gap-2 ml-auto">
        {secondaryActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className="inline-flex h-8 items-center rounded border border-frappe-border bg-frappe-surface px-2.5 text-xs font-medium text-frappe-dark shadow-2xs hover:bg-frappe-hover focus:outline-hidden focus:ring-2 focus:ring-frappe-dark"
          >
            {action.label}
          </button>
        ))}

        {primaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex h-8 items-center rounded bg-[#1059DC] px-3.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(16,89,220,0.17)] hover:bg-[#084AC3] focus:outline-hidden focus:ring-2 focus:ring-[#1059DC] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {primaryAction}
          </button>
        )}

        {onMenuAction && (
          <button
            type="button"
            onClick={onMenuAction}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-frappe-border bg-frappe-surface text-frappe-muted hover:bg-frappe-hover focus:outline-hidden"
            title="Options supplémentaires"
          >
            •••
          </button>
        )}
      </div>
    </header>
  )
}
