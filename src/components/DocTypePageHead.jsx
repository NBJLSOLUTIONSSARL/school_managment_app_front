export default function DocTypePageHead({ title, active }) {
  return (
    <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center gap-3 border-b border-frappe-border bg-frappe-surface px-4 py-3 sm:px-6">
      <nav aria-label="Fil d’Ariane" className="text-xs text-frappe-muted">Mon compte /</nav>
      <h1 className="text-base font-semibold">{title}</h1>
      <span className={`rounded border px-2 py-0.5 text-2xs font-medium ${active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
        {active ? 'Compte actif' : 'Compte inactif'}
      </span>
    </header>
  )
}
