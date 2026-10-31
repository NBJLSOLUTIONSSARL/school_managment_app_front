import React from 'react';

export default function StatusBadge({ status, dot = false }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-500';

  if (
    normalized === 'actif' ||
    normalized === 'justifiée' ||
    normalized === 'approuvé' ||
    normalized === 'lu' ||
    normalized === 'réussie'
  ) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (
    normalized === 'en attente' ||
    normalized === 'non lu' ||
    normalized === 'en cours'
  ) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (
    normalized === 'en congé' ||
    normalized === 'refusé' ||
    normalized === 'rejeté' ||
    normalized === 'inactif'
  ) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (normalized.includes('moyen') || !isNaN(parseFloat(status))) {
    const val = parseFloat(status);
    if (val >= 16) {
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    } else if (val >= 14) {
      styles = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
    } else {
      styles = 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>}
      {status}
    </span>
  );
}
