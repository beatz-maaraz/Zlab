import React, { useState, useRef, useEffect } from 'react';
import { Pipette, Plus, X, Copy, Check } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface ColorPickerPopoverProps {
  color: string;
  opacity?: number;
  onChangeColor: (color: string) => void;
  onChangeOpacity?: (opacity: number) => void;
  title?: string;
  disabled?: boolean;
}

const CURATED_PALETTE = [
  '#0D99FF',
  '#9FCAFF',
  '#38BDF8',
  '#34D399',
  '#10B981',
  '#FBBF24',
  '#F59E0B',
  '#F87171',
  '#EF4444',
  '#A78BFA',
  '#8B5CF6',
  '#EC4899',
  '#FFFFFF',
  '#E5E2E1',
  '#89919E',
  '#3F4753',
  '#201F1F',
  '#141416',
];

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  color,
  opacity = 100,
  onChangeColor,
  onChangeOpacity,
  title = 'Color',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { documentColors, addDocumentColor } = useEditorStore();

  const isEyedropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

  // Normalize color for native input
  const safeColor =
    color && color.startsWith('#') && (color.length === 7 || color.length === 4)
      ? color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color
      : '#0D99FF';

  // Outside click & ESC dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleEyeDropper = async () => {
    if (!isEyedropperSupported) return;
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        onChangeColor(result.sRGBHex.toUpperCase());
      }
    } catch {
      // User cancelled eyedropper
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Trigger Swatch Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="relative w-6 h-6 rounded-md border border-[#353534] hover:border-[#0d99ff] overflow-hidden transition-all shadow-xs shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0d99ff] disabled:opacity-40 disabled:cursor-not-allowed group"
        title="Open color swatch popover"
      >
        {/* Transparent checkerboard background */}
        <span
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
        />
        {/* Color fill */}
        <span
          className="absolute inset-0 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: color === 'none' ? 'transparent' : color,
            opacity: opacity / 100,
          }}
        />
      </button>

      {/* Floating Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-8 w-64 bg-[#1a191a] border border-[#353534] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 select-none text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2a292a]">
            <span className="font-semibold text-[#e5e2e1] text-xs">{title}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#89919e] hover:text-[#e5e2e1] p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color & EyeDropper Row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#353534] shrink-0 shadow-inner">
              <input
                type="color"
                value={safeColor}
                onChange={(e) => onChangeColor(e.target.value.toUpperCase())}
                className="absolute -top-3 -left-3 w-14 h-14 cursor-pointer bg-transparent border-0"
              />
            </div>

            <div className="flex-1 flex items-center bg-[#141416] px-2 py-1.5 rounded-lg border border-[#353534]">
              <span className="text-[#89919e] font-mono text-xs mr-0.5">#</span>
              <input
                type="text"
                value={color.replace(/^#/, '')}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  onChangeColor(val ? `#${val.toUpperCase()}` : '#000000');
                }}
                className="bg-transparent text-[#e5e2e1] w-full text-xs font-mono outline-none uppercase"
                placeholder="0D99FF"
              />
              <button
                type="button"
                onClick={handleCopyHex}
                className="text-[#89919e] hover:text-[#9fcaff] ml-1 p-0.5 transition-colors"
                title="Copy HEX"
              >
                {copied ? <Check className="w-3 h-3 text-[#34d399]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {isEyedropperSupported && (
              <button
                type="button"
                onClick={handleEyeDropper}
                className="p-2 bg-[#141416] hover:bg-[#201f1f] text-[#89919e] hover:text-[#9fcaff] rounded-lg border border-[#353534] transition-colors shrink-0"
                title="Pick color from screen"
              >
                <Pipette className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Opacity Slider (if supported) */}
          {onChangeOpacity && (
            <div className="mb-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#89919e]">
                <span>Opacity</span>
                <span className="font-mono text-[#e5e2e1]">{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => onChangeOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-[#252528] rounded-lg appearance-none cursor-pointer accent-[#0d99ff]"
              />
            </div>
          )}

          {/* Palette Colors */}
          <div className="mb-3">
            <span className="text-[10px] text-[#89919e] uppercase font-bold tracking-wider block mb-1.5">
              Palette
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {CURATED_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeColor(c)}
                  className={`w-full aspect-square rounded-md border transition-transform hover:scale-110 ${
                    color.toUpperCase() === c.toUpperCase()
                      ? 'border-[#0d99ff] ring-1 ring-[#0d99ff]'
                      : 'border-[#353534]/70'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Document Colors */}
          <div className="pt-2 border-t border-[#2a292a]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[#89919e] uppercase font-bold tracking-wider">
                Document Colors
              </span>
              <button
                type="button"
                onClick={() => addDocumentColor(color)}
                className="flex items-center gap-1 text-[10px] text-[#9fcaff] hover:underline"
                title="Save current color to document"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {documentColors.length === 0 ? (
              <div className="text-[10px] text-[#707070] italic">No document colors saved yet.</div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {documentColors.map((c, i) => (
                  <button
                    key={`${c}-${i}`}
                    type="button"
                    onClick={() => onChangeColor(c)}
                    className="w-5 h-5 rounded-md border border-[#353534] hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
