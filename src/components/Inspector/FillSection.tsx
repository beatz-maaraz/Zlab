import React from 'react';
import { Plus } from 'lucide-react';
import { CanvasElement } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { NumberAdjustInput } from './NumberAdjustInput';

interface FillSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

export const FillSection: React.FC<FillSectionProps> = ({
  element,
  onUpdate,
  disabled = false,
}) => {
  const { documentColors, addDocumentColor } = useEditorStore();

  const currentColor = element.fill || '#0D99FF';
  const currentOpacity = element.fillOpacity ?? 100;

  return (
    <div className="p-4 border-b border-[#201f1f] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#e5e2e1]">
        <span>Fill</span>
        <span className="text-[10px] text-[#89919e] font-mono">{currentColor}</span>
      </div>

      {/* Color Input and Hex String */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#353534] shrink-0">
          <input
            type="color"
            value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#0D99FF'}
            disabled={disabled}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer bg-transparent border-0"
          />
        </div>

        <div className="flex-1 flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <input
            type="text"
            value={currentColor}
            disabled={disabled}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="bg-transparent text-[#e5e2e1] w-full text-xs font-mono outline-none disabled:opacity-40 uppercase"
            placeholder="#0D99FF"
          />
        </div>

        {/* Opacity % */}
        <div className="w-24 shrink-0">
          <NumberAdjustInput
            value={currentOpacity}
            min={0}
            max={100}
            step={1}
            largeStep={10}
            suffix="%"
            disabled={disabled}
            onChange={(fillOpacity) => onUpdate({ fillOpacity })}
          />
        </div>
      </div>

      {/* Document Colors */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#89919e] uppercase font-bold tracking-wider flex items-center gap-1">
            Document Colors
          </span>
          <button
            onClick={() => addDocumentColor(currentColor)}
            disabled={disabled}
            className="w-4 h-4 flex items-center justify-center rounded bg-[#353534] hover:bg-[#0d99ff] text-[#e5e2e1] transition-colors disabled:opacity-50"
            title="Save color to document"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {documentColors.length === 0 && (
            <div className="text-[10px] text-[#555] italic w-full">No saved colors yet.</div>
          )}
          {documentColors.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ fill: color })}
              disabled={disabled}
              className="w-5 h-5 rounded-md border border-[#353534] hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Use ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

