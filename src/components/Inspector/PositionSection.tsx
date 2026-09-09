import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  RotateCw,
  CornerDownRight,
} from 'lucide-react';
import { CanvasElement } from '../../types';

interface PositionSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  isArtboard: boolean;
  disabled?: boolean;
}

export const PositionSection: React.FC<PositionSectionProps> = ({
  element,
  onUpdate,
  isArtboard,
  disabled = false,
}) => {
  return (
    <div className="p-4 border-b border-[#201f1f] space-y-4">
      {/* Alignment Tools */}
      {!isArtboard && (
        <div className="flex items-center justify-between bg-[#141416] p-1 rounded-lg border border-[#353534]">
          <button
            onClick={() => onUpdate({ x: 0 })}
            disabled={disabled}
            className="p-1 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40"
            title="Align Left (⌥A)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdate({ x: 200 })}
            disabled={disabled}
            className="p-1 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40"
            title="Align Horizontal Center (⌥H)"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdate({ x: 400 })}
            disabled={disabled}
            className="p-1 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40"
            title="Align Right (⌥D)"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-[1px] bg-[#353534]" />
          <button
            onClick={() => onUpdate({ y: 0 })}
            disabled={disabled}
            className="p-1 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40"
            title="Align Top (⌥W)"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdate({ y: 200 })}
            disabled={disabled}
            className="p-1 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40"
            title="Align Vertical Center (⌥V)"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdate({ y: 400 })}
            disabled={disabled}
            className="p-1 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40"
            title="Align Bottom (⌥S)"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Coordinate & Dimension Inputs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* X Position */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <span className="text-[#89919e] font-mono w-4">X</span>
          <input
            type="number"
            value={element.x}
            disabled={disabled || isArtboard}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value, 10) || 0 })}
            className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
          />
        </div>

        {/* Y Position */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <span className="text-[#89919e] font-mono w-4">Y</span>
          <input
            type="number"
            value={element.y}
            disabled={disabled || isArtboard}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value, 10) || 0 })}
            className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
          />
        </div>

        {/* Width */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <span className="text-[#89919e] font-mono w-4">W</span>
          <input
            type="number"
            value={element.width}
            disabled={disabled}
            onChange={(e) => onUpdate({ width: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
          />
        </div>

        {/* Height */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <span className="text-[#89919e] font-mono w-4">H</span>
          <input
            type="number"
            value={element.height}
            disabled={disabled}
            onChange={(e) => onUpdate({ height: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
          />
        </div>

        {/* Rotation */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <RotateCw className="w-3 h-3 text-[#89919e] mr-1.5 shrink-0" />
          <input
            type="number"
            value={element.rotation || 0}
            disabled={disabled || isArtboard}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value, 10) || 0 })}
            className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
          />
          <span className="text-[#89919e] text-[10px] ml-1">°</span>
        </div>

        {/* Corner Radius */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <CornerDownRight className="w-3 h-3 text-[#89919e] mr-1.5 shrink-0" />
          <input
            type="number"
            value={element.borderRadius ?? 0}
            disabled={disabled}
            onChange={(e) => onUpdate({ borderRadius: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
          />
          <span className="text-[#89919e] text-[10px] ml-1">px</span>
        </div>
      </div>
    </div>
  );
};
