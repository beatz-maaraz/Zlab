import React from 'react';
import { CanvasElement } from '../../types';

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
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Y Offset */}
          <div className="flex items-center bg-[#141416] px-2 py-1.5 rounded-lg border border-[#353534]">
            <span className="text-[#89919e] text-[10px] w-3">Y</span>
            <input
              type="number"
              value={element.shadowY || 0}
              disabled={disabled}
              onChange={(e) => onUpdate({ shadowY: parseInt(e.target.value, 10) || 0 })}
              className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
            />
          </div>

          {/* Blur */}
          <div className="flex items-center bg-[#141416] px-2 py-1.5 rounded-lg border border-[#353534]">
            <span className="text-[#89919e] text-[10px] w-3">B</span>
            <input
              type="number"
              min="0"
              value={element.shadowBlur || 0}
              disabled={disabled}
              onChange={(e) => onUpdate({ shadowBlur: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
            />
          </div>

          {/* Spread */}
          <div className="flex items-center bg-[#141416] px-2 py-1.5 rounded-lg border border-[#353534]">
            <span className="text-[#89919e] text-[10px] w-3">S</span>
            <input
              type="number"
              value={element.shadowSpread || 0}
              disabled={disabled}
              onChange={(e) => onUpdate({ shadowSpread: parseInt(e.target.value, 10) || 0 })}
              className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
            />
          </div>
        </div>
      )}
    </div>
  );
};
