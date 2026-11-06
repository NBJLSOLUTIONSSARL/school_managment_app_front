import React from 'react';

export default function StatusBadge({
  status,
  variant = 'pill', // 'pill' or 'dot'
  dot = false,
  className = '',
}) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  let dotColor = 'bg-slate-400';
  let pillStyles = 'bg-slate-100 text-slate-700';

  if (
    normalized === 'active' ||
    normalized === 'actif' ||
    normalized === 'approved' ||
    normalized === 'approuvé' ||
    normalized === 'justifiée' ||
    normalized === 'paid' ||
    normalized === 'payée'
  ) {
    dotColor = 'bg-[#10B981]';
    pillStyles = 'bg-[#ECFDF5] text-[#10B981]';
  } else if (
    normalized === 'pending' ||
    normalized === 'en attente' ||
    normalized === 'pending payment' ||
    normalized === 'demo lesson' ||
    normalized === 'assignment' ||
    normalized === 'final interview' ||
    normalized === 'low attendance' ||
    normalized === 'unassigned'
  ) {
    if (normalized === 'pending payment' || normalized === 'low attendance') {
      dotColor = 'bg-[#EF4444]';
      pillStyles = 'bg-[#FEF2F2] text-[#EF4444]';
    } else if (normalized === 'demo lesson') {
      dotColor = 'bg-[#4361EE]';
      pillStyles = 'bg-[#EEF2FF] text-[#4361EE]';
    } else {
      dotColor = 'bg-[#F59E0B]';
      pillStyles = 'bg-[#FFFBEB] text-[#D97706]';
    }
  } else if (
    normalized === 'documents review' ||
    normalized === 'in review' ||
    normalized === 'cv review'
  ) {
    dotColor = normalized === 'cv review' ? 'bg-[#10B981]' : 'bg-[#4361EE]';
    pillStyles = 'bg-[#EEF2FF] text-[#4361EE]';
  } else if (
    normalized === 'suspended' ||
    normalized === 'at risk' ||
    normalized === 'no teacher' ||
    normalized === 'rejeté' ||
    normalized === 'refusé' ||
    normalized === 'en retard'
  ) {
    dotColor = 'bg-[#EF4444]';
    pillStyles = 'bg-[#FEF2F2] text-[#EF4444]';
  }

  if (variant === 'dot' || dot) {
    return (
      <span className={`inline-flex items-center gap-2 text-xs font-medium text-[#1E293B] ${className}`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}></span>
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${pillStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>}
      {status}
    </span>
  );
}
