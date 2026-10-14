import React, { forwardRef } from 'react';
import { DevicePreview } from '../../../types';

export interface ArtboardProps {
  id: string;
  devicePreview: DevicePreview;
  width: number;
  height: number;
  backgroundColor: string;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  showGrid?: boolean;
  children: React.ReactNode;
  overlayGuides?: React.ReactNode;
}

/**
 * Fixed Artboard component.
 * Uses exact design dimensions (1440x900 for desktop, 390x844 for mobile).
 * Does not mutate design coordinates when visual preview scale changes.
 */
export const Artboard = forwardRef<HTMLDivElement, ArtboardProps>(
  (
    {
      id,
      devicePreview,
      width,
      height,
      backgroundColor,
      isSelected,
      onMouseDown,
      onClick,
      onDragOver,
      onDrop,
      showGrid,
      children,
      overlayGuides,
    },
    ref
  ) => {
    const isMobile = devicePreview === 'mobile';

    return (
      <div
        ref={ref}
        id={id}
        onMouseDown={onMouseDown}
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: backgroundColor || '#131313',
          borderRadius: isMobile ? '40px' : '8px',
        }}
        className={`artboard ${
          isMobile ? 'mobile-artboard' : 'desktop-artboard'
        } relative overflow-hidden select-none cursor-default transition-colors ${
          !isMobile ? 'ring-1 ring-[#3f4753]' : ''
        }`}
      >
        {/* Grid Lines Overlay */}
        {showGrid && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="artboard-grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(159,202,255,0.08)" strokeWidth="0.5" />
              </pattern>
              <pattern id="artboard-grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#artboard-grid-small)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(159,202,255,0.18)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#artboard-grid-large)" />
          </svg>
        )}
 
        {/* iOS Chrome for Mobile: Dynamic Island & Home Bar */}
        {isMobile && (
          <>
            {/* Dynamic Island - Refined for realistic depth and sensors */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-40 pointer-events-none flex items-center justify-between px-4 shadow-xl">
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1c1b1b] border border-white/5" />
                <div className="w-1 h-1 rounded-full bg-[#1c1b1b]" />
              </div>
              {/* Fake camera lens effect */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#050505] to-[#1a1a1a] flex items-center justify-center border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d99ff]/10 ring-1 ring-[#0d99ff]/20" />
              </div>
            </div>
 
            {/* iOS Home Indicator Bar */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-white/20 hover:bg-white/40 rounded-full z-40 pointer-events-none transition-colors" />
          </>
        )}
 
        {/* Selection Highlight for Artboard Root */}
        <div
          className={`absolute inset-0 pointer-events-none z-30 transition-colors ${
            isSelected
              ? isMobile
                ? 'rounded-[40px] border-2 border-[#9fcaff] ring-4 ring-[#9fcaff]/10'
                : 'rounded-lg border-2 border-[#9fcaff]'
              : 'border-transparent'
          }`}
        >
          {isSelected && !isMobile && (
            <>
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
            </>
          )}
        </div>

        {/* Artboard Child Elements */}
        {children}

        {/* Interactive Drawing Box, Smart Snap Guides, Pen Paths */}
        {overlayGuides}
      </div>
    );
  }
);

Artboard.displayName = 'Artboard';
