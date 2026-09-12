import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { CanvasElement } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { NumberAdjustInput } from './NumberAdjustInput';
import {
  MATERIAL_3_PRESETS,
  IOS_MATERIAL_PRESETS,
  GLASS_EFFECT_PRESETS,
} from '../../data/materialPresets';

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
  const [materialTab, setMaterialTab] = useState<'m3' | 'ios' | 'glass'>('m3');

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

      {/* Design System Preset Tokens Swatches */}
      <div className="pt-1 border-t border-[#201f1f] mt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#89919e] uppercase font-bold tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#9fcaff]" /> Presets
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => setMaterialTab('m3')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                materialTab === 'm3' ? 'text-[#9fcaff] bg-[#0d99ff]/15 font-semibold' : 'text-[#89919e]'
              }`}
            >
              M3
            </button>
            <button
              onClick={() => setMaterialTab('ios')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                materialTab === 'ios' ? 'text-[#9fcaff] bg-[#0d99ff]/15 font-semibold' : 'text-[#89919e]'
              }`}
            >
              iOS
            </button>
            <button
              onClick={() => setMaterialTab('glass')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                materialTab === 'glass' ? 'text-[#9fcaff] bg-[#0d99ff]/15 font-semibold' : 'text-[#89919e]'
              }`}
            >
              Glass
            </button>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {materialTab === 'm3' &&
            MATERIAL_3_PRESETS.slice(0, 12).map((p) => {
              const bg = p.props.fill || '#d0bcff';
              return (
                <button
                  key={p.id}
                  onClick={() => onUpdate(p.props)}
                  disabled={disabled}
                  className="w-full aspect-square rounded-md border border-[#353534] hover:scale-110 transition-transform"
                  style={{ backgroundColor: bg }}
                  title={`${p.name} (${bg})`}
                />
              );
            })}

          {materialTab === 'ios' &&
            IOS_MATERIAL_PRESETS.slice(0, 12).map((p) => {
              const bg = p.props.fill || '#007aff';
              return (
                <button
                  key={p.id}
                  onClick={() => onUpdate(p.props)}
                  disabled={disabled}
                  className="w-full aspect-square rounded-md border border-[#353534] hover:scale-110 transition-transform"
                  style={{ backgroundColor: bg }}
                  title={`${p.name} (${bg})`}
                />
              );
            })}

          {materialTab === 'glass' &&
            GLASS_EFFECT_PRESETS.map((p) => {
              const bg = p.props.fill || 'rgba(255,255,255,0.1)';
              return (
                <button
                  key={p.id}
                  onClick={() => onUpdate(p.props)}
                  disabled={disabled}
                  className="w-full aspect-square rounded-md border border-white/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: bg }}
                  title={p.name}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};
