import React, { useRef, useState, useEffect } from 'react';
import { CanvasElement } from '../../types';
import { Folder, FolderMinus, Unlock, Pin, PinOff, Lock, Copy, Trash2 } from 'lucide-react';

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const;

interface TransformGizmoProps {
  selectedElement: CanvasElement;
  allElements: Record<string, CanvasElement>;
  zoom: number;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUngroup?: (id: string) => void;
  setElements: React.Dispatch<React.SetStateAction<Record<string, CanvasElement>>>;
}

export const TransformGizmo: React.FC<TransformGizmoProps> = ({
  selectedElement,
  allElements,
  zoom,
  onUpdate,
  onDuplicate,
  onDelete,
  onUngroup,
  setElements,
}) => {
  const isResizingRef = useRef(false);
  const startRef = useRef<{
    mouseX: number;
    mouseY: number;
    x: number;
    y: number;
    w: number;
    h: number;
    aspectRatio: number;
  } | null>(null);

  const handlePointerDown = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (selectedElement.locked) return;

    isResizingRef.current = true;
    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: selectedElement.x,
      y: selectedElement.y,
      w: selectedElement.width,
      h: selectedElement.height,
      aspectRatio: selectedElement.width / (selectedElement.height || 1),
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const onPointerMove = (evt: PointerEvent) => {
      if (!isResizingRef.current || !startRef.current) return;

      const dx = (evt.clientX - startRef.current.mouseX) / zoom;
      const dy = (evt.clientY - startRef.current.mouseY) / zoom;

      let { x, y, w, h } = startRef.current;
      const minSize = 10;

      // Handle calculations
      if (handle.includes('e')) w = Math.max(minSize, w + dx);
      if (handle.includes('s')) h = Math.max(minSize, h + dy);
      if (handle.includes('w')) {
        const nextW = Math.max(minSize, w - dx);
        x += w - nextW;
        w = nextW;
      }
      if (handle.includes('n')) {
        const nextH = Math.max(minSize, h - dy);
        y += h - nextH;
        h = nextH;
      }

      // Aspect ratio lock with Shift key (corner handles only)
      if (evt.shiftKey && handle.length === 2) {
         if (handle === 'se' || handle === 'nw' || handle === 'ne' || handle === 'sw') {
             h = w / startRef.current.aspectRatio;
             // Re-adjust y/x if we're pulling from north/west
             if (handle.includes('n')) y = startRef.current.y + (startRef.current.h - h);
             if (handle.includes('w')) x = startRef.current.x + (startRef.current.w - w);
         }
      }

      // Live DOM update for performance
      const elDom = document.getElementById(`canvas-el-${selectedElement.id}`);
      if (elDom) {
        elDom.style.left = `${Math.round(x)}px`;
        elDom.style.top = `${Math.round(y)}px`;
        elDom.style.width = `${Math.round(w)}px`;
        elDom.style.height = `${Math.round(h)}px`;
      }
    };

    const onPointerUp = (evt: PointerEvent) => {
      if (!isResizingRef.current || !startRef.current) return;
      
      const dx = (evt.clientX - startRef.current.mouseX) / zoom;
      const dy = (evt.clientY - startRef.current.mouseY) / zoom;
      
      let { x, y, w, h } = startRef.current;
      const minSize = 10;
      if (handle.includes('e')) w = Math.max(minSize, w + dx);
      if (handle.includes('s')) h = Math.max(minSize, h + dy);
      if (handle.includes('w')) {
        const nextW = Math.max(minSize, w - dx);
        x += w - nextW;
        w = nextW;
      }
      if (handle.includes('n')) {
        const nextH = Math.max(minSize, h - dy);
        y += h - nextH;
        h = nextH;
      }
      
      if (evt.shiftKey && handle.length === 2) {
          h = w / startRef.current.aspectRatio;
          if (handle.includes('n')) y = startRef.current.y + (startRef.current.h - h);
          if (handle.includes('w')) x = startRef.current.x + (startRef.current.w - w);
      }

      isResizingRef.current = false;
      evt.target?.removeEventListener('pointermove', onPointerMove as any);
      evt.target?.removeEventListener('pointerup', onPointerUp as any);
      
      onUpdate(selectedElement.id, { 
          x: Math.round(x), 
          y: Math.round(y), 
          width: Math.round(w), 
          height: Math.round(h) 
      });
    };

    (e.target as HTMLElement).addEventListener('pointermove', onPointerMove as any);
    (e.target as HTMLElement).addEventListener('pointerup', onPointerUp as any);
  };

  const isGroup = selectedElement.type === 'group';
  const childrenCount = Object.values(allElements).filter((c) => c.parentId === selectedElement.id).length;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${selectedElement.x}px`,
        top: `${selectedElement.y}px`,
        width: `${selectedElement.width}px`,
        height: `${selectedElement.height}px`,
        transform: selectedElement.rotation ? `rotate(${selectedElement.rotation}deg)` : undefined,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* Selection Border */}
      <div className="absolute inset-0 border-2 border-[#0d99ff] pointer-events-none" />

      {/* Resize Handles */}
      {!selectedElement.locked && HANDLES.map((h) => (
        <div
          key={h}
          onPointerDown={(e) => handlePointerDown(h, e)}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            backgroundColor: '#131313',
            border: '2px solid #0d99ff',
            borderRadius: '1px',
            pointerEvents: 'all',
            cursor: `${h}-resize`,
            top: h.includes('n') ? '-5px' : h.includes('s') ? 'calc(100% - 3px)' : 'calc(50% - 4px)',
            left: h.includes('w') ? '-5px' : h.includes('e') ? 'calc(100% - 3px)' : 'calc(50% - 4px)',
          }}
          className="hover:scale-125 transition-transform"
        />
      ))}

      {/* Quick Action Bar */}
      <div
        className="absolute -top-10 right-0 bg-[#1c1b1b]/95 backdrop-blur border border-[#353534] rounded-md px-1.5 py-0.5 flex items-center gap-1 shadow-xl pointer-events-auto"
      >
        {isGroup && onUngroup && (
          <button
            onClick={() => onUngroup(selectedElement.id)}
            className="px-1.5 py-0.5 rounded bg-[#f59e0b]/20 hover:bg-[#f59e0b]/35 text-[#fbbf24] text-[10px] font-semibold transition-colors flex items-center gap-1 mr-0.5"
            title="Ungroup components (⌘⇧G)"
          >
            <FolderMinus className="w-3 h-3" />
            <span>Ungroup</span>
          </button>
        )}
        
        {(selectedElement.locked || selectedElement.fixed || selectedElement.pinned) && (
          <button
            onClick={() => {
              onUpdate(selectedElement.id, { locked: false, fixed: false, pinned: false });
            }}
            className="px-1.5 py-0.5 rounded bg-[#0d99ff]/20 hover:bg-[#0d99ff]/40 text-[#9fcaff] text-[10px] font-bold transition-colors flex items-center gap-1 mr-0.5"
          >
            <Unlock className="w-2.5 h-2.5" />
            <span>Unfix</span>
          </button>
        )}

        <button
          onClick={() => onUpdate(selectedElement.id, { fixed: !selectedElement.fixed, pinned: !selectedElement.fixed })}
          className={`p-1 rounded transition-colors ${selectedElement.fixed ? 'text-[#0d99ff] bg-[#0d99ff]/20' : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'}`}
        >
          {selectedElement.fixed ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
        </button>

        <button
          onClick={() => onUpdate(selectedElement.id, { locked: !selectedElement.locked })}
          className={`p-1 rounded transition-colors ${selectedElement.locked ? 'text-[#f59e0b] bg-[#f59e0b]/20' : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'}`}
        >
          {selectedElement.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>

        {onDuplicate && (
          <button onClick={() => onDuplicate(selectedElement.id)} className="p-1 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]">
            <Copy className="w-3 h-3" />
          </button>
        )}

        {onDelete && (
          <button onClick={() => onDelete(selectedElement.id)} className="p-1 rounded text-[#89919e] hover:text-[#ffb4ab] hover:bg-[#2a2a2a]">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Label Pill */}
      <div className="absolute -bottom-7 left-0 bg-[#0d99ff] text-[#002f55] text-[9px] font-mono px-2 py-0.5 rounded font-bold shadow flex items-center gap-1.5 whitespace-nowrap">
        {isGroup ? (
          <span className="flex items-center gap-1">
            <Folder className="w-3 h-3" />
            {selectedElement.name} ({childrenCount} items)
          </span>
        ) : (
          <span>{selectedElement.name}</span>
        )}
        <span className="opacity-75">
          {Math.round(selectedElement.width)}×{Math.round(selectedElement.height)} • ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
        </span>
      </div>
    </div>
  );
};
