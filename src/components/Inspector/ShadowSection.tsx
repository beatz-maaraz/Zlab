import React from 'react';
import { CanvasElement } from '../../types';
import { NumberAdjustInput } from './NumberAdjustInput';

interface ShadowSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

export const ShadowSection: React.FC<ShadowSectionProps> = ({
  element,
  onUpdate,
  disabled = false,
}) => {
  const hasShadow = (element.shadowBlur || 0) > 0 || (element.shadowY || 0) > 0;

  return (
    <div className="p-4 border-b border-[#201f1f] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#e5e2e1]">
        <span>Drop Shadow</span>
        <button
          onClick={() => {
            if (hasShadow) {
              onUpdate({ shadowBlur: 0, shadowY: 0, shadowSpread: 0 });
            } else {
              onUpdate({ shadowBlur: 16, shadowY: 8, shadowSpread: -2 });
            }
          }}
          disabled={disabled}
          className="text-[10px] text-[#9fcaff] hover:underline disabled:opacity-40"
        >
          {hasShadow ? 'Remove' : '+ Add'}
        </button>
      </div>

      {hasShadow && (
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {/* Y Offset */}
          <NumberAdjustInput
            label="Y"
            labelTitle="Drag to scrub Shadow Y Offset"
            value={element.shadowY || 0}
            disabled={disabled}
            onChange={(shadowY) => onUpdate({ shadowY })}
          />

          {/* Blur */}
          <NumberAdjustInput
            label="B"
            labelTitle="Drag to scrub Shadow Blur"
            value={element.shadowBlur || 0}
            min={0}
            max={100}
            disabled={disabled}
            onChange={(shadowBlur) => onUpdate({ shadowBlur: Math.max(0, shadowBlur) })}
          />

          {/* Spread */}
          <NumberAdjustInput
            label="S"
            labelTitle="Drag to scrub Shadow Spread"
            value={element.shadowSpread || 0}
            min={-50}
            max={50}
            disabled={disabled}
            onChange={(shadowSpread) => onUpdate({ shadowSpread })}
          />
        </div>
      )}
    </div>
  );
};
