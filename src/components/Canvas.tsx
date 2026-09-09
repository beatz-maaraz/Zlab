import React, { useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  Users,
  CheckCircle2,
  MousePointer2,
  Smartphone,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Pin,
  PinOff,
  CornerDownRight,
  Sliders,
  Shield,
  Square,
  Circle,
  Type,
  Maximize2,
  Move,
  RotateCw,
  LayoutDashboard,
} from 'lucide-react';
import { CanvasElement, Collaborator, ToolMode, CanvasComment } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface CanvasProps {
  zoom: number;
  setZoom?: (zoom: number | ((prev: number) => number)) => void;
  currentTool: ToolMode;
  setCurrentTool?: (tool: ToolMode) => void;
  devicePreview: 'desktop' | 'mobile';
  selectedElementId: string;
  setSelectedElementId: (id: string) => void;
  elements: Record<string, CanvasElement>;
  setElements: React.Dispatch<React.SetStateAction<Record<string, CanvasElement>>>;
  onUpdateElementWithHistory?: (newElements: Record<string, CanvasElement>) => void;
  collaborators: Collaborator[];
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onDropElement?: (el: CanvasElement) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  zoom,
  setZoom,
  currentTool,
  setCurrentTool,
  devicePreview,
  selectedElementId,
  setSelectedElementId,
  elements,
  setElements,
  onUpdateElementWithHistory,
  collaborators,
  onDuplicateElement,
  onDeleteElement,
  showGrid = false,
  onToggleGrid,
  onDropElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Dragging element state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Smart snapping guides state
  const [snapGuideX, setSnapGuideX] = useState<number | null>(null);
  const [snapGuideY, setSnapGuideY] = useState<number | null>(null);

  // Resizing element state
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    initialW: number;
    initialH: number;
    initialX: number;
    initialY: number;
    aspectRatio: number;
  } | null>(null);

  // Rotating element state
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [rotateStart, setRotateStart] = useState<{
    centerX: number;
    centerY: number;
    initialRotation: number;
  } | null>(null);
  const [currentRotationAngle, setCurrentRotationAngle] = useState<number | null>(null);

  // Interactive drawing state (Rect, Frame, Pen tools)
  const [drawingState, setDrawingState] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    tool: ToolMode;
  } | null>(null);

  // Inline text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const [comments, setComments] = useState<CanvasComment[]>([
    {
      id: 'c1',
      author: 'Sarah Chen',
      initials: 'SC',
      avatarColor: '#9fcaff',
      text: 'Heading typography and contrast look great here!',
      x: 740,
      y: 270,
      timestamp: '10m ago',
      resolved: false,
    },
  ]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  // Canvas background panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'hand' || e.button === 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (currentTool === 'move') {
      // Clicking empty canvas space deselects elements
      if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-stage-wrapper') {
        setSelectedElementId(devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
        setEditingTextId(null);
      }
    }
  };

  // Global mouse handlers for panning, dragging, resizing, rotating, and drawing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Pan Canvas
      if (isPanning) {
        setPan({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        });
        return;
      }

      // 2. Drag Element
      if (draggingId && dragStart) {
        const deltaX = (e.clientX - dragStart.mouseX) / zoom;
        const deltaY = (e.clientY - dragStart.mouseY) / zoom;
        let newX = Math.round(dragStart.initialX + deltaX);
        let newY = Math.round(dragStart.initialY + deltaY);

        const currentEl = elements[draggingId];
        const artboardWidth = devicePreview === 'mobile' ? 390 : (elements['desktop-1440']?.width || 1440);
        const artboardHeight = devicePreview === 'mobile' ? 844 : (elements['desktop-1440']?.height || 900);

        if (currentEl) {
          const elCenterX = newX + currentEl.width / 2;
          const artboardCenterX = artboardWidth / 2;
          // Snap horizontal center (threshold 6px)
          if (Math.abs(elCenterX - artboardCenterX) < 7) {
            newX = Math.round(artboardCenterX - currentEl.width / 2);
            setSnapGuideX(artboardCenterX);
          } else {
            setSnapGuideX(null);
          }

          const elCenterY = newY + currentEl.height / 2;
          const artboardCenterY = artboardHeight / 2;
          // Snap vertical center (threshold 6px)
          if (Math.abs(elCenterY - artboardCenterY) < 7) {
            newY = Math.round(artboardCenterY - currentEl.height / 2);
            setSnapGuideY(artboardCenterY);
          } else {
            setSnapGuideY(null);
          }
        }

        setElements((prev) => {
          const el = prev[draggingId];
          if (!el) return prev;
          return {
            ...prev,
            [draggingId]: {
              ...el,
              x: newX,
              y: newY,
            },
          };
        });
        return;
      }

      // 3. Resize Element
      if (resizingId && resizeStart && resizeHandle) {
        const deltaX = (e.clientX - resizeStart.mouseX) / zoom;
        const deltaY = (e.clientY - resizeStart.mouseY) / zoom;

        setElements((prev) => {
          const el = prev[resizingId];
          if (!el) return prev;

          let newW = resizeStart.initialW;
          let newH = resizeStart.initialH;
          let newX = resizeStart.initialX;
          let newY = resizeStart.initialY;

          // East / West
          if (resizeHandle.includes('e')) {
            newW = Math.max(20, Math.round(resizeStart.initialW + deltaX));
          }
          if (resizeHandle.includes('w')) {
            const possibleW = Math.max(20, Math.round(resizeStart.initialW - deltaX));
            newX = resizeStart.initialX + (resizeStart.initialW - possibleW);
            newW = possibleW;
          }

          // South / North
          if (resizeHandle.includes('s')) {
            newH = Math.max(20, Math.round(resizeStart.initialH + deltaY));
          }
          if (resizeHandle.includes('n')) {
            const possibleH = Math.max(20, Math.round(resizeStart.initialH - deltaY));
            newY = resizeStart.initialY + (resizeStart.initialH - possibleH);
            newH = possibleH;
          }

          // Preserve Aspect Ratio when Shift is held
          if (e.shiftKey && resizeStart.aspectRatio) {
            if (resizeHandle === 'se' || resizeHandle === 'nw' || resizeHandle === 'ne' || resizeHandle === 'sw') {
              newH = Math.round(newW / resizeStart.aspectRatio);
            }
          }

          return {
            ...prev,
            [resizingId]: {
              ...el,
              x: newX,
              y: newY,
              width: newW,
              height: newH,
            },
          };
        });
        return;
      }

      // 4. Rotate Element
      if (rotatingId && rotateStart) {
        const deltaX = e.clientX - rotateStart.centerX;
        const deltaY = e.clientY - rotateStart.centerY;
        let deg = Math.round((Math.atan2(deltaY, deltaX) * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        if (deg >= 360) deg -= 360;

        // Holding Shift snaps to 15-degree increments
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
          if (deg === 360) deg = 0;
        }

        setCurrentRotationAngle(deg);
        setElements((prev) => {
          const el = prev[rotatingId];
          if (!el) return prev;
          return {
            ...prev,
            [rotatingId]: {
              ...el,
              rotation: deg,
            },
          };
        });
        return;
      }

      // 5. Drawing Preview
      if (drawingState) {
        const artboardEl = document.getElementById(
          devicePreview === 'desktop' ? 'artboard-desktop-1440' : 'artboard-mobile-view'
        );
        if (artboardEl) {
          const rect = artboardEl.getBoundingClientRect();
          const currX = Math.round((e.clientX - rect.left) / zoom);
          const currY = Math.round((e.clientY - rect.top) / zoom);
          setDrawingState((prev) => (prev ? { ...prev, currentX: currX, currentY: currY } : null));
        }
      }
    };

    const handleMouseUp = () => {
      if (isPanning) setIsPanning(false);

      if (draggingId) {
        setDraggingId(null);
        setDragStart(null);
        setSnapGuideX(null);
        setSnapGuideY(null);
        if (onUpdateElementWithHistory) {
          onUpdateElementWithHistory(elements);
        }
      }

      if (resizingId) {
        setResizingId(null);
        setResizeHandle(null);
        setResizeStart(null);
        if (onUpdateElementWithHistory) {
          onUpdateElementWithHistory(elements);
        }
      }

      if (rotatingId) {
        setRotatingId(null);
        setRotateStart(null);
        setCurrentRotationAngle(null);
        if (onUpdateElementWithHistory) {
          onUpdateElementWithHistory(elements);
        }
      }

      // Finish drawing new element
      if (drawingState) {
        const left = Math.min(drawingState.startX, drawingState.currentX);
        const top = Math.min(drawingState.startY, drawingState.currentY);
        let width = Math.abs(drawingState.currentX - drawingState.startX);
        let height = Math.abs(drawingState.currentY - drawingState.startY);

        // If user just clicked without dragging, use sleek default dimensions
        if (width < 12 && height < 12) {
          width = drawingState.tool === 'pen' ? 140 : 240;
          height = drawingState.tool === 'pen' ? 90 : 160;
        }

        const timestamp = Date.now();
        const parentTarget = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';
        let newEl: CanvasElement;

        if (drawingState.tool === 'rect') {
          newEl = {
            id: `rect_${timestamp}`,
            name: 'Rectangle',
            type: 'rectangle',
            x: left,
            y: top,
            width,
            height,
            rotation: 0,
            borderRadius: 8,
            fill: '#0d99ff',
            fillOpacity: 100,
            stroke: '#3f4753',
            strokeWidth: 1,
            shadowBlur: 14,
            shadowY: 4,
            shadowSpread: 0,
            visible: true,
            locked: false,
            parentId: parentTarget,
          };
        } else if (drawingState.tool === 'frame') {
          newEl = {
            id: `frame_${timestamp}`,
            name: 'Frame Container',
            type: 'frame',
            x: left,
            y: top,
            width,
            height,
            rotation: 0,
            borderRadius: 12,
            fill: '#1c1b1b',
            fillOpacity: 100,
            stroke: '#353534',
            strokeWidth: 1,
            shadowBlur: 14,
            shadowY: 4,
            shadowSpread: 0,
            visible: true,
            locked: false,
            parentId: parentTarget,
          };
        } else {
          // Pen tool -> Vector Shape
          newEl = {
            id: `shape_${timestamp}`,
            name: 'Vector Path',
            type: 'shape',
            x: left,
            y: top,
            width,
            height,
            rotation: 0,
            borderRadius: 12,
            fill: '#6001d1',
            fillOpacity: 100,
            stroke: '#9fcaff',
            strokeWidth: 2,
            shadowBlur: 12,
            shadowY: 4,
            shadowSpread: 0,
            visible: true,
            locked: false,
            variant: 'diamond',
            parentId: parentTarget,
          };
        }

        const updated = { ...elements, [newEl.id]: newEl };
        setElements(updated);
        if (onUpdateElementWithHistory) onUpdateElementWithHistory(updated);
        setSelectedElementId(newEl.id);
        setDrawingState(null);
        if (setCurrentTool) setCurrentTool('move');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isPanning,
    startPan,
    draggingId,
    dragStart,
    resizingId,
    resizeStart,
    resizeHandle,
    rotatingId,
    rotateStart,
    drawingState,
    zoom,
    elements,
    devicePreview,
    onUpdateElementWithHistory,
    setElements,
    setSelectedElementId,
    setCurrentTool,
  ]);

  // Artboard mouse down for tool operations
  const handleArtboardMouseDown = (e: React.MouseEvent) => {
    // Only intercept if a creation tool is active
    if (currentTool === 'text') {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = Math.round((e.clientX - rect.left) / zoom);
      const clickY = Math.round((e.clientY - rect.top) / zoom);

      const newId = `text_${Date.now()}`;
      const newEl: CanvasElement = {
        id: newId,
        name: 'Text Layer',
        type: 'text',
        x: clickX,
        y: clickY,
        width: 300,
        height: 52,
        rotation: 0,
        borderRadius: 0,
        fill: '#e5e2e1',
        fillOpacity: 100,
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 0,
        shadowY: 0,
        shadowSpread: 0,
        visible: true,
        locked: false,
        parentId: devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view',
        textContent: 'Double click to edit text',
        textColor: '#e5e2e1',
        fontSize: 22,
      };

      const updated = { ...elements, [newId]: newEl };
      setElements(updated);
      if (onUpdateElementWithHistory) onUpdateElementWithHistory(updated);
      setSelectedElementId(newId);
      setEditingTextId(newId);
      if (setCurrentTool) setCurrentTool('move');
      return;
    }

    if (currentTool === 'rect' || currentTool === 'frame' || currentTool === 'pen') {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = Math.round((e.clientX - rect.left) / zoom);
      const clickY = Math.round((e.clientY - rect.top) / zoom);

      setDrawingState({
        startX: clickX,
        startY: clickY,
        currentX: clickX,
        currentY: clickY,
        tool: currentTool,
      });
      return;
    }

    if (currentTool === 'comment') {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = Math.round((e.clientX - rect.left) / zoom);
      const clickY = Math.round((e.clientY - rect.top) / zoom);

      const newC: CanvasComment = {
        id: `c_${Date.now()}`,
        author: 'Alex Creator',
        initials: 'YOU',
        avatarColor: '#9fcaff',
        text: 'Add note here...',
        x: clickX,
        y: clickY,
        timestamp: 'Just now',
        resolved: false,
      };
      setComments((prev) => [...prev, newC]);
      setActiveCommentId(newC.id);
      if (setCurrentTool) setCurrentTool('move');
    }
  };

  // Start dragging an element
  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    setSelectedElementId(el.id);

    if (el.locked || currentTool === 'hand' || currentTool !== 'move') return;

    setDraggingId(el.id);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: el.x,
      initialY: el.y,
    });
  };

  // Start resizing an element
  const handleResizeHandleMouseDown = (
    e: React.MouseEvent,
    el: CanvasElement,
    handle: string
  ) => {
    e.stopPropagation();
    if (el.locked) return;

    setResizingId(el.id);
    setResizeHandle(handle);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialW: el.width,
      initialH: el.height,
      initialX: el.x,
      initialY: el.y,
      aspectRatio: el.width / (el.height || 1),
    });
  };

  // Start rotating an element
  const handleRotateHandleMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    if (el.locked) return;

    const domEl = document.getElementById(`canvas-el-${el.id}`);
    if (domEl) {
      const r = domEl.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      const centerY = r.top + r.height / 2;

      setRotatingId(el.id);
      setRotateStart({
        centerX,
        centerY,
        initialRotation: el.rotation || 0,
      });
      setCurrentRotationAngle(el.rotation || 0);
      return;
    }

    const artboardEl = document.getElementById(
      devicePreview === 'desktop' ? 'artboard-desktop-1440' : 'artboard-mobile-view'
    );
    if (!artboardEl) return;
    const rect = artboardEl.getBoundingClientRect();
    const centerX = rect.left + (el.x + el.width / 2) * zoom;
    const centerY = rect.top + (el.y + el.height / 2) * zoom;

    setRotatingId(el.id);
    setRotateStart({
      centerX,
      centerY,
      initialRotation: el.rotation || 0,
    });
    setCurrentRotationAngle(el.rotation || 0);
  };

  // Get active artboard elements
  const artboardId = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';
  const artboardElement = elements[artboardId];
  const artboardWidth = artboardElement?.width || (devicePreview === 'desktop' ? 1440 : 390);
  const artboardHeight = artboardElement?.height || (devicePreview === 'desktop' ? 900 : 844);

  const artboardChildren = (Object.values(elements) as CanvasElement[]).filter(
    (el) => el.parentId === artboardId && el.id !== artboardId && el.id !== 'hero-bg'
  );

  // Render individual element content based on its type
  const renderElementContent = (el: CanvasElement) => {
    // 1. Navigation Header Frame
    if (el.id === 'navbar-frame' || el.name.toLowerCase().includes('nav')) {
      return (
        <div className="w-full h-full flex items-center justify-between px-8 text-[#e5e2e1] select-none">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0d99ff] to-[#005299] flex items-center justify-center font-black text-white text-xs shadow-md border border-[#9fcaff]/30">
              Z
            </div>
            <span className="font-bold text-sm tracking-tight text-[#e5e2e1]">
              ZLAB
            </span>
          </div>
          <div className="flex items-center gap-7 text-xs text-[#bfc7d5]">
            <span className="text-[#e5e2e1] font-semibold cursor-pointer">Overview</span>
            <span className="hover:text-[#e5e2e1] cursor-pointer">Features</span>
            <span className="hover:text-[#e5e2e1] cursor-pointer">Workflows</span>
            <span className="hover:text-[#e5e2e1] cursor-pointer">Pricing</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-[#bfc7d5] hover:text-[#e5e2e1] px-3 py-1.5 font-medium">
              Sign In
            </button>
            <button className="bg-[#9fcaff] text-[#003259] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#0d99ff] transition-colors shadow">
              Get Started
            </button>
          </div>
        </div>
      );
    }

    // Mobile Navigation Bar
    if (el.id === 'mobile-nav-bar') {
      return (
        <div className="w-full h-full flex items-center justify-between px-3 text-[#e5e2e1] select-none bg-[#1c1b1b] rounded-xl border border-[#353534]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0d99ff] to-[#005299] flex items-center justify-center font-black text-white text-[11px] shadow border border-[#9fcaff]/30">
              Z
            </div>
            <span className="font-bold text-xs tracking-tight text-[#e5e2e1]">
              ZLab
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#201f1f] border border-[#353534] text-[#9fcaff] px-2 py-0.5 rounded-full font-medium">
              iOS 18
            </span>
          </div>
        </div>
      );
    }

    // Mobile Bottom Tab Bar
    if (el.id === 'mobile-tab-bar') {
      return (
        <div className="w-full h-full flex items-center justify-around px-2 text-[#89919e] select-none bg-[#1c1b1b]/95 backdrop-blur-md rounded-2xl border border-[#353534]">
          <div className="flex flex-col items-center text-[#9fcaff] cursor-pointer">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">Design</span>
          </div>
          <div className="flex flex-col items-center hover:text-[#e5e2e1] cursor-pointer">
            <Layers className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">Layers</span>
          </div>
          <div className="flex flex-col items-center hover:text-[#e5e2e1] cursor-pointer">
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">Assets</span>
          </div>
          <div className="flex flex-col items-center hover:text-[#e5e2e1] cursor-pointer">
            <Sliders className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">Inspect</span>
          </div>
        </div>
      );
    }

    // Mobile Feature Card
    if (el.id === 'mobile-feature-card') {
      return (
        <div className="w-full h-full p-4 flex flex-col justify-between select-none bg-[#1c1b1b] rounded-2xl border border-[#2a2a2a] hover:border-[#353534] transition-colors">
          <div>
            <div className="w-8 h-8 rounded-lg bg-[#0d99ff]/15 text-[#9fcaff] flex items-center justify-center mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#e5e2e1] mb-1">Tactile Prototypes</h3>
            <p className="text-[11px] text-[#bfc7d5] leading-relaxed">
              Design mobile screens with fluid smart animations and full gesture support.
            </p>
          </div>
          <div className="text-[10px] text-[#9fcaff] font-mono flex items-center gap-1 font-semibold mt-2">
            <span>HIG Compliant</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      );
    }

    // 2. Feature Cards Grid Container
    if (el.id === 'feature-grid-container' || el.type === 'grid') {
      return (
        <div className="w-full h-full p-6 grid grid-cols-3 gap-6 select-none">
          {/* Card 1 */}
          <div className="bg-[#141416]/90 p-5 rounded-xl border border-[#2a2a2a] hover:border-[#353534] transition-colors flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#0d99ff]/15 text-[#9fcaff] flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#e5e2e1] mb-1">Lightning Fast Engine</h3>
              <p className="text-xs text-[#bfc7d5] leading-relaxed">
                GPU-accelerated vector rendering engine operating at 120fps with sub-millisecond layer transform latency.
              </p>
            </div>
            <div className="text-[10px] text-[#9fcaff] font-mono mt-3 flex items-center gap-1 font-semibold">
              <span>WebGPU v2.4</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#141416]/90 p-5 rounded-xl border border-[#2a2a2a] hover:border-[#353534] transition-colors flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#6001d1]/20 text-[#d2bbff] flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#e5e2e1] mb-1">Adaptive Layer Tree</h3>
              <p className="text-xs text-[#bfc7d5] leading-relaxed">
                Smart auto-layout with nested constraints, responsive flex alignments, and component variants.
              </p>
            </div>
            <div className="text-[10px] text-[#d2bbff] font-mono mt-3 flex items-center gap-1 font-semibold">
              <span>Dynamic Flex</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#141416]/90 p-5 rounded-xl border border-[#2a2a2a] hover:border-[#353534] transition-colors flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#064e3b]/30 text-[#34d399] flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#e5e2e1] mb-1">Multiplayer Sync</h3>
              <p className="text-xs text-[#bfc7d5] leading-relaxed">
                Collaborate in real time with synchronized cursors, smart threaded annotations, and versioning.
              </p>
            </div>
            <div className="text-[10px] text-[#34d399] font-mono mt-3 flex items-center gap-1 font-semibold">
              <span>P2P CRDT</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      );
    }

    // 3. Text Layer (with Inline Direct Editing)
    if (el.type === 'text') {
      if (editingTextId === el.id) {
        return (
          <textarea
            autoFocus
            value={el.textContent || ''}
            onChange={(e) => {
              const val = e.target.value;
              setElements((prev) => ({
                ...prev,
                [el.id]: { ...prev[el.id], textContent: val },
              }));
            }}
            onBlur={() => {
              setEditingTextId(null);
              if (onUpdateElementWithHistory) onUpdateElementWithHistory(elements);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditingTextId(null);
              }
            }}
            style={{
              fontSize: `${el.fontSize || 18}px`,
              color: el.textColor || el.fill || '#e5e2e1',
              fontWeight: el.id === 'main-hero-title' ? 700 : 400,
            }}
            className="w-full h-full bg-transparent border-0 outline-none resize-none p-0 m-0 leading-tight"
          />
        );
      }

      return (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingTextId(el.id);
          }}
          style={{
            color: el.textColor || el.fill || '#e5e2e1',
            fontSize: `${el.fontSize || 18}px`,
            opacity: (el.fillOpacity ?? 100) / 100,
            fontWeight: el.id === 'main-hero-title' ? 700 : 400,
            textAlign: (el.textAlign as any) || (el.id === 'main-hero-title' || el.id === 'hero-subtitle' ? 'center' : 'left'),
          }}
          className="w-full h-full flex flex-col justify-center select-none leading-tight"
          title="Double click to edit text"
        >
          <span>{el.textContent || el.name}</span>
        </div>
      );
    }

    // 4. Buttons
    if (el.type === 'button') {
      const isGlass = el.glassEffect && el.glassEffect !== 'none' || el.materialPreset === 'glass' || el.variant === 'liquid-glass-btn';
      const isM3Fab = el.variant === 'm3-fab';

      return (
        <button
          style={{
            backgroundColor: el.fill,
            color: el.textColor || (el.materialPreset === 'm3' ? '#381e72' : '#ffffff'),
            borderRadius: `${el.borderRadius ?? (isM3Fab ? 16 : 8)}px`,
            border:
              el.stroke && el.stroke !== 'none'
                ? `${el.strokeWidth ?? 1}px solid ${el.stroke}`
                : isGlass
                ? '1px solid rgba(255,255,255,0.25)'
                : 'none',
            boxShadow: el.shadowBlur
              ? `0px ${el.shadowY ?? 4}px ${el.shadowBlur}px rgba(0,0,0,0.35)`
              : 'none',
            opacity: (el.fillOpacity ?? 100) / 100,
            fontSize: `${el.fontSize || (isM3Fab ? 22 : 13)}px`,
            backdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlass ? 'blur(16px)' : undefined,
            WebkitBackdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlass ? 'blur(16px)' : undefined,
          }}
          className={`w-full h-full flex items-center justify-center font-bold px-4 transition-transform select-none gap-2 shadow relative overflow-hidden ${
            el.materialPreset === 'ios' ? 'tracking-tight font-semibold' : ''
          }`}
        >
          {isGlass && (
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          )}
          {el.iconName && <DynamicIcon name={el.iconName} className="w-4 h-4 shrink-0" />}
          <span>{el.textContent || el.name}</span>
          {el.variant === 'pill' && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
        </button>
      );
    }

    // 5. Badges / Pills / Chips
    if (el.type === 'badge') {
      const isM3Chip = el.variant === 'm3-chip' || el.materialPreset === 'm3';
      return (
        <div
          style={{
            backgroundColor: el.fill,
            color: el.textColor || '#d2bbff',
            borderRadius: `${el.borderRadius ?? (isM3Chip ? 8 : 16)}px`,
            border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? '#353534'}`,
            fontSize: `${el.fontSize || 11}px`,
            boxShadow: el.shadowBlur ? `0px ${el.shadowY ?? 2}px ${el.shadowBlur}px rgba(0,0,0,0.25)` : undefined,
          }}
          className="w-full h-full flex items-center justify-center font-semibold px-3 py-1 gap-1.5 shadow-sm select-none"
        >
          {el.iconName && <DynamicIcon name={el.iconName} className="w-3.5 h-3.5 shrink-0" />}
          <span>{el.textContent || el.name}</span>
        </div>
      );
    }

    // 6. Cards & Surfaces
    if (el.type === 'card') {
      const isGlass = el.glassEffect && el.glassEffect !== 'none' || el.materialPreset === 'glass' || el.variant?.includes('glass');
      const isIos = el.materialPreset === 'ios' || el.variant?.includes('ios');
      const isM3 = el.materialPreset === 'm3' || el.variant?.includes('m3');

      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? (isIos ? 22 : isM3 ? 16 : 12)}px`,
            border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? '#353534'}`,
            boxShadow: `0px ${el.shadowY ?? 4}px ${el.shadowBlur ?? 14}px rgba(0,0,0,0.35)`,
            opacity: (el.fillOpacity ?? 100) / 100,
            backdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlass ? 'blur(20px)' : isIos ? 'blur(20px)' : undefined,
            WebkitBackdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlass ? 'blur(20px)' : isIos ? 'blur(20px)' : undefined,
          }}
          className="w-full h-full p-4 flex flex-col justify-between text-left overflow-hidden select-none relative"
        >
          {isGlass && (
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          )}

          <div className="flex items-center justify-between mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isM3
                  ? 'bg-[#d0bcff]/20 text-[#d0bcff]'
                  : isIos
                  ? 'bg-[#007aff]/20 text-[#007aff]'
                  : 'bg-[#2a2a2a] text-[#9fcaff]'
              }`}
            >
              <DynamicIcon name={el.iconName || (isGlass ? 'Sparkles' : 'Zap')} className="w-4 h-4" />
            </div>
            {isM3 && (
              <span className="text-[9px] bg-[#4a4458] text-[#e8def8] px-2 py-0.5 rounded-full font-mono">
                Material 3
              </span>
            )}
            {isIos && (
              <span className="text-[9px] bg-[#007aff]/20 text-[#9fcaff] px-2 py-0.5 rounded-full font-mono">
                iOS Vibrancy
              </span>
            )}
            {isGlass && (
              <span className="text-[9px] bg-[#9fcaff]/20 text-[#9fcaff] px-2 py-0.5 rounded-full font-mono">
                Frosted Glass
              </span>
            )}
            {el.variant === 'stat' && (
              <span className="text-[10px] bg-[#064e3b] text-[#34d399] px-2 py-0.5 rounded-full font-mono font-medium">
                +24.6%
              </span>
            )}
            {el.variant === 'pricing' && (
              <span className="text-[10px] bg-[#6001d1] text-[#c9aeff] px-2 py-0.5 rounded-full font-mono">
                Popular
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              style={{
                color: el.textColor || '#e5e2e1',
                fontSize: `${el.fontSize || 14}px`,
              }}
              className="font-bold tracking-tight truncate"
            >
              {el.textContent || el.name}
            </h4>
            {el.subText && (
              <p className="text-[11px] text-[#bfc7d5] mt-1 line-clamp-2 leading-relaxed">
                {el.subText}
              </p>
            )}
          </div>
        </div>
      );
    }

    // 7. Inputs
    if (el.type === 'input') {
      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? 8}px`,
            border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? '#353534'}`,
            boxShadow: `0px ${el.shadowY ?? 2}px ${el.shadowBlur ?? 8}px rgba(0,0,0,0.2)`,
          }}
          className="w-full h-full px-3 py-2 flex items-center justify-between text-xs overflow-hidden select-none"
        >
          <div className="flex items-center gap-2 truncate">
            <DynamicIcon name={el.iconName || 'Search'} className="w-3.5 h-3.5 text-[#89919e] shrink-0" />
            <span className="text-[#89919e] truncate">{el.textContent || 'Search components...'}</span>
          </div>
          {el.variant === 'toggle' && (
            <div className="w-9 h-5 rounded-full bg-[#0d99ff] p-0.5 flex items-center justify-end">
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </div>
          )}
        </div>
      );
    }

    // 8. Geometric Shapes
    if (el.type === 'shape') {
      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? 8}px`,
            border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? '#353534'}`,
            boxShadow: `0px ${el.shadowY ?? 4}px ${el.shadowBlur ?? 12}px rgba(0,0,0,0.3)`,
            transform:
              el.variant === 'diamond'
                ? 'rotate(45deg)'
                : undefined,
          }}
          className="w-full h-full flex items-center justify-center select-none"
        >
          {el.variant === 'star' && <Sparkles className="w-10 h-10 text-[#fbbf24]" />}
        </div>
      );
    }

    // 8.5 Generic System Components (M3, iOS, Glass Docks, Segments)
    if (el.type === 'component') {
      const isGlass = el.glassEffect && el.glassEffect !== 'none' || el.materialPreset === 'glass' || el.variant?.includes('glass');
      const isIos = el.materialPreset === 'ios' || el.variant?.includes('ios');

      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? 8}px`,
            border:
              el.stroke && el.stroke !== 'none'
                ? `${el.strokeWidth ?? 1}px solid ${el.stroke}`
                : isGlass
                ? '1px solid rgba(255,255,255,0.18)'
                : 'none',
            boxShadow: el.shadowBlur
              ? `0px ${el.shadowY ?? 4}px ${el.shadowBlur}px rgba(0,0,0,0.3)`
              : 'none',
            opacity: (el.fillOpacity ?? 100) / 100,
            backdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlass ? 'blur(20px)' : isIos ? 'blur(20px)' : undefined,
            WebkitBackdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlass ? 'blur(20px)' : isIos ? 'blur(20px)' : undefined,
          }}
          className="w-full h-full flex items-center justify-center px-3 py-2 text-xs relative overflow-hidden select-none"
        >
          {isGlass && (
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          )}
          {el.variant === 'ios-segmented' ? (
            <div className="flex items-center gap-1 w-full justify-around">
              <span className="px-3 py-1 rounded-md bg-[#636366] text-white font-medium text-[11px] shadow-sm">Day</span>
              <span className="px-3 py-1 rounded-md text-[#8e8e93] text-[11px]">Week</span>
              <span className="px-3 py-1 rounded-md text-[#8e8e93] text-[11px]">Month</span>
            </div>
          ) : el.variant === 'ios-island' ? (
            <div className="flex items-center justify-between w-full px-2 text-[10px]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#34c759] animate-pulse" />
              <span className="font-mono text-white text-[11px] font-semibold">{el.textContent || 'LIVE'}</span>
              <div className="w-2 h-2 rounded-full bg-[#007aff]" />
            </div>
          ) : el.variant === 'm3-switch' ? (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-[#e6e0e9] font-medium text-xs truncate">{el.textContent || 'M3 Switch'}</span>
              <div className="w-11 h-6 rounded-full bg-[#d0bcff] p-0.5 flex items-center justify-end shadow-inner">
                <div className="w-5 h-5 rounded-full bg-[#381e72] flex items-center justify-center text-white text-[10px] shadow">
                  ✓
                </div>
              </div>
            </div>
          ) : el.variant === 'ios-switch' ? (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-white font-medium text-xs truncate">{el.textContent || 'iOS Switch'}</span>
              <div className="w-11 h-6 rounded-full bg-[#34c759] p-0.5 flex items-center justify-end shadow-inner">
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </div>
            </div>
          ) : el.variant === 'm3-slider' ? (
            <div className="flex flex-col gap-1 w-full px-2">
              <div className="flex justify-between text-[10px] text-[#cac4d0]">
                <span>{el.textContent || 'Intensity'}</span>
                <span>80%</span>
              </div>
              <div className="w-full h-3 bg-[#4a4458] rounded-full relative flex items-center px-1">
                <div className="w-[80%] h-full bg-[#d0bcff] rounded-full absolute left-0 top-0" />
                <div className="w-4 h-4 rounded-full bg-[#381e72] border-2 border-[#d0bcff] relative z-10 shadow" />
              </div>
            </div>
          ) : el.variant === 'ios-slider' ? (
            <div className="flex flex-col gap-1 w-full px-2">
              <div className="flex justify-between text-[10px] text-[#8e8e93]">
                <span>{el.textContent || 'Brightness'}</span>
                <span>75%</span>
              </div>
              <div className="w-full h-2.5 bg-[#3a3a3c] rounded-full relative overflow-hidden flex items-center">
                <div className="w-[75%] h-full bg-white rounded-full absolute left-0 top-0" />
              </div>
            </div>
          ) : el.variant === 'ios-stepper' ? (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-white text-xs truncate">{el.textContent?.split('[')[0] || 'Value'}</span>
              <div className="flex items-center bg-[#2c2c2e] rounded-lg border border-[#3a3a3c] overflow-hidden text-xs">
                <span className="px-2.5 py-1 text-white hover:bg-[#3a3a3c] border-r border-[#3a3a3c] font-bold">−</span>
                <span className="px-2.5 py-1 text-white hover:bg-[#3a3a3c] font-bold">+</span>
              </div>
            </div>
          ) : el.variant === 'ios-row' ? (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-white text-xs truncate">{el.textContent?.replace('›', '') || 'Option'}</span>
              <span className="text-[#8e8e93] text-sm font-semibold">›</span>
            </div>
          ) : el.variant === 'm3-list' ? (
            <div className="flex flex-col justify-center w-full px-2 text-left">
              <span className="text-[#e6e0e9] font-medium text-xs truncate">{el.textContent}</span>
              {el.subText && <span className="text-[#938f99] text-[10px] truncate">{el.subText}</span>}
            </div>
          ) : el.variant === 'm3-appbar' ? (
            <div className="flex items-center justify-between w-full px-3">
              <span className="text-[#e6e0e9] text-base font-semibold">←</span>
              <span className="text-[#e6e0e9] text-xs font-medium truncate">{el.textContent?.replace(/[←•⋮]/g, '').trim()}</span>
              <span className="text-[#e6e0e9] text-base font-bold">⋮</span>
            </div>
          ) : el.variant === 'ios-navbar' ? (
            <div className="flex flex-col justify-center w-full px-3 text-left">
              <span className="text-[#007aff] text-xs font-normal">‹ Back</span>
              <span className="text-white text-sm font-bold tracking-tight">Settings</span>
            </div>
          ) : el.variant === 'm3-nav' ? (
            <div className="flex items-center justify-around w-full px-2 text-[11px] text-[#cac4d0]">
              <div className="flex flex-col items-center">
                <span className="px-3 py-0.5 rounded-full bg-[#4a4458] text-[#d0bcff] font-semibold">★ Home</span>
              </div>
              <span>Explore</span>
              <span>Library</span>
              <span>Tokens</span>
              <span>Settings</span>
            </div>
          ) : el.variant === 'ios-tabbar' ? (
            <div className="flex items-center justify-around w-full px-2 text-[11px] text-[#8e8e93]">
              <span className="text-[#007aff] font-medium">✦ Today</span>
              <span>★ Games</span>
              <span>📦 Apps</span>
              <span>🕹 Arcade</span>
              <span>🔍 Search</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 truncate">
              {el.iconName && <DynamicIcon name={el.iconName} className="w-4 h-4 shrink-0" />}
              <span style={{ color: el.textColor || '#bfc7d5', fontSize: `${el.fontSize || 12}px` }}>
                {el.textContent || el.name}
              </span>
            </div>
          )}
        </div>
      );
    }

    // 9. Frame Containers / Rectangles
    const isGlassFrame = el.glassEffect && el.glassEffect !== 'none' || el.materialPreset === 'glass';
    return (
      <div
        style={{
          backgroundColor: el.fill,
          borderRadius: `${el.borderRadius ?? 8}px`,
          border:
            el.stroke && el.stroke !== 'none'
              ? `${el.strokeWidth ?? 1}px solid ${el.stroke}`
              : isGlassFrame
              ? '1px solid rgba(255,255,255,0.18)'
              : 'none',
          boxShadow: el.shadowBlur
            ? `0px ${el.shadowY ?? 4}px ${el.shadowBlur}px rgba(0,0,0,0.3)`
            : 'none',
          opacity: (el.fillOpacity ?? 100) / 100,
          backdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlassFrame ? 'blur(20px)' : undefined,
          WebkitBackdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : isGlassFrame ? 'blur(20px)' : undefined,
        }}
        className="w-full h-full relative select-none overflow-hidden"
      >
        {isGlassFrame && (
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        )}
      </div>
    );
  };

  // Reusable interactive artboard child element renderer
  const renderArtboardItem = (el: CanvasElement) => {
    const isSelected = selectedElementId === el.id;
    if (el.visible === false) return null;

    return (
      <div
        key={el.id}
        id={`canvas-el-${el.id}`}
        onMouseDown={(e) => handleElementMouseDown(e, el)}
        style={{
          position: 'absolute',
          left: `${el.x}px`,
          top: `${el.y}px`,
          width: `${el.width}px`,
          height: `${el.height}px`,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          zIndex: isSelected ? 40 : 20,
        }}
        className={`group transition-shadow select-none ${
          el.locked ? 'cursor-not-allowed' : 'cursor-move'
        } ${
          isSelected
            ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#131313]'
            : 'hover:ring-1 hover:ring-[#0d99ff]/60'
        }`}
      >
        {/* Element Inner Content */}
        {renderElementContent(el)}

        {/* SELECTION CONTROLS, 8 HANDLES, ROTATION HANDLE, TOOLBAR */}
        {isSelected && (
          <>
            {/* Top Stem & Rotation Handle */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-50">
              <div
                onMouseDown={(e) => handleRotateHandleMouseDown(e, el)}
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
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 'nw')}
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 'ne')}
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 'sw')}
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 'se')}
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#0d99ff] cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            />

            {/* 4 Edge Midpoint Handles */}
            <div
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 'n')}
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-[#131313] border border-[#0d99ff] cursor-ns-resize z-50"
            />
            <div
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 's')}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-[#131313] border border-[#0d99ff] cursor-ns-resize z-50"
            />
            <div
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 'e')}
              className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2.5 bg-[#131313] border border-[#0d99ff] cursor-ew-resize z-50"
            />
            <div
              onMouseDown={(e) => handleResizeHandleMouseDown(e, el, 'w')}
              className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2.5 bg-[#131313] border border-[#0d99ff] cursor-ew-resize z-50"
            />

            {/* Dimensions & Name Pill */}
            <div className="absolute -bottom-6 left-0 bg-[#0d99ff] text-[#002f55] text-[9px] font-mono px-2 py-0.5 rounded font-bold shadow flex items-center gap-1.5 z-50 whitespace-nowrap">
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
                  onClick={() => {
                    const updated = {
                      ...elements,
                      [el.id]: { ...el, locked: false, fixed: false, pinned: false },
                    };
                    setElements(updated);
                    if (onUpdateElementWithHistory) onUpdateElementWithHistory(updated);
                  }}
                  className="px-1.5 py-0.5 rounded bg-[#0d99ff]/20 hover:bg-[#0d99ff]/40 text-[#9fcaff] text-[10px] font-bold transition-colors flex items-center gap-1 mr-0.5"
                  title="Unfix position and unlock element controls"
                >
                  <Unlock className="w-2.5 h-2.5" />
                  <span>Unfix</span>
                </button>
              )}

              {/* Pin / Fix Position Toggle */}
              <button
                onClick={() => {
                  const updated = {
                    ...elements,
                    [el.id]: { ...el, fixed: !el.fixed, pinned: !el.fixed },
                  };
                  setElements(updated);
                  if (onUpdateElementWithHistory) onUpdateElementWithHistory(updated);
                }}
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
                onClick={() => {
                  const updated = {
                    ...elements,
                    [el.id]: { ...el, locked: !el.locked },
                  };
                  setElements(updated);
                  if (onUpdateElementWithHistory) onUpdateElementWithHistory(updated);
                }}
                className={`p-1 rounded transition-colors ${
                  el.locked
                    ? 'text-[#f59e0b] bg-[#f59e0b]/20'
                    : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
                }`}
                title={el.locked ? 'Unlock element' : 'Lock element'}
              >
                {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>

              {onDuplicateElement && (
                <button
                  onClick={() => onDuplicateElement(el.id)}
                  className="p-1 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
                  title="Duplicate (⌘D)"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}

              {onDeleteElement && (
                <button
                  onClick={() => onDeleteElement(el.id)}
                  className="p-1 rounded text-[#89919e] hover:text-[#ffb4ab] hover:bg-[#2a2a2a] transition-colors"
                  title="Delete element (Del)"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Drag-drop handlers for dropping library components onto the artboard
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('application/zlab-element');
      if (!raw) return;
      const partial: Partial<CanvasElement> = JSON.parse(raw);
      const artboardEl = document.getElementById(
        devicePreview === 'desktop' ? 'artboard-desktop-1440' : 'artboard-mobile-view'
      );
      if (!artboardEl) return;
      const rect = artboardEl.getBoundingClientRect();
      const dropX = Math.round((e.clientX - rect.left) / zoom);
      const dropY = Math.round((e.clientY - rect.top) / zoom);
      const timestamp = Date.now();
      const dropParentId = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';
      const newEl: CanvasElement = {
        // Defaults
        rotation: 0,
        shadowSpread: 0,
        visible: true,
        locked: false,
        // Partial overrides (component props)
        ...partial,
        // Forced overrides after spread
        id: `dropped_${partial.type || 'el'}_${timestamp}`,
        name: partial.name || 'Component',
        type: (partial.type || 'rectangle') as CanvasElement['type'],
        x: dropX,
        y: dropY,
        width: partial.width || 200,
        height: partial.height || 48,
        borderRadius: partial.borderRadius ?? 8,
        fill: partial.fill || '#0d99ff',
        fillOpacity: partial.fillOpacity ?? 100,
        stroke: partial.stroke || 'none',
        strokeWidth: partial.strokeWidth || 1,
        shadowBlur: partial.shadowBlur || 0,
        shadowY: partial.shadowY || 0,
        parentId: dropParentId,
      };
      if (onDropElement) {
        onDropElement(newEl);
      } else {
        const updated = { ...elements, [newEl.id]: newEl };
        setElements(updated);
        if (onUpdateElementWithHistory) onUpdateElementWithHistory(updated);
        setSelectedElementId(newEl.id);
      }
    } catch {
      // ignore invalid drop data
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-full h-full relative overflow-hidden select-none ${
        currentTool === 'hand' || isPanning
          ? 'cursor-grab active:cursor-grabbing'
          : currentTool === 'text'
          ? 'cursor-text'
          : currentTool === 'rect' || currentTool === 'frame' || currentTool === 'pen' || currentTool === 'comment'
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
      style={{
        backgroundColor: '#0c0c0e',
        backgroundImage: `radial-gradient(circle, #252528 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoom / Tool Badge Indicator in Top Left */}
      <div className="absolute top-4 left-4 bg-[#141416]/90 border border-[#353534]/60 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#89919e] z-30 pointer-events-none flex items-center gap-2 shadow-lg backdrop-blur">
        <span>{Math.round(zoom * 100)}%</span>
        <span>•</span>
        <span className="text-[#9fcaff] capitalize">{currentTool} Tool</span>
        {showGrid && <span className="text-[#34d399]">[Grid]</span>}
      </div>

      {/* Bottom-right: Scale Slider + Grid Toggle */}
      <div className="absolute bottom-10 right-5 z-30 flex items-center gap-2">
        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          title="Toggle grid lines"
          className={`p-1.5 rounded-lg border text-[11px] font-medium transition-all shadow ${
            showGrid
              ? 'bg-[#34d399]/20 border-[#34d399]/50 text-[#34d399]'
              : 'bg-[#141416]/90 border-[#353534]/60 text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>

        {/* Zoom out */}
        <button
          onClick={() => setZoom?.((z) => Math.max(0.1, Math.round((z - 0.1) * 10) / 10))}
          className="w-6 h-6 bg-[#141416]/90 border border-[#353534]/60 rounded text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/60 transition-all flex items-center justify-center text-sm font-bold shadow"
        >−</button>

        {/* Zoom Slider */}
        <input
          type="range"
          min={10}
          max={300}
          step={5}
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom?.(Number(e.target.value) / 100)}
          className="w-28 h-1.5 accent-[#0d99ff] cursor-pointer"
          title={`Zoom: ${Math.round(zoom * 100)}%`}
        />

        {/* Zoom in */}
        <button
          onClick={() => setZoom?.((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))}
          className="w-6 h-6 bg-[#141416]/90 border border-[#353534]/60 rounded text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/60 transition-all flex items-center justify-center text-sm font-bold shadow"
        >+</button>

        {/* Zoom label */}
        <span className="text-[11px] font-mono text-[#89919e] bg-[#141416]/90 border border-[#353534]/60 px-2 py-0.5 rounded shadow min-w-[44px] text-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Main Canvas Stage */}
      <div
        id="canvas-stage-wrapper"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPanning ? 'none' : 'transform 0.08s ease-out',
        }}
        className="relative flex items-center justify-center p-24"
      >
        {/* DESKTOP 1440 ARTBOARD FRAME */}
        {devicePreview === 'desktop' ? (
          <div
            id="artboard-desktop-1440"
            onMouseDown={handleArtboardMouseDown}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElementId('desktop-1440');
            }}
            style={{
              width: `${artboardWidth}px`,
              height: `${artboardHeight}px`,
              backgroundColor: elements['desktop-1440']?.fill || '#131313',
            }}
            className="relative rounded-lg shadow-2xl overflow-hidden ring-1 ring-[#3f4753] transition-all"
          >
            {/* Desktop Artboard Selection Highlight */}
            <div
              className={`absolute inset-0 border-2 pointer-events-none z-30 transition-colors ${
                selectedElementId === 'desktop-1440' ? 'border-[#9fcaff]' : 'border-transparent'
              }`}
            >
              {selectedElementId === 'desktop-1440' && (
                <>
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#131313] border-2 border-[#9fcaff]" />
                  <div className="absolute -bottom-7 right-0 bg-[#9fcaff] text-[#003259] text-[10px] px-2 py-0.5 rounded font-mono font-bold shadow">
                    {artboardWidth} × {artboardHeight}
                  </div>
                </>
              )}
            </div>

            {/* Smart Snap Center Guidelines */}
            {snapGuideX !== null && (
              <div
                style={{ left: `${snapGuideX}px` }}
                className="absolute top-0 bottom-0 w-[1px] border-l border-dashed border-[#00f0ff] pointer-events-none z-50 shadow-[0_0_8px_#00f0ff]"
              />
            )}
            {snapGuideY !== null && (
              <div
                style={{ top: `${snapGuideY}px` }}
                className="absolute left-0 right-0 h-[1px] border-t border-dashed border-[#00f0ff] pointer-events-none z-50 shadow-[0_0_8px_#00f0ff]"
              />
            )}

            {/* Canvas Interactive Drawing Preview Box */}
            {drawingState && (
              <div
                style={{
                  left: `${Math.min(drawingState.startX, drawingState.currentX)}px`,
                  top: `${Math.min(drawingState.startY, drawingState.currentY)}px`,
                  width: `${Math.abs(drawingState.currentX - drawingState.startX)}px`,
                  height: `${Math.abs(drawingState.currentY - drawingState.startY)}px`,
                }}
                className="absolute border-2 border-dashed border-[#0d99ff] bg-[#0d99ff]/15 rounded pointer-events-none z-50"
              >
                <div className="absolute -bottom-6 left-0 bg-[#0d99ff] text-[#002f55] text-[10px] font-mono px-1.5 py-0.5 rounded font-bold whitespace-nowrap shadow">
                  {Math.abs(drawingState.currentX - drawingState.startX)} ×{' '}
                  {Math.abs(drawingState.currentY - drawingState.startY)}
                </div>
              </div>
            )}

            {/* Hero Canvas Ambient Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#9fcaff]/5 via-transparent to-transparent pointer-events-none" />

            {/* Grid Lines Overlay */}
            {showGrid && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(159,202,255,0.08)" strokeWidth="0.5"/>
                  </pattern>
                  <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#grid-small)"/>
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(159,202,255,0.18)" strokeWidth="0.8"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-large)"/>
              </svg>
            )}

            {/* UNIFIED ARTBOARD CHILD ELEMENTS (Fully draggable, resizable, rotatable) */}
            {artboardChildren.map(renderArtboardItem)}
          </div>
        ) : (
          /* MOBILE APP VIEW ARTBOARD (Fully interactive draggable, resizable elements) */
          <div
            id="artboard-mobile-view"
            onMouseDown={handleArtboardMouseDown}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElementId('mobile-app-view');
            }}
            style={{
              width: `${artboardWidth}px`,
              height: `${artboardHeight}px`,
              backgroundColor: elements['mobile-app-view']?.fill || '#131313',
            }}
            className="relative rounded-[44px] shadow-2xl overflow-hidden ring-2 ring-[#3f4753] border-4 border-[#201f1f]"
          >
            {/* Top iOS Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 pointer-events-none flex items-center justify-between px-3">
              <div className="w-2 h-2 rounded-full bg-[#1c1b1b]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#0d99ff]/30 ring-1 ring-[#0d99ff]" />
            </div>

            {/* Bottom iOS Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-40 pointer-events-none" />

            {/* Mobile Selection Highlight */}
            <div
              className={`absolute inset-0 rounded-[40px] pointer-events-none z-30 transition-colors ${
                selectedElementId === 'mobile-app-view' ? 'border-2 border-[#9fcaff]' : ''
              }`}
            />

            {/* Smart Snap Center Guidelines */}
            {snapGuideX !== null && (
              <div
                style={{ left: `${snapGuideX}px` }}
                className="absolute top-0 bottom-0 w-[1px] border-l border-dashed border-[#00f0ff] pointer-events-none z-50 shadow-[0_0_8px_#00f0ff]"
              />
            )}
            {snapGuideY !== null && (
              <div
                style={{ top: `${snapGuideY}px` }}
                className="absolute left-0 right-0 h-[1px] border-t border-dashed border-[#00f0ff] pointer-events-none z-50 shadow-[0_0_8px_#00f0ff]"
              />
            )}

            {/* Canvas Interactive Drawing Preview Box */}
            {drawingState && (
              <div
                style={{
                  left: `${Math.min(drawingState.startX, drawingState.currentX)}px`,
                  top: `${Math.min(drawingState.startY, drawingState.currentY)}px`,
                  width: `${Math.abs(drawingState.currentX - drawingState.startX)}px`,
                  height: `${Math.abs(drawingState.currentY - drawingState.startY)}px`,
                }}
                className="absolute border-2 border-dashed border-[#0d99ff] bg-[#0d99ff]/15 rounded pointer-events-none z-50"
              >
                <div className="absolute -bottom-6 left-0 bg-[#0d99ff] text-[#002f55] text-[10px] font-mono px-1.5 py-0.5 rounded font-bold whitespace-nowrap shadow">
                  {Math.abs(drawingState.currentX - drawingState.startX)} ×{' '}
                  {Math.abs(drawingState.currentY - drawingState.startY)}
                </div>
              </div>
            )}

            {/* Mobile Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#9fcaff]/5 via-transparent to-[#9fcaff]/5 pointer-events-none" />

            {/* Grid Lines Overlay */}
            {showGrid && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid-small-m" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(159,202,255,0.08)" strokeWidth="0.5"/>
                  </pattern>
                  <pattern id="grid-large-m" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#grid-small-m)"/>
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(159,202,255,0.18)" strokeWidth="0.8"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-large-m)"/>
              </svg>
            )}

            {/* Unified Artboard Child Elements */}
            {artboardChildren.map(renderArtboardItem)}
          </div>
        )}

        {/* Live Multiplayer Collaborator Cursors */}
        {collaborators.map((c) => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: `${c.cursorX}px`,
              top: `${c.cursorY}px`,
              transition: 'all 0.4s ease-out',
            }}
            className="pointer-events-none z-40 flex items-start gap-1"
          >
            <MousePointer2
              className="w-4 h-4 drop-shadow-md"
              style={{ color: c.color, fill: c.color }}
            />
            <div
              style={{ backgroundColor: c.color }}
              className="text-[10px] font-bold text-[#002f55] px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap"
            >
              {c.name}
            </div>
          </div>
        ))}

        {/* Interactive Canvas Comments */}
        {comments.map((cm) => (
          <div
            key={cm.id}
            style={{ position: 'absolute', left: `${cm.x}px`, top: `${cm.y}px` }}
            className="z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveCommentId(activeCommentId === cm.id ? null : cm.id)}
              style={{ backgroundColor: cm.avatarColor }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#003259] ring-2 ring-[#131313] shadow-lg hover:scale-110 transition-transform"
            >
              {cm.initials}
            </button>

            {activeCommentId === cm.id && (
              <div className="absolute left-7 top-0 w-64 bg-[#1c1b1b] border border-[#353534] rounded-xl shadow-2xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#e5e2e1]">{cm.author}</span>
                  <span className="text-[10px] text-[#89919e]">{cm.timestamp}</span>
                </div>
                <p className="text-[#bfc7d5] mb-2">{cm.text}</p>
                <div className="flex items-center justify-between border-t border-[#353534] pt-2">
                  <button
                    onClick={() => {
                      setComments((prev) => prev.filter((item) => item.id !== cm.id));
                      setActiveCommentId(null);
                    }}
                    className="text-[10px] text-[#9fcaff] hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Resolve
                  </button>
                  <button
                    onClick={() => setActiveCommentId(null)}
                    className="text-[10px] text-[#89919e] hover:text-[#e5e2e1]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
