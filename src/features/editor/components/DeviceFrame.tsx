import React from 'react';
import { DevicePreview } from '../../../types';

export interface DeviceFrameProps {
  devicePreview: DevicePreview;
  totalScale: number;
  isInteracting: boolean;
  children: React.ReactNode;
}

/**
 * Visual device frame wrapper for Desktop and Mobile preview.
 * Applies the single visual scale transform without modifying design coordinates.
 * Mobile preview frame adds an authentic device bezel without padding into the artboard coordinates.
 */
export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  devicePreview,
  totalScale,
  isInteracting,
  children,
}) => {
  return (
    <div
      id="device-frame-container"
      className="device-frame-container pointer-events-auto select-none"
      style={{
        transform: `scale(${totalScale})`,
        transformOrigin: '0 0',
        transition: isInteracting ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {devicePreview === 'mobile' ? (
        /* Mobile Device Bezel Wrapper - Refined for premium look */
        <div
          id="mobile-frame-wrapper"
          className="relative p-3 bg-gradient-to-b from-[#252528] to-[#121214] rounded-[52px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)_inset] border border-[#3f4753]/60 ring-1 ring-black/40"
        >
          {/* Side phone buttons styling - Refined with subtle depth */}
          {/* Silence Switch / Action Button */}
          <div className="absolute -left-[1.5px] top-24 w-[2.5px] h-6 bg-[#353534] rounded-l-[1px] border-r border-white/5 shadow-sm" />
          {/* Volume Up */}
          <div className="absolute -left-[1.5px] top-36 w-[2.5px] h-12 bg-[#353534] rounded-l-[1px] border-r border-white/5 shadow-sm" />
          {/* Volume Down */}
          <div className="absolute -left-[1.5px] top-52 w-[2.5px] h-12 bg-[#353534] rounded-l-[1px] border-r border-white/5 shadow-sm" />
          {/* Side / Power Button */}
          <div className="absolute -right-[1.5px] top-40 w-[2.5px] h-20 bg-[#353534] rounded-r-[1px] border-l border-white/5 shadow-sm" />

          {/* The Actual 390x844 Artboard */}
          {children}
        </div>
      ) : (
        /* Desktop Artboard Container */
        <div id="desktop-frame-wrapper" className="relative shadow-2xl">
          {children}
        </div>
      )}
    </div>
  );
};
