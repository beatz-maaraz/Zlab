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
        /* Mobile Device Bezel Wrapper */
        <div
          id="mobile-frame-wrapper"
          className="relative p-3 bg-[#1e1e20] rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-[#3f4753]/80 ring-1 ring-white/5"
        >
          {/* Side phone buttons styling */}
          <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-[#353534] rounded-l-sm" />
          <div className="absolute -left-[3px] top-42 w-[3px] h-12 bg-[#353534] rounded-l-sm" />
          <div className="absolute -left-[3px] top-58 w-[3px] h-12 bg-[#353534] rounded-l-sm" />
          <div className="absolute -right-[3px] top-36 w-[3px] h-16 bg-[#353534] rounded-r-sm" />

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
