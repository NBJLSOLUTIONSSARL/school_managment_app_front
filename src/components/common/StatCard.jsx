import React from 'react';
import CircularProgress from './CircularProgress';

export default function StatCard({
  title,
  value,
  subtitle,
  progress,
  progressColor = '#4361EE',
  progressLabel,
  icon: Icon,
  badgeText,
  badgeType = 'positive',
  iconBg = 'bg-[#EEF2FF]',
  iconColor = 'text-[#4361EE]',
  className = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs flex items-center justify-between transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex-1 pr-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
            {value}
          </span>
          {badgeText && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                badgeType === 'positive'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-amber-700 bg-amber-50'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm font-medium text-[#64748B] mt-1">{title}</p>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>
        )}
      </div>

      {progress !== undefined ? (
        <CircularProgress
          value={progress}
          color={progressColor}
          label={progressLabel}
          size={52}
          strokeWidth={4.5}
        />
      ) : Icon ? (
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
        >
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>
      ) : null}
    </div>
  );
}
