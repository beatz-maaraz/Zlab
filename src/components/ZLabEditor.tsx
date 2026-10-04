import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';

interface Element {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
}

interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

interface DragInfo {
  type: 'move' | 'resize';
  id: string;
  startX: number;
  startY: number;
  initialElemX?: number;
  initialElemY?: number;
  handle?: string;
  initX?: number;
  initY?: number;
  initW?: number;
  initH?: number;
}

export default function ZLabEditor() {
  // -------------------------------------------------------------
  // 1. STATE & REFS
  // -------------------------------------------------------------
  const [elements, setElements] = useState<Element[]>([
    { id: '1', type: 'rect', x: 120, y: 120, width: 140, height: 90, fill: '#3b82f6', opacity: 1 },
    { id: '2', type: 'circle', x: 320, y: 160, width: 110, height: 110, fill: '#10b981', opacity: 1 },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ panX: 0, panY: 0, zoom: 1.0 });
  const [activeTool, setActiveTool] = useState<string>('select'); // 'select', 'rect', 'circle'

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWorldRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef<DragInfo | null>(null);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  // -------------------------------------------------------------
  // 2. COORDINATE CONVERSION (Screen to Canvas World)
  // -------------------------------------------------------------
  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.round((clientX - rect.left - viewport.panX) / viewport.zoom),
      y: Math.round((clientY - rect.top - viewport.panY) / viewport.zoom),
    };
  }, [viewport]);

  // -------------------------------------------------------------
  // 3. ZOOM ANCHORED TO CURSOR
  // -------------------------------------------------------------
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Point in world coordinates before zoom
    const worldX = (mouseX - viewport.panX) / viewport.zoom;
    const worldY = (mouseY - viewport.panY) / viewport.zoom;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.2), 5.0);

    setViewport({
      panX: mouseX - worldX * newZoom,
      panY: mouseY - worldY * newZoom,
      zoom: newZoom,
    });
  };

  // -------------------------------------------------------------
  // 4. ADD NEW SHAPES
  // -------------------------------------------------------------
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === 'select') {
      setSelectedId(null);
      return;
    }

    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    const newShape: Element = {
      id: Date.now().toString(),
      type: activeTool,
      x: x - 50,
      y: y - 50,
      width: 100,
      height: 100,
      fill: activeTool === 'rect' ? '#8b5cf6' : '#ec4899',
      opacity: 1,
    };

    setElements((prev) => [...prev, newShape]);
    setSelectedId(newShape.id);
    setActiveTool('select'); // Return to select tool
  };

  // -------------------------------------------------------------
  // 5. DRAG ELEMENT (Divided by zoom for 1:1 speed)
  // -------------------------------------------------------------
  const startElementDrag = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedId(id);

    const elem = elements.find((el) => el.id === id);
    if (!elem) return;

    dragInfoRef.current = {
      type: 'move',
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialElemX: elem.x,
      initialElemY: elem.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // -------------------------------------------------------------
  // 6. RESIZE ELEMENT (8 Handles with Minimum Clamp)
  // -------------------------------------------------------------
  const startResize = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedElement) return;

    dragInfoRef.current = {
      type: 'resize',
      handle,
      id: selectedElement.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: selectedElement.x,
      initY: selectedElement.y,
      initW: selectedElement.width,
      initH: selectedElement.height,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragInfoRef.current;
    if (!drag) return;

    // Movement in canvas world units
    const dx = (e.clientX - drag.startX) / viewport.zoom;
    const dy = (e.clientY - drag.startY) / viewport.zoom;

    if (drag.type === 'move') {
      setElements((prev) =>
        prev.map((el) =>
          el.id === drag.id
            ? { ...el, x: Math.round(drag.initialElemX! + dx), y: Math.round(drag.initialElemY! + dy) }
            : el
        )
      );
    } else if (drag.type === 'resize') {
      const { initX, initY, initW, initH, handle } = drag;
      let newW = initW!;
      let newH = initH!;
      let newX = initX!;
      let newY = initY!;

      // Width and X
      if (handle!.includes('e')) newW = Math.max(15, initW! + dx);
      if (handle!.includes('w')) {
        const candidateW = Math.max(15, initW! - dx);
        newX += initW! - candidateW;
        newW = candidateW;
      }

      // Height and Y
      if (handle!.includes('s')) newH = Math.max(15, initH! + dy);
      if (handle!.includes('n')) {
        const candidateH = Math.max(15, initH! - dy);
        newY += initH! - candidateH;
        newH = candidateH;
      }

      setElements((prev) =>
        prev.map((el) =>
          el.id === drag.id
            ? { ...el, x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) }
            : el
        )
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragInfoRef.current) {
      const target = e.target as HTMLElement;
      dragInfoRef.current = null;
      try { target.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };

  // -------------------------------------------------------------
  // 7. KEYBOARD SHORTCUTS (Delete safety)
  // -------------------------------------------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (isInput) return; // Do not delete canvas elements while typing in an input field

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        setElements((prev) => prev.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  // -------------------------------------------------------------
  // 8. EXPORT HTML & PNG
  // -------------------------------------------------------------
  const exportPng = async () => {
    if (!canvasWorldRef.current) return;
    try {
      if ('fonts' in document) {
        await (document as any).fonts.ready;
      }
      const dataUrl = await toPng(canvasWorldRef.current, {
        pixelRatio: 2,
        style: { transform: 'none', position: 'static' },
        filter: (node: any) => !node.classList?.contains('editor-gizmo'),
      });
      const a = document.createElement('a');
      a.download = 'zlab-design.png';
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const exportHtml = () => {
    const itemsMarkup = elements.map(el => 
      `  <div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;background-color:${el.fill};opacity:${el.opacity};border-radius:${el.type === 'circle' ? '50%' : '8px'};"></div>`
    ).join('\n');

    const fullHtml = `<div style="position:relative;width:1000px;height:700px;background:#18181b;overflow:hidden;border-radius:12px;">\n${itemsMarkup}\n</div>`;
    navigator.clipboard.writeText(fullHtml);
    alert('Clean HTML copied to clipboard!');
  };

  // -------------------------------------------------------------
  // 9. RENDER UI
  // -------------------------------------------------------------
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'sans-serif', userSelect: 'none' }}>
      {/* Top Navbar */}
      <div style={{ height: '48px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#121215' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <strong style={{ letterSpacing: '1px', color: '#60a5fa' }}>ZLAB</strong>
          <span style={{ fontSize: '12px', color: '#71717a' }}>| Vector Studio</span>
        </div>

        {/* Tools */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'select', label: 'Select (V)' },
            { id: 'rect', label: 'Rectangle' },
            { id: 'circle', label: 'Circle' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                border: '1px solid',
                borderColor: activeTool === t.id ? '#3b82f6' : '#27272a',
                backgroundColor: activeTool === t.id ? '#1e3a8a' : '#18181b',
                color: activeTool === t.id ? '#ffffff' : '#a1a1aa',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{Math.round(viewport.zoom * 100)}%</span>
          <button onClick={exportHtml} style={{ padding: '6px 12px', background: '#27272a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
            Copy HTML
          </button>
          <button onClick={exportPng} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            Export PNG
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Infinite Interactive Canvas */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#0c0d10',
            backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
            backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
            backgroundPosition: `${viewport.panX}px ${viewport.panY}px`,
            cursor: activeTool === 'select' ? 'default' : 'crosshair',
          }}
        >
          {/* Scaled Canvas World Layer */}
          <div
            ref={canvasWorldRef}
            style={{
              position: 'absolute',
              transformOrigin: '0 0',
              transform: `translate3d(${viewport.panX}px, ${viewport.panY}px, 0) scale(${viewport.zoom})`,
              width: '4000px',
              height: '4000px',
            }}
          >
            {elements.map((el) => (
              <div
                key={el.id}
                onPointerDown={(e) => startElementDrag(el.id, e)}
                style={{
                  position: 'absolute',
                  transform: `translate3d(${el.x}px, ${el.y}px, 0)`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  backgroundColor: el.fill,
                  opacity: el.opacity,
                  borderRadius: el.type === 'circle' ? '50%' : '8px',
                  boxShadow: selectedId === el.id ? '0 0 0 2px #3b82f6' : 'none',
                  cursor: 'grab',
                  touchAction: 'none',
                }}
              />
            ))}

            {/* Selection Gizmo (8 Handles) */}
            {selectedElement && (
              <div
                className="editor-gizmo"
                style={{
                  position: 'absolute',
                  transform: `translate3d(${selectedElement.x}px, ${selectedElement.y}px, 0)`,
                  width: `${selectedElement.width}px`,
                  height: `${selectedElement.height}px`,
                  border: '1px solid #3b82f6',
                  pointerEvents: 'none',
                }}
              >
                {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => (
                  <div
                    key={h}
                    onPointerDown={(e) => startResize(h, e)}
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#fff',
                      border: '1.5px solid #2563eb',
                      borderRadius: '2px',
                      pointerEvents: 'all',
                      cursor: `${h as any}-resize`,
                      top: h.includes('n') ? '-5px' : h.includes('s') ? 'calc(100% - 3px)' : 'calc(50% - 4px)',
                      left: h.includes('w') ? '-5px' : h.includes('e') ? 'calc(100% - 3px)' : 'calc(50% - 4px)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Inspector Panel */}
        <div style={{ width: '240px', background: '#121215', borderLeft: '1px solid #27272a', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: '#a1a1aa' }}>Properties</h4>
          {selectedElement ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: '#71717a', marginBottom: '4px' }}>Fill Color</label>
                <input
                  type="color"
                  value={selectedElement.fill}
                  onChange={(e) => {
                    const val = e.target.value;
                    setElements((prev) => prev.map((el) => (el.id === selectedElement.id ? { ...el, fill: val } : el)));
                  }}
                  style={{ width: '100%', height: '32px', background: 'transparent', border: '1px solid #27272a', borderRadius: '4px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ color: '#71717a' }}>Width</label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => {
                      const val = Math.max(10, parseInt(e.target.value) || 10);
                      setElements((prev) => prev.map((el) => (el.id === selectedElement.id ? { ...el, width: val } : el)));
                    }}
                    style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '6px', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#71717a' }}>Height</label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => {
                      const val = Math.max(10, parseInt(e.target.value) || 10);
                      setElements((prev) => prev.map((el) => (el.id === selectedElement.id ? { ...el, height: val } : el)));
                    }}
                    style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '6px', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#71717a', marginBottom: '4px' }}>Opacity: {Math.round(selectedElement.opacity * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedElement.opacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setElements((prev) => prev.map((el) => (el.id === selectedElement.id ? { ...el, opacity: val } : el)));
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <button
                onClick={() => {
                  setElements((prev) => prev.filter((el) => el.id !== selectedElement.id));
                  setSelectedId(null);
                }}
                style={{ marginTop: '12px', padding: '8px', background: '#7f1d1d', border: 'none', color: '#fca5a5', borderRadius: '6px', cursor: 'pointer' }}
              >
                Delete Element
              </button>
            </div>
          ) : (
            <div style={{ color: '#52525b', fontSize: '13px' }}>Click an element on the canvas to inspect its properties.</div>
          )}
        </div>
      </div>
    </div>
  );
}
