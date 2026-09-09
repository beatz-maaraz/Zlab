import { useState, useEffect, useMemo, RefObject } from 'react';
import { DevicePreview, DEVICE_PRESETS } from '../../../types';

/**
 * Calculates the scale factor to visually fit the fixed artboard inside the available container viewport.
 * Does not mutate design coordinates; only scales the visual representation.
 */
export function calculatePreviewScale(
  containerWidth: number,
  containerHeight: number,
  artboardWidth: number,
  artboardHeight: number,
  padding = 48
): number {
  if (containerWidth <= 0 || containerHeight <= 0 || artboardWidth <= 0 || artboardHeight <= 0) {
    return 1;
  }
  const availableWidth = Math.max(1, containerWidth - padding);
  const availableHeight = Math.max(1, containerHeight - padding);

  const scaleX = availableWidth / artboardWidth;
  const scaleY = availableHeight / artboardHeight;

  return Math.min(scaleX, scaleY, 1);
}

export interface UsePreviewScaleOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  devicePreview: DevicePreview;
  zoom: number;
  padding?: number;
}

export interface PreviewScaleResult {
  artboardWidth: number;
  artboardHeight: number;
  fitScale: number;
  previewScale: number;
  totalScale: number;
  containerSize: { width: number; height: number };
  screenToArtboard: (clientX: number, clientY: number, artboardRect: DOMRect) => { x: number; y: number };
}

export function usePreviewScale({
  containerRef,
  devicePreview,
  zoom,
  padding = 48,
}: UsePreviewScaleOptions): PreviewScaleResult {
  const preset = DEVICE_PRESETS[devicePreview] || DEVICE_PRESETS.desktop;
  const artboardWidth = preset.width;
  const artboardHeight = preset.height;

  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    measure();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerSize({
            width: Math.round(entry.contentRect.width),
            height: Math.round(entry.contentRect.height),
          });
        }
      }
    });

    observer.observe(el);

    // Also listen to window resize as fallback
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [containerRef]);

  const fitScale = useMemo(() => {
    if (containerSize.width <= 0 || containerSize.height <= 0) return 1;

    // For mobile, include frame bezel allowance (e.g. 24px) so outer frame is not clipped
    const extraFrameAllowance = devicePreview === 'mobile' ? 24 : 0;
    return calculatePreviewScale(
      containerSize.width,
      containerSize.height,
      artboardWidth + extraFrameAllowance,
      artboardHeight + extraFrameAllowance,
      padding
    );
  }, [containerSize.width, containerSize.height, artboardWidth, artboardHeight, devicePreview, padding]);

  const previewScale = fitScale;
  const totalScale = previewScale * zoom;

  const screenToArtboard = (clientX: number, clientY: number, artboardRect: DOMRect) => {
    const effectiveScale = totalScale > 0 ? totalScale : 1;
    return {
      x: (clientX - artboardRect.left) / effectiveScale,
      y: (clientY - artboardRect.top) / effectiveScale,
    };
  };

  return {
    artboardWidth,
    artboardHeight,
    fitScale,
    previewScale,
    totalScale,
    containerSize,
    screenToArtboard,
  };
}
