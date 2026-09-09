import React, { useState } from 'react';
import { Sparkles, Search, Check } from 'lucide-react';
import { CanvasElement } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface IconSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  disabled?: boolean;
}

const POPULAR_ICONS = [
  'Sparkles',
  'Star',
  'Heart',
  'Zap',
  'Bell',
  'Shield',
  'User',
  'Users',
  'CheckCircle2',
  'AlertTriangle',
  'Search',
  'Plus',
  'Play',
  'Image',
  'Camera',
  'Globe',
  'Compass',
  'Layers',
  'Grid',
  'Component',
  'Sliders',
  'Edit3',
  'Copy',
  'Download',
  'Share2',
  'Monitor',
  'Smartphone',
  'Mail',
  'MessageSquare',
  'Terminal',
  'Cpu',
  'TrendingUp',
  'Bookmark',
  'Flame',
  'Moon',
  'Sun',
];

const PRESET_COLORS = [
  '#9fcaff',
  '#d2bbff',
  '#34d399',
  '#f59e0b',
  '#ffb4ab',
  '#ffffff',
  '#89919e',
  '#6001d1',
];

export const IconSection: React.FC<IconSectionProps> = ({
  element,
  onUpdate,
  disabled = false,
}) => {
  // Only show if element is an icon or has iconName
  if (element.type !== 'icon' && !element.iconName) {
    return null;
  }

  const [search, setSearch] = useState('');

  const currentIcon = element.iconName || 'Sparkles';
  const currentColor = element.textColor || '#9fcaff';

  const filteredIcons = POPULAR_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 border-b border-[#201f1f] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#e5e2e1]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>Vector Icon</span>
        </div>
        <span className="text-[10px] font-mono text-[#89919e]">{currentIcon}</span>
      </div>

      {/* Selected Icon Display & Quick Color Pick */}
      <div className="flex items-center gap-3 bg-[#141416] p-2.5 rounded-lg border border-[#353534]">
        <div
          style={{ color: currentColor }}
          className="w-10 h-10 rounded-md bg-[#201f1f] border border-[#353534] flex items-center justify-center shrink-0 shadow-inner"
        >
          <DynamicIcon name={currentIcon} className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-[11px] font-semibold text-[#e5e2e1] truncate">{currentIcon}</div>
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                disabled={disabled}
                onClick={() => onUpdate({ textColor: c, stroke: c })}
                style={{ backgroundColor: c }}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  currentColor.toLowerCase() === c.toLowerCase()
                    ? 'ring-2 ring-white scale-110'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search Icons */}
      <div className="relative">
        <Search className="w-3 h-3 absolute left-2.5 top-2 text-[#89919e]" />
        <input
          type="text"
          value={search}
          disabled={disabled}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons (e.g. Star, Zap)..."
          className="w-full bg-[#141416] border border-[#353534] rounded-md pl-7 pr-2.5 py-1 text-xs text-[#e5e2e1] placeholder-[#89919e] outline-none focus:border-[#0d99ff] disabled:opacity-40"
        />
      </div>

      {/* Grid of Icons */}
      <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
        {filteredIcons.map((iconName) => {
          const isSelected = currentIcon.toLowerCase() === iconName.toLowerCase();
          return (
            <button
              key={iconName}
              disabled={disabled}
              onClick={() => onUpdate({ iconName, name: `${iconName} Icon` })}
              className={`p-2 rounded-md flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#0d99ff]/20 text-[#9fcaff] ring-1 ring-[#0d99ff]'
                  : 'bg-[#181717] hover:bg-[#252424] text-[#bfc7d5] hover:text-[#e5e2e1]'
              } disabled:opacity-40`}
              title={iconName}
            >
              <DynamicIcon name={iconName} className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
