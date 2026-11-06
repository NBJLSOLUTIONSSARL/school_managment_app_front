import React from 'react';

export default function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  color = '#4361EE',
  trackColor = '#F1F5F9',
  label,
  className = '',
}) {
  const isDash = value === '-' || value === null || value === undefined;
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const percentage = Math.min(Math.max((numValue / max) * 100, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isDash
    ? circumference
    : circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {!isDash && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-bold text-[11px] sm:text-xs select-none"
          style={{ color: isDash ? '#94A3B8' : '#1E293B' }}
        >
          {label !== undefined ? label : isDash ? '-' : `${Math.round(numValue)}%`}
        </span>
      </div>
    </div>
  );
}
