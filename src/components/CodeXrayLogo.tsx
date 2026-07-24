import React from 'react';

interface CodeXrayLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  theme?: 'dark' | 'light';
  subtitle?: string;
}

export const CodeXrayLogo: React.FC<CodeXrayLogoProps> = ({
  size = 34,
  className = '',
  showText = true,
  theme = 'dark',
  subtitle,
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Gemini Sparkle Vector Icon */}
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
            {/* Gemini Signature Gradient */}
            <linearGradient id="geminiLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a73e8" />
              <stop offset="35%" stopColor="#8ab4f8" />
              <stop offset="65%" stopColor="#a142f4" />
              <stop offset="100%" stopColor="#e8eaed" />
            </linearGradient>

            <linearGradient id="geminiAura" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285f4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#9b51e0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e91e63" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Outer glowing ring */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#geminiLogoGrad)"
            strokeWidth="2.2"
            strokeDasharray="5 3"
            className="animate-[spin_12s_linear_infinite]"
          />

          {/* Gemini 4-point Sparkle Star */}
          <path
            d="M20 6 C20 13.5, 13.5 20, 6 20 C13.5 20, 20 26.5, 20 34 C20 26.5, 26.5 20, 34 20 C26.5 20, 20 13.5, 20 6 Z"
            fill="url(#geminiLogoGrad)"
          />

          {/* Inner Core Pulse */}
          <circle cx="20" cy="20" r="3" fill="#ffffff" className="animate-pulse" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className={`text-lg font-extrabold tracking-tight font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Code<span className="bg-gradient-to-r from-[#1a73e8] via-[#8ab4f8] via-[#a142f4] to-[#e8eaed] bg-clip-text text-transparent">Xray</span>
            </span>
          </div>
          {subtitle && (
            <span className={`text-[10px] tracking-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
