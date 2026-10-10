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
  zoom = 1,
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
        const isArtboard = guide.type === 'artboard';

        let lineColor = '#ff007a';
        let glowColor = 'rgba(255, 0, 122, 0.45)';
        if (isArtboard) {
          lineColor = '#00f0ff';
          glowColor = 'rgba(0, 240, 255, 0.45)';
        } else if (guide.type === 'gap') {
          lineColor = '#10b981';
          glowColor = 'rgba(16, 185, 129, 0.45)';
        }

        // Adjust line width and tick size based on zoom to keep them visually thin
        const strokeWidth = 1 / zoom;
        const tickSize = 8 / zoom;
        const tickOffset = 3.5 / zoom;
        const badgeOffset = 6 / zoom;
        const borderRadius = 4 / zoom;
        const fontSize = 9 / zoom;
        const paddingX = 4 / zoom;
        const paddingY = 2 / zoom;

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
                  width: `${strokeWidth}px`,
                  backgroundColor: lineColor,
                  boxShadow: `0 0 ${8/zoom}px ${glowColor}`,
                }}
                className="absolute pointer-events-none transform -translate-x-1/2"
              />

              {/* Start Tick Marker */}
              <div
                style={{
                  left: `${guide.position - tickOffset}px`,
                  top: `${guide.start}px`,
                  width: `${tickSize}px`,
                  height: `${strokeWidth}px`,
                  backgroundColor: lineColor,
                }}
                className="absolute pointer-events-none"
              />

              {/* End Tick Marker */}
              <div
                style={{
                  left: `${guide.position - tickOffset}px`,
                  top: `${guide.end}px`,
                  width: `${tickSize}px`,
                  height: `${strokeWidth}px`,
                  backgroundColor: lineColor,
                }}
                className="absolute pointer-events-none"
              />

              {/* Real-Time Smart Alignment Badge */}
              {guide.label && (
                <div
                  style={{
                    left: `${guide.position + badgeOffset}px`,
                    top: `${midY}px`,
                    backgroundColor: lineColor,
                    boxShadow: `0 ${2/zoom}px ${6/zoom}px ${glowColor}`,
                    borderRadius: `${borderRadius}px`,
                    padding: `${paddingY}px ${paddingX}px`,
                    fontSize: `${fontSize}px`,
                  }}
                  className="absolute -translate-y-1/2 font-mono font-bold text-white whitespace-nowrap select-none pointer-events-none flex items-center gap-1 z-[65] tracking-tight"
                >
                  <span>{guide.label}</span>
                  {guide.sourceTarget && (
                    <span style={{ fontSize: `${8/zoom}px` }} className="opacity-85 font-normal max-w-[90px] truncate">
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
                height: `${strokeWidth}px`,
                backgroundColor: lineColor,
                boxShadow: `0 0 ${8/zoom}px ${glowColor}`,
              }}
              className="absolute pointer-events-none transform -translate-y-1/2"
            />

            {/* Start Tick Marker */}
            <div
              style={{
                top: `${guide.position - tickOffset}px`,
                left: `${guide.start}px`,
                height: `${tickSize}px`,
                width: `${strokeWidth}px`,
                backgroundColor: lineColor,
              }}
              className="absolute pointer-events-none"
            />

            {/* End Tick Marker */}
            <div
              style={{
                top: `${guide.position - tickOffset}px`,
                left: `${guide.end}px`,
                height: `${tickSize}px`,
                width: `${strokeWidth}px`,
                backgroundColor: lineColor,
              }}
              className="absolute pointer-events-none"
            />

            {/* Real-Time Smart Alignment Badge */}
            {guide.label && (
              <div
                style={{
                  top: `${guide.position + badgeOffset}px`,
                  left: `${midX}px`,
                  backgroundColor: lineColor,
                  boxShadow: `0 ${2/zoom}px ${6/zoom}px ${glowColor}`,
                  borderRadius: `${borderRadius}px`,
                  padding: `${paddingY}px ${paddingX}px`,
                  fontSize: `${fontSize}px`,
                }}
                className="absolute -translate-x-1/2 font-mono font-bold text-white whitespace-nowrap select-none pointer-events-none flex items-center gap-1 z-[65] tracking-tight"
              >
                <span>{guide.label}</span>
                {guide.sourceTarget && (
                  <span style={{ fontSize: `${8/zoom}px` }} className="opacity-85 font-normal max-w-[90px] truncate">
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
        const strokeWidth = 1.5 / zoom;
        const tickSize = 2.5 / zoom;
        const fontSize = 9 / zoom;
        const paddingX = 4 / zoom;
        const borderRadius = 2 / zoom;

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
              <div style={{ height: `${strokeWidth}px` }} className="absolute inset-x-0 bg-[#10b981]" />

              {/* Left & Right End Ticks */}
              <div style={{ width: `${strokeWidth}px`, height: `${tickSize * 4}px` }} className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#10b981]" />
              <div style={{ width: `${strokeWidth}px`, height: `${tickSize * 4}px` }} className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#10b981]" />

              {/* Distance Numerical Badge */}
              <div
                style={{
                  fontSize: `${fontSize}px`,
                  padding: `0 ${paddingX}px`,
                  borderRadius: `${borderRadius}px`,
                }}
                className="relative bg-[#10b981] text-white font-mono font-bold shadow-sm whitespace-nowrap z-10 leading-none"
              >
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
            <div style={{ width: `${strokeWidth}px` }} className="absolute inset-y-0 bg-[#10b981]" />

            {/* Top & Bottom End Ticks */}
            <div style={{ height: `${strokeWidth}px`, width: `${tickSize * 4}px` }} className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#10b981]" />
            <div style={{ height: `${strokeWidth}px`, width: `${tickSize * 4}px` }} className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#10b981]" />

            {/* Distance Numerical Badge */}
            <div
              style={{
                fontSize: `${fontSize}px`,
                padding: `${paddingX/2}px ${paddingX}px`,
                borderRadius: `${borderRadius}px`,
              }}
              className="relative bg-[#10b981] text-white font-mono font-bold shadow-sm whitespace-nowrap z-10 leading-none"
            >
              {marker.distance}
            </div>
          </div>
        );
      })}
    </div>
  );
};
