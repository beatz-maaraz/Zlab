import React, { useState, useEffect } from 'react';
import { Lock, Unlock, RotateCw, CornerDownRight } from 'lucide-react';
import { CanvasElement } from '../../types';
import { NumberAdjustInput } from './NumberAdjustInput';

interface TransformSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  isArtboard: boolean;
  disabled?: boolean;
}

export const TransformSection: React.FC<TransformSectionProps> = ({
  element,
  onUpdate,
  isArtboard,
  disabled = false,
}) => {
  const [isRatioLocked, setIsRatioLocked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(() => {
    return (element.width || 1) / (element.height || 1);
  });

  // Keep ratio updated when ratio lock is newly engaged
  const toggleRatioLock = () => {
    if (!isRatioLocked) {
      const currentRatio = (element.width || 1) / (element.height || 1);
      setAspectRatio(currentRatio > 0 ? currentRatio : 1);
    }
    setIsRatioLocked(!isRatioLocked);
  };

  const handleWidthChange = (newWidth: number) => {
    const clampedW = Math.max(1, Math.round(newWidth));
    if (isRatioLocked && aspectRatio > 0) {
      const newHeight = Math.max(1, Math.round(clampedW / aspectRatio));
      onUpdate({ width: clampedW, height: newHeight });
    } else {
      onUpdate({ width: clampedW });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const clampedH = Math.max(1, Math.round(newHeight));
    if (isRatioLocked && aspectRatio > 0) {
      const newWidth = Math.max(1, Math.round(clampedH * aspectRatio));
      onUpdate({ width: newWidth, height: clampedH });
    } else {
      onUpdate({ height: clampedH });
    }
  };

  return (
    <div className="p-3 border-b border-[#201f1f] space-y-2 select-none">
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#89919e] uppercase tracking-wider px-0.5">
        <span>Transform & Geometry</span>
        {isArtboard && (
          <span className="text-[9px] font-mono text-[#0d99ff] bg-[#0d99ff]/10 px-1.5 py-0.5 rounded">
            Artboard
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {/* Row 1: X and Y coordinates */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <NumberAdjustInput
            id="input-pos-x"
            tabIndex={1}
            label="X"
            labelTitle="Drag to scrub X position"
            value={element.x}
            disabled={disabled || isArtboard}
            onChange={(x) => onUpdate({ x })}
          />
          <NumberAdjustInput
            id="input-pos-y"
            tabIndex={2}
            label="Y"
            labelTitle="Drag to scrub Y position"
            value={element.y}
            disabled={disabled || isArtboard}
            onChange={(y) => onUpdate({ y })}
          />
        </div>

        {/* Row 2: W and H with lock icon between them to link proportions */}
        <div className="relative grid grid-cols-2 gap-1.5 text-xs items-center">
          <NumberAdjustInput
            id="input-dim-w"
            tabIndex={3}
            label="W"
            labelTitle="Drag to scrub Width"
            value={element.width}
            min={1}
            suffix="px"
            disabled={disabled}
            onChange={handleWidthChange}
          />

          <NumberAdjustInput
            id="input-dim-h"
            tabIndex={4}
            label="H"
            labelTitle="Drag to scrub Height"
            value={element.height}
            min={1}
            suffix="px"
            disabled={disabled}
            onChange={handleHeightChange}
          />

          {/* Aspect ratio link button positioned between/overlaying W and H */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10">
            <button
              type="button"
              tabIndex={-1}
              onClick={toggleRatioLock}
              disabled={disabled}
              className={`p-1 rounded-full border shadow-xs transition-all ${
                isRatioLocked
                  ? 'bg-[#0d99ff] border-[#0d99ff] text-white'
                  : 'bg-[#1e1e1e] border-[#353534] text-[#89919e] hover:text-[#e5e2e1] hover:border-[#4a4a49]'
              }`}
              title={isRatioLocked ? 'Proportions linked (click to unlock)' : 'Link proportions'}
            >
              {isRatioLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        {/* Row 3: Rotation angle (∠) and Corner Radius (R) */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <NumberAdjustInput
            id="input-rotation"
            tabIndex={5}
            label="∠"
            labelTitle="Drag to scrub Rotation Angle"
            value={element.rotation || 0}
            step={1}
            largeStep={15}
            suffix="°"
            disabled={disabled || isArtboard}
            onChange={(rotation) => onUpdate({ rotation })}
          />

          <NumberAdjustInput
            id="input-radius"
            tabIndex={6}
            label="R"
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
    </div>
  );
};
