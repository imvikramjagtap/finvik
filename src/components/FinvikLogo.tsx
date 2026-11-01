import React from 'react';

interface FinvikLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
}

export const FinvikLogo: React.FC<FinvikLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="nav-shield-main" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="nav-shield-cyan" x1="20" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="nav-shield-emerald" x1="50" y1="20" x2="80" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="nav-shield-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8b5cf6" floodOpacity="0.3" />
          </filter>
        </defs>

        <rect width="100" height="100" rx="24" fill="#0b1120" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

        <g filter="url(#nav-shield-glow)">
          {/* Needs 50% */}
          <path
            d="M 22 26 C 22 23.5 24.5 21.5 27 22.5 L 48 31 C 49.5 31.6 50 33 50 34.5 L 50 78 C 50 80.5 47.2 82 45 80.5 L 24 66 C 22.8 65.2 22 63.8 22 62.5 Z"
            fill="url(#nav-shield-main)"
          />
          {/* Wants 30% */}
          <path
            d="M 54 33 C 54 31.5 55 30.5 56.5 30 L 73 24.5 C 75.5 23.6 78 25.5 78 28 L 78 48 C 78 49.5 77 50.8 75.5 51.5 L 56.5 59 C 55 59.6 54 58.5 54 57 Z"
            fill="url(#nav-shield-cyan)"
          />
          {/* Savings 20% */}
          <path
            d="M 54 62 C 54 60.5 55.2 59.8 56.5 59.3 L 75.5 52 C 77.2 51.3 78 52.8 78 54.2 L 78 61.5 C 78 63 77.2 64.2 76 65 L 56.5 78.5 C 55 79.5 54 78.5 54 77 Z"
            fill="url(#nav-shield-emerald)"
          />
          <circle cx="50" cy="56" r="3.5" fill="#ffffff" opacity="0.9" />
        </g>
      </svg>

      {showText && (
        <div>
          <p className="font-bold text-app-fg text-sm tracking-tight leading-tight">FinVik</p>
          <p className="text-[hsl(215,20%,45%)] text-xs font-medium">Personal Finance</p>
        </div>
      )}
    </div>
  );
};
