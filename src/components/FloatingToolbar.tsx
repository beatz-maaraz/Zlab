import React, { useState, useRef, useCallback } from 'react';
import {
  MousePointer,
  Crop,
  Square,
  PenTool,
  Type,
  Hand,
  MessageSquare,
  GripVertical,
} from 'lucide-react';
import { ToolMode } from '../types';

interface FloatingToolbarProps {
  currentTool: ToolMode;
  setCurrentTool: (tool: ToolMode) => void;
  commentCount?: number;
  enableDragAndDrop?: boolean;
}

interface ToolDef {
  id: ToolMode;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const DEFAULT_TOOLS: ToolDef[] = [
  { id: 'move', label: 'Move Tool', shortcut: 'V', icon: <MousePointer className="w-4 h-4" /> },
  { id: 'frame', label: 'Frame Tool', shortcut: 'F', icon: <Crop className="w-4 h-4" /> },
  { id: 'rect', label: 'Rectangle', shortcut: 'R', icon: <Square className="w-4 h-4" /> },
  { id: 'pen', label: 'Pen Tool', shortcut: 'P', icon: <PenTool className="w-4 h-4" /> },
  { id: 'text', label: 'Text Tool', shortcut: 'T', icon: <Type className="w-4 h-4" /> },
  { id: 'hand', label: 'Hand Tool', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
];

// Comment tool is defined separately so it can receive the dynamic badge
const COMMENT_TOOL_BASE: Omit<ToolDef, 'icon'> = {
  id: 'comment',
  label: 'Comments',
  shortcut: 'C',
};

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  currentTool,
  setCurrentTool,
  commentCount = 1,
  enableDragAndDrop = true,
}) => {
  // Mutable tool order — users can drag to rearrange
  const [toolOrder, setToolOrder] = useState<ToolMode[]>(() =>
    [...DEFAULT_TOOLS.map((t) => t.id), COMMENT_TOOL_BASE.id]
  );

  // Build a lookup map for tool definitions (comment icon needs commentCount)
  const toolMap = useRef(new Map<ToolMode, ToolDef>());
  DEFAULT_TOOLS.forEach((t) => toolMap.current.set(t.id, t));
  toolMap.current.set('comment', {
    ...COMMENT_TOOL_BASE,
    icon: (
      <div className="relative">
        <MessageSquare className="w-4 h-4" />
        {commentCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#0d99ff] ring-1 ring-[#131313]" />
        )}
      </div>
    ),
  });

  // ----- Container Drag-and-drop state -----
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingContainer, setIsDraggingContainer] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDraggingContainer(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [position]);

  const handleContainerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingContainer) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    let nextX = initialPos.current.x + dx;
    let nextY = initialPos.current.y + dy;

    if (containerRef.current && containerRef.current.parentElement) {
      const parentRect = containerRef.current.parentElement.getBoundingClientRect();
      const rect = containerRef.current.getBoundingClientRect();
      
      // The container has 'top-6' and 'left-6', which is 24px from top-left
      const xMin = -24;
      const xMax = parentRect.width - 24 - rect.width;
      
      const yMin = -24;
      const yMax = parentRect.height - 24 - rect.height;

      nextX = Math.max(xMin, Math.min(nextX, xMax));
      nextY = Math.max(yMin, Math.min(nextY, yMax));
    }

    setPosition({
      x: nextX,
      y: nextY,
    });
  }, [isDraggingContainer]);

  const handleContainerPointerUp = useCallback((e: React.PointerEvent) => {
    setIsDraggingContainer(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // ----- Tool Drag-and-drop state -----
  const [draggedToolId, setDraggedToolId] = useState<ToolMode | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, toolId: ToolMode) => {
    e.stopPropagation();
    setDraggedToolId(toolId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a temporary ghost element so we don't see the default browser preview
    const ghost = document.createElement('div');
    ghost.style.cssText = 'width:1px;height:1px;opacity:0;position:fixed;top:-99px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    // Remove it after the drag starts
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedToolId(null);
    setDropIdx(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggedToolId) {
        setDropIdx(null);
        return;
      }
      
      const currentDragIdx = toolOrder.indexOf(draggedToolId);
      if (currentDragIdx === idx) {
        setDropIdx(null);
        return;
      }
      
      setDropIdx(idx);
    },
    [draggedToolId, toolOrder]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIdx: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDropIdx(null);
      
      if (!draggedToolId) {
        setDraggedToolId(null);
        return;
      }
      
      setToolOrder((prev) => {
        const fromIdx = prev.indexOf(draggedToolId);
        if (fromIdx === -1 || fromIdx === toIdx) return prev;
        
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
      setDraggedToolId(null);
    },
    [draggedToolId]
  );

  return (
    <div
      id="floating-canvas-toolbar"
      ref={containerRef}
      className="absolute top-6 left-6 z-30 flex items-center gap-1 bg-[#2a2a2a]/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-2xl border border-[#353534]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(0.8)`,
        transformOrigin: 'top left',
        transition: isDraggingContainer ? 'none' : 'transform 0.1s ease-out',
      }}
    >
      {/* Container Drag Handle */}
      <div
        className="flex items-center justify-center p-1 cursor-grab active:cursor-grabbing text-[#89919e] hover:text-[#e5e2e1] transition-colors"
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
        onPointerCancel={handleContainerPointerUp}
        title="Drag toolbar"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Divider */}
      <div className="w-[1px] h-6 bg-[#353534] mx-1" />

      {toolOrder.map((toolId, idx) => {
        const t = toolMap.current.get(toolId);
        if (!t) return null;
        const isActive = currentTool === t.id;
        const isBeingDragged = draggedToolId === t.id;
        const isDropTarget = dropIdx === idx;
        const currentDragIdx = draggedToolId ? toolOrder.indexOf(draggedToolId) : -1;

        return (
          <div
            key={t.id}
            className="relative"
            draggable={enableDragAndDrop}
            onDragStart={enableDragAndDrop ? (e) => handleDragStart(e, t.id) : undefined}
            onDragEnd={enableDragAndDrop ? handleDragEnd : undefined}
            onDragOver={enableDragAndDrop ? (e) => handleDragOver(e, idx) : undefined}
            onDragEnter={
              enableDragAndDrop
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                : undefined
            }
            onDrop={enableDragAndDrop ? (e) => handleDrop(e, idx) : undefined}
          >
            {/* Left-side drop indicator */}
            {isDropTarget && currentDragIdx !== -1 && currentDragIdx > idx && (
              <span
                className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full z-10"
                style={{ backgroundColor: '#0d99ff', transform: 'translateX(-3px)' }}
              />
            )}
            {/* Right-side drop indicator */}
            {isDropTarget && currentDragIdx !== -1 && currentDragIdx < idx && (
              <span
                className="absolute right-0 top-1 bottom-1 w-[2px] rounded-full z-10"
                style={{ backgroundColor: '#0d99ff', transform: 'translateX(3px)' }}
              />
            )}

            <button
              id={`tool-btn-${t.id}`}
              onClick={() => setCurrentTool(t.id)}
              title={`${t.label} (${t.shortcut}) — drag to reorder`}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#0d99ff] text-[#002f55] shadow-md scale-105 font-medium'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#353534]'
              } ${isBeingDragged ? 'opacity-30 scale-90' : ''}`}
              style={{ cursor: enableDragAndDrop ? 'grab' : 'pointer' }}
            >
              {t.icon}
            </button>
          </div>
        );
      })}
    </div>
  );
};
