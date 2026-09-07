import React from 'react';

interface ZLabLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const ZLabLogo: React.FC<ZLabLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-xs', subtext: 'text-[9px]' },
    md: { icon: 32, text: 'text-sm', subtext: 'text-[10px]' },
    lg: { icon: 40, text: 'text-base', subtext: 'text-xs' },
    xl: { icon: 48, text: 'text-lg', subtext: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric ZLab Emblem */}
      <div
        style={{ width: currentSize.icon, height: currentSize.icon }}
        className="relative shrink-0 rounded-xl bg-gradient-to-br from-[#1c1b1b] to-[#121214] p-0.5 border border-[#353534] shadow-md group-hover:border-[#0d99ff] transition-all group-hover:shadow-[0_0_12px_rgba(13,153,255,0.25)] flex items-center justify-center overflow-hidden"
      >
        {/* Subtle grid background inside the icon */}
        <div className="absolute inset-0 bg-[radial-gradient(#0d99ff_1px,transparent_1px)] [background-size:6px_6px] opacity-15" />

        {/* Scalable Vector SVG 'Z' Mark */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[78%] h-[78%] relative z-10 drop-shadow-[0_1px_4px_rgba(13,153,255,0.4)]"
        >
          {/* Subtle glow filter definition */}
          <defs>
            <linearGradient id="zlab-accent-grad" x1="6" y1="8" x2="26" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9fcaff" />
              <stop offset="0.5" stopColor="#0d99ff" />
              <stop offset="1" stopColor="#005299" />
            </linearGradient>
            <linearGradient id="zlab-accent-glow" x1="6" y1="8" x2="26" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#9fcaff" />
            </linearGradient>
          </defs>

          {/* Precision faceted Z-path */}
          <path
            d="M7 8.5H25L11 23.5H25"
            stroke="url(#zlab-accent-grad)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Geometric anchor nodes */}
          <circle cx="7" cy="8.5" r="2" fill="url(#zlab-accent-glow)" />
          <circle cx="25" cy="8.5" r="2" fill="#0d99ff" />
          <circle cx="11" cy="23.5" r="2" fill="#0d99ff" />
          <circle cx="25" cy="23.5" r="2" fill="url(#zlab-accent-glow)" />

          {/* Central intersecting pulse dot */}
          <circle cx="18" cy="16" r="1.2" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight text-[#e5e2e1] group-hover:text-[#9fcaff] transition-colors ${currentSize.text}`}
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              ZLab
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0d99ff]/15 text-[#9fcaff] border border-[#0d99ff]/30 font-semibold uppercase tracking-wider">
              Studio
            </span>
          </div>
          <span className={`text-[#89919e] font-medium tracking-normal mt-0.5 ${currentSize.subtext}`}>
            Vector Engine
          </span>
        </div>
      )}
    </div>
  );
};
