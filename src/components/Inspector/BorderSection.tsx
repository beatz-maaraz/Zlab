import React from 'react';
import { CanvasElement } from '../../types';

interface BorderSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

export const BorderSection: React.FC<BorderSectionProps> = ({
  element,
  onUpdate,
  disabled = false,
}) => {
  const currentStroke = element.stroke || 'none';
  const hasStroke = currentStroke !== 'none';
  const strokeColor = hasStroke ? currentStroke : '#3F4753';

  return (
    <div className="p-4 border-b border-[#201f1f] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#e5e2e1]">
        <span>Stroke / Border</span>
        <button
          onClick={() => {
            if (hasStroke) {
              onUpdate({ stroke: 'none', strokeWidth: 0 });
            } else {
              onUpdate({ stroke: '#0d99ff', strokeWidth: 1 });
            }
          }}
          disabled={disabled}
          className="text-[10px] text-[#9fcaff] hover:underline disabled:opacity-40"
        >
          {hasStroke ? 'Remove' : '+ Add'}
        </button>
      </div>

      {hasStroke && (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#353534] shrink-0">
            <input
              type="color"
              value={strokeColor.startsWith('#') && strokeColor.length === 7 ? strokeColor : '#3F4753'}
              disabled={disabled}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer bg-transparent border-0"
            />
          </div>

          <div className="flex-1 flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
            <input
              type="text"
              value={strokeColor}
              disabled={disabled}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="bg-transparent text-[#e5e2e1] w-full text-xs font-mono outline-none disabled:opacity-40 uppercase"
            />
          </div>

          {/* Stroke Width */}
          <div className="w-16 flex items-center bg-[#141416] px-2 py-1.5 rounded-lg border border-[#353534]">
            <input
              type="number"
              min="1"
              max="32"
              value={element.strokeWidth || 1}
              disabled={disabled}
              onChange={(e) =>
                onUpdate({
                  strokeWidth: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
              className="bg-transparent text-[#e5e2e1] w-full text-xs font-mono text-right outline-none disabled:opacity-40"
            />
            <span className="text-[#89919e] text-[10px] ml-0.5">px</span>
          </div>
        </div>
      )}
    </div>
  );
};
