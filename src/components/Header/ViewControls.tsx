import React, { useState, useRef, useEffect } from 'react';
import { Undo, Redo, ZoomIn, Check, Monitor, Smartphone, Plus, Minus } from 'lucide-react';

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
    <div className="h-8 flex items-center gap-0.5 sm:gap-1 bg-[#201f1f] px-1 sm:px-1.5 rounded-lg border border-[#353534]/50 shrink-0">
      {/* Undo */}
      <button
        id="btn-header-undo"
        onClick={onUndo}
        disabled={!canUndo}
        className={`h-6 w-6 flex items-center justify-center rounded transition-colors ${
          canUndo
            ? 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
            : 'text-[#89919e]/40 cursor-not-allowed'
        }`}
        title="Undo (⌘Z)"
      >
        <Undo className="w-3.5 h-3.5" />
      </button>
      {/* Redo */}
      <button
        id="btn-header-redo"
        onClick={onRedo}
        disabled={!canRedo}
        className={`h-6 w-6 flex items-center justify-center rounded transition-colors ${
          canRedo
            ? 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
            : 'text-[#89919e]/40 cursor-not-allowed'
        }`}
        title="Redo (⇧⌘Z)"
      >
        <Redo className="w-3.5 h-3.5" />
      </button>

      {/* Zoom Adjust Controls (Decrease / Percentage Menu / Increase) - hidden on small screens */}
      <div ref={zoomRef} className="relative hidden md:flex items-center h-6 bg-[#141416] rounded-md border border-[#353534] px-0.5">
        <button
          id="btn-header-zoom-decrease"
          type="button"
          onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
          disabled={zoom <= 0.25}
          className="p-1 text-[#bfc7d5] hover:text-[#9fcaff] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-20"
          title="Zoom Out / Decrease Zoom (⌘-)"
        >
          <Minus className="w-3 h-3" />
        </button>

        <button
          id="btn-header-zoom"
          onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
          className="px-1.5 py-0.5 text-[#e5e2e1] hover:text-[#9fcaff] hover:bg-[#201f1f] rounded transition-colors flex items-center gap-1 text-xs select-none"
          title="Zoom Presets"
        >
          <ZoomIn className="w-3 h-3 text-[#89919e]" />
          <span className="font-mono text-[11px] min-w-[34px] text-center">{Math.round(zoom * 100)}%</span>
        </button>

        <button
          id="btn-header-zoom-increase"
          type="button"
          onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
          disabled={zoom >= 3}
          className="p-1 text-[#bfc7d5] hover:text-[#9fcaff] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-20"
          title="Zoom In / Increase Zoom (⌘+)"
        >
          <Plus className="w-3 h-3" />
        </button>

        {zoomMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#89919e] tracking-wider border-b border-[#353534]">
              Zoom Presets
            </div>
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setZoom(lvl);
                  setZoomMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              >
                <span>{Math.round(lvl * 100)}%</span>
                {Math.abs(zoom - lvl) < 0.04 && <Check className="w-3.5 h-3.5 text-[#9fcaff]" />}
              </button>
            ))}
            <div className="border-t border-[#353534] mt-1 pt-1">
              <button
                onClick={() => {
                  setZoom(1);
                  setZoomMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-[#9fcaff] hover:bg-[#2a2a2a] transition-colors"
              >
                <span>Reset (100%)</span>
                <span className="text-[10px] text-[#89919e]">⌘0</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block h-4 w-[1px] bg-[#3f4753] mx-1" />

      {/* Device Change Control (Desktop / Mobile) */}
      <div
        id="control-device-switcher"
        className="flex items-center bg-[#141416] p-0.5 rounded-lg border border-[#353534]"
        title="Change Canvas Viewport"
      >
        <button
          id="btn-change-control-desktop"
          onClick={() => setDevicePreview('desktop')}
          className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-xs transition-all ${
            devicePreview === 'desktop'
              ? 'bg-[#0d99ff] text-[#002f55] font-semibold shadow-sm'
              : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
          }`}
          title="Desktop Artboard (1440 × 900)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Desktop</span>
        </button>
        <button
          id="btn-change-control-mobile"
          onClick={() => setDevicePreview('mobile')}
          className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-xs transition-all ${
            devicePreview === 'mobile'
              ? 'bg-[#0d99ff] text-[#002f55] font-semibold shadow-sm'
              : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
          }`}
          title="Mobile Artboard (390 × 844)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Mobile</span>
        </button>
      </div>
    </div>
  );
};
