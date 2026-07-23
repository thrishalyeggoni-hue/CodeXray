import React from 'react';

interface CodeXrayLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  theme?: 'dark' | 'light';
  subtitle?: string;
}

export const CodeXrayLogo: React.FC<CodeXrayLogoProps> = ({
  size = 32,
  className = '',
  showText = true,
  theme = 'dark',
  subtitle,
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Transparent Vector Logo Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="cxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="cxXrayBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Outer glowing X-ray ring - Transparent background */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#cxGradient)"
            strokeWidth="2.2"
            strokeDasharray="4 2"
            className="animate-[spin_12s_linear_infinite]"
          />

          {/* Inner Code Brackets < / > */}
          <path
            d="M13 14L8 20L13 26"
            stroke="url(#cxGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 14L32 20L27 26"
            stroke="url(#cxGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-Ray Laser Line across center */}
          <line
            x1="12"
            y1="20"
            x2="28"
            y2="20"
            stroke="url(#cxXrayBeam)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Core Focal Dot */}
          <circle cx="20" cy="20" r="2.5" fill="#38bdf8" className="animate-ping" />
          <circle cx="20" cy="20" r="2" fill="#6366f1" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className={`text-lg font-bold tracking-tight font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Code<span className="text-indigo-600 dark:text-indigo-400">Xray</span>
            </span>
          </div>
          {subtitle && (
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
