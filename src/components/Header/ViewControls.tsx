import React, { useState, useRef, useEffect } from 'react';
import { Undo, Redo, ZoomIn, Check, Monitor, Smartphone } from 'lucide-react';

interface ViewControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  devicePreview: 'desktop' | 'mobile';
  setDevicePreview: (mode: 'desktop' | 'mobile') => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  setZoom,
  devicePreview,
  setDevicePreview,
}) => {
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomRef.current && !zoomRef.current.contains(e.target as Node)) {
        setZoomMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1 bg-[#201f1f] px-2 py-1 rounded-lg border border-[#353534]/50">
      {/* Undo */}
      <button
        id="btn-header-undo"
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-1.5 rounded transition-colors ${
          canUndo
            ? 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
            : 'text-[#89919e]/40 cursor-not-allowed'
        }`}
        title="Undo (⌘Z)"
      >
        <Undo className="w-4 h-4" />
      </button>

      {/* Redo */}
      <button
        id="btn-header-redo"
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-1.5 rounded transition-colors ${
          canRedo
            ? 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
            : 'text-[#89919e]/40 cursor-not-allowed'
        }`}
        title="Redo (⇧⌘Z)"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-[#3f4753] mx-1" />

      {/* Zoom control */}
      <div ref={zoomRef} className="relative">
        <button
          id="btn-header-zoom"
          onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
          className="p-1 px-1.5 text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors flex items-center gap-1 text-xs"
          title="Zoom Level"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">{Math.round(zoom * 100)}%</span>
        </button>
        {zoomMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-xl py-1 z-50 text-xs">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setZoom(lvl);
                  setZoomMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-[#e5e2e1] hover:bg-[#2a2a2a]"
              >
                <span>{Math.round(lvl * 100)}%</span>
                {Math.abs(zoom - lvl) < 0.05 && <Check className="w-3.5 h-3.5 text-[#9fcaff]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-[#3f4753] mx-1" />

      {/* Device Change Control (Desktop / Mobile) */}
      <div
        id="control-device-switcher"
        className="flex items-center bg-[#141416] p-0.5 rounded-lg border border-[#353534]"
        title="Change Canvas Viewport"
      >
        <button
          id="btn-change-control-desktop"
          onClick={() => setDevicePreview('desktop')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
            devicePreview === 'desktop'
              ? 'bg-[#0d99ff] text-[#002f55] font-semibold shadow-sm'
              : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
          }`}
          title="Desktop Artboard (1440 × 900)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Desktop</span>
        </button>
        <button
          id="btn-change-control-mobile"
          onClick={() => setDevicePreview('mobile')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
            devicePreview === 'mobile'
              ? 'bg-[#0d99ff] text-[#002f55] font-semibold shadow-sm'
              : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
          }`}
          title="Mobile Artboard (390 × 844)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile</span>
        </button>
      </div>
    </div>
  );
};
