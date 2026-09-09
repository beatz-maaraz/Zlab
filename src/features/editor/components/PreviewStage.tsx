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
      className="preview-stage absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px)`,
        transition: isPanning ? 'none' : 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};
