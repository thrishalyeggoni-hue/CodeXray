import React from 'react';

interface GeminiHeartIconProps {
  className?: string;
  size?: number;
}

export const GeminiHeartIcon: React.FC<GeminiHeartIconProps> = ({
  className = "w-4 h-4 inline-block align-middle mx-1 transition-transform hover:scale-125 duration-200 cursor-pointer",
  size
}) => {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px` } : {};

  return (
    <svg
      className={className}
      style={sizeStyle}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="geminiHeartGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a73e8" />
          <stop offset="25%" stopColor="#8ab4f8" />
          <stop offset="50%" stopColor="#a142f4" />
          <stop offset="75%" stopColor="#e91e63" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
      </defs>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="url(#geminiHeartGradInline)"
      />
    </svg>
  );
};
