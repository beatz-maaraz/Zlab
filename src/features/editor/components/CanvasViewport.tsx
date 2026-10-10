import React, { forwardRef } from 'react';
import { ToolMode } from '../../../types';
import { CanvasGrid } from '../../../components/Canvas/CanvasGrid';

export interface CanvasViewportProps {
  currentTool: ToolMode;
  isPanning: boolean;
  isSpacePressed?: boolean;
  showGrid: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

export const CanvasViewport = forwardRef<HTMLDivElement, CanvasViewportProps>(
  (
    {
      currentTool,
      isPanning,
      isSpacePressed = false,
      showGrid,
      zoom,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onContextMenu,
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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onContextMenu={onContextMenu}
        onWheel={onWheel}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          cursor: isPanning
            ? 'grabbing'
            : isSpacePressed || currentTool === 'hand'
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
        className="canvas-viewport w-full h-full relative overflow-hidden select-none bg-[#0e0e0e] outline-none touch-none"
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
