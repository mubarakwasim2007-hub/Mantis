import React from 'react';

interface MantisLogoProps {
  className?: string;
  size?: number;
}

export const MantisLogo: React.FC<MantisLogoProps> = ({ className = 'w-6 h-6', size = 26 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]"
      >
        <defs>
          <linearGradient id="mantisGradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.6" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Antennae */}
        <path
          d="M17 7C19 4 23 2 26 2"
          stroke="url(#mantisGradient)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M18 9C21 7 24 5 27 5"
          stroke="url(#mantisGradient)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Head */}
        <path
          d="M14 9L18 8L16 12L12 11Z"
          fill="url(#mantisGradient)"
        />

        {/* Raptor arms (folded praying mantis arms) */}
        <path
          d="M15 11C13 8 9 9 7 13C6 15 8 18 11 16L13 14"
          stroke="url(#mantisGradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 12C14 11 11 12 10 15L12 17"
          stroke="url(#mantisGradient)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Thorax and slender body */}
        <path
          d="M14 12C16 16 17 21 16 27C15.8 28.5 14 29 13 28C12 27 13 22 13 18Z"
          fill="url(#mantisGradient)"
        />

        {/* Long wings / abdomen casing */}
        <path
          d="M15 15C18 19 22 24 23 28C21.5 28.5 18 26 15 20Z"
          fill="url(#mantisGradient)"
          opacity="0.85"
        />

        {/* Slender hind legs */}
        <path
          d="M15 20L21 21L25 29"
          stroke="url(#mantisGradient)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 22L10 24L8 30"
          stroke="url(#mantisGradient)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
