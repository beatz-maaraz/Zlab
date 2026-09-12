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
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
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
        onContextMenu={onContextMenu}
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

        {/* Top Ruler (Visual Only) */}
        <div 
          className="absolute top-0 left-0 right-0 h-5 bg-[#141416]/95 border-b border-[#353534]/60 z-20 backdrop-blur" 
          style={{ 
            backgroundSize: `${50 * zoom}px 100%`, 
            backgroundImage: 'linear-gradient(90deg, #353534 1px, transparent 1px)' 
          }} 
        />
        {/* Left Ruler (Visual Only) */}
        <div 
          className="absolute top-0 left-0 bottom-0 w-5 bg-[#141416]/95 border-r border-[#353534]/60 z-20 backdrop-blur" 
          style={{ 
            backgroundSize: `100% ${50 * zoom}px`, 
            backgroundImage: 'linear-gradient(180deg, #353534 1px, transparent 1px)' 
          }} 
        />
        {/* Top Left Ruler Corner */}
        <div className="absolute top-0 left-0 w-5 h-5 bg-[#141416] border-r border-b border-[#353534]/60 z-30" />

        {/* Content / Preview Stage */}
        {children}
      </div>
    );
  }
);

CanvasViewport.displayName = 'CanvasViewport';
