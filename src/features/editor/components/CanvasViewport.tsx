import React, { forwardRef } from 'react';
import { ToolMode } from '../../../types';
import { CanvasGrid } from '../../../components/Canvas/CanvasGrid';

export interface CanvasViewportProps {
  currentTool: ToolMode;
  isPanning: boolean;
  showGrid: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

export const CanvasViewport = forwardRef<HTMLDivElement, CanvasViewportProps>(
  (
    {
      currentTool,
      isPanning,
      showGrid,
      zoom,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onWheel,
      onDragOver,
      onDrop,
      children,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        id="canvas-viewport"
        tabIndex={0}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          cursor:
            isPanning || currentTool === 'hand'
              ? 'grab'
              : currentTool === 'rect' || currentTool === 'frame'
              ? 'crosshair'
              : currentTool === 'pen'
              ? 'crosshair'
              : currentTool === 'text'
              ? 'text'
              : currentTool === 'comment'
              ? 'cell'
              : 'default',
        }}
        className="canvas-viewport w-full h-full relative overflow-hidden select-none bg-[#0e0e0e] outline-none flex items-center justify-center"
      >
        {/* Visual Dots & Grids Background */}
        <CanvasGrid showGrid={showGrid} zoom={zoom} />

        {/* Content / Preview Stage */}
        {children}
      </div>
    );
  }
);

CanvasViewport.displayName = 'CanvasViewport';
