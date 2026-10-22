import React from 'react';
import { LayoutDashboard, MoveHorizontal, MoveVertical, Plus, Minus } from 'lucide-react';
import { CanvasElement } from '../../types';
import { NumberAdjustInput } from './NumberAdjustInput';

interface AutoLayoutSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

export const AutoLayoutSection: React.FC<AutoLayoutSectionProps> = ({
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
    <div className="p-3 border-b border-[#201f1f] space-y-2 select-none">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#89919e] uppercase tracking-wider">
          <LayoutDashboard className="w-3 h-3 text-[#9fcaff]" />
          <span>Auto Layout</span>
        </div>

        {hasAutoLayout ? (
          <button
            type="button"
            onClick={() => onUpdate({ layoutMode: 'none' })}
            disabled={disabled}
            className="flex items-center gap-1 text-[10px] text-[#89919e] hover:text-[#ffb4ab] transition-colors disabled:opacity-40"
            title="Remove Auto Layout"
          >
            <Minus className="w-3 h-3" />
            <span>Remove</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              onUpdate({
                layoutMode: 'horizontal',
                gap: 12,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'start',
              })
            }
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] font-medium text-[#9fcaff] hover:text-[#e5e2e1] transition-colors disabled:opacity-40"
            title="Add Auto Layout"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Expanded Controls when applied */}
      {hasAutoLayout && (
        <div className="space-y-2 pt-1 animate-in fade-in duration-150">
          {/* Direction Segment Switch */}
          <div className="flex items-center bg-[#141416] p-0.5 rounded-lg border border-[#353534]">
            <button
              type="button"
              onClick={() => onUpdate({ layoutMode: 'horizontal' })}
              disabled={disabled}
              className={`flex-1 py-1 text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                layoutMode === 'horizontal'
                  ? 'bg-[#0d99ff] text-white font-medium shadow-xs'
                  : 'text-[#89919e] hover:text-[#e5e2e1]'
              } disabled:opacity-40`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
              <span>Row</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ layoutMode: 'vertical' })}
              disabled={disabled}
              className={`flex-1 py-1 text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                layoutMode === 'vertical'
                  ? 'bg-[#0d99ff] text-white font-medium shadow-xs'
                  : 'text-[#89919e] hover:text-[#e5e2e1]'
              } disabled:opacity-40`}
            >
              <MoveVertical className="w-3.5 h-3.5" />
              <span>Column</span>
            </button>
          </div>

          {/* Gap & Padding with Scrubber Inputs */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <NumberAdjustInput
              label="Gap"
              labelTitle="Drag to scrub Auto Layout Gap"
              value={gap}
              min={0}
              suffix="px"
              disabled={disabled}
              onChange={(val) => onUpdate({ gap: Math.max(0, val) })}
            />

            <NumberAdjustInput
              label="Pad"
              labelTitle="Drag to scrub Auto Layout Padding"
              value={padding}
              min={0}
              suffix="px"
              disabled={disabled}
              onChange={(val) => onUpdate({ padding: Math.max(0, val) })}
            />
          </div>

          {/* Alignment Segment */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-[11px] text-[#89919e]">Align</span>
            <div className="flex items-center bg-[#141416] p-0.5 rounded-lg border border-[#353534]">
              {(['start', 'center', 'end'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdate({ alignItems: align })}
                  disabled={disabled}
                  className={`px-2 py-0.5 rounded-md text-[10px] capitalize transition-colors ${
                    alignItems === align
                      ? 'bg-[#0d99ff] text-white font-medium shadow-xs'
                      : 'text-[#89919e] hover:text-[#e5e2e1]'
                  } disabled:opacity-40`}
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
