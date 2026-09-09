import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid, Monitor, Smartphone } from 'lucide-react';

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  showGrid: boolean;
  onToggleGrid?: () => void;
  devicePreview: 'desktop' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  showGrid,
  onToggleGrid,
  devicePreview,
  onDeviceChange,
}) => {
  return (
    <div className="absolute bottom-6 left-6 z-40 flex items-center gap-1.5 bg-[#1c1b1b]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#353534] shadow-2xl">
      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-1 rounded-lg text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
        title="Zoom Out (⌘-)"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      {/* Current Zoom */}
      <button
        onClick={onZoomReset}
        className="px-2 py-0.5 rounded-md text-[11px] font-mono text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
        title="Reset Zoom to 100% (⌘0)"
      >
        {Math.round(zoom * 100)}%
      </button>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-1 rounded-lg text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
        title="Zoom In (⌘+)"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="h-3 w-[1px] bg-[#353534] mx-1" />

      {/* Grid Toggle */}
      {onToggleGrid && (
        <button
          onClick={onToggleGrid}
          className={`p-1 rounded-lg transition-colors ${
            showGrid
              ? 'text-[#0d99ff] bg-[#0d99ff]/15'
              : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
          }`}
          title="Toggle Canvas Grid (G)"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Fit to View */}
      <button
        onClick={onZoomReset}
        className="p-1 rounded-lg text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
        title="Fit Canvas"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <div className="h-3 w-[1px] bg-[#353534] mx-1" />

      {/* Device Quick Switcher */}
      <button
        onClick={() => onDeviceChange(devicePreview === 'desktop' ? 'mobile' : 'desktop')}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-[#9fcaff] hover:bg-[#2a2a2a] transition-colors"
        title="Switch Preview (1: Desktop, 2: Mobile)"
      >
        {devicePreview === 'desktop' ? (
          <>
            <Monitor className="w-3 h-3" />
            <span>1440</span>
          </>
        ) : (
          <>
            <Smartphone className="w-3 h-3" />
            <span>390</span>
          </>
        )}
      </button>
    </div>
  );
};
