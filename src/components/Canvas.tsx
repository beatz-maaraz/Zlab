import React, { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Folder,
  FolderPlus,
  FolderMinus,
  Search,
  Filter,
  X,
  Eye,
  EyeOff,
  MoreVertical,
  Grid,
  User,
  Check,
  Mail,
  ChevronRight,
  Magnet,
  Bell,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { CanvasElement, Collaborator, ToolMode, CanvasComment, DevicePreview } from '../types';
import { useUIStore } from '../store/uiStore';
import { calculateContrastRatio } from '../utils/analysisEngine';
import { DynamicIcon } from './DynamicIcon';
import { usePreviewScale } from '../features/editor/hooks/usePreviewScale';
import { CanvasViewport } from '../features/editor/components/CanvasViewport';
import { PreviewStage } from '../features/editor/components/PreviewStage';
import { DeviceFrame } from '../features/editor/components/DeviceFrame';
import { Artboard } from '../features/editor/components/Artboard';
import { ContextMenu, ContextMenuItem, ContextMenuState } from './ContextMenu';
import {
  computeSmartSnapping,
  AlignmentGuide,
  DistanceMarker,
} from '../utils/smartSnapping';
import { AlignmentGuidelines } from './Canvas/AlignmentGuidelines';
import { useCanvasCoordinates } from '../hooks/useCanvasCoordinates';
import { TransformGizmo } from './Canvas/TransformGizmo';

interface CanvasProps {
  zoom: number;
  setZoom?: (zoom: number | ((prev: number) => number)) => void;
  currentTool: ToolMode;
  setCurrentTool?: (tool: ToolMode) => void;
  devicePreview: 'desktop' | 'mobile';
  selectedElementId: string;
  setSelectedElementId: (id: string) => void;
  selectedElementIds?: string[];
  setSelectedElementIds?: (ids: string[]) => void;
  toggleElementSelection?: (id: string) => void;
  onGroup?: () => void;
  onUngroup?: (groupId?: string) => void;
  elements: Record<string, CanvasElement>;
  setElements: React.Dispatch<React.SetStateAction<Record<string, CanvasElement>>>;
  onUpdateElementWithHistory?: (newElements: Record<string, CanvasElement>) => void;
  collaborators: Collaborator[];
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  snapToGuides?: boolean;
  onToggleSnapToGuides?: () => void;
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
  selectedElementIds = [],
  setSelectedElementIds,
  toggleElementSelection,
  onGroup,
  onUngroup,
  elements,
  setElements,
  onUpdateElementWithHistory,
  collaborators,
  onDuplicateElement,
  onDeleteElement,
  showGrid = false,
  onToggleGrid,
  snapToGuides,
  onToggleSnapToGuides,
  onDropElement,
}) => {
  const artboardRef = useRef<HTMLDivElement>(null);
  const { showAuditOverlay, toggleAuditOverlay, openModal } = useUIStore();
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Global Spacebar listener for temporary pan mode (Figma-style Space+Drag)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.closest && target.closest('[contenteditable="true"]'))
      ) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (currentTool !== 'hand') {
          setIsPanning(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentTool]);

  // Smart snapping toggle state
  const [internalSnapEnabled, setInternalSnapEnabled] = useState(true);
  const isSnapEnabled = snapToGuides !== undefined ? snapToGuides : internalSnapEnabled;
  const toggleSnap = onToggleSnapToGuides || (() => setInternalSnapEnabled((prev) => !prev));

  // Dynamic Alignment Guidelines & Gap Distance Markers state
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);
  const [activeDistanceMarkers, setActiveDistanceMarkers] = useState<DistanceMarker[]>([]);

  // Drag start positions for multiple selected elements
  const [dragStartElements, setDragStartElements] = useState<Record<string, { x: number; y: number }> | null>(null);

  const {
    containerRef,
    screenToCanvas,
  } = useCanvasCoordinates();

  const {
    artboardWidth,
    artboardHeight,
    previewScale,
    totalScale,
    containerSize,
  } = usePreviewScale({
    containerRef,
    devicePreview,
    zoom,
    padding: 48,
  });

  // Initial centering logic for the absolute world layer
  const [hasCentered, setHasCentered] = useState(false);
  const prevDeviceRef = useRef(devicePreview);

  useEffect(() => {
    if (!hasCentered && containerSize.width > 0 && containerSize.height > 0) {
      const extraBezel = devicePreview === 'mobile' ? 24 : 0;
      const initialPanX = (containerSize.width - (artboardWidth + extraBezel) * previewScale) / 2;
      const initialPanY = (containerSize.height - (artboardHeight + extraBezel) * previewScale) / 2;
      setPan({ x: Math.round(initialPanX), y: Math.max(12, Math.round(initialPanY)) });
      setHasCentered(true);
    }
  }, [containerSize, artboardWidth, artboardHeight, previewScale, hasCentered, devicePreview]);

  // Recenter when switching device preview (Desktop <-> Mobile) so artboard centers cleanly
  useEffect(() => {
    if (prevDeviceRef.current !== devicePreview) {
      prevDeviceRef.current = devicePreview;
      if (containerSize.width > 0 && containerSize.height > 0) {
        const extraBezel = devicePreview === 'mobile' ? 24 : 0;
        const targetPanX = (containerSize.width - (artboardWidth + extraBezel) * previewScale) / 2;
        const targetPanY = (containerSize.height - (artboardHeight + extraBezel) * previewScale) / 2;
        setPan({ x: Math.round(targetPanX), y: Math.max(12, Math.round(targetPanY)) });
      }
    }
  }, [devicePreview, containerSize, artboardWidth, artboardHeight, previewScale]);

  // Fit to screen (Figma Shift+1 / Cmd+0)
  const fitToScreen = React.useCallback(() => {
    setZoom?.(1);
    if (containerSize.width > 0 && containerSize.height > 0) {
      const extraBezel = devicePreview === 'mobile' ? 24 : 0;
      const initialPanX = (containerSize.width - (artboardWidth + extraBezel) * previewScale) / 2;
      const initialPanY = (containerSize.height - (artboardHeight + extraBezel) * previewScale) / 2;
      setPan({ x: Math.round(initialPanX), y: Math.max(12, Math.round(initialPanY)) });
    }
  }, [containerSize, artboardWidth, artboardHeight, previewScale, devicePreview, setZoom]);

  // Zoom to selection / center canvas on target element (Figma Shift+2)
  const zoomToSelection = React.useCallback((targetId?: string) => {
    const id = targetId || selectedElementId;
    if (!id || id === 'desktop-1440' || id === 'mobile-app-view') {
      fitToScreen();
      return;
    }
    const el = elements[id];
    if (!el || containerSize.width <= 0 || containerSize.height <= 0) return;

    const elCenterX = el.x + (el.width || 100) / 2;
    const elCenterY = el.y + (el.height || 100) / 2;

    const targetPanX = containerSize.width / 2 - elCenterX * totalScale;
    const targetPanY = containerSize.height / 2 - elCenterY * totalScale;
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  }, [selectedElementId, elements, containerSize, totalScale, fitToScreen]);

  // Global listeners for fit-view and focus-element custom events
  useEffect(() => {
    const handleFitView = () => fitToScreen();
    const handleFocusElement = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id) {
        zoomToSelection(customEvent.detail.id);
      }
    };

    window.addEventListener('zlab:fit-view', handleFitView);
    window.addEventListener('zlab:focus-element', handleFocusElement as EventListener);
    return () => {
      window.removeEventListener('zlab:fit-view', handleFitView);
      window.removeEventListener('zlab:focus-element', handleFocusElement as EventListener);
    };
  }, [fitToScreen, zoomToSelection]);

  // Canvas-level keyboard shortcuts for Shift+1 (Fit) and Shift+2 (Focus)
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest && target.closest('[contenteditable="true"]'))
      ) {
        return;
      }
      if (e.shiftKey && (e.key === '!' || e.code === 'Digit1')) {
        e.preventDefault();
        fitToScreen();
      }
      if (e.shiftKey && (e.key === '@' || e.code === 'Digit2')) {
        e.preventDefault();
        zoomToSelection();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [fitToScreen, zoomToSelection]);
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

  // Marquee drag-selection state
  const [marqueeState, setMarqueeState] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

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

  // Context Menu state
  const [canvasContextMenu, setCanvasContextMenu] = useState<ContextMenuState | null>(null);

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalTarget(document.getElementById('canvas-zoom-indicator-portal'));
  }, []);

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Determine context (empty canvas vs selected elements)
    const isMultiSelect = selectedElementIds.length > 1;
    const hasSelection = selectedElementId !== 'desktop-1440' && selectedElementId !== 'mobile-app-view';

    const items: ContextMenuItem[] = [];

    if (hasSelection) {
      items.push({
        id: 'duplicate',
        label: isMultiSelect ? `Duplicate (${selectedElementIds.length})` : 'Duplicate',
        icon: <Copy className="w-3.5 h-3.5" />,
        shortcut: '⌘D',
        action: () => {
          if (onDuplicateElement) {
            selectedElementIds.forEach(id => onDuplicateElement(id));
          }
        },
      });

      if (onGroup) {
        items.push({
          id: 'group',
          label: isMultiSelect ? `Group (${selectedElementIds.length})` : 'Group',
          icon: <FolderPlus className="w-3.5 h-3.5" />,
          shortcut: '⌘G',
          disabled: !isMultiSelect,
          action: () => onGroup(),
        });
      }

      if (onUngroup && !isMultiSelect && elements[selectedElementId]?.type === 'group') {
        items.push({
          id: 'ungroup',
          label: 'Ungroup',
          icon: <FolderMinus className="w-3.5 h-3.5" />,
          shortcut: '⌘⇧G',
          action: () => onUngroup(selectedElementId),
        });
      }

      items.push({
        id: 'delete',
        label: isMultiSelect ? `Delete (${selectedElementIds.length})` : 'Delete',
        icon: <Trash2 className="w-3.5 h-3.5" />,
        shortcut: 'Del',
        danger: true,
        separator: true,
        action: () => {
          if (onDeleteElement) {
            selectedElementIds.forEach(id => onDeleteElement(id));
          }
        },
      });
    } else {
      // Empty Canvas Menu
      items.push({
        id: 'toggle-snapping',
        label: isSnapEnabled ? 'Disable Smart Snapping' : 'Enable Smart Snapping',
        icon: <Magnet className="w-3.5 h-3.5" />,
        shortcut: 'S',
        action: toggleSnap,
      });
      items.push({
        id: 'toggle-grid',
        label: showGrid ? 'Hide Grid' : 'Show Grid',
        icon: <LayoutDashboard className="w-3.5 h-3.5" />,
        shortcut: '⌘\'',
        action: () => {
          if (onToggleGrid) onToggleGrid();
        },
      });
    }

    setCanvasContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetId: selectedElementId,
      items,
    });
  };

  // Canvas background panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'hand' || isSpacePressed || e.button === 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    } else if (currentTool === 'move') {
      // Clicking empty canvas space deselects elements
      if (
        e.target === containerRef.current ||
        (e.target as HTMLElement).id === 'canvas-viewport' ||
        (e.target as HTMLElement).id === 'preview-stage'
      ) {
        const rootId = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';
        setSelectedElementId(rootId);
        if (setSelectedElementIds) setSelectedElementIds([rootId]);
        setEditingTextId(null);
      }
    }
  };

  // Touch pinch-to-zoom and two-finger pan gesture state
  const pinchStateRef = useRef<{
    initialDist: number;
    initialMidX: number;
    initialMidY: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
  } | null>(null);

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      pinchStateRef.current = {
        initialDist: dist,
        initialMidX: midX,
        initialMidY: midY,
        initialZoom: zoom,
        initialPan: { ...pan },
      };
      setIsPanning(false);
      return;
    }

    if (e.touches.length === 1) {
      pinchStateRef.current = null;
      const touch = e.touches[0];
      const target = e.target as HTMLElement;
      const isCanvasBackground =
        target === containerRef.current ||
        target.id === 'canvas-viewport' ||
        target.id === 'preview-stage' ||
        target.classList?.contains('canvas-viewport') ||
        target.classList?.contains('preview-stage');

      if (currentTool === 'hand' || isCanvasBackground) {
        setIsPanning(true);
        setStartPan({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        const rootId = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';
        setSelectedElementId(rootId);
        if (setSelectedElementIds) setSelectedElementIds([rootId]);
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

      // 2. Drag Element (work strictly in unscaled artboard coordinates)
      if (draggingId && dragStart) {
        // Normalize mouse delta to artboard space
        const deltaX = (e.clientX - dragStart.mouseX) / totalScale;
        const deltaY = (e.clientY - dragStart.mouseY) / totalScale;
        
        let newX = Math.round(dragStart.initialX + deltaX);
        let newY = Math.round(dragStart.initialY + deltaY);

        const currentEl = elements[draggingId];
        if (currentEl) {
          if (isSnapEnabled && !e.altKey) {
            // Exclude current element and any other currently selected elements from snapping candidates
            const excludedIds = new Set(
              selectedElementIds.includes(draggingId) ? selectedElementIds : [draggingId]
            );

            const candidateNeighbors = (Object.values(elements) as CanvasElement[]).filter(
              (item) =>
                !excludedIds.has(item.id) &&
                item.id !== 'desktop-1440' &&
                item.id !== 'mobile-app-view' &&
                item.id !== 'default-artboard-frame' &&
                item.id !== 'hero-bg' &&
                item.visible !== false
            );

            const snapResult = computeSmartSnapping(
              {
                x: newX,
                y: newY,
                width: currentEl.width || 100,
                height: currentEl.height || 40,
              },
              candidateNeighbors,
              {
                artboardWidth,
                artboardHeight,
                threshold: 6,
                snapToArtboard: true,
                snapToNeighbors: true,
                snapToEqualGaps: true,
              }
            );

            newX = snapResult.x;
            newY = snapResult.y;
            setActiveGuides(snapResult.guides);
            setActiveDistanceMarkers(snapResult.distanceMarkers);
          } else {
            setActiveGuides([]);
            setActiveDistanceMarkers([]);
          }
        }

        const shiftX = newX - dragStart.initialX;
        const shiftY = newY - dragStart.initialY;
        const isMultiDrag =
          selectedElementIds &&
          selectedElementIds.length > 1 &&
          selectedElementIds.includes(draggingId);

        // OPTIMIZATION: Update DOM directly during drag to avoid React re-render lag
        requestAnimationFrame(() => {
          if (isMultiDrag) {
            for (const id of selectedElementIds) {
              const elDom = document.getElementById(`canvas-el-${id}`);
              const startPos = dragStartElements?.[id];
              if (elDom && startPos) {
                const targetX = Math.round(startPos.x + shiftX);
                const targetY = Math.round(startPos.y + shiftY);
                elDom.style.left = `${targetX}px`;
                elDom.style.top = `${targetY}px`;
              }
            }
          } else {
            const elDom = document.getElementById(`canvas-el-${draggingId}`);
            if (elDom) {
              elDom.style.left = `${newX}px`;
              elDom.style.top = `${newY}px`;
            }
          }
        });

        return;
      }

      // 3. Resize Element (work strictly in unscaled artboard coordinates)
      if (resizingId && resizeStart && resizeHandle) {
        const deltaX = (e.clientX - resizeStart.mouseX) / totalScale;
        const deltaY = (e.clientY - resizeStart.mouseY) / totalScale;

        const el = elements[resizingId];
        if (!el) return;

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

          // Smart Snapping during resize
          if (isSnapEnabled && !e.altKey) {
            const candidateNeighbors = (Object.values(elements) as CanvasElement[]).filter(
              (item) =>
                item.id !== resizingId &&
                item.id !== 'desktop-1440' &&
                item.id !== 'mobile-app-view' &&
                item.id !== 'default-artboard-frame' &&
                item.id !== 'hero-bg' &&
                item.visible !== false
            );

            const resizeGuides: AlignmentGuide[] = [];
            const threshold = 6;

            if (resizeHandle.includes('e')) {
              const currentRight = newX + newW;
              let bestDelta = threshold + 1;
              let bestTarget = currentRight;
              let guideLabel = '';
              let guideTargetName = '';

              for (const nb of candidateNeighbors) {
                const points = [
                  { pos: nb.x, label: 'Align to Left' },
                  { pos: nb.x + nb.width / 2, label: 'Center Align' },
                  { pos: nb.x + nb.width, label: 'Align to Right' },
                ];
                for (const p of points) {
                  const d = Math.abs(currentRight - p.pos);
                  if (d < bestDelta) {
                    bestDelta = d;
                    bestTarget = p.pos;
                    guideLabel = p.label;
                    guideTargetName = nb.name;
                  }
                }
              }
              const dArt = Math.abs(currentRight - artboardWidth);
              if (dArt < bestDelta) {
                bestDelta = dArt;
                bestTarget = artboardWidth;
                guideLabel = 'Artboard Right';
                guideTargetName = '';
              }

              if (bestDelta <= threshold) {
                newW = Math.max(20, Math.round(bestTarget - newX));
                resizeGuides.push({
                  id: `resize-v-${bestTarget}`,
                  orientation: 'vertical',
                  position: bestTarget,
                  start: 0,
                  end: artboardHeight,
                  type: 'edge',
                  label: guideLabel,
                  sourceTarget: guideTargetName,
                });
              }
            }

            if (resizeHandle.includes('w')) {
              let bestDelta = threshold + 1;
              let bestTarget = newX;
              let guideLabel = '';
              let guideTargetName = '';

              for (const nb of candidateNeighbors) {
                const points = [
                  { pos: nb.x, label: 'Align to Left' },
                  { pos: nb.x + nb.width / 2, label: 'Center Align' },
                  { pos: nb.x + nb.width, label: 'Align to Right' },
                ];
                for (const p of points) {
                  const d = Math.abs(newX - p.pos);
                  if (d < bestDelta) {
                    bestDelta = d;
                    bestTarget = p.pos;
                    guideLabel = p.label;
                    guideTargetName = nb.name;
                  }
                }
              }
              if (Math.abs(newX) < bestDelta) {
                bestDelta = Math.abs(newX);
                bestTarget = 0;
                guideLabel = 'Artboard Left';
                guideTargetName = '';
              }

              if (bestDelta <= threshold) {
                const diff = newX - bestTarget;
                newX = bestTarget;
                newW = Math.max(20, Math.round(newW + diff));
                resizeGuides.push({
                  id: `resize-v-${bestTarget}`,
                  orientation: 'vertical',
                  position: bestTarget,
                  start: 0,
                  end: artboardHeight,
                  type: 'edge',
                  label: guideLabel,
                  sourceTarget: guideTargetName,
                });
              }
            }

            if (resizeHandle.includes('s')) {
              const currentBottom = newY + newH;
              let bestDelta = threshold + 1;
              let bestTarget = currentBottom;
              let guideLabel = '';
              let guideTargetName = '';

              for (const nb of candidateNeighbors) {
                const points = [
                  { pos: nb.y, label: 'Align to Top' },
                  { pos: nb.y + nb.height / 2, label: 'Center Align' },
                  { pos: nb.y + nb.height, label: 'Align to Bottom' },
                ];
                for (const p of points) {
                  const d = Math.abs(currentBottom - p.pos);
                  if (d < bestDelta) {
                    bestDelta = d;
                    bestTarget = p.pos;
                    guideLabel = p.label;
                    guideTargetName = nb.name;
                  }
                }
              }
              const dArt = Math.abs(currentBottom - artboardHeight);
              if (dArt < bestDelta) {
                bestDelta = dArt;
                bestTarget = artboardHeight;
                guideLabel = 'Artboard Bottom';
                guideTargetName = '';
              }

              if (bestDelta <= threshold) {
                newH = Math.max(20, Math.round(bestTarget - newY));
                resizeGuides.push({
                  id: `resize-h-${bestTarget}`,
                  orientation: 'horizontal',
                  position: bestTarget,
                  start: 0,
                  end: artboardWidth,
                  type: 'edge',
                  label: guideLabel,
                  sourceTarget: guideTargetName,
                });
              }
            }

            if (resizeHandle.includes('n')) {
              let bestDelta = threshold + 1;
              let bestTarget = newY;
              let guideLabel = '';
              let guideTargetName = '';

              for (const nb of candidateNeighbors) {
                const points = [
                  { pos: nb.y, label: 'Align to Top' },
                  { pos: nb.y + nb.height / 2, label: 'Center Align' },
                  { pos: nb.y + nb.height, label: 'Align to Bottom' },
                ];
                for (const p of points) {
                  const d = Math.abs(newY - p.pos);
                  if (d < bestDelta) {
                    bestDelta = d;
                    bestTarget = p.pos;
                    guideLabel = p.label;
                    guideTargetName = nb.name;
                  }
                }
              }
              if (Math.abs(newY) < bestDelta) {
                bestDelta = Math.abs(newY);
                bestTarget = 0;
                guideLabel = 'Artboard Top';
                guideTargetName = '';
              }

              if (bestDelta <= threshold) {
                const diff = newY - bestTarget;
                newY = bestTarget;
                newH = Math.max(20, Math.round(newH + diff));
                resizeGuides.push({
                  id: `resize-h-${bestTarget}`,
                  orientation: 'horizontal',
                  position: bestTarget,
                  start: 0,
                  end: artboardWidth,
                  type: 'edge',
                  label: guideLabel,
                  sourceTarget: guideTargetName,
                });
              }
            }

            setActiveGuides(resizeGuides);
            setActiveDistanceMarkers([]);
          } else {
            setActiveGuides([]);
            setActiveDistanceMarkers([]);
          }

          // OPTIMIZATION: Update DOM directly during resize
          requestAnimationFrame(() => {
            const elDom = document.getElementById(`canvas-el-${resizingId}`);
            if (elDom) {
              elDom.style.left = `${newX}px`;
              elDom.style.top = `${newY}px`;
              elDom.style.width = `${newW}px`;
              elDom.style.height = `${newH}px`;
            }
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
        
        // OPTIMIZATION: Update DOM directly during rotation
        requestAnimationFrame(() => {
          const elDom = document.getElementById(`canvas-el-${rotatingId}`);
          if (elDom) {
            elDom.style.transform = `rotate(${deg}deg)`;
          }
        });
        
        return;
      }

      // 5. Drawing Preview with Smart Snapping
      if (drawingState && artboardRef.current) {
        const rect = artboardRef.current.getBoundingClientRect();
        let currX = Math.round((e.clientX - rect.left) / totalScale);
        let currY = Math.round((e.clientY - rect.top) / totalScale);

        if (isSnapEnabled && !e.altKey) {
            const candidateNeighbors = (Object.values(elements) as CanvasElement[]).filter(
                (item) => item.id !== 'desktop-1440' && item.id !== 'mobile-app-view' && item.visible !== false
            );
            
            // For drawing, we treat the current cursor as a 1x1 box to snap its position
            const snapResult = computeSmartSnapping(
                { x: currX, y: currY, width: 0, height: 0 },
                candidateNeighbors,
                { artboardWidth, artboardHeight, threshold: 6, snapToArtboard: true, snapToNeighbors: true, snapToEqualGaps: false }
            );
            
            currX = snapResult.x;
            currY = snapResult.y;
            setActiveGuides(snapResult.guides);
        } else {
            setActiveGuides([]);
        }

        setDrawingState((prev) => (prev ? { ...prev, currentX: currX, currentY: currY } : null));
        return;
      }

      // 6. Marquee Selection
      if (marqueeState && artboardRef.current) {
        const rect = artboardRef.current.getBoundingClientRect();
        const currX = Math.round((e.clientX - rect.left) / totalScale);
        const currY = Math.round((e.clientY - rect.top) / totalScale);
        setMarqueeState((prev) => (prev ? { ...prev, currentX: currX, currentY: currY } : null));

        const minX = Math.min(marqueeState.startX, currX);
        const maxX = Math.max(marqueeState.startX, currX);
        const minY = Math.min(marqueeState.startY, currY);
        const maxY = Math.max(marqueeState.startY, currY);

        if (maxX - minX > 6 || maxY - minY > 6) {
          const hits = (Object.values(elements) as CanvasElement[]).filter((el) => {
            if (
              el.id === 'desktop-1440' ||
              el.id === 'mobile-app-view' ||
              el.id === 'default-artboard-frame' ||
              el.id === 'hero-bg' ||
              el.visible === false
            ) {
              return false;
            }
            // If element is child of a group, check if its parent group is hit instead of child directly
            if (el.parentId && elements[el.parentId]?.type === 'group') {
              return false;
            }
            const elRight = el.x + (el.width || 0);
            const elBottom = el.y + (el.height || 0);
            return el.x < maxX && elRight > minX && el.y < maxY && elBottom > minY;
          }).map((el) => el.id);

          if (hits.length > 0) {
            if (setSelectedElementIds) setSelectedElementIds(hits);
            setSelectedElementId(hits[hits.length - 1]);
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isPanning) setIsPanning(false);
      if (marqueeState) setMarqueeState(null);

      if (draggingId && dragStart) {
        // Commit final positions to React state
        const deltaX = (e.clientX - dragStart.mouseX) / totalScale;
        const deltaY = (e.clientY - dragStart.mouseY) / totalScale;
        
        let newX = Math.round(dragStart.initialX + deltaX);
        let newY = Math.round(dragStart.initialY + deltaY);

        // Recalculate snap for final position if enabled
        const currentEl = elements[draggingId];
        if (currentEl && isSnapEnabled && !e.altKey) {
            const excludedIds = new Set(selectedElementIds.includes(draggingId) ? selectedElementIds : [draggingId]);
            const candidateNeighbors = (Object.values(elements) as CanvasElement[]).filter(
                (item) => !excludedIds.has(item.id) && item.id !== 'desktop-1440' && item.id !== 'mobile-app-view' && item.visible !== false
            );
            const snapResult = computeSmartSnapping(
                { x: newX, y: newY, width: currentEl.width, height: currentEl.height },
                candidateNeighbors,
                { artboardWidth, artboardHeight, threshold: 6, snapToArtboard: true, snapToNeighbors: true, snapToEqualGaps: true }
            );
            newX = snapResult.x;
            newY = snapResult.y;
        }

        const shiftX = newX - dragStart.initialX;
        const shiftY = newY - dragStart.initialY;
        const isMultiDrag = selectedElementIds?.includes(draggingId) && selectedElementIds.length > 1;

        setElements((prev) => {
          const updated = { ...prev };
          if (isMultiDrag) {
            for (const id of selectedElementIds) {
              const el = prev[id];
              const startPos = dragStartElements?.[id];
              if (el && startPos) {
                updated[id] = {
                  ...el,
                  x: Math.round(startPos.x + shiftX),
                  y: Math.round(startPos.y + shiftY),
                };
              }
            }
          } else if (prev[draggingId]) {
            updated[draggingId] = {
              ...prev[draggingId],
              x: newX,
              y: newY,
            };
          }
          
          if (onUpdateElementWithHistory) {
            onUpdateElementWithHistory(updated);
          }
          return updated;
        });

        setDraggingId(null);
        setDragStart(null);
        setDragStartElements(null);
        setActiveGuides([]);
        setActiveDistanceMarkers([]);
        setSnapGuideX(null);
        setSnapGuideY(null);
      }

      if (resizingId && resizeStart && resizeHandle) {
        // Commit final dimensions to state
        const deltaX = (e.clientX - resizeStart.mouseX) / totalScale;
        const deltaY = (e.clientY - resizeStart.mouseY) / totalScale;

        setElements((prev) => {
          const el = prev[resizingId];
          if (!el) return prev;

          let newW = resizeStart.initialW;
          let newH = resizeStart.initialH;
          let newX = resizeStart.initialX;
          let newY = resizeStart.initialY;

          if (resizeHandle.includes('e')) newW = Math.max(20, Math.round(resizeStart.initialW + deltaX));
          if (resizeHandle.includes('w')) {
            const possibleW = Math.max(20, Math.round(resizeStart.initialW - deltaX));
            newX = resizeStart.initialX + (resizeStart.initialW - possibleW);
            newW = possibleW;
          }
          if (resizeHandle.includes('s')) newH = Math.max(20, Math.round(resizeStart.initialH + deltaY));
          if (resizeHandle.includes('n')) {
            const possibleH = Math.max(20, Math.round(resizeStart.initialH - deltaY));
            newY = resizeStart.initialY + (resizeStart.initialH - possibleH);
            newH = possibleH;
          }
          
          // Apply snap to final state if needed (simplified here, but should match move logic)
          
          const updated = {
            ...prev,
            [resizingId]: { ...el, x: newX, y: newY, width: newW, height: newH }
          };
          
          if (onUpdateElementWithHistory) {
            onUpdateElementWithHistory(updated);
          }
          return updated;
        });

        setResizingId(null);
        setResizeHandle(null);
        setResizeStart(null);
        setActiveGuides([]);
        setActiveDistanceMarkers([]);
      }

      if (rotatingId && rotateStart) {
        // Commit final rotation to state
        const deltaX = e.clientX - rotateStart.centerX;
        const deltaY = e.clientY - rotateStart.centerY;
        let deg = Math.round((Math.atan2(deltaY, deltaX) * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        if (deg >= 360) deg -= 360;
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
          if (deg === 360) deg = 0;
        }

        setElements((prev) => {
          const el = prev[rotatingId];
          if (!el) return prev;
          const updated = {
            ...prev,
            [rotatingId]: { ...el, rotation: deg }
          };
          if (onUpdateElementWithHistory) {
            onUpdateElementWithHistory(updated);
          }
          return updated;
        });

        setRotatingId(null);
        setRotateStart(null);
        setCurrentRotationAngle(null);
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
        setActiveGuides([]);
        if (setCurrentTool) setCurrentTool('move');
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStateRef.current && containerRef.current) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currentMidX = (t1.clientX + t2.clientX) / 2;
        const currentMidY = (t1.clientY + t2.clientY) / 2;

        const { initialDist, initialMidX, initialMidY, initialZoom, initialPan } = pinchStateRef.current;
        if (initialDist > 10) {
          const scaleDelta = currentDist / initialDist;
          const newZoom = Math.min(Math.max(initialZoom * scaleDelta, 0.2), 3.0);

          const rect = containerRef.current.getBoundingClientRect();
          const anchorX = initialMidX - rect.left;
          const anchorY = initialMidY - rect.top;

          const canvasAnchorX = (anchorX - initialPan.x) / (previewScale * initialZoom);
          const canvasAnchorY = (anchorY - initialPan.y) / (previewScale * initialZoom);

          const panDeltaX = currentMidX - initialMidX;
          const panDeltaY = currentMidY - initialMidY;

          const newPanX = anchorX - canvasAnchorX * (previewScale * newZoom) + panDeltaX;
          const newPanY = anchorY - canvasAnchorY * (previewScale * newZoom) + panDeltaY;

          setZoom?.(Number(newZoom.toFixed(2)));
          setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
        }
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleMouseMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as MouseEvent);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchStateRef.current = null;
      }
      handleMouseUp(e as any);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    isPanning,
    startPan,
    draggingId,
    dragStart,
    dragStartElements,
    isSnapEnabled,
    selectedElementIds,
    resizingId,
    resizeStart,
    resizeHandle,
    rotatingId,
    rotateStart,
    drawingState,
    totalScale,
    previewScale,
    setZoom,
    artboardWidth,
    artboardHeight,
    elements,
    devicePreview,
    onUpdateElementWithHistory,
    setElements,
    setSelectedElementId,
    setCurrentTool,
  ]);

  // Artboard mouse down for tool operations
  const handleArtboardMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'hand' || isSpacePressed || e.button === 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (!artboardRef.current) return;
    const rect = artboardRef.current.getBoundingClientRect();
    const clickX = Math.round((e.clientX - rect.left) / totalScale);
    const clickY = Math.round((e.clientY - rect.top) / totalScale);

    // Only intercept if a creation tool is active
    if (currentTool === 'text') {
      e.stopPropagation();
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
      return;
    }

    // Default: select active artboard and initialize marquee selection
    const activeArtId = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';
    setSelectedElementId(activeArtId);
    if (setSelectedElementIds) setSelectedElementIds([activeArtId]);

    if (currentTool === 'move') {
      setMarqueeState({
        startX: clickX,
        startY: clickY,
        currentX: clickX,
        currentY: clickY,
      });
    }
  };

  // Start dragging an element
  const handleElementPointerDown = (e: React.PointerEvent, el: CanvasElement) => {
    // If in hand pan mode, space pressed, or middle mouse: Pan the canvas directly
    if (currentTool === 'hand' || isSpacePressed || e.button === 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    e.stopPropagation();
    
    // Capture pointer to prevent loss during rapid movement
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (e.shiftKey && toggleElementSelection) {
      toggleElementSelection(el.id);
      return;
    }

    const isAlreadySelected = selectedElementIds?.includes(el.id);
    if (!isAlreadySelected) {
      setSelectedElementId(el.id);
      if (setSelectedElementIds) {
        setSelectedElementIds([el.id]);
      }
    } else {
      setSelectedElementId(el.id);
    }

    if (el.locked || currentTool !== 'move') return;

    setDraggingId(el.id);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: el.x,
      initialY: el.y,
    });

    const startMap: Record<string, { x: number; y: number }> = {};
    const idsToDrag = isAlreadySelected && selectedElementIds && selectedElementIds.length > 0
      ? selectedElementIds
      : [el.id];
    idsToDrag.forEach((id) => {
      if (elements[id]) {
        startMap[id] = { x: elements[id].x, y: elements[id].y };
      }
    });
    setDragStartElements(startMap);
  };

  // Start resizing an element
  const handleResizeHandlePointerDown = (
    e: React.PointerEvent,
    el: CanvasElement,
    handle: string
  ) => {
    e.stopPropagation();
    if (el.locked) return;
    
    // Capture pointer to prevent loss
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

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
  const handleRotateHandlePointerDown = (e: React.PointerEvent, el: CanvasElement) => {
    e.stopPropagation();
    if (el.locked) return;

    // Capture pointer
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

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

    if (artboardRef.current) {
      const rect = artboardRef.current.getBoundingClientRect();
      const centerX = rect.left + (el.x + el.width / 2) * totalScale;
      const centerY = rect.top + (el.y + el.height / 2) * totalScale;

      setRotatingId(el.id);
      setRotateStart({
        centerX,
        centerY,
        initialRotation: el.rotation || 0,
      });
      setCurrentRotationAngle(el.rotation || 0);
    }
  };

  // Get active artboard elements
  const artboardId = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';

  const artboardChildren = useMemo(() => {
    const allEls = Object.values(elements) as CanvasElement[];
    const isMobileMode = devicePreview === 'mobile';

    // 1. Elements parented or matching this active artboard
    // Note: Do not include items that belong to a group container, as their parent group renders them
    const matching = allEls.filter((el) => {
      if (
        el.id === 'desktop-1440' ||
        el.id === 'mobile-app-view' ||
        el.id === 'default-artboard-frame' ||
        el.id === 'hero-bg'
      ) {
        return false;
      }

      // If child belongs to a group, the group container renders it
      if (el.parentId && elements[el.parentId]?.type === 'group') {
        return false;
      }

      if (isMobileMode) {
        return (
          el.parentId === 'mobile-app-view' ||
          (el.parentId && elements[el.parentId]?.parentId === 'mobile-app-view')
        );
      } else {
        return (
          el.parentId !== 'mobile-app-view' &&
          (!el.parentId || elements[el.parentId]?.parentId !== 'mobile-app-view')
        );
      }
    });

    let result = matching;
    // Fallback: if no specific children exist for this mode, show all top-level design elements
    if (result.length === 0) {
      result = allEls.filter(
        (el) =>
          el.id !== 'desktop-1440' &&
          el.id !== 'mobile-app-view' &&
          el.id !== 'default-artboard-frame' &&
          el.id !== 'hero-bg' &&
          (!el.parentId || !elements[el.parentId] || elements[el.parentId].type !== 'group')
      );
    }

    // Ensure selected element (or its parent group) is always visible and interactive
    if (selectedElementId && elements[selectedElementId]) {
      const sel = elements[selectedElementId];
      if (
        sel.id !== 'desktop-1440' &&
        sel.id !== 'mobile-app-view'
      ) {
        if (sel.parentId && elements[sel.parentId]?.type === 'group') {
          const parentGroup = elements[sel.parentId];
          if (!result.some((r) => r.id === parentGroup.id)) {
            result = [...result, parentGroup];
          }
        } else if (!result.some((r) => r.id === sel.id)) {
          result = [...result, sel];
        }
      }
    }

    return result;
  }, [elements, artboardId, devicePreview, selectedElementId]);

  const activeArtboardBg =
    (devicePreview === 'mobile'
      ? elements['mobile-app-view']?.fill || elements['desktop-1440']?.fill
      : elements['desktop-1440']?.fill) || '#131313';

  // Render individual element content based on its type
  const renderElementContent = (el: CanvasElement) => {
    // 1. Navigation Header Frame & Dynamic Headers
    if (el.variant === 'm3-dynamic-header' || el.variant === 'ios-dynamic-header') {
      const isM3 = el.materialPreset === 'm3' || el.variant === 'm3-dynamic-header';
      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? 16}px`,
            border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? '#353534'}`,
            boxShadow: `0px ${el.shadowY ?? 4}px ${el.shadowBlur ?? 12}px rgba(0,0,0,0.3)`,
            flexShrink: 0,
            minWidth: 'fit-content',
          }}
          className="w-full h-full px-4 flex items-center justify-between gap-3 text-xs select-none relative overflow-hidden"
        >
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isM3 ? 'bg-[#d0bcff]/20 text-[#d0bcff]' : 'bg-[#007aff]/20 text-[#007aff]'}`}>
              {isM3 ? 'M3' : 'iOS'}
            </div>
            <span className="font-semibold text-white tracking-tight hidden sm:inline">
              {el.label || 'Header'}
            </span>
          </div>

          {/* Integrated Search Action Bar */}
          <div className="flex-1 max-w-md h-9 bg-[#17161b] rounded-full border border-[#35343a] flex items-center px-3 gap-2">
            <Search className="w-3.5 h-3.5 text-[#89919e] shrink-0" />
            <input
              type="text"
              value={el.searchQuery || ''}
              onChange={(e) => {
                const val = e.target.value;
                setElements((prev) => ({
                  ...prev,
                  [el.id]: { ...prev[el.id], searchQuery: val },
                }));
              }}
              placeholder={el.textContent || 'Search assets & views...'}
              className="bg-transparent text-white placeholder-[#89919e] outline-none text-xs w-full"
            />
            {el.searchQuery && (
              <button
                onClick={() => {
                  setElements((prev) => ({
                    ...prev,
                    [el.id]: { ...prev[el.id], searchQuery: '' },
                  }));
                }}
                className="text-[#89919e] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[#89919e] shrink-0">
            <button className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <Filter className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    if (el.id === 'navbar-frame' || el.name.toLowerCase().includes('nav')) {
      return (
        <div 
          style={{ flexShrink: 0, minWidth: 'fit-content' }}
          className="w-full h-full flex items-center justify-between px-8 text-[#e5e2e1] select-none"
        >
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

    // 1.5 Footer Tabs Component
    if (el.variant === 'm3-footer-tabs' || el.variant === 'ios-footer-tabs' || el.id === 'mobile-tab-bar') {
      const isM3 = el.materialPreset === 'm3' || el.variant === 'm3-footer-tabs';
      const activeTabId = el.activeTab || 'home';
      const tabs = el.tabs || [
        { id: 'home', label: 'Home', icon: 'LayoutDashboard' },
        { id: 'search', label: 'Search', icon: 'Search' },
        { id: 'grid', label: 'Data Grid', icon: 'Grid', badge: '12' },
        { id: 'profile', label: 'Profile', icon: 'User' },
      ];

      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? 24}px`,
            border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? '#353534'}`,
            boxShadow: `0px ${el.shadowY ?? 6}px ${el.shadowBlur ?? 20}px rgba(0,0,0,0.35)`,
            backdropFilter: el.backdropBlur ? `blur(${el.backdropBlur}px)` : 'none',
            flexShrink: 0,
            minWidth: 'fit-content',
          }}
          className="w-full h-full flex items-center justify-around px-3 select-none text-xs relative overflow-hidden"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setElements((prev) => ({
                    ...prev,
                    [el.id]: { ...prev[el.id], activeTab: tab.id },
                  }));
                }}
                className={`flex flex-col items-center justify-center gap-1 transition-all py-1 px-3 rounded-xl relative ${
                  isActive
                    ? isM3
                      ? 'text-[#d0bcff] font-bold'
                      : 'text-[#007aff] font-bold'
                    : 'text-[#89919e] hover:text-white'
                }`}
              >
                {/* M3 Active Indicator Pill */}
                {isActive && isM3 && (
                  <div className="absolute inset-0 bg-[#d0bcff]/20 rounded-xl border border-[#d0bcff]/40 -z-0 animate-fadeIn" />
                )}
                <div className="relative z-10 flex items-center justify-center">
                  <DynamicIcon name={tab.icon || 'Sparkles'} className="w-4 h-4 shrink-0" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 bg-[#ef4444] text-white text-[9px] font-bold px-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // Mobile Feature Card
    if (el.id === 'mobile-feature-card') {
      return (
        <div 
          style={{ flexShrink: 0, minWidth: 'fit-content' }}
          className="w-full h-full p-4 flex flex-col justify-between select-none bg-[#1c1b1b] rounded-2xl border border-[#2a2a2a] hover:border-[#353534] transition-colors"
        >
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

    // 2. Feature Cards Grid & Adaptive Data Grids
    if (el.variant === 'm3-adaptive-grid' || el.variant === 'ios-adaptive-grid' || (el.type === 'grid' && el.items)) {
      const isM3 = el.materialPreset === 'm3' || el.variant === 'm3-adaptive-grid';
      const items = el.items || [
        { id: '1', name: 'Primary Filled Button', type: 'Material 3', status: 'Published', updated: '2 mins ago' },
        { id: '2', name: 'Dynamic Top App Bar', type: 'Material 3', status: 'In Review', updated: '1 hr ago' },
        { id: '3', name: 'Interactive Floating Input', type: 'Material 3', status: 'Published', updated: 'Yesterday' },
        { id: '4', name: 'Footer Navigation Bar', type: 'Material 3', status: 'Draft', updated: '3 days ago' },
      ];
      const query = (el.searchQuery || '').toLowerCase();
      const filteredItems = items.filter(
        (item: any) =>
          !query ||
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.title && item.title.toLowerCase().includes(query)) ||
          (item.type && item.type.toLowerCase().includes(query)) ||
          (item.category && item.category.toLowerCase().includes(query))
      );

      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? 16}px`,
            border: `${el.strokeWidth ?? 1}px solid ${el.stroke ?? '#353534'}`,
            boxShadow: `0px ${el.shadowY ?? 4}px ${el.shadowBlur ?? 16}px rgba(0,0,0,0.3)`,
            flexShrink: 0,
            minWidth: 'fit-content',
          }}
          className="w-full h-full p-4 flex flex-col justify-between text-xs select-none relative overflow-hidden"
        >
          {/* Header Bar with Search & Title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2d2d32]">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${isM3 ? 'bg-[#d0bcff]/20 text-[#d0bcff]' : 'bg-[#007aff]/20 text-[#007aff]'}`}>
                <Grid className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-white tracking-tight">{el.label || el.name}</h4>
              <span className="text-[10px] bg-[#27272a] text-[#9fcaff] px-2 py-0.5 rounded-full font-mono font-medium">
                {filteredItems.length} items
              </span>
            </div>

            {/* Quick Search */}
            <div className="w-44 h-7 bg-[#17161b] rounded-lg border border-[#35343a] flex items-center px-2 gap-1.5 text-[11px]">
              <Search className="w-3 h-3 text-[#89919e] shrink-0" />
              <input
                type="text"
                value={el.searchQuery || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setElements((prev) => ({
                    ...prev,
                    [el.id]: { ...prev[el.id], searchQuery: val },
                  }));
                }}
                placeholder="Filter grid..."
                className="bg-transparent text-white placeholder-[#89919e] outline-none text-[11px] w-full"
              />
            </div>
          </div>

          {/* Adaptive List Rows */}
          <div className="flex-1 overflow-auto py-2 space-y-1.5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-6 text-[#89919e] text-[11px]">
                No items matching &quot;{el.searchQuery}&quot;
              </div>
            ) : (
              filteredItems.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#17161b] border border-[#27272a] hover:border-[#9fcaff] transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-2 h-2 rounded-full bg-[#0d99ff]" />
                    <span className="font-semibold text-white truncate text-xs">
                      {item.name || item.title || `Item ${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px]">
                    <span className="text-[#89919e] font-mono">{item.type || item.category || 'Asset'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                        item.status === 'Published' || item.badge === 'Active'
                          ? 'bg-[#064e3b] text-[#34d399]'
                          : item.status === 'In Review'
                          ? 'bg-[#78350f] text-[#fde047]'
                          : 'bg-[#27272a] text-[#bfc7d5]'
                      }`}
                    >
                      {item.status || item.badge || 'Ready'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#89919e]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (el.id === 'feature-grid-container' || el.type === 'grid') {
      return (
        <div 
          style={{ flexShrink: 0, minWidth: 'fit-content' }}
          className="w-full h-full p-6 grid grid-cols-3 gap-6 select-none"
        >
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
              flexShrink: 0,
              minWidth: 'fit-content',
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
            flexShrink: 0,
            minWidth: 'fit-content',
          }}
          className="w-full h-full flex flex-col justify-center select-none leading-tight pointer-events-auto"
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
            flexShrink: 0,
            minWidth: 'fit-content',
          }}
          className={`w-full h-full flex items-center justify-center font-bold px-4 transition-transform select-none gap-2 shadow relative overflow-hidden pointer-events-auto ${
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

    // 5.5 Vector Icon Elements
    if (el.type === 'icon') {
      const iconSize = Math.max(14, Math.round(Math.min(el.width, el.height) * 0.65));
      return (
        <div
          style={{
            backgroundColor: el.fill || 'transparent',
            borderRadius: `${el.borderRadius ?? 10}px`,
            border:
              el.stroke && el.stroke !== 'none'
                ? `${el.strokeWidth ?? 1}px solid ${el.stroke}`
                : 'none',
            boxShadow: el.shadowBlur
              ? `0px ${el.shadowY ?? 2}px ${el.shadowBlur}px rgba(0,0,0,0.3)`
              : undefined,
            color: el.textColor || '#9fcaff',
            opacity: (el.fillOpacity ?? 100) / 100,
          }}
          className="w-full h-full flex items-center justify-center overflow-hidden select-none p-1 transition-colors"
        >
          <DynamicIcon
            name={el.iconName || 'Sparkles'}
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
            className="shrink-0 transition-transform"
          />
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

    // 7. Interactive Inputs with Floating Labels
    if (el.type === 'input') {
      const isFloating = el.hasFloatingLabel || el.variant?.includes('floating');
      const isM3 = el.materialPreset === 'm3' || el.variant?.includes('m3');
      const isIos = el.materialPreset === 'ios' || el.variant?.includes('ios');
      const isPassword = el.iconName === 'Lock' || el.name.toLowerCase().includes('password');

      const value = el.textContent || '';
      const hasValue = value.length > 0;
      const isFocused = el.isFocused || false;
      const shouldFloat = isFloating && (hasValue || isFocused);

      return (
        <div
          style={{
            backgroundColor: el.fill,
            borderRadius: `${el.borderRadius ?? (isIos ? 14 : isM3 ? 12 : 8)}px`,
            border: `${el.strokeWidth ?? 1}px solid ${
              isFocused
                ? isM3
                  ? '#d0bcff'
                  : isIos
                  ? '#007aff'
                  : '#0d99ff'
                : el.stroke ?? '#353534'
            }`,
            boxShadow: isFocused
              ? `0px 0px 10px ${isM3 ? 'rgba(208,188,255,0.4)' : isIos ? 'rgba(0,122,255,0.4)' : 'rgba(13,153,255,0.4)'}`
              : `0px ${el.shadowY ?? 2}px ${el.shadowBlur ?? 8}px rgba(0,0,0,0.2)`,
          }}
          className="w-full h-full px-3 py-1.5 flex flex-col justify-center text-xs relative select-none group transition-all"
        >
          {/* Floating Label / Standard Label */}
          {el.label && (
            <label
              style={{
                transition: 'all 0.2s ease-out',
                transform: shouldFloat ? 'translateY(-2px) scale(0.85)' : 'translateY(10px) scale(1)',
                transformOrigin: 'left top',
                color: shouldFloat
                  ? isM3
                    ? '#d0bcff'
                    : isIos
                    ? '#007aff'
                    : '#9fcaff'
                  : '#89919e',
              }}
              className="text-[11px] font-semibold block pointer-events-none truncate z-10"
            >
              {el.label}
            </label>
          )}

          <div className="flex items-center gap-2 w-full mt-0.5">
            {el.iconName && (
              <DynamicIcon
                name={el.iconName}
                className={`w-3.5 h-3.5 shrink-0 ${
                  isM3 ? 'text-[#d0bcff]' : isIos ? 'text-[#007aff]' : 'text-[#89919e]'
                }`}
              />
            )}
            <input
              type={isPassword ? 'password' : 'text'}
              value={value}
              onFocus={() => {
                setElements((prev) => ({
                  ...prev,
                  [el.id]: { ...prev[el.id], isFocused: true },
                }));
              }}
              onBlur={() => {
                setElements((prev) => ({
                  ...prev,
                  [el.id]: { ...prev[el.id], isFocused: false },
                }));
              }}
              onChange={(e) => {
                const val = e.target.value;
                setElements((prev) => ({
                  ...prev,
                  [el.id]: { ...prev[el.id], textContent: val },
                }));
              }}
              placeholder={!shouldFloat ? el.placeholder || el.textContent || 'Type value...' : ''}
              className="bg-transparent text-white placeholder-[#89919e] outline-none text-xs w-full font-medium"
            />

            {/* Clear Button or Toggle Switch */}
            {hasValue && (
              <button
                onClick={() => {
                  setElements((prev) => ({
                    ...prev,
                    [el.id]: { ...prev[el.id], textContent: '' },
                  }));
                }}
                className="text-[#89919e] hover:text-white transition-colors p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {el.variant === 'toggle' && (
              <div className="w-9 h-5 rounded-full bg-[#0d99ff] p-0.5 flex items-center justify-end">
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </div>
            )}
          </div>

          {/* Helper Text below input */}
          {el.helperText && (
            <span className="text-[9px] text-[#89919e] mt-0.5 block truncate">
              {el.helperText}
            </span>
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
          ) : el.variant === 'm3-nav' || el.variant === 'm3-nav-bar' ? (
            <div className="flex items-center justify-around w-full px-2 text-[10px] text-[#cac4d0]">
              <div className="flex flex-col items-center gap-0.5">
                <div className="px-3.5 py-0.5 rounded-full bg-[#d0bcff] text-[#381e72] font-bold">★</div>
                <span className="text-[#d0bcff] font-bold">Home</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span>✦</span>
                <span>Explore</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span>📦</span>
                <span>Library</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span>⚙</span>
                <span>Settings</span>
              </div>
            </div>
          ) : el.variant === 'm3-checkbox' ? (
            <div className="flex items-center gap-2.5 w-full px-2">
              <div className="w-5 h-5 rounded-md bg-[#d0bcff] flex items-center justify-center text-[#381e72] font-bold text-xs shadow-sm">
                ✓
              </div>
              <span className="text-[#e6e0e9] font-medium text-xs truncate">{el.textContent || el.name}</span>
            </div>
          ) : el.variant === 'm3-radio' ? (
            <div className="flex items-center gap-2.5 w-full px-2">
              <div className="w-5 h-5 rounded-full border-2 border-[#d0bcff] flex items-center justify-center p-0.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d0bcff]" />
              </div>
              <span className="text-[#e6e0e9] font-medium text-xs truncate">{el.textContent || el.name}</span>
            </div>
          ) : el.variant === 'm3-progress' ? (
            <div className="flex flex-col gap-1.5 w-full px-3">
              <div className="flex justify-between text-[10px] text-[#cac4d0]">
                <span>{el.textContent || 'Progress Indicator'}</span>
                <span className="font-mono text-[#d0bcff]">65%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#36343b] overflow-hidden">
                <div className="w-[65%] h-full rounded-full bg-[#d0bcff] shadow-[0_0_8px_#d0bcff]" />
              </div>
            </div>
          ) : el.variant === 'm3-circular-progress' ? (
            <div className="flex items-center justify-center gap-2.5 w-full">
              <div className="w-6 h-6 rounded-full border-2 border-[#49454f] border-t-[#d0bcff] animate-spin" />
              <span className="text-[#e6e0e9] text-xs font-medium">{el.textContent || 'Loading...'}</span>
            </div>
          ) : el.variant === 'm3-snackbar' ? (
            <div className="flex items-center justify-between w-full px-3 py-1 bg-[#313033] rounded-lg text-xs shadow-lg border border-[#49454f]">
              <span className="text-[#f4eff4] truncate">{el.textContent || 'Action recorded successfully'}</span>
              <span className="text-[#d0bcff] font-bold text-[11px] ml-2 hover:underline uppercase tracking-wide cursor-pointer">Dismiss</span>
            </div>
          ) : el.variant === 'm3-search' ? (
            <div className="flex items-center justify-between w-full px-3 py-1.5 bg-[#211f26] rounded-full border border-[#49454f] text-xs shadow-sm">
              <div className="flex items-center gap-2 truncate text-[#cac4d0]">
                <Search className="w-3.5 h-3.5 text-[#938f99]" />
                <span className="text-[#cac4d0] truncate">{el.textContent || 'Search design tokens...'}</span>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#4a4458] text-[#e8def8] flex items-center justify-center text-[10px]">🎙</span>
            </div>
          ) : el.variant === 'm3-top-app-bar' ? (
            <div className="flex items-center justify-between w-full px-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[#e6e0e9] text-base cursor-pointer">☰</span>
                <span className="text-[#e6e0e9] font-medium text-xs truncate">{el.textContent || 'Material 3 Top App Bar'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#cac4d0]">
                <Search className="w-3.5 h-3.5" />
                <div className="w-5 h-5 rounded-full bg-[#4a4458] text-[#d0bcff] text-[9px] font-bold flex items-center justify-center">Z</div>
              </div>
            </div>
          ) : el.variant === 'm3-tabs' ? (
            <div className="flex items-center justify-around w-full border-b border-[#49454f] text-xs">
              <div className="flex-1 text-center py-2 relative text-[#d0bcff] font-bold">
                <span>Primary</span>
                <div className="absolute bottom-0 inset-x-4 h-0.5 bg-[#d0bcff] rounded-t-full" />
              </div>
              <div className="flex-1 text-center py-2 text-[#938f99]">
                <span>Secondary</span>
              </div>
              <div className="flex-1 text-center py-2 text-[#938f99]">
                <span>Tertiary</span>
              </div>
            </div>
          ) : el.variant === 'm3-card-elevated' || el.variant === 'm3-card-filled' || el.variant === 'm3-card-outlined' ? (
            <div className="flex flex-col justify-between w-full h-full p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d0bcff]">{el.tag || 'M3 CARD'}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#4a4458] text-[#e8def8] font-mono">{el.variant.replace('m3-card-', '')}</span>
              </div>
              <div>
                <h3 className="text-[#e6e0e9] font-bold text-sm tracking-tight">{el.textContent || 'Elevated Surface'}</h3>
                <p className="text-[#938f99] text-xs mt-1 leading-snug">{el.subText || 'Material 3 surface container elevation token.'}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#49454f]/40">
                <span className="px-3 py-1 rounded-full bg-[#d0bcff] text-[#381e72] font-bold text-[10px] shadow-sm">Explore</span>
                <span className="px-3 py-1 rounded-full border border-[#49454f] text-[#cac4d0] text-[10px]">Cancel</span>
              </div>
            </div>
          ) : el.variant?.startsWith('m3-suite-') ? (
            <div className="w-full h-full p-3.5 flex flex-col justify-between text-left select-none">
              <div className="flex items-center justify-between border-b border-[#36343b] pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d0bcff]" />
                  <span className="font-bold text-xs text-[#e6e0e9]">{el.textContent}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#381e72] text-[#d0bcff] font-mono font-bold">
                  M3 SUITE
                </span>
              </div>
              <div className="py-2 flex-1 flex flex-col justify-center gap-2">
                {el.variant === 'm3-suite-actions' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#d0bcff] text-[#381e72] text-[10px] font-bold shadow">Filled</span>
                    <span className="px-3 py-1 rounded-full bg-[#4a4458] text-[#e8def8] text-[10px] font-medium">Tonal</span>
                    <span className="px-3 py-1 rounded-full border border-[#938f99] text-[#d0bcff] text-[10px]">Outlined</span>
                    <span className="text-[#d0bcff] text-[11px] underline">Text</span>
                    <span className="w-7 h-7 rounded-xl bg-[#d0bcff] text-[#381e72] flex items-center justify-center font-bold text-xs shadow">+</span>
                  </div>
                )}
                {el.variant === 'm3-suite-comm' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Bell className="w-4 h-4 text-[#e6e0e9]" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#d0bcff] text-[#381e72] text-[8px] font-bold flex items-center justify-center">3</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-[#36343b] overflow-hidden">
                        <div className="w-2/3 h-full bg-[#d0bcff]" />
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-[#313033] text-[10px] text-[#f4eff4] flex justify-between">
                      <span>Notification banner active</span>
                      <span className="text-[#d0bcff] font-bold">UNDO</span>
                    </div>
                  </div>
                )}
                {el.variant === 'm3-suite-containment' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-[#211f26] border border-[#36343b] text-[10px]">
                      <span className="font-bold text-[#e6e0e9] block">Elevated Card</span>
                      <span className="text-[#938f99] text-[9px]">Surface high</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1d1b20] border border-[#49454f] text-[10px]">
                      <span className="font-bold text-[#e6e0e9] block">Outlined Card</span>
                      <span className="text-[#938f99] text-[9px]">Stroke variant</span>
                    </div>
                  </div>
                )}
                {el.variant === 'm3-suite-navigation' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-[#211f26] text-[10px] text-[#e6e0e9]">
                      <span>☰ Material 3 App Bar</span>
                      <span>🔍</span>
                    </div>
                    <div className="flex items-center justify-around py-1 bg-[#1d1b20] rounded text-[10px] text-[#cac4d0]">
                      <span className="text-[#d0bcff] font-bold">★ Home</span>
                      <span>✦ Explore</span>
                      <span>⚙ Settings</span>
                    </div>
                  </div>
                )}
                {el.variant === 'm3-suite-selection' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#e6e0e9]">
                      <span>Switch & Checkbox</span>
                      <div className="w-8 h-4 rounded-full bg-[#d0bcff] p-0.5 flex justify-end">
                        <div className="w-3 h-3 rounded-full bg-[#381e72]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#cac4d0]">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded bg-[#d0bcff] flex items-center justify-center text-[#381e72] font-bold text-[8px]">✓</div>
                        <span>Active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded-full border border-[#d0bcff] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]" />
                        </div>
                        <span>Radio</span>
                      </div>
                    </div>
                  </div>
                )}
                {el.variant === 'm3-suite-inputs' && (
                  <div className="space-y-2">
                    <div className="p-1.5 rounded-lg border border-[#49454f] bg-[#141218] text-[10px] text-[#cac4d0] flex justify-between">
                      <span>Outlined Input Field</span>
                      <span className="text-[#938f99]">✏</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#211f26] border border-[#36343b] text-[10px] text-[#938f99] flex items-center gap-1.5">
                      <span>🔍</span>
                      <span>Search tokens...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-[#938f99] font-mono flex items-center justify-between border-t border-[#36343b] pt-1.5">
                <span>{el.subText || 'M3 Multi-token bundle'}</span>
                <span className="text-[#d0bcff]">Ready</span>
              </div>
            </div>
          ) : el.variant === 'ios-tabbar' ? (
            <div className="flex items-center justify-around w-full px-2 text-[11px] text-[#8e8e93]">
              <span className="text-[#007aff] font-medium">✦ Today</span>
              <span>★ Games</span>
              <span>📦 Apps</span>
              <span>🕹 Arcade</span>
              <span>🔍 Search</span>
            </div>
          ) : el.variant?.includes('dynamic-header') ? (
            <div className="flex items-center justify-between w-full px-4 text-xs">
              <span className="font-semibold text-white">{el.materialPreset === 'ios' ? '‹ Back' : '≡'}</span>
              <div className={`flex-1 mx-3 px-3 py-1.5 flex items-center gap-2 ${el.materialPreset === 'ios' ? 'bg-[#3a3a3c]' : 'bg-[#353534]'} rounded-full text-[#8e8e93]`}>
                <span>🔍</span>
                <span>Search...</span>
              </div>
              <span className="font-semibold text-white">{el.materialPreset === 'ios' ? 'Edit' : '⚙'}</span>
            </div>
          ) : el.variant?.includes('footer-tabs') ? (
            <div className={`flex items-center justify-around w-full px-2 text-[11px] ${el.materialPreset === 'ios' ? 'text-[#8e8e93]' : 'text-[#cac4d0]'}`}>
              <div className={`flex flex-col items-center ${el.materialPreset === 'ios' ? 'text-[#007aff]' : 'text-[#d0bcff]'}`}>
                <span className={`px-3 py-0.5 rounded-full ${el.materialPreset === 'ios' ? '' : 'bg-[#4a4458]'} font-semibold`}>🏠 Home</span>
              </div>
              <span>🔍 Browse</span>
              <span>👤 Profile</span>
            </div>
          ) : el.variant?.includes('data-grid') ? (
            <div className="flex flex-col w-full h-full p-2 overflow-hidden gap-1.5">
              {(el.textContent || '').split('\n').map((line, idx) => (
                <div key={idx} className={`flex justify-between p-2 rounded-lg ${el.materialPreset === 'ios' ? 'bg-[#2c2c2e]' : 'bg-[#353534]'} text-xs font-medium`}>
                  <span>{line.split('$')[0].trim()}</span>
                  <span className={el.materialPreset === 'ios' ? 'text-[#007aff]' : 'text-[#d0bcff]'}>${line.split('$')[1]}</span>
                </div>
              ))}
            </div>
          ) : el.variant?.includes('floating-input') ? (
            <div className="flex flex-col justify-center w-full px-3 text-left">
              <span className={`text-[9px] font-semibold ${el.materialPreset === 'ios' ? 'text-[#007aff]' : 'text-[#d0bcff]'}`}>Email Address</span>
              <span className="text-white text-xs font-medium mt-0.5">{el.subText}</span>
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
    if (el.type === 'group') {
      const groupChildren = (Object.values(elements) as CanvasElement[]).filter(
        (child) => child.parentId === el.id && child.visible !== false
      );

      return (
        <div className="w-full h-full relative pointer-events-auto">
          {groupChildren.map((child) => {
            const isChildSelected = selectedElementId === child.id || (selectedElementIds?.includes(child.id) ?? false);
            return (
              <div
                key={child.id}
                id={`canvas-el-${child.id}`}
                style={{
                  position: 'absolute',
                  left: `${child.x}px`,
                  top: `${child.y}px`,
                  width: `${child.width}px`,
                  height: `${child.height}px`,
                  transform: child.rotation ? `rotate(${child.rotation}deg)` : undefined,
                  zIndex: isChildSelected ? 35 : 10,
                }}
                className={`transition-shadow select-none ${
                  child.locked ? 'cursor-not-allowed' : 'cursor-move'
                } ${
                  isChildSelected
                    ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#131313]'
                    : 'hover:ring-1 hover:ring-[#0d99ff]/50'
                }`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey && toggleElementSelection) {
                    toggleElementSelection(child.id);
                    return;
                  }
                  setSelectedElementId(child.id);
                  if (setSelectedElementIds) {
                    setSelectedElementIds([child.id]);
                  }
                  if (!child.locked && currentTool === 'move') {
                    setDraggingId(child.id);
                    setDragStart({
                      mouseX: e.clientX,
                      mouseY: e.clientY,
                      initialX: child.x,
                      initialY: child.y,
                    });
                  }
                }}
              >
                {renderElementContent(child)}

                {/* Child Name Badge when specifically selected */}
                {isChildSelected && selectedElementId === child.id && (
                  <div className="absolute -bottom-5 left-0 bg-[#0d99ff] text-[#002f55] text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shadow flex items-center gap-1 z-50 whitespace-nowrap">
                    <span>{child.name}</span>
                    <span className="opacity-75">
                      {child.width}×{child.height}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

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
    const isSelected = selectedElementId === el.id || (selectedElementIds?.includes(el.id) ?? false);
    if (el.visible === false) return null;

    return (
      <div
        key={el.id}
        id={`canvas-el-${el.id}`}
        onPointerDown={(e) => handleElementPointerDown(e, el)}
        style={{
          position: 'absolute',
          left: `${el.x}px`,
          top: `${el.y}px`,
          width: `${el.width}px`,
          height: `${el.height}px`,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          zIndex: isSelected ? 40 : el.type === 'group' ? 15 : 20,
          backgroundColor: 'transparent',
          pointerEvents: 'auto',
        }}
        className={`group transition-shadow select-none ${
          isPanning
            ? 'cursor-grabbing'
            : isSpacePressed || currentTool === 'hand'
            ? 'cursor-grab'
            : el.locked
            ? 'cursor-not-allowed'
            : 'cursor-move'
        } ${
          isSelected
            ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#131313]'
            : el.type === 'group'
            ? 'border border-dashed border-white/20 hover:border-[#0d99ff]/60'
            : 'hover:ring-1 hover:ring-[#0d99ff]/60'
        }`}
      >
        {/* Element Inner Content */}
        {renderElementContent(el)}
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
      if (!artboardRef.current) return;
      const rect = artboardRef.current.getBoundingClientRect();
      let dropX = Math.round((e.clientX - rect.left) / totalScale);
      let dropY = Math.round((e.clientY - rect.top) / totalScale);

      const dropW = partial.width || 200;
      const dropH = partial.height || 48;

      if (isSnapEnabled) {
          const candidateNeighbors = (Object.values(elements) as CanvasElement[]).filter(
              (item) => item.id !== 'desktop-1440' && item.id !== 'mobile-app-view' && item.visible !== false
          );
          const snapResult = computeSmartSnapping(
              { x: dropX, y: dropY, width: dropW, height: dropH },
              candidateNeighbors,
              { artboardWidth, artboardHeight, threshold: 8, snapToArtboard: true, snapToNeighbors: true, snapToEqualGaps: true }
          );
          dropX = snapResult.x;
          dropY = snapResult.y;
      }

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
        width: dropW,
        height: dropH,
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

  // Native non-passive wheel event listener for trackpad pinch zoom & pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const canvasPointX = (mouseX - pan.x) / totalScale;
        const canvasPointY = (mouseY - pan.y) / totalScale;

        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.15), 3.0);
        const newTotalScale = previewScale * newZoom;

        const newPanX = mouseX - canvasPointX * newTotalScale;
        const newPanY = mouseY - canvasPointY * newTotalScale;

        setZoom?.(newZoom);
        setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
      } else {
        setPan((p) => ({
          x: Math.round(p.x - e.deltaX),
          y: Math.round(p.y - e.deltaY),
        }));
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [containerRef, pan, totalScale, zoom, previewScale, setZoom]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Handled by native non-passive listener above
  };

  return (
    <CanvasViewport
      ref={containerRef}
      currentTool={currentTool}
      isPanning={isPanning}
      isSpacePressed={isSpacePressed}
      showGrid={showGrid}
      zoom={zoom}
      onMouseDown={handleCanvasMouseDown}
      onTouchStart={handleCanvasTouchStart}
      onContextMenu={handleCanvasContextMenu}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Zoom / Artboard Resolution Badge Indicator in Footer Portal */}
      {portalTarget && createPortal(
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#89919e] ml-3">
          <span>{Math.round(zoom * 100)}% Zoom</span>
          <span>•</span>
          <span className="text-[#e5e2e1] font-semibold">{artboardWidth} × {artboardHeight}</span>
          <span>•</span>
          <span className="text-[#9fcaff] capitalize">{devicePreview} ({Math.round(previewScale * 100)}% fit)</span>
          {showGrid && <span className="text-[#34d399]">[Grid]</span>}
        </div>,
        portalTarget
      )}

      {/* Bottom-right: Scale Slider + Reset + Grid Toggle (Desktop & Mobile) */}
      <div
        id="canvas-bottom-right-slider-widget"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 right-3 sm:bottom-6 sm:right-5 z-20 flex items-center gap-1 sm:gap-2 bg-[#141416]/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-[#353534]/60 shadow-xl max-w-[calc(100vw-24px)] select-none"
      >
        {/* Fit / Reset button */}
        <button
          id="btn-desktop-zoom-fit"
          onClick={fitToScreen}
          title="Reset zoom to 100% and center artboard (Shift+1 / ⌘0)"
          className="px-2 py-1 bg-[#1c1b1b] border border-[#353534]/60 rounded-lg text-[10px] font-mono text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/50 transition-all shadow"
        >
          Fit View
        </button>

        {/* Smart Snapping & Dynamic Guidelines Toggle */}
        <button
          id="btn-desktop-snapping-toggle"
          onClick={toggleSnap}
          title={isSnapEnabled ? 'Smart Snapping & Dynamic Guidelines Active (Press S to toggle, hold Alt to bypass)' : 'Enable Smart Snapping & Dynamic Alignment Guidelines (S)'}
          className={`p-1 sm:p-1.5 rounded-lg border text-[11px] font-medium transition-all shadow flex items-center gap-1 ${
            isSnapEnabled
              ? 'bg-[#ff007a]/20 border-[#ff007a]/50 text-[#ff007a]'
              : 'bg-[#1c1b1b] border-[#353534]/60 text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/50'
          }`}
        >
          <Magnet className="w-3.5 h-3.5" />
        </button>

        {/* Grid Toggle */}
        <button
          id="btn-desktop-grid-toggle"
          onClick={onToggleGrid}
          title="Toggle grid lines"
          className={`p-1 sm:p-1.5 rounded-lg border text-[11px] font-medium transition-all shadow ${
            showGrid
              ? 'bg-[#34d399]/20 border-[#34d399]/50 text-[#34d399]'
              : 'bg-[#1c1b1b] border-[#353534]/60 text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>

        {/* Audit Overlay Mode Toggle */}
        <button
          id="btn-desktop-audit-toggle"
          onClick={toggleAuditOverlay}
          title={showAuditOverlay ? "Hide visual accessibility & audit overlay" : "Show visual accessibility & audit overlay"}
          className={`p-1 sm:p-1.5 rounded-lg border text-[11px] font-medium transition-all shadow flex items-center gap-1 ${
            showAuditOverlay
              ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300'
              : 'bg-[#1c1b1b] border-[#353534]/60 text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[10px]">Audit</span>
        </button>

        {/* Zoom out */}
        <button
          id="btn-desktop-zoom-out"
          onClick={() => setZoom?.((z) => Math.max(0.2, Math.round((z - 0.1) * 10) / 10))}
          className="w-5 h-5 sm:w-6 sm:h-6 bg-[#1c1b1b] border border-[#353534]/60 rounded-lg text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/60 transition-all flex items-center justify-center text-xs sm:text-sm font-bold shadow"
        >−</button>

        {/* Zoom Slider (Desktop right zoom slider) */}
        <input
          id="desktop-zoom-slider"
          type="range"
          min={20}
          max={300}
          step={5}
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom?.(Number(e.target.value) / 100)}
          onMouseDown={(e) => e.stopPropagation()}
          className="hidden sm:block w-20 md:w-28 h-1.5 accent-[#0d99ff] cursor-pointer bg-[#2a2a2a] rounded-lg"
          title={`Desktop Zoom Slider: ${Math.round(zoom * 100)}%`}
        />

        {/* Zoom in */}
        <button
          id="btn-desktop-zoom-in"
          onClick={() => setZoom?.((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))}
          className="w-5 h-5 sm:w-6 sm:h-6 bg-[#1c1b1b] border border-[#353534]/60 rounded-lg text-[#89919e] hover:text-[#e5e2e1] hover:border-[#9fcaff]/60 transition-all flex items-center justify-center text-xs sm:text-sm font-bold shadow"
        >+</button>

        {/* Zoom label */}
        <span
          id="desktop-zoom-label"
          className="text-[10px] sm:text-[11px] font-mono text-[#89919e] bg-[#1c1b1b] border border-[#353534]/60 px-1.5 sm:px-2 py-0.5 rounded-lg shadow min-w-[36px] sm:min-w-[44px] text-center"
        >
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Preview Stage (Translates for panning, centers viewport) */}
      <PreviewStage pan={pan} isPanning={isPanning}>
        {/* Device Frame (Applies visual scale transform around center) */}
        <DeviceFrame
          devicePreview={devicePreview}
          totalScale={totalScale}
          isInteracting={isPanning || !!draggingId || !!resizingId}
        >
          <div className="relative">
            {/* Interactive Figma-style Artboard Frame Header Chip */}
            <div
              id="artboard-header-chip"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(artboardId);
                if (setSelectedElementIds) setSelectedElementIds([artboardId]);
              }}
              className={`absolute -top-7 ${devicePreview === 'mobile' ? 'left-3' : 'left-0'} flex items-center gap-1.5 px-2.5 py-0.5 rounded cursor-pointer transition-all text-xs select-none z-30 ${
                selectedElementId === artboardId
                  ? 'bg-[#0d99ff] text-white shadow-sm ring-1 ring-[#0d99ff]/50 font-semibold'
                  : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
              }`}
              title="Click to select Artboard Frame"
            >
              <span className="text-[10px] opacity-75 font-mono">#</span>
              <span>{devicePreview === 'desktop' ? 'Desktop - 1440' : 'Mobile - 390'}</span>
              <span className="text-[10px] opacity-60 font-mono">
                {artboardWidth}×{artboardHeight}
              </span>
            </div>

            {/* Artboard (Renders fixed 1440x900 or 390x844 surface) */}
            <Artboard
              ref={artboardRef}
              id={artboardId}
              devicePreview={devicePreview}
              width={artboardWidth}
              height={artboardHeight}
              backgroundColor={activeArtboardBg}
              isSelected={selectedElementId === artboardId}
              onMouseDown={handleArtboardMouseDown}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(artboardId);
                if (setSelectedElementIds) setSelectedElementIds([artboardId]);
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              showGrid={showGrid}
            overlayGuides={
              <>
                {/* Dynamic Alignment Guidelines & Equal Gap Distance Indicators */}
                <AlignmentGuidelines
                  guides={activeGuides}
                  distanceMarkers={activeDistanceMarkers}
                  zoom={totalScale}
                />

                {/* Smart Snap Center Guidelines Fallback */}
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

                {/* Marquee Drag Selection Box */}
                {marqueeState && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${Math.min(marqueeState.startX, marqueeState.currentX)}px`,
                      top: `${Math.min(marqueeState.startY, marqueeState.currentY)}px`,
                      width: `${Math.abs(marqueeState.currentX - marqueeState.startX)}px`,
                      height: `${Math.abs(marqueeState.currentY - marqueeState.startY)}px`,
                    }}
                    className="border border-[#0d99ff] bg-[#0d99ff]/15 rounded pointer-events-none z-50 shadow-sm"
                  />
                )}

                {/* Top-level Selection Transform Gizmo */}
                {selectedElementId && elements[selectedElementId] && selectedElementId !== 'desktop-1440' && selectedElementId !== 'mobile-app-view' && (
                    <TransformGizmo
                        selectedElement={elements[selectedElementId]}
                        allElements={elements}
                        zoom={totalScale}
                        onUpdate={(id, updates) => {
                            const updated = { ...elements, [id]: { ...elements[id], ...updates } };
                            setElements(updated);
                            if (onUpdateElementWithHistory) onUpdateElementWithHistory(updated);
                        }}
                        onDuplicate={onDuplicateElement}
                        onDelete={onDeleteElement}
                        onUngroup={onUngroup}
                        setElements={setElements}
                    />
                )}
              </>
            }
          >
            {/* Unified Artboard Child Elements */}
            {artboardChildren.map(renderArtboardItem)}

            {/* Visual Design & Accessibility Audit Heatmap Badges */}
            {showAuditOverlay &&
              artboardChildren.map((el) => {
                if (!el || el.visible === false) return null;
                const isTextOrBtn = el.type === 'text' || el.type === 'button' || Boolean(el.textContent);
                const isInteractive =
                  el.type === 'button' ||
                  el.type === 'input' ||
                  el.type === 'icon' ||
                  Boolean(el.variant?.includes('btn'));

                let contrastBadge = null;
                if (isTextOrBtn) {
                  const parent = el.parentId ? elements[el.parentId] : null;
                  const bg =
                    el.type === 'button'
                      ? el.fill && el.fill !== 'none'
                        ? el.fill
                        : '#0D99FF'
                      : parent && parent.fill && parent.fill !== 'none'
                      ? parent.fill
                      : '#141218';
                  const fg = el.textColor || (el.type === 'text' ? el.fill : '#FFFFFF');
                  contrastBadge = calculateContrastRatio(fg, bg);
                }

                const isTouchUndersized = isInteractive && (el.width < 48 || el.height < 48);

                if (!contrastBadge && !isTouchUndersized) return null;

                return (
                  <div
                    key={`audit-chip-${el.id}`}
                    style={{
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${Math.max(0, el.y - 18)}px`,
                      zIndex: 48,
                      pointerEvents: 'auto',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                      if (setSelectedElementIds) setSelectedElementIds([el.id]);
                    }}
                    className="flex items-center gap-1 select-none cursor-pointer transform -translate-y-1 transition-transform hover:scale-110"
                    title={`Audit tag for ${el.name}. Click to select & analyze.`}
                  >
                    {contrastBadge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-0.5 shadow-md ${
                          contrastBadge.normalTextAAA
                            ? 'bg-emerald-500/90 text-white'
                            : contrastBadge.normalTextAA
                            ? 'bg-sky-500/90 text-white'
                            : 'bg-rose-500 text-white ring-1 ring-rose-400 animate-pulse'
                        }`}
                      >
                        {contrastBadge.normalTextAA ? '✓' : '✗'} {contrastBadge.ratio}:1
                      </span>
                    )}
                    {isTouchUndersized && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500 text-black shadow-md flex items-center gap-0.5">
                        <span className="text-[8px]">📱</span> &lt;48px
                      </span>
                    )}
                  </div>
                );
              })}

            {/* Live Multiplayer Collaborator Cursors inside Artboard */}
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

            {/* Interactive Canvas Comments inside Artboard */}
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
          </Artboard>
          </div>
        </DeviceFrame>
      </PreviewStage>
      {/* Context Menu */}
      <ContextMenu
        menu={canvasContextMenu}
        onClose={() => setCanvasContextMenu(null)}
      />
    </CanvasViewport>
  );
};
