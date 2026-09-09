import React from 'react';
import { LayoutDashboard, MoveHorizontal, MoveVertical } from 'lucide-react';
import { CanvasElement } from '../../types';

interface LayoutSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({
  element,
  onUpdate,
  disabled = false,
}) => {
  const hasAutoLayout = element.layoutMode && element.layoutMode !== 'none';
  const layoutMode = element.layoutMode || 'none';
  const gap = element.gap ?? 12;
  const padding = element.padding ?? 16;
  const alignItems = element.alignItems || 'start';

  return (
    <div className="p-4 border-b border-[#201f1f] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#e5e2e1]">
        <div className="flex items-center gap-1.5">
          <LayoutDashboard className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>Auto Layout</span>
        </div>
        <button
          onClick={() => {
            if (hasAutoLayout) {
              onUpdate({ layoutMode: 'none' });
            } else {
              onUpdate({
                layoutMode: 'horizontal',
                gap: 12,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'start',
              });
            }
          }}
          disabled={disabled}
          className="text-[10px] text-[#9fcaff] hover:underline disabled:opacity-40"
        >
          {hasAutoLayout ? 'Remove' : '+ Add'}
        </button>
      </div>

      {hasAutoLayout && (
        <div className="space-y-2.5">
          {/* Direction */}
          <div className="flex items-center justify-between bg-[#141416] p-1 rounded-lg border border-[#353534]">
            <button
              onClick={() => onUpdate({ layoutMode: 'horizontal' })}
              disabled={disabled}
              className={`flex-1 py-1 text-xs rounded flex items-center justify-center gap-1.5 transition-colors ${
                layoutMode === 'horizontal'
                  ? 'bg-[#0d99ff] text-[#002f55] font-semibold'
                  : 'text-[#89919e] hover:text-[#e5e2e1]'
              }`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
              <span>Row</span>
            </button>
            <button
              onClick={() => onUpdate({ layoutMode: 'vertical' })}
              disabled={disabled}
              className={`flex-1 py-1 text-xs rounded flex items-center justify-center gap-1.5 transition-colors ${
                layoutMode === 'vertical'
                  ? 'bg-[#0d99ff] text-[#002f55] font-semibold'
                  : 'text-[#89919e] hover:text-[#e5e2e1]'
              }`}
            >
              <MoveVertical className="w-3.5 h-3.5" />
              <span>Column</span>
            </button>
          </div>

          {/* Gap & Padding */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
              <span className="text-[#89919e] text-[10px] mr-1">Gap</span>
              <input
                type="number"
                min="0"
                value={gap}
                disabled={disabled}
                onChange={(e) =>
                  onUpdate({
                    gap: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
              />
              <span className="text-[#89919e] text-[10px] ml-1">px</span>
            </div>

            <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
              <span className="text-[#89919e] text-[10px] mr-1">Pad</span>
              <input
                type="number"
                min="0"
                value={padding}
                disabled={disabled}
                onChange={(e) =>
                  onUpdate({
                    padding: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
              />
              <span className="text-[#89919e] text-[10px] ml-1">px</span>
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#89919e] text-[11px]">Align Items</span>
            <div className="flex items-center gap-1">
              {(['start', 'center', 'end'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdate({ alignItems: align })}
                  className={`px-2 py-0.5 rounded text-[10px] capitalize transition-colors ${
                    alignItems === align
                      ? 'bg-[#0d99ff] text-[#002f55] font-semibold'
                      : 'bg-[#141416] text-[#89919e] border border-[#353534]'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
