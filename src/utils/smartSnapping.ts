import { CanvasElement } from '../types';

export interface AlignmentGuide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number; // X coordinate if vertical, Y coordinate if horizontal
  start: number;    // Y start if vertical, X start if horizontal
  end: number;      // Y end if vertical, X end if horizontal
  type: 'edge' | 'center' | 'gap' | 'artboard';
  label?: string;
  sourceTarget?: string;
}

export interface DistanceMarker {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance: number;
  orientation: 'horizontal' | 'vertical';
}

export interface SnapComputationResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
  distanceMarkers: DistanceMarker[];
  hasSnappedX: boolean;
  hasSnappedY: boolean;
}

export interface SnapOptions {
  threshold?: number;
  snapToArtboard?: boolean;
  snapToNeighbors?: boolean;
  snapToEqualGaps?: boolean;
  artboardWidth: number;
  artboardHeight: number;
}

export interface MovingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface XCandidate {
  snappedX: number;
  delta: number;
  lineX: number;
  startY: number;
  endY: number;
  label: string;
  type: 'edge' | 'center' | 'gap' | 'artboard';
  targetName?: string;
  distanceMarker?: DistanceMarker;
}

interface YCandidate {
  snappedY: number;
  delta: number;
  lineY: number;
  startX: number;
  endX: number;
  label: string;
  type: 'edge' | 'center' | 'gap' | 'artboard';
  targetName?: string;
  distanceMarker?: DistanceMarker;
}

/**
 * Robust smart snapping calculation for canvas UI elements.
 * Checks neighboring elements (edges, centers, gaps) and artboard boundaries.
 */
export function computeSmartSnapping(
  moving: MovingBox,
  neighbors: CanvasElement[],
  options: SnapOptions
): SnapComputationResult {
  const threshold = options.threshold ?? 6;
  const { artboardWidth, artboardHeight } = options;
  const snapToArtboard = options.snapToArtboard ?? true;
  const snapToNeighbors = options.snapToNeighbors ?? true;
  const snapToEqualGaps = options.snapToEqualGaps ?? true;

  const mLeft = moving.x;
  const mCenterX = moving.x + moving.width / 2;
  const mRight = moving.x + moving.width;

  const mTop = moving.y;
  const mCenterY = moving.y + moving.height / 2;
  const mBottom = moving.y + moving.height;

  // -------------------------------------------------------------
  // 1. Calculate Horizontal (X) Snap Candidates
  // -------------------------------------------------------------
  const xCandidates: XCandidate[] = [];

  if (snapToNeighbors) {
    for (const nb of neighbors) {
      const nLeft = nb.x;
      const nCenterX = nb.x + nb.width / 2;
      const nRight = nb.x + nb.width;
      const nTop = nb.y;
      const nBottom = nb.y + nb.height;

      const spanYMin = Math.min(mTop, nTop) - 12;
      const spanYMax = Math.max(mBottom, nBottom) + 12;

      // 1. Left to Left
      let delta = Math.abs(mLeft - nLeft);
      if (delta <= threshold) {
        xCandidates.push({
          snappedX: nLeft,
          delta,
          lineX: nLeft,
          startY: spanYMin,
          endY: spanYMax,
          label: 'Left Align',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 2. Right to Left (moving element placed directly to the left of neighbor)
      delta = Math.abs(mRight - nLeft);
      if (delta <= threshold) {
        xCandidates.push({
          snappedX: nLeft - moving.width,
          delta,
          lineX: nLeft,
          startY: spanYMin,
          endY: spanYMax,
          label: 'Right to Left',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 3. Center to Center
      delta = Math.abs(mCenterX - nCenterX);
      if (delta <= threshold) {
        xCandidates.push({
          snappedX: nCenterX - moving.width / 2,
          delta,
          lineX: nCenterX,
          startY: spanYMin,
          endY: spanYMax,
          label: 'Center X',
          type: 'center',
          targetName: nb.name,
        });
      }

      // 4. Left to Right (moving element placed directly to the right of neighbor)
      delta = Math.abs(mLeft - nRight);
      if (delta <= threshold) {
        xCandidates.push({
          snappedX: nRight,
          delta,
          lineX: nRight,
          startY: spanYMin,
          endY: spanYMax,
          label: 'Left to Right',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 5. Right to Right
      delta = Math.abs(mRight - nRight);
      if (delta <= threshold) {
        xCandidates.push({
          snappedX: nRight - moving.width,
          delta,
          lineX: nRight,
          startY: spanYMin,
          endY: spanYMax,
          label: 'Right Align',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 6. Proximity Gap Snap (e.g. standard spacing gaps: 8, 16, 24, 32, 40)
      const standardGaps = [8, 12, 16, 20, 24, 32, 40, 48];
      // Neighbor is to the left of moving element
      if (mLeft > nRight && mLeft - nRight <= 80) {
        const currentGap = mLeft - nRight;
        for (const g of standardGaps) {
          if (Math.abs(currentGap - g) <= threshold) {
            const snapped = nRight + g;
            const midY = (Math.max(mTop, nTop) + Math.min(mBottom, nBottom)) / 2;
            xCandidates.push({
              snappedX: snapped,
              delta: Math.abs(currentGap - g),
              lineX: nRight + g / 2,
              startY: spanYMin,
              endY: spanYMax,
              label: `Gap: ${g}px`,
              type: 'gap',
              targetName: nb.name,
              distanceMarker: {
                id: `dist-x-${nb.id}-${g}`,
                x1: nRight,
                y1: midY,
                x2: snapped,
                y2: midY,
                distance: g,
                orientation: 'horizontal',
              },
            });
          }
        }
      }
      // Moving element is to the left of neighbor
      if (nLeft > mRight && nLeft - mRight <= 80) {
        const currentGap = nLeft - mRight;
        for (const g of standardGaps) {
          if (Math.abs(currentGap - g) <= threshold) {
            const snapped = nLeft - g - moving.width;
            const midY = (Math.max(mTop, nTop) + Math.min(mBottom, nBottom)) / 2;
            xCandidates.push({
              snappedX: snapped,
              delta: Math.abs(currentGap - g),
              lineX: nLeft - g / 2,
              startY: spanYMin,
              endY: spanYMax,
              label: `Gap: ${g}px`,
              type: 'gap',
              targetName: nb.name,
              distanceMarker: {
                id: `dist-x-${nb.id}-${g}-rev`,
                x1: snapped + moving.width,
                y1: midY,
                x2: nLeft,
                y2: midY,
                distance: g,
                orientation: 'horizontal',
              },
            });
          }
        }
      }
    }
  }

  // Equal Gap Snapping between two neighboring elements (Left and Right)
  if (snapToEqualGaps && neighbors.length >= 2) {
    for (let i = 0; i < neighbors.length; i++) {
      const a = neighbors[i];
      for (let j = i + 1; j < neighbors.length; j++) {
        const b = neighbors[j];
        // Determine left and right neighbor
        const leftNb = a.x < b.x ? a : b;
        const rightNb = a.x < b.x ? b : a;

        // Moving element between leftNb and rightNb
        if (mLeft >= leftNb.x + leftNb.width - 20 && mRight <= rightNb.x + 20) {
          const availableSpace = rightNb.x - (leftNb.x + leftNb.width);
          if (availableSpace > moving.width) {
            const equalGap = (availableSpace - moving.width) / 2;
            const targetX = leftNb.x + leftNb.width + equalGap;
            const delta = Math.abs(mLeft - targetX);
            if (delta <= threshold) {
              const midY = (mTop + mBottom) / 2;
              xCandidates.push({
                snappedX: Math.round(targetX),
                delta,
                lineX: Math.round(targetX + moving.width / 2),
                startY: Math.min(leftNb.y, mTop, rightNb.y) - 10,
                endY: Math.max(leftNb.y + leftNb.height, mBottom, rightNb.y + rightNb.height) + 10,
                label: `Equal Gap: ${Math.round(equalGap)}px`,
                type: 'gap',
                distanceMarker: {
                  id: `dist-eq-${leftNb.id}-${rightNb.id}`,
                  x1: leftNb.x + leftNb.width,
                  y1: midY,
                  x2: targetX,
                  y2: midY,
                  distance: Math.round(equalGap),
                  orientation: 'horizontal',
                },
              });
            }
          }
        }
      }
    }
  }

  // Artboard X candidates
  if (snapToArtboard) {
    // 1. Artboard Left Edge (0)
    let delta = Math.abs(mLeft - 0);
    if (delta <= threshold) {
      xCandidates.push({
        snappedX: 0,
        delta,
        lineX: 0,
        startY: 0,
        endY: artboardHeight,
        label: 'Artboard Left',
        type: 'artboard',
      });
    }

    // 2. Artboard Center X (width / 2)
    const artCenterX = artboardWidth / 2;
    delta = Math.abs(mCenterX - artCenterX);
    if (delta <= threshold) {
      xCandidates.push({
        snappedX: Math.round(artCenterX - moving.width / 2),
        delta,
        lineX: artCenterX,
        startY: 0,
        endY: artboardHeight,
        label: 'Artboard Center',
        type: 'artboard',
      });
    }

    // 3. Artboard Right Edge (width)
    delta = Math.abs(mRight - artboardWidth);
    if (delta <= threshold) {
      xCandidates.push({
        snappedX: artboardWidth - moving.width,
        delta,
        lineX: artboardWidth,
        startY: 0,
        endY: artboardHeight,
        label: 'Artboard Right',
        type: 'artboard',
      });
    }
  }

  // -------------------------------------------------------------
  // 2. Calculate Vertical (Y) Snap Candidates
  // -------------------------------------------------------------
  const yCandidates: YCandidate[] = [];

  if (snapToNeighbors) {
    for (const nb of neighbors) {
      const nLeft = nb.x;
      const nRight = nb.x + nb.width;
      const nTop = nb.y;
      const nCenterY = nb.y + nb.height / 2;
      const nBottom = nb.y + nb.height;

      const spanXMin = Math.min(mLeft, nLeft) - 12;
      const spanXMax = Math.max(mRight, nRight) + 12;

      // 1. Top to Top
      let delta = Math.abs(mTop - nTop);
      if (delta <= threshold) {
        yCandidates.push({
          snappedY: nTop,
          delta,
          lineY: nTop,
          startX: spanXMin,
          endX: spanXMax,
          label: 'Top Align',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 2. Bottom to Top (moving element placed directly above neighbor)
      delta = Math.abs(mBottom - nTop);
      if (delta <= threshold) {
        yCandidates.push({
          snappedY: nTop - moving.height,
          delta,
          lineY: nTop,
          startX: spanXMin,
          endX: spanXMax,
          label: 'Bottom to Top',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 3. Center to Center
      delta = Math.abs(mCenterY - nCenterY);
      if (delta <= threshold) {
        yCandidates.push({
          snappedY: nCenterY - moving.height / 2,
          delta,
          lineY: nCenterY,
          startX: spanXMin,
          endX: spanXMax,
          label: 'Center Y',
          type: 'center',
          targetName: nb.name,
        });
      }

      // 4. Top to Bottom (moving element placed directly below neighbor)
      delta = Math.abs(mTop - nBottom);
      if (delta <= threshold) {
        yCandidates.push({
          snappedY: nBottom,
          delta,
          lineY: nBottom,
          startX: spanXMin,
          endX: spanXMax,
          label: 'Top to Bottom',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 5. Bottom to Bottom
      delta = Math.abs(mBottom - nBottom);
      if (delta <= threshold) {
        yCandidates.push({
          snappedY: nBottom - moving.height,
          delta,
          lineY: nBottom,
          startX: spanXMin,
          endX: spanXMax,
          label: 'Bottom Align',
          type: 'edge',
          targetName: nb.name,
        });
      }

      // 6. Proximity Gap Snap
      const standardGaps = [8, 12, 16, 20, 24, 32, 40, 48];
      if (mTop > nBottom && mTop - nBottom <= 80) {
        const currentGap = mTop - nBottom;
        for (const g of standardGaps) {
          if (Math.abs(currentGap - g) <= threshold) {
            const snapped = nBottom + g;
            const midX = (Math.max(mLeft, nLeft) + Math.min(mRight, nRight)) / 2;
            yCandidates.push({
              snappedY: snapped,
              delta: Math.abs(currentGap - g),
              lineY: nBottom + g / 2,
              startX: spanXMin,
              endX: spanXMax,
              label: `Gap: ${g}px`,
              type: 'gap',
              targetName: nb.name,
              distanceMarker: {
                id: `dist-y-${nb.id}-${g}`,
                x1: midX,
                y1: nBottom,
                x2: midX,
                y2: snapped,
                distance: g,
                orientation: 'vertical',
              },
            });
          }
        }
      }
      if (nTop > mBottom && nTop - mBottom <= 80) {
        const currentGap = nTop - mBottom;
        for (const g of standardGaps) {
          if (Math.abs(currentGap - g) <= threshold) {
            const snapped = nTop - g - moving.height;
            const midX = (Math.max(mLeft, nLeft) + Math.min(mRight, nRight)) / 2;
            yCandidates.push({
              snappedY: snapped,
              delta: Math.abs(currentGap - g),
              lineY: nTop - g / 2,
              startX: spanXMin,
              endX: spanXMax,
              label: `Gap: ${g}px`,
              type: 'gap',
              targetName: nb.name,
              distanceMarker: {
                id: `dist-y-${nb.id}-${g}-rev`,
                x1: midX,
                y1: snapped + moving.height,
                x2: midX,
                y2: nTop,
                distance: g,
                orientation: 'vertical',
              },
            });
          }
        }
      }
    }
  }

  // Equal Gap Snapping between two neighboring elements (Top and Bottom)
  if (snapToEqualGaps && neighbors.length >= 2) {
    for (let i = 0; i < neighbors.length; i++) {
      const a = neighbors[i];
      for (let j = i + 1; j < neighbors.length; j++) {
        const b = neighbors[j];
        const topNb = a.y < b.y ? a : b;
        const bottomNb = a.y < b.y ? b : a;

        if (mTop >= topNb.y + topNb.height - 20 && mBottom <= bottomNb.y + 20) {
          const availableSpace = bottomNb.y - (topNb.y + topNb.height);
          if (availableSpace > moving.height) {
            const equalGap = (availableSpace - moving.height) / 2;
            const targetY = topNb.y + topNb.height + equalGap;
            const delta = Math.abs(mTop - targetY);
            if (delta <= threshold) {
              const midX = (mLeft + mRight) / 2;
              yCandidates.push({
                snappedY: Math.round(targetY),
                delta,
                lineY: Math.round(targetY + moving.height / 2),
                startX: Math.min(topNb.x, mLeft, bottomNb.x) - 10,
                endX: Math.max(topNb.x + topNb.width, mRight, bottomNb.x + bottomNb.width) + 10,
                label: `Equal Gap: ${Math.round(equalGap)}px`,
                type: 'gap',
                distanceMarker: {
                  id: `dist-eq-y-${topNb.id}-${bottomNb.id}`,
                  x1: midX,
                  y1: topNb.y + topNb.height,
                  x2: midX,
                  y2: targetY,
                  distance: Math.round(equalGap),
                  orientation: 'vertical',
                },
              });
            }
          }
        }
      }
    }
  }

  // Artboard Y candidates
  if (snapToArtboard) {
    // 1. Artboard Top Edge (0)
    let delta = Math.abs(mTop - 0);
    if (delta <= threshold) {
      yCandidates.push({
        snappedY: 0,
        delta,
        lineY: 0,
        startX: 0,
        endX: artboardWidth,
        label: 'Artboard Top',
        type: 'artboard',
      });
    }

    // 2. Artboard Center Y (height / 2)
    const artCenterY = artboardHeight / 2;
    delta = Math.abs(mCenterY - artCenterY);
    if (delta <= threshold) {
      yCandidates.push({
        snappedY: Math.round(artCenterY - moving.height / 2),
        delta,
        lineY: artCenterY,
        startX: 0,
        endX: artboardWidth,
        label: 'Artboard Center',
        type: 'artboard',
      });
    }

    // 3. Artboard Bottom Edge (height)
    delta = Math.abs(mBottom - artboardHeight);
    if (delta <= threshold) {
      yCandidates.push({
        snappedY: artboardHeight - moving.height,
        delta,
        lineY: artboardHeight,
        startX: 0,
        endX: artboardWidth,
        label: 'Artboard Bottom',
        type: 'artboard',
      });
    }
  }

  // -------------------------------------------------------------
  // 3. Resolve Best Snap for X & Y
  // -------------------------------------------------------------
  let finalX = moving.x;
  let finalY = moving.y;
  let hasSnappedX = false;
  let hasSnappedY = false;
  const guides: AlignmentGuide[] = [];
  const distanceMarkers: DistanceMarker[] = [];

  if (xCandidates.length > 0) {
    // Sort by smallest delta; prioritize neighbor alignment over artboard if deltas are close
    xCandidates.sort((a, b) => {
      if (Math.abs(a.delta - b.delta) < 0.5) {
        if (a.type !== 'artboard' && b.type === 'artboard') return -1;
        if (a.type === 'artboard' && b.type !== 'artboard') return 1;
      }
      return a.delta - b.delta;
    });

    const bestX = xCandidates[0];
    finalX = Math.round(bestX.snappedX);
    hasSnappedX = true;

    // Collect all candidates matching this snapped coordinate / line to show comprehensive guides
    const matchingX = xCandidates.filter(
      (c) => Math.abs(c.snappedX - bestX.snappedX) <= 1 || Math.abs(c.lineX - bestX.lineX) <= 1
    );

    // Merge start and end spans across all matching elements
    const startY = Math.max(0, Math.min(...matchingX.map((c) => c.startY)));
    const endY = Math.min(artboardHeight, Math.max(...matchingX.map((c) => c.endY)));

    guides.push({
      id: `guide-v-${bestX.lineX}`,
      orientation: 'vertical',
      position: bestX.lineX,
      start: startY,
      end: endY,
      type: bestX.type,
      label: bestX.label,
      sourceTarget: bestX.targetName,
    });

    matchingX.forEach((c) => {
      if (c.distanceMarker) {
        distanceMarkers.push(c.distanceMarker);
      }
    });
  }

  if (yCandidates.length > 0) {
    yCandidates.sort((a, b) => {
      if (Math.abs(a.delta - b.delta) < 0.5) {
        if (a.type !== 'artboard' && b.type === 'artboard') return -1;
        if (a.type === 'artboard' && b.type !== 'artboard') return 1;
      }
      return a.delta - b.delta;
    });

    const bestY = yCandidates[0];
    finalY = Math.round(bestY.snappedY);
    hasSnappedY = true;

    const matchingY = yCandidates.filter(
      (c) => Math.abs(c.snappedY - bestY.snappedY) <= 1 || Math.abs(c.lineY - bestY.lineY) <= 1
    );

    const startX = Math.max(0, Math.min(...matchingY.map((c) => c.startX)));
    const endX = Math.min(artboardWidth, Math.max(...matchingY.map((c) => c.endX)));

    guides.push({
      id: `guide-h-${bestY.lineY}`,
      orientation: 'horizontal',
      position: bestY.lineY,
      start: startX,
      end: endX,
      type: bestY.type,
      label: bestY.label,
      sourceTarget: bestY.targetName,
    });

    matchingY.forEach((c) => {
      if (c.distanceMarker) {
        distanceMarkers.push(c.distanceMarker);
      }
    });
  }

  return {
    x: finalX,
    y: finalY,
    guides,
    distanceMarkers,
    hasSnappedX,
    hasSnappedY,
  };
}
