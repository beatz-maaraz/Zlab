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
import { NumberAdjustInput } from './NumberAdjustInput';

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

      {/* Coordinate & Dimension Inputs with Scrubbers and Steppers */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* X Position */}
        <NumberAdjustInput
          label="X"
          labelTitle="Drag to scrub X position"
          value={element.x}
          disabled={disabled || isArtboard}
          onChange={(x) => onUpdate({ x })}
        />

        {/* Y Position */}
        <NumberAdjustInput
          label="Y"
          labelTitle="Drag to scrub Y position"
          value={element.y}
          disabled={disabled || isArtboard}
          onChange={(y) => onUpdate({ y })}
        />

        {/* Width */}
        <NumberAdjustInput
          label="W"
          labelTitle="Drag to scrub Width"
          value={element.width}
          min={1}
          suffix="px"
          disabled={disabled}
          onChange={(width) => onUpdate({ width: Math.max(1, width) })}
        />

        {/* Height */}
        <NumberAdjustInput
          label="H"
          labelTitle="Drag to scrub Height"
          value={element.height}
          min={1}
          suffix="px"
          disabled={disabled}
          onChange={(height) => onUpdate({ height: Math.max(1, height) })}
        />

        {/* Rotation */}
        <NumberAdjustInput
          label={<RotateCw className="w-3 h-3" />}
          labelTitle="Drag to scrub Rotation"
          value={element.rotation || 0}
          step={1}
          largeStep={15}
          suffix="°"
          disabled={disabled || isArtboard}
          onChange={(rotation) => onUpdate({ rotation })}
        />

        {/* Corner Radius */}
        <NumberAdjustInput
          label={<CornerDownRight className="w-3 h-3" />}
          labelTitle="Drag to scrub Corner Radius"
          value={element.borderRadius ?? 0}
          min={0}
          max={500}
          suffix="px"
          disabled={disabled}
          onChange={(borderRadius) => onUpdate({ borderRadius: Math.max(0, borderRadius) })}
        />
      </div>
    </div>
  );
};
