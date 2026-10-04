import { useRef, useCallback } from 'react';

export const useCanvasCoordinates = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert raw screen pointer coordinates (clientX/Y) to canvas space
  const screenToCanvas = useCallback((clientX: number, clientY: number, pan: { x: number; y: number }, zoom: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, []);

  // Convert canvas coordinates back to screen pixel coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number, pan: { x: number; y: number }, zoom: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: canvasX * zoom + pan.x + rect.left,
      y: canvasY * zoom + pan.y + rect.top,
    };
  }, []);

  return {
    containerRef,
    screenToCanvas,
    canvasToScreen,
  };
};
