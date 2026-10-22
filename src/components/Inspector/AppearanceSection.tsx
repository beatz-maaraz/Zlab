import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import { CanvasElement } from '../../types';
import { ColorPickerPopover } from './ColorPickerPopover';
import { NumberAdjustInput } from './NumberAdjustInput';

interface AppearanceSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  element,
  onUpdate,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasFill = element.fill && element.fill !== 'none';
  const fillColor = hasFill ? element.fill : '#0D99FF';
  const fillOpacity = element.fillOpacity ?? 100;

  const hasStroke = element.stroke && element.stroke !== 'none';
  const strokeColor = hasStroke ? element.stroke : '#3F4753';
  const strokeWidth = element.strokeWidth || 1;

  const hasShadow = (element.shadowBlur || 0) > 0 || (element.shadowY || 0) > 0;

  return (
    <div className="border-b border-[#201f1f] select-none">
      {/* Collapsible Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#89919e]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#89919e]" />
          )}
          <span>Appearance</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Active summary swatches when collapsed */}
          {!isExpanded && (
            <div className="flex items-center -space-x-1">
              {hasFill && (
                <div
                  className="w-3 h-3 rounded-full border border-[#353534]"
                  style={{ backgroundColor: fillColor }}
                />
              )}
              {hasStroke && (
                <div
                  className="w-3 h-3 rounded-full border border-[#353534]"
                  style={{ backgroundColor: strokeColor }}
                />
              )}
            </div>
          )}
          <span className="text-[10px] text-[#89919e] font-mono">
            {hasFill ? fillColor : 'None'}
          </span>
        </div>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-2">
          {/* Fill Row */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-10 text-[11px] font-medium text-[#89919e] shrink-0">Fill</span>

            {hasFill ? (
              <>
                {/* Unified Swatch Popover */}
                <ColorPickerPopover
                  title="Fill Color"
                  color={fillColor}
                  opacity={fillOpacity}
                  disabled={disabled}
                  onChangeColor={(fill) => onUpdate({ fill })}
                  onChangeOpacity={(fillOpacity) => onUpdate({ fillOpacity })}
                />

                {/* Hex Text Field */}
                <div className="flex-1 flex items-center bg-[#141416] px-2 py-1 rounded-lg border border-[#353534] min-w-0">
                  <span className="text-[#89919e] font-mono text-[11px] mr-0.5">#</span>
                  <input
                    type="text"
                    disabled={disabled}
                    value={fillColor.replace(/^#/, '')}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      onUpdate({ fill: val ? `#${val.toUpperCase()}` : '#000000' });
                    }}
                    className="bg-transparent text-[#e5e2e1] w-full text-xs font-mono outline-none uppercase disabled:opacity-40"
                    placeholder="0D99FF"
                  />
                </div>

                {/* Opacity % */}
                <div className="w-18 shrink-0">
                  <NumberAdjustInput
                    value={fillOpacity}
                    min={0}
                    max={100}
                    step={1}
                    largeStep={10}
                    suffix="%"
                    disabled={disabled}
                    onChange={(val) => onUpdate({ fillOpacity: val })}
                  />
                </div>

                {/* Inline Remove (-) Button */}
                <button
                  type="button"
                  onClick={() => onUpdate({ fill: 'none' })}
                  disabled={disabled}
                  className="p-1 text-[#89919e] hover:text-[#ffb4ab] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40 shrink-0"
                  title="Remove Fill"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-between bg-[#141416]/50 px-2 py-1 rounded-lg border border-dashed border-[#353534]">
                <span className="text-[11px] text-[#707070] italic">None</span>
                <button
                  type="button"
                  onClick={() => onUpdate({ fill: '#0D99FF', fillOpacity: 100 })}
                  disabled={disabled}
                  className="flex items-center gap-1 text-[11px] text-[#9fcaff] hover:text-[#e5e2e1] transition-colors"
                  title="Add Fill"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>

          {/* Stroke / Border Row */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-10 text-[11px] font-medium text-[#89919e] shrink-0">Stroke</span>

            {hasStroke ? (
              <>
                {/* Unified Swatch Popover */}
                <ColorPickerPopover
                  title="Stroke Color"
                  color={strokeColor}
                  disabled={disabled}
                  onChangeColor={(stroke) => onUpdate({ stroke })}
                />

                {/* Hex Text Field */}
                <div className="flex-1 flex items-center bg-[#141416] px-2 py-1 rounded-lg border border-[#353534] min-w-0">
                  <span className="text-[#89919e] font-mono text-[11px] mr-0.5">#</span>
                  <input
                    type="text"
                    disabled={disabled}
                    value={strokeColor.replace(/^#/, '')}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      onUpdate({ stroke: val ? `#${val.toUpperCase()}` : '#000000' });
                    }}
                    className="bg-transparent text-[#e5e2e1] w-full text-xs font-mono outline-none uppercase disabled:opacity-40"
                    placeholder="3F4753"
                  />
                </div>

                {/* Stroke Width */}
                <div className="w-18 shrink-0">
                  <NumberAdjustInput
                    value={strokeWidth}
                    min={1}
                    max={64}
                    step={1}
                    largeStep={4}
                    suffix="px"
                    disabled={disabled}
                    onChange={(val) => onUpdate({ strokeWidth: Math.max(1, val) })}
                  />
                </div>

                {/* Inline Remove (-) Button */}
                <button
                  type="button"
                  onClick={() => onUpdate({ stroke: 'none', strokeWidth: 0 })}
                  disabled={disabled}
                  className="p-1 text-[#89919e] hover:text-[#ffb4ab] hover:bg-[#201f1f] rounded transition-colors disabled:opacity-40 shrink-0"
                  title="Remove Stroke"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-between bg-[#141416]/50 px-2 py-1 rounded-lg border border-dashed border-[#353534]">
                <span className="text-[11px] text-[#707070] italic">None</span>
                <button
                  type="button"
                  onClick={() => onUpdate({ stroke: '#0D99FF', strokeWidth: 1 })}
                  disabled={disabled}
                  className="flex items-center gap-1 text-[11px] text-[#9fcaff] hover:text-[#e5e2e1] transition-colors"
                  title="Add Stroke"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>

          {/* Drop Shadow Row & Compact 3-Input Grid */}
          <div className="pt-1 border-t border-[#201f1f]/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="w-14 text-[11px] font-medium text-[#89919e]">Shadow</span>
              {hasShadow ? (
                <button
                  type="button"
                  onClick={() => onUpdate({ shadowBlur: 0, shadowY: 0, shadowSpread: 0 })}
                  disabled={disabled}
                  className="flex items-center gap-1 text-[10px] text-[#89919e] hover:text-[#ffb4ab] transition-colors"
                  title="Remove Shadow"
                >
                  <Minus className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpdate({ shadowBlur: 16, shadowY: 8, shadowSpread: -2 })}
                  disabled={disabled}
                  className="flex items-center gap-1 text-[10px] text-[#9fcaff] hover:text-[#e5e2e1] transition-colors"
                  title="Add Drop Shadow"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              )}
            </div>

            {hasShadow && (
              <div className="grid grid-cols-3 gap-1.5 text-xs animate-in fade-in duration-150">
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
        </div>
      )}
    </div>
  );
};
