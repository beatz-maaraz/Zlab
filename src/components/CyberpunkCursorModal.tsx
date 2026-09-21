import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Crosshair,
  MousePointer2,
  Hand,
  Type,
  Hourglass,
  Move,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { CYBERPUNK_CURSORS, CyberpunkCursor } from '../data/cyberpunkCursors';

interface CyberpunkCursorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToCanvas?: () => void;
  onApplyEditorCursor?: (cursorUrl: string) => void;
}

export const CyberpunkCursorModal: React.FC<CyberpunkCursorModalProps> = ({
  isOpen,
  onClose,
  onInsertToCanvas,
  onApplyEditorCursor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTestCursor, setActiveTestCursor] = useState<CyberpunkCursor>(CYBERPUNK_CURSORS[0]);
  const [testText, setTestText] = useState('ZLAB CYBERPUNK DESIGN SYSTEM // ACTIVE TEXT PROMPT');
  const [testBoxSize, setTestBoxSize] = useState({ w: 220, h: 100 });
  const [testClickCount, setTestClickCount] = useState(0);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Cursors', icon: Sparkles },
    { id: 'Default Pointers', label: 'Directional Chevrons', icon: MousePointer2 },
    { id: 'Selection', label: 'Selection Hands', icon: Hand },
    { id: 'Text Input', label: 'Text I-Beams', icon: Type },
    { id: 'Wait & Progress', label: 'Wait Indicators', icon: Hourglass },
    { id: 'Resize', label: 'Resize Arrows', icon: Move },
    { id: 'Precision & Editing', label: 'Precision Reticles', icon: Crosshair },
  ];

  const filteredCursors = selectedCategory === 'all'
    ? CYBERPUNK_CURSORS
    : CYBERPUNK_CURSORS.filter((c) => c.category === selectedCategory);

  const handleCopyCode = (cursor: CyberpunkCursor, e: React.MouseEvent) => {
    e.stopPropagation();
    const css = `/* ZLAB Cyberpunk ${cursor.name} */\ncursor: url("${cursor.svgDataUri}") ${cursor.hotspot.x} ${cursor.hotspot.y}, auto;`;
    navigator.clipboard.writeText(css);
    setCopiedId(cursor.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSvg = (cursor: CyberpunkCursor, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([cursor.svgRaw], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zlab-${cursor.codeName.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="cyberpunk-cursor-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="cyberpunk-console-screen"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[#06090e]/95 border border-[#00f0ff]/50 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-[#e5e2e1] overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.12) 0%, transparent 60%),
            linear-gradient(to right, rgba(0, 240, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      >
        {/* Top Sci-Fi Console Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-[#00f0ff]/30 bg-[#0c121e]/80 backdrop-blur-md gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Terminal className="w-4 h-4 text-[#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-wider text-[#00f0ff] uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                  ZLAB // CYBERPUNK HUD CURSOR DESIGN SYSTEM
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/40">
                  8K VECTOR MASTER
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#89919e] tracking-tight">
                Dark Metallic Obsidian • Glowing Cyan Neon Edges (#00f0ff) • Glassmorphism Precision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onInsertToCanvas && (
              <button
                id="btn-insert-cyberpunk-sheet-canvas"
                onClick={() => {
                  onInsertToCanvas();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 text-[#00f0ff] border border-[#00f0ff]/60 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] cursor-pointer"
                title="Insert full design system sheet directly onto your ZLab canvas artboard"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Insert to Canvas</span>
              </button>
            )}

            <button
              id="btn-close-cyberpunk-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#141b27] hover:bg-[#1f293d] text-[#89919e] hover:text-[#00f0ff] border border-[#26354d] flex items-center justify-center transition-colors cursor-pointer"
              title="Close console"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-[#080d16]/90 border-b border-[#00f0ff]/20 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#00f0ff] text-[#05080e] font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                    : 'text-[#89919e] hover:text-[#00f0ff] hover:bg-[#0f1726] border border-transparent hover:border-[#00f0ff]/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Interactive Live Cursor Playground Sandbox */}
          <div
            id="cursor-hud-sandbox"
            className="rounded-xl border border-[#00f0ff]/40 bg-[#090e18]/80 p-4 shadow-[inset_0_0_30px_rgba(0,240,255,0.06)]"
          >
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#00f0ff]/20 gap-2 mb-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-ping" />
                <span className="text-[#00ffa3] font-bold">LIVE HUD PLAYGROUND</span>
                <span className="text-[#4e5b6e]">|</span>
                <span className="text-[#89919e]">Active Cursor:</span>
                <span className="text-[#00f0ff] font-semibold">{activeTestCursor.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                  {activeTestCursor.codeName}
                </span>
              </div>

              {onApplyEditorCursor && (
                <button
                  id="btn-apply-editor-cursor"
                  onClick={() => onApplyEditorCursor(activeTestCursor.svgDataUri)}
                  className="px-2.5 py-1 rounded bg-[#00ffa3]/15 hover:bg-[#00ffa3]/25 text-[#00ffa3] border border-[#00ffa3]/40 text-[11px] font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Make this glowing cursor your active canvas pointer in ZLab"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use in ZLab Canvas</span>
                </button>
              )}
            </div>

            {/* Test Stage where cursor is applied */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-lg bg-[#04060a] border border-[#00f0ff]/25 relative overflow-hidden"
              style={{
                cursor: `url("${activeTestCursor.svgDataUri}") ${activeTestCursor.hotspot.x} ${activeTestCursor.hotspot.y}, auto`,
              }}
            >
              {/* Interactive Target 1: Click Button */}
              <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1f2d45] flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-mono text-[#89919e] uppercase">Interactive Click & Grab Node</span>
                <button
                  onClick={() => setTestClickCount((c) => c + 1)}
                  className="px-3 py-2 rounded-md bg-[#00f0ff]/15 hover:bg-[#00f0ff]/30 text-[#00f0ff] border border-[#00f0ff]/50 text-xs font-mono font-bold transition-all text-center"
                >
                  TRANSMIT PULSE (Clicks: {testClickCount})
                </button>
                <p className="text-[10px] text-[#4e5b6e] font-mono">Move mouse across this area to feel cursor response.</p>
              </div>

              {/* Interactive Target 2: Text Input Laser Area */}
              <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1f2d45] flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-mono text-[#89919e] uppercase">Laser Vernier Text Field</span>
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#070b12] border border-[#00f0ff]/40 text-xs font-mono text-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff]"
                />
                <p className="text-[10px] text-[#4e5b6e] font-mono">Precision typography alignment with optical caliper.</p>
              </div>

              {/* Interactive Target 3: Resize Dimension Area */}
              <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1f2d45] flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-mono text-[#89919e] uppercase">Dimension Scale Matrix</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTestBoxSize({ w: Math.max(120, testBoxSize.w - 20), h: testBoxSize.h })}
                    className="px-2 py-1 bg-[#141b27] hover:bg-[#1e2a3f] text-xs font-mono rounded text-[#89919e] hover:text-[#00f0ff] border border-[#27354d]"
                  >
                    - W
                  </button>
                  <button
                    onClick={() => setTestBoxSize({ w: Math.min(300, testBoxSize.w + 20), h: testBoxSize.h })}
                    className="px-2 py-1 bg-[#141b27] hover:bg-[#1e2a3f] text-xs font-mono rounded text-[#89919e] hover:text-[#00f0ff] border border-[#27354d]"
                  >
                    + W
                  </button>
                  <span className="text-[11px] font-mono text-[#00ffa3]">
                    {testBoxSize.w} × {testBoxSize.h} px
                  </span>
                </div>
                <p className="text-[10px] text-[#4e5b6e] font-mono">Dual-axis & diagonal aspect ratio preservation.</p>
              </div>
            </div>
          </div>

          {/* Cursor Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCursors.map((cursor) => {
              const isSelected = activeTestCursor.id === cursor.id;
              const isCopied = copiedId === cursor.id;

              return (
                <div
                  key={cursor.id}
                  id={`cursor-card-${cursor.id}`}
                  onClick={() => setActiveTestCursor(cursor)}
                  className={`group relative rounded-xl p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#0e1624] border-2 border-[#00f0ff] shadow-[0_0_24px_rgba(0,240,255,0.3)]'
                      : 'bg-[#080d15]/80 hover:bg-[#0c131f] border border-[#00f0ff]/30 hover:border-[#00f0ff]/70 shadow-md'
                  }`}
                  style={{
                    cursor: `url("${cursor.svgDataUri}") ${cursor.hotspot.x} ${cursor.hotspot.y}, auto`,
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 uppercase font-semibold">
                        {cursor.category}
                      </span>
                      <h4 className="font-mono text-sm font-bold text-[#e5e2e1] group-hover:text-[#00f0ff] mt-1.5 transition-colors">
                        {cursor.name}
                      </h4>
                      <span className="text-[10px] font-mono text-[#89919e]">{cursor.codeName}</span>
                    </div>

                    <span className="text-[10px] font-mono text-[#00ffa3] bg-[#00ffa3]/10 px-1.5 py-0.5 rounded border border-[#00ffa3]/30 shrink-0">
                      HOTSPOT ({cursor.hotspot.x}, {cursor.hotspot.y})
                    </span>
                  </div>

                  {/* Visual SVG Showcase Node */}
                  <div
                    className="my-3.5 h-28 rounded-lg bg-[#04060a] border border-[#00f0ff]/20 flex items-center justify-center relative overflow-hidden group-hover:border-[#00f0ff]/50 transition-colors"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08) 0%, transparent 70%),
                        linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)
                      `,
                      backgroundSize: '100% 100%, 16px 16px, 16px 16px',
                    }}
                  >
                    {/* Render raw SVG magnified */}
                    <div
                      className="w-14 h-14 flex items-center justify-center transform transition-transform group-hover:scale-125 duration-200"
                      dangerouslySetInnerHTML={{ __html: cursor.svgRaw }}
                    />

                    {/* Corner Crosshairs */}
                    <div className="absolute top-1.5 left-1.5 text-[8px] font-mono text-[#00f0ff]/40">+</div>
                    <div className="absolute top-1.5 right-1.5 text-[8px] font-mono text-[#00f0ff]/40">+</div>
                    <div className="absolute bottom-1.5 left-1.5 text-[8px] font-mono text-[#00f0ff]/40">+</div>
                    <div className="absolute bottom-1.5 right-1.5 text-[8px] font-mono text-[#00f0ff]/40">+</div>

                    <span className="absolute bottom-1 right-2 text-[9px] font-mono text-[#4e5b6e]">
                      Hover to Test Cursor
                    </span>
                  </div>

                  {/* Description & Technical Specs */}
                  <p className="text-xs text-[#bfc7d5] mb-3 leading-relaxed">
                    {cursor.description}
                  </p>

                  <div className="text-[10px] font-mono space-y-1 py-2 border-t border-[#1a2638] text-[#89919e]">
                    <div className="flex items-center justify-between">
                      <span>CHASSIS:</span>
                      <span className="text-[#bfc7d5]">{cursor.specs.baseMaterial}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>EMITTER:</span>
                      <span className="text-[#00f0ff]">{cursor.specs.neonGlow}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SCALE:</span>
                      <span className="text-[#00ffa3]">{cursor.specs.scale}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#1a2638]">
                    <button
                      onClick={(e) => handleCopyCode(cursor, e)}
                      className="flex-1 py-1.5 px-2 rounded-md bg-[#131b28] hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy CSS cursor code to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-[#00ffa3]" />
                          <span className="text-[#00ffa3]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy CSS</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDownloadSvg(cursor, e)}
                      className="p-1.5 rounded-md bg-[#131b28] hover:bg-[#1d293d] text-[#89919e] hover:text-[#00f0ff] border border-[#25344d] transition-colors cursor-pointer"
                      title="Download clean standalone SVG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Bar with System Diagnostic Status */}
        <div className="flex flex-wrap items-center justify-between px-5 py-2.5 bg-[#0a0f19] border-t border-[#00f0ff]/20 text-[11px] font-mono text-[#89919e] gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#00ffa3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3]" />
              HUD MATRIX STABLE
            </span>
            <span className="hidden md:inline text-[#4e5b6e]">|</span>
            <span className="hidden md:inline">SYSTEM: ZLAB v4.2 PRO</span>
            <span className="hidden md:inline text-[#4e5b6e]">|</span>
            <span className="hidden md:inline">RESOLUTION: 8K CINEMATIC HUD</span>
          </div>

          <div className="flex items-center gap-2">
            <span>TOTAL CURSORS: {CYBERPUNK_CURSORS.length}</span>
            <span className="text-[#00f0ff] font-bold">ALL COMPLIANT W3C CSS SPEC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
