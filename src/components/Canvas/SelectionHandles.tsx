import React from 'react';
import {
  Lock,
  Unlock,
  Pin,
  PinOff,
  Copy,
  Trash2,
} from 'lucide-react';
import { CanvasElement } from '../../types';

interface SelectionHandlesProps {
  element: CanvasElement;
  currentRotationAngle: number | null;
  rotatingId: string | null;
  onRotateHandleMouseDown: (e: React.MouseEvent, element: CanvasElement) => void;
  onResizeHandleMouseDown: (e: React.MouseEvent, element: CanvasElement, handle: string) => void;
  onToggleLock: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUnfixAndUnlock: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const SelectionHandles: React.FC<SelectionHandlesProps> = ({
  element: el,
  currentRotationAngle,
  rotatingId,
  onRotateHandleMouseDown,
  onResizeHandleMouseDown,
  onToggleLock,
  onTogglePin,
  onUnfixAndUnlock,
  onDuplicate,
  onDelete,
}) => {
  return (
    <>
      {/* Top Stem & Rotation Handle */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-auto">
        <div
          onMouseDown={(e) => onRotateHandleMouseDown(e, el)}
          className="w-3.5 h-3.5 rounded-full bg-[#131313] border-2 border-[#0d99ff] hover:bg-[#0d99ff] cursor-grab active:cursor-grabbing shadow-lg transition-transform hover:scale-125"
          title="Drag to rotate element (Hold Shift for 15° steps)"
        />
        <div className="w-[1px] h-3.5 bg-[#0d99ff]" />
      </div>

      {/* Rotation Angle Tooltip */}
      {currentRotationAngle !== null && rotatingId === el.id && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0d99ff] text-[#002f55] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow z-50">
          {currentRotationAngle}°
        </div>
      )}

      {/* 4 Corner Handles */}
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 'nw')}
        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nwse-resize z-50 hover:scale-125 transition-transform pointer-events-auto"
      />
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 'ne')}
        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nesw-resize z-50 hover:scale-125 transition-transform pointer-events-auto"
      />
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 'sw')}
        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nesw-resize z-50 hover:scale-125 transition-transform pointer-events-auto"
      />
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 'se')}
        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nwse-resize z-50 hover:scale-125 transition-transform pointer-events-auto"
      />

      {/* 4 Edge Midpoint Handles */}
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 'n')}
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-[#131313] border border-[#0d99ff] cursor-ns-resize z-50 pointer-events-auto"
      />
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 's')}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-[#131313] border border-[#0d99ff] cursor-ns-resize z-50 pointer-events-auto"
      />
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 'e')}
        className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2.5 bg-[#131313] border border-[#0d99ff] cursor-ew-resize z-50 pointer-events-auto"
      />
      <div
        onMouseDown={(e) => onResizeHandleMouseDown(e, el, 'w')}
        className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2.5 bg-[#131313] border border-[#0d99ff] cursor-ew-resize z-50 pointer-events-auto"
      />

      {/* Dimensions & Name Pill */}
      <div className="absolute -bottom-6 left-0 bg-[#0d99ff] text-[#002f55] text-[9px] font-mono px-2 py-0.5 rounded font-bold shadow flex items-center gap-1.5 z-50 whitespace-nowrap pointer-events-none">
        <span>{el.name}</span>
        <span className="opacity-75">
          {el.width}×{el.height} • ({el.x}, {el.y})
        </span>
      </div>

      {/* Quick Action Floating Bar */}
      <div
        className="absolute -top-9 right-0 bg-[#1c1b1b]/95 backdrop-blur border border-[#353534] rounded-md px-1.5 py-0.5 flex items-center gap-1 shadow-xl z-50 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Unfix / Unlock quick action badge if locked/fixed */}
        {(el.locked || el.fixed || el.pinned) && (
          <button
            onClick={() => onUnfixAndUnlock(el.id)}
            className="px-1.5 py-0.5 rounded bg-[#0d99ff]/20 hover:bg-[#0d99ff]/40 text-[#9fcaff] text-[10px] font-bold transition-colors flex items-center gap-1 mr-0.5"
            title="Unfix position and unlock element controls"
          >
            <Unlock className="w-2.5 h-2.5" />
            <span>Unfix</span>
          </button>
        )}

        {/* Pin / Fix Position Toggle */}
        <button
          onClick={() => onTogglePin(el.id)}
          className={`p-1 rounded transition-colors ${
            el.fixed || el.pinned
              ? 'text-[#0d99ff] bg-[#0d99ff]/20'
              : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
          }`}
          title={el.fixed || el.pinned ? 'Unfix position (Unpin from viewport)' : 'Fix position (Pin to viewport)'}
        >
          {el.fixed || el.pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
        </button>

        {/* Lock / Unlock Toggle */}
        <button
          onClick={() => onToggleLock(el.id)}
          className={`p-1 rounded transition-colors ${
            el.locked
              ? 'text-[#f59e0b] bg-[#f59e0b]/20'
              : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
          }`}
          title={el.locked ? 'Unlock element' : 'Lock element'}
        >
          {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>

        {onDuplicate && (
          <button
            onClick={() => onDuplicate(el.id)}
            className="p-1 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
            title="Duplicate (⌘D)"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(el.id)}
            className="p-1 rounded text-[#89919e] hover:text-[#ffb4ab] hover:bg-[#2a2a2a] transition-colors"
            title="Delete element (Del)"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </>
  );
};
