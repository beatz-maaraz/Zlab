import React from 'react';

interface CanvasGridProps {
  showGrid: boolean;
  zoom: number;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ showGrid, zoom }) => {
  if (!showGrid) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60"
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(159, 202, 255, 0.22) 1.2px, transparent 1.2px),
          linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px)
        `,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px, ${96 * zoom}px ${96 * zoom}px, ${96 * zoom}px ${96 * zoom}px`,
        backgroundPosition: '0 0, 0 0, 0 0',
      }}
    />
  );
};
