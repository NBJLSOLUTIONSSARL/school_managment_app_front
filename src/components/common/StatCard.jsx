import React from 'react';

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  badgeText,
  badgeType = 'positive',
  iconBg = 'bg-[#F4EDE2]',
  iconColor = 'text-[#C5A880]',
  className = ''
}) {
  return (
    <div className={`academy-card p-5 flex items-center justify-between transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center space-x-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="w-6 h-6 stroke-[1.8]" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#16222F]">
              {value}
            </span>
            {badgeText && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  badgeType === 'positive'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-amber-700 bg-amber-50'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[#78716C] mt-0.5">{title}</p>
          {subtitle && (
            <p className="text-xs text-[#A8A29E] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
