import React from 'react';
import { AlignmentGuide, DistanceMarker } from '../../utils/smartSnapping';

interface AlignmentGuidelinesProps {
  guides: AlignmentGuide[];
  distanceMarkers?: DistanceMarker[];
  zoom?: number;
}

export const AlignmentGuidelines: React.FC<AlignmentGuidelinesProps> = ({
  guides,
  distanceMarkers = [],
}) => {
  if (guides.length === 0 && distanceMarkers.length === 0) {
    return null;
  }

  return (
    <div
      id="dynamic-alignment-guidelines-layer"
      className="absolute inset-0 pointer-events-none z-[60] overflow-visible"
    >
      {/* 1. Alignment Guides (Horizontal and Vertical) */}
      {guides.map((guide) => {
        const isVertical = guide.orientation === 'vertical';
        const isCenter = guide.type === 'center';
        const isArtboard = guide.type === 'artboard';

        // Color coding:
        // Magenta (#ff007a) for neighbor edge/center alignment (industry standard)
        // Cyan (#00f0ff) for artboard bounds/centers
        // Emerald (#10b981) for equal gap alignment
        let lineColor = '#ff007a';
        let glowColor = 'rgba(255, 0, 122, 0.45)';
        if (isArtboard) {
          lineColor = '#00f0ff';
          glowColor = 'rgba(0, 240, 255, 0.45)';
        } else if (guide.type === 'gap') {
          lineColor = '#10b981';
          glowColor = 'rgba(16, 185, 129, 0.45)';
        }

        if (isVertical) {
          const height = Math.max(8, guide.end - guide.start);
          const midY = guide.start + height / 2;

          return (
            <React.Fragment key={guide.id}>
              {/* Vertical Guide Line */}
              <div
                style={{
                  left: `${guide.position}px`,
                  top: `${guide.start}px`,
                  height: `${height}px`,
                  backgroundColor: lineColor,
                  boxShadow: `0 0 8px ${glowColor}`,
                }}
                className="absolute w-[1px] pointer-events-none transform -translate-x-[0.5px]"
              />

              {/* Start Tick Marker */}
              <div
                style={{
                  left: `${guide.position - 3.5}px`,
                  top: `${guide.start}px`,
                  backgroundColor: lineColor,
                }}
                className="absolute w-[8px] h-[1px] pointer-events-none"
              />

              {/* End Tick Marker */}
              <div
                style={{
                  left: `${guide.position - 3.5}px`,
                  top: `${guide.end}px`,
                  backgroundColor: lineColor,
                }}
                className="absolute w-[8px] h-[1px] pointer-events-none"
              />

              {/* Real-Time Smart Alignment Badge */}
              {guide.label && (
                <div
                  style={{
                    left: `${guide.position + 6}px`,
                    top: `${midY}px`,
                    backgroundColor: lineColor,
                    boxShadow: `0 2px 6px ${glowColor}`,
                  }}
                  className="absolute -translate-y-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white whitespace-nowrap select-none pointer-events-none flex items-center gap-1 z-[65] tracking-tight"
                >
                  <span>{guide.label}</span>
                  {guide.sourceTarget && (
                    <span className="opacity-85 font-normal text-[8px] max-w-[90px] truncate">
                      ({guide.sourceTarget})
                    </span>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        }

        // Horizontal Guide
        const width = Math.max(8, guide.end - guide.start);
        const midX = guide.start + width / 2;

        return (
          <React.Fragment key={guide.id}>
            {/* Horizontal Guide Line */}
            <div
              style={{
                top: `${guide.position}px`,
                left: `${guide.start}px`,
                width: `${width}px`,
                backgroundColor: lineColor,
                boxShadow: `0 0 8px ${glowColor}`,
              }}
              className="absolute h-[1px] pointer-events-none transform -translate-y-[0.5px]"
            />

            {/* Start Tick Marker */}
            <div
              style={{
                top: `${guide.position - 3.5}px`,
                left: `${guide.start}px`,
                backgroundColor: lineColor,
              }}
              className="absolute h-[8px] w-[1px] pointer-events-none"
            />

            {/* End Tick Marker */}
            <div
              style={{
                top: `${guide.position - 3.5}px`,
                left: `${guide.end}px`,
                backgroundColor: lineColor,
              }}
              className="absolute h-[8px] w-[1px] pointer-events-none"
            />

            {/* Real-Time Smart Alignment Badge */}
            {guide.label && (
              <div
                style={{
                  top: `${guide.position + 6}px`,
                  left: `${midX}px`,
                  backgroundColor: lineColor,
                  boxShadow: `0 2px 6px ${glowColor}`,
                }}
                className="absolute -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white whitespace-nowrap select-none pointer-events-none flex items-center gap-1 z-[65] tracking-tight"
              >
                <span>{guide.label}</span>
                {guide.sourceTarget && (
                  <span className="opacity-85 font-normal text-[8px] max-w-[90px] truncate">
                    ({guide.sourceTarget})
                  </span>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* 2. Dynamic Distance Markers / Gap Spacing Indicators */}
      {distanceMarkers.map((marker) => {
        const isHorizontal = marker.orientation === 'horizontal';

        if (isHorizontal) {
          const xMin = Math.min(marker.x1, marker.x2);
          const width = Math.abs(marker.x2 - marker.x1);
          const y = marker.y1;

          if (width < 2) return null;

          return (
            <div
              key={marker.id}
              style={{
                left: `${xMin}px`,
                top: `${y}px`,
                width: `${width}px`,
              }}
              className="absolute -translate-y-1/2 pointer-events-none flex items-center justify-center"
            >
              {/* Distance Spanning Line */}
              <div className="absolute inset-x-0 h-[1.5px] bg-[#10b981]" />

              {/* Left & Right End Ticks */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2.5 w-[1.5px] bg-[#10b981]" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-[1.5px] bg-[#10b981]" />

              {/* Distance Numerical Badge */}
              <div className="relative px-1.5 py-0.2 bg-[#10b981] text-white text-[9px] font-mono font-bold rounded shadow-sm whitespace-nowrap z-10 leading-none">
                {marker.distance}
              </div>
            </div>
          );
        }

        const yMin = Math.min(marker.y1, marker.y2);
        const height = Math.abs(marker.y2 - marker.y1);
        const x = marker.x1;

        if (height < 2) return null;

        return (
          <div
            key={marker.id}
            style={{
              left: `${x}px`,
              top: `${yMin}px`,
              height: `${height}px`,
            }}
            className="absolute -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center"
          >
            {/* Distance Spanning Line */}
            <div className="absolute inset-y-0 w-[1.5px] bg-[#10b981]" />

            {/* Top & Bottom End Ticks */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-[1.5px] bg-[#10b981]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-[1.5px] bg-[#10b981]" />

            {/* Distance Numerical Badge */}
            <div className="relative px-1.5 py-0.5 bg-[#10b981] text-white text-[9px] font-mono font-bold rounded shadow-sm whitespace-nowrap z-10 leading-none">
              {marker.distance}
            </div>
          </div>
        );
      })}
    </div>
  );
};
