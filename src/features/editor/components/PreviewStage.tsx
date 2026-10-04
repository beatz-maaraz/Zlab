import React from 'react';

export interface PreviewStageProps {
  pan: { x: number; y: number };
  isPanning: boolean;
  children: React.ReactNode;
}

/**
 * Preview Stage centers the design artboard in the editor viewport.
 * Handles panning translation without interfering with scale or artboard coordinates.
 */
export const PreviewStage: React.FC<PreviewStageProps> = ({ pan, isPanning, children }) => {
  return (
    <div
      id="preview-stage"
      className="preview-stage absolute inset-0 pointer-events-none"
      style={{
        transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
        transformOrigin: '0 0',
        transition: isPanning ? 'none' : 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};
