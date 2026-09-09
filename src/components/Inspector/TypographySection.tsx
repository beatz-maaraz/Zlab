import React from 'react';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { CanvasElement } from '../../types';

interface TypographySectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

export const TypographySection: React.FC<TypographySectionProps> = ({
  element,
  onUpdate,
  disabled = false,
}) => {
  if (element.type !== 'text' && element.type !== 'button') {
    return null;
  }

  return (
    <div className="p-4 border-b border-[#201f1f] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#e5e2e1]">
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>Typography</span>
        </div>
      </div>

      {/* Text Content Input */}
      <div className="space-y-1">
        <label className="text-[10px] text-[#89919e] uppercase font-bold tracking-wider">
          Content
        </label>
        <textarea
          rows={2}
          value={element.textContent || ''}
          disabled={disabled}
          onChange={(e) => onUpdate({ textContent: e.target.value })}
          className="w-full bg-[#141416] border border-[#353534] rounded-lg px-2.5 py-1.5 text-xs text-[#e5e2e1] outline-none focus:border-[#0d99ff] resize-none disabled:opacity-40"
          placeholder="Enter text..."
        />
      </div>

      {/* Font Size & Weight Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Font Size */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <span className="text-[#89919e] text-[11px] mr-1">Size</span>
          <input
            type="number"
            value={element.fontSize || 16}
            disabled={disabled}
            onChange={(e) => onUpdate({ fontSize: Math.max(8, parseInt(e.target.value, 10) || 12) })}
            className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono disabled:opacity-40"
          />
          <span className="text-[#89919e] text-[10px] ml-1">px</span>
        </div>

        {/* Font Weight */}
        <div className="flex items-center bg-[#141416] px-2.5 py-1.5 rounded-lg border border-[#353534]">
          <select
            value={element.fontWeight || '400'}
            disabled={disabled}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="bg-transparent text-[#e5e2e1] w-full outline-none text-xs disabled:opacity-40"
          >
            <option value="300" className="bg-[#1c1b1b]">Light (300)</option>
            <option value="400" className="bg-[#1c1b1b]">Regular (400)</option>
            <option value="500" className="bg-[#1c1b1b]">Medium (500)</option>
            <option value="600" className="bg-[#1c1b1b]">SemiBold (600)</option>
            <option value="700" className="bg-[#1c1b1b]">Bold (700)</option>
            <option value="800" className="bg-[#1c1b1b]">ExtraBold (800)</option>
          </select>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center justify-between bg-[#141416] p-1 rounded-lg border border-[#353534]">
        <button
          onClick={() => onUpdate({ textAlign: 'left' })}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            element.textAlign === 'left' || !element.textAlign
              ? 'bg-[#0d99ff] text-[#002f55] font-bold'
              : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onUpdate({ textAlign: 'center' })}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            element.textAlign === 'center'
              ? 'bg-[#0d99ff] text-[#002f55] font-bold'
              : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onUpdate({ textAlign: 'right' })}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            element.textAlign === 'right'
              ? 'bg-[#0d99ff] text-[#002f55] font-bold'
              : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
