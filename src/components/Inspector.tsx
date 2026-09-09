import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Minus,
  Download,
  Copy,
  Check,
  Code2,
  Sparkles,
  Trash2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Play,
  FileCode,
  Globe,
  Sliders,
  RotateCw,
  CornerDownRight,
  Smartphone,
  Monitor,
  ArrowRight,
  MoveHorizontal,
  MoveVertical,
  Bold,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { CanvasElement, InspectorTab } from '../types';
import {
  MATERIAL_3_PRESETS,
  IOS_MATERIAL_PRESETS,
  GLASS_EFFECT_PRESETS,
} from '../data/materialPresets';
import {
  downloadInteractivePrototypeHtml,
  downloadPng,
  downloadSvg,
  downloadJson,
} from '../utils/exportUtils';

interface InspectorProps {
  selectedElement: CanvasElement;
  allElements?: Record<string, CanvasElement>;
  projectTitle?: string;
  devicePreview?: 'desktop' | 'mobile';
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onExportSelected: () => void;
  onOpenPrototype?: () => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  width?: number;
  onStartResize?: (e: React.MouseEvent) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedElement,
  allElements = {},
  projectTitle = 'ZLab Project',
  devicePreview = 'desktop',
  onUpdateElement,
  onExportSelected,
  onOpenPrototype,
  onDeleteElement,
  onDuplicateElement,
  width = 288,
  onStartResize,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('design');
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeType, setCodeType] = useState<'css' | 'tailwind' | 'react'>('css');
  const [fillColor, setFillColor] = useState(selectedElement.fill || '#0D99FF');
  const [strokeColor, setStrokeColor] = useState(selectedElement.stroke || '#3F4753');
  const [materialSystemTab, setMaterialSystemTab] = useState<'material3' | 'ios' | 'glass'>('material3');

  // Prototype settings local state
  const [protoTrigger, setProtoTrigger] = useState<'tap' | 'click' | 'hover' | 'drag' | 'delay'>(
    selectedElement.prototype?.trigger || 'tap'
  );
  const [protoAction, setProtoAction] = useState<'navigate' | 'overlay' | 'url' | 'back'>(
    selectedElement.prototype?.action || 'navigate'
  );
  const [protoDestination, setProtoDestination] = useState<string>(
    selectedElement.prototype?.destinationId ||
      (selectedElement.id.includes('welcome') ? 'signin-screen-frame' : 'welcome-screen-frame')
  );
  const [protoAnimation, setProtoAnimation] = useState<
    'smart_animate' | 'dissolve' | 'instant' | 'slide_in' | 'slide_out' | 'push'
  >(selectedElement.prototype?.animation || 'smart_animate');
  const [protoEasing, setProtoEasing] = useState<'ease-out' | 'ease-in-out' | 'spring' | 'linear'>(
    selectedElement.prototype?.easing || 'ease-out'
  );
  const [protoDuration, setProtoDuration] = useState<number>(
    selectedElement.prototype?.duration || 450
  );

  // Sync prototype settings when selected element changes
  useEffect(() => {
    if (selectedElement.prototype) {
      setProtoTrigger(selectedElement.prototype.trigger);
      setProtoAction(selectedElement.prototype.action);
      setProtoDestination(selectedElement.prototype.destinationId);
      setProtoAnimation(selectedElement.prototype.animation);
      if (selectedElement.prototype.easing) setProtoEasing(selectedElement.prototype.easing);
      if (selectedElement.prototype.duration) setProtoDuration(selectedElement.prototype.duration);
    } else {
      if (selectedElement.id.includes('welcome')) {
        setProtoDestination('signin-screen-frame');
        setProtoAnimation('smart_animate');
        setProtoTrigger('tap');
      } else if (selectedElement.id.includes('signin')) {
        setProtoDestination('welcome-screen-frame');
        setProtoAnimation('smart_animate');
        setProtoTrigger('tap');
      }
    }
  }, [selectedElement.id, selectedElement.prototype]);

  // Color presets for quick selection
  const COLOR_PRESETS = [
    '#9fcaff',
    '#0d99ff',
    '#6001d1',
    '#d2bbff',
    '#34d399',
    '#f59e0b',
    '#ef4444',
    '#1c1b1b',
    '#2a2a2a',
    '#ffffff',
  ];

  // Sync colors when element changes
  useEffect(() => {
    setFillColor(selectedElement.fill || '#0D99FF');
    setStrokeColor(selectedElement.stroke || '#3F4753');
  }, [selectedElement.id, selectedElement.fill, selectedElement.stroke]);

  // Determine parent container dimensions for alignment
  const parentWidth =
    devicePreview === 'mobile'
      ? 390
      : allElements?.['desktop-1440']?.width || 1440;
  const parentHeight =
    devicePreview === 'mobile'
      ? 844
      : allElements?.['desktop-1440']?.height || 900;

  // Alignment functions
  const handleAlignLeft = () => {
    onUpdateElement({ x: selectedElement.parentId ? 48 : 0 });
  };

  const handleAlignHorizontalCenter = () => {
    const centeredX = Math.max(0, Math.round((parentWidth - selectedElement.width) / 2));
    onUpdateElement({ x: centeredX });
  };

  const handleAlignRight = () => {
    const pad = selectedElement.parentId ? 48 : 0;
    const rightX = Math.max(0, Math.round(parentWidth - selectedElement.width - pad));
    onUpdateElement({ x: rightX });
  };

  const handleAlignTop = () => {
    onUpdateElement({ y: selectedElement.parentId ? 20 : 0 });
  };

  const handleAlignVerticalCenter = () => {
    const centeredY = Math.max(0, Math.round((parentHeight - selectedElement.height) / 2));
    onUpdateElement({ y: centeredY });
  };

  const handleAlignBottom = () => {
    const pad = selectedElement.parentId ? 40 : 0;
    const bottomY = Math.max(0, Math.round(parentHeight - selectedElement.height - pad));
    onUpdateElement({ y: bottomY });
  };

  const handleDistributeHorizontal = () => {
    onUpdateElement({ x: Math.round(selectedElement.x + 24) });
  };

  const handleDistributeVertical = () => {
    onUpdateElement({ y: Math.round(selectedElement.y + 24) });
  };

  const handleCopyCode = () => {
    let snippet = '';
    if (codeType === 'css') {
      snippet = `/* ZLab Generated CSS for ${selectedElement.name} */
.${selectedElement.id} {
  width: ${selectedElement.width}px;
  height: ${selectedElement.height}px;
  border-radius: ${selectedElement.borderRadius ?? 8}px;
  background-color: ${selectedElement.fill};
  border: ${selectedElement.strokeWidth ?? 0}px solid ${selectedElement.stroke};
  box-shadow: 0px ${selectedElement.shadowY ?? 0}px ${selectedElement.shadowBlur ?? 0}px rgba(0, 0, 0, 0.35);
  opacity: ${(selectedElement.fillOpacity ?? 100) / 100};
}`;
    } else if (codeType === 'tailwind') {
      snippet = `// Tailwind CSS classes for ${selectedElement.name}
className="w-[${selectedElement.width}px] h-[${selectedElement.height}px] rounded-[${selectedElement.borderRadius ?? 8}px] bg-[${selectedElement.fill}] border-[${selectedElement.strokeWidth ?? 0}px] border-[${selectedElement.stroke}] shadow-lg"`;
    } else {
      snippet = `// React Component for ${selectedElement.name}
export const ${selectedElement.name.replace(/[^a-zA-Z0-9]/g, '')} = () => (
  <div
    style={{
      width: ${selectedElement.width},
      height: ${selectedElement.height},
      backgroundColor: '${selectedElement.fill}',
      borderRadius: ${selectedElement.borderRadius ?? 8},
      border: '${selectedElement.strokeWidth ?? 0}px solid ${selectedElement.stroke}',
    }}
  >
    ${selectedElement.textContent || ''}
  </div>
);`;
    }

    navigator.clipboard?.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <aside
      id="right-inspector-sidebar"
      style={{ width: `${width}px` }}
      className="fixed right-0 top-16 bottom-8 bg-[#1c1b1b] border-l border-[#353534]/70 flex flex-col z-20 select-none overflow-hidden"
    >
      {/* Resizer handle on the left edge */}
      {onStartResize && (
        <div
          onMouseDown={onStartResize}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0d99ff] active:bg-[#0d99ff] transition-colors z-30 group"
          title="Drag to resize inspector panel"
        >
          <div className="w-0.5 h-6 bg-[#3f4753] group-hover:bg-[#0d99ff] rounded-full mx-auto my-auto absolute top-1/2 -translate-y-1/2 left-0.5" />
        </div>
      )}

      {/* Inspector Tabs */}
      <div className="flex items-center justify-around border-b border-[#353534] py-2 px-1 bg-[#181717]">
        <button
          id="tab-btn-design"
          onClick={() => setActiveTab('design')}
          className={`text-xs font-medium pb-1 transition-colors relative ${
            activeTab === 'design' ? 'text-[#e5e2e1]' : 'text-[#89919e] hover:text-[#bfc7d5]'
          }`}
        >
          <span>Design</span>
          {activeTab === 'design' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9fcaff] rounded-full" />
          )}
        </button>
        <button
          id="tab-btn-prototype"
          onClick={() => setActiveTab('prototype')}
          className={`text-xs font-medium pb-1 transition-colors relative ${
            activeTab === 'prototype' ? 'text-[#e5e2e1]' : 'text-[#89919e] hover:text-[#bfc7d5]'
          }`}
        >
          <span>Prototype</span>
          {activeTab === 'prototype' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9fcaff] rounded-full" />
          )}
        </button>
        <button
          id="tab-btn-inspect"
          onClick={() => setActiveTab('inspect')}
          className={`text-xs font-medium pb-1 transition-colors relative ${
            activeTab === 'inspect' ? 'text-[#e5e2e1]' : 'text-[#89919e] hover:text-[#bfc7d5]'
          }`}
        >
          <span>Code</span>
          {activeTab === 'inspect' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9fcaff] rounded-full" />
          )}
        </button>
      </div>

      {/* Selected Element Header */}
      <div className="px-3.5 py-2.5 border-b border-[#353534]/50 flex items-center justify-between bg-[#141416]">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={selectedElement.name}
            onChange={(e) => onUpdateElement({ name: e.target.value })}
            className="text-xs font-semibold text-[#e5e2e1] bg-transparent outline-none truncate w-full hover:bg-[#201f1f] px-1 rounded focus:bg-[#201f1f] focus:border border-[#0d99ff]"
          />
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#2a2a2a] text-[#9fcaff] rounded">
              {selectedElement.type}
            </span>
            <span className="text-[10px] text-[#89919e]">
              {selectedElement.width}×{selectedElement.height}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Fix / Pin toggle */}
          <button
            onClick={() => onUpdateElement({ fixed: !selectedElement.fixed, pinned: !selectedElement.fixed })}
            className={`p-1.5 rounded transition-colors ${
              selectedElement.fixed || selectedElement.pinned
                ? 'text-[#0d99ff] bg-[#0d99ff]/15'
                : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
            }`}
            title={selectedElement.fixed || selectedElement.pinned ? 'Unfix position (Unpin from viewport)' : 'Fix position (Pin to viewport)'}
          >
            {selectedElement.fixed || selectedElement.pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* Lock toggle */}
          <button
            onClick={() => onUpdateElement({ locked: !selectedElement.locked })}
            className={`p-1.5 rounded transition-colors ${
              selectedElement.locked
                ? 'text-[#f59e0b] bg-[#f59e0b]/15'
                : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
            }`}
            title={selectedElement.locked ? 'Unlock element' : 'Lock element'}
          >
            {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Delete button */}
          {onDeleteElement &&
            selectedElement.id !== 'desktop-1440' &&
            selectedElement.id !== 'hero-bg' && (
              <button
                onClick={() => onDeleteElement(selectedElement.id)}
                className="p-1.5 text-[#89919e] hover:text-[#ffb4ab] rounded hover:bg-[#2a2a2a] transition-colors"
                title="Delete element"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
        </div>
      </div>

      {/* Locked / Fixed Warning Banner with Instant Unfix Action */}
      {(selectedElement.locked || selectedElement.fixed || selectedElement.pinned) && (
        <div className="mx-3.5 mt-2 px-2.5 py-1.5 rounded-lg bg-[#201f1f] border border-[#f59e0b]/40 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#f59e0b] text-[11px] truncate">
            {selectedElement.locked && <Lock className="w-3 h-3 shrink-0" />}
            {Boolean(selectedElement.fixed || selectedElement.pinned) && <Pin className="w-3 h-3 shrink-0" />}
            <span className="truncate">
              {selectedElement.locked ? 'Element is locked' : 'Fixed position'}
            </span>
          </div>
          <button
            onClick={() => onUpdateElement({ locked: false, fixed: false, pinned: false })}
            className="text-[10px] font-bold text-[#9fcaff] hover:text-white bg-[#0d99ff]/20 hover:bg-[#0d99ff]/40 px-2 py-0.5 rounded transition-colors shrink-0"
          >
            Unfix & Unlock
          </button>
        </div>
      )}

      {/* TAB 1: DESIGN PROPERTIES */}
      {activeTab === 'design' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs text-[#e5e2e1]">
          {/* Alignment Tools Bar (Figma-style) */}
          <div className="bg-[#141416] p-1.5 rounded-lg border border-[#353534]/60 flex items-center justify-between">
            <button
              onClick={handleAlignLeft}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleAlignHorizontalCenter}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Align Horizontal Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleAlignRight}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-[#353534]" />
            <button
              onClick={handleAlignTop}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Align Top"
            >
              <AlignStartVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleAlignVerticalCenter}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Align Vertical Center"
            >
              <AlignCenterVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleAlignBottom}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Align Bottom"
            >
              <AlignEndVertical className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-[#353534]" />
            <button
              onClick={handleDistributeHorizontal}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Distribute Horizontal Spacing (+24px)"
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDistributeVertical}
              className="p-1.5 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors"
              title="Distribute Vertical Spacing (+24px)"
            >
              <MoveVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Coordinates & Dimensions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
              Layout & Transform
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                <span className="text-[#89919e] font-mono mr-2">X</span>
                <input
                  type="number"
                  value={selectedElement.x}
                  onChange={(e) => onUpdateElement({ x: Number(e.target.value) })}
                  className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                />
              </div>
              <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                <span className="text-[#89919e] font-mono mr-2">Y</span>
                <input
                  type="number"
                  value={selectedElement.y}
                  onChange={(e) => onUpdateElement({ y: Number(e.target.value) })}
                  className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                />
              </div>
              <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                <span className="text-[#89919e] font-mono mr-2">W</span>
                <input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) =>
                    onUpdateElement({ width: Math.max(10, Number(e.target.value)) })
                  }
                  className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                />
              </div>
              <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                <span className="text-[#89919e] font-mono mr-2">H</span>
                <input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) =>
                    onUpdateElement({ height: Math.max(10, Number(e.target.value)) })
                  }
                  className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                />
              </div>
              {/* Rotation & Radius */}
              <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                <span className="text-[#89919e] mr-2">∠</span>
                <input
                  type="number"
                  value={selectedElement.rotation ?? 0}
                  onChange={(e) => onUpdateElement({ rotation: Number(e.target.value) })}
                  className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                />
                <span className="text-[#89919e] text-[10px]">°</span>
              </div>
              {selectedElement.type !== 'text' && (
                <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                  <span className="text-[#89919e] mr-2">R</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedElement.borderRadius ?? 8}
                    onChange={(e) =>
                      onUpdateElement({ borderRadius: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                  />
                  <span className="text-[#89919e] text-[10px]">px</span>
                </div>
              )}
            </div>

            {/* Opacity Slider */}
            <div className="flex items-center justify-between bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50 mt-2">
              <span className="text-[#89919e] text-[10px] uppercase font-semibold mr-2">Opacity</span>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedElement.fillOpacity ?? 100}
                onChange={(e) => onUpdateElement({ fillOpacity: Number(e.target.value) })}
                className="flex-1 mx-2 accent-[#0d99ff] h-1 bg-[#353534] rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-[#e5e2e1] w-8 text-right">
                {selectedElement.fillOpacity ?? 100}%
              </span>
            </div>
          </div>

          {/* Auto Layout Section */}
          {selectedElement.type === 'frame' && (
            <div className="space-y-2 border-t border-[#353534]/60 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Auto Layout
                </span>
                <select
                  value={selectedElement.layoutMode || 'none'}
                  onChange={(e) => onUpdateElement({ layoutMode: e.target.value as any })}
                  className="bg-[#201f1f] text-xs text-[#e5e2e1] border border-[#353534]/50 rounded px-1.5 py-0.5 outline-none cursor-pointer hover:bg-[#2a2a2a] focus:border-[#0d99ff]"
                >
                  <option value="none">None</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              
              {selectedElement.layoutMode && selectedElement.layoutMode !== 'none' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                    <span className="text-[#89919e] mr-2" title="Gap between items">↔</span>
                    <input
                      type="number"
                      min="0"
                      value={selectedElement.gap ?? 0}
                      onChange={(e) => onUpdateElement({ gap: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                    <span className="text-[#89919e] mr-2" title="Padding">⚏</span>
                    <input
                      type="number"
                      min="0"
                      value={selectedElement.padding ?? 0}
                      onChange={(e) => onUpdateElement({ padding: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-transparent font-mono text-[#e5e2e1] outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                    <span className="text-[#89919e]">Align Items</span>
                    <select
                      value={selectedElement.alignItems || 'start'}
                      onChange={(e) => onUpdateElement({ alignItems: e.target.value as any })}
                      className="bg-transparent text-[#e5e2e1] font-mono outline-none cursor-pointer"
                    >
                      <option value="start">Start</option>
                      <option value="center">Center</option>
                      <option value="end">End</option>
                      <option value="stretch">Stretch</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Typography Section (if text, button, card, input, or has textContent) */}
          {(selectedElement.type === 'text' ||
            selectedElement.type === 'button' ||
            selectedElement.type === 'card' ||
            selectedElement.type === 'input' ||
            selectedElement.textContent) && (
            <div className="space-y-2 border-t border-[#353534]/60 pt-3">
              <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                Typography
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={selectedElement.textContent || ''}
                  onChange={(e) => onUpdateElement({ textContent: e.target.value })}
                  placeholder="Text content..."
                  className="w-full bg-[#201f1f] border border-[#353534]/50 rounded px-2.5 py-1.5 text-xs text-[#e5e2e1] outline-none focus:border-[#0d99ff]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-[#201f1f] rounded px-2.5 py-1.5 border border-[#353534]/50">
                    <span className="text-[#89919e] text-[10px] mr-2">Size</span>
                    <input
                      type="number"
                      min="8"
                      max="96"
                      value={selectedElement.fontSize || 14}
                      onChange={(e) =>
                        onUpdateElement({ fontSize: Math.max(8, Number(e.target.value)) })
                      }
                      className="w-full bg-transparent font-mono text-xs text-[#e5e2e1] outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-[#201f1f] rounded px-2 py-1 border border-[#353534]/50">
                    <input
                      type="color"
                      value={selectedElement.textColor || '#ffffff'}
                      onChange={(e) => onUpdateElement({ textColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent mr-2"
                    />
                    <span className="font-mono text-[11px] text-[#e5e2e1] truncate">
                      {selectedElement.textColor || '#ffffff'}
                    </span>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="flex items-center justify-between bg-[#201f1f] p-1 rounded border border-[#353534]/50">
                  <span className="text-[10px] text-[#89919e] px-1.5">Align</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onUpdateElement({ textAlign: 'left' } as any)}
                      className={`p-1 rounded transition-colors ${
                        (selectedElement as any).textAlign === 'left' || !(selectedElement as any).textAlign
                          ? 'bg-[#0d99ff]/20 text-[#9fcaff]'
                          : 'text-[#89919e] hover:text-[#e5e2e1]'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement({ textAlign: 'center' } as any)}
                      className={`p-1 rounded transition-colors ${
                        (selectedElement as any).textAlign === 'center'
                          ? 'bg-[#0d99ff]/20 text-[#9fcaff]'
                          : 'text-[#89919e] hover:text-[#e5e2e1]'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement({ textAlign: 'right' } as any)}
                      className={`p-1 rounded transition-colors ${
                        (selectedElement as any).textAlign === 'right'
                          ? 'bg-[#0d99ff]/20 text-[#9fcaff]'
                          : 'text-[#89919e] hover:text-[#e5e2e1]'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fill Color Section - Hidden for text elements */}
          {selectedElement.type !== 'text' && (
          <>
          <div className="space-y-2 border-t border-[#353534]/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                Fill
              </span>
              <button
                onClick={() => onUpdateElement({ fill: '#9fcaff' })}
                className="text-[11px] text-[#9fcaff] hover:underline"
              >
                Reset Fill
              </button>
            </div>
            <div className="flex items-center justify-between bg-[#201f1f] p-2 rounded border border-[#353534]/50">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => {
                    setFillColor(e.target.value);
                    onUpdateElement({ fill: e.target.value });
                  }}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={(selectedElement.fill || '#131313').toUpperCase()}
                  onChange={(e) => {
                    setFillColor(e.target.value);
                    onUpdateElement({ fill: e.target.value });
                  }}
                  className="font-mono text-xs text-[#e5e2e1] bg-transparent outline-none w-20"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-[#89919e]">
                  {selectedElement.fillOpacity ?? 100}%
                </span>
                <button
                  onClick={() =>
                    onUpdateElement({
                      fillOpacity: (selectedElement.fillOpacity ?? 100) === 100 ? 50 : 100,
                    })
                  }
                  className="text-[#89919e] hover:text-[#e5e2e1] p-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Color Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setFillColor(c);
                    onUpdateElement({ fill: c });
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-4 h-4 rounded-full border border-[#353534] transition-transform hover:scale-125 ${
                    (selectedElement.fill || '').toLowerCase() === c.toLowerCase() ? 'ring-2 ring-[#9fcaff]' : ''
                  }`}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Stroke Section */}
          <div className="space-y-2 border-t border-[#353534]/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                Stroke
              </span>
              <button
                onClick={() =>
                  onUpdateElement({
                    stroke: selectedElement.stroke === 'none' ? '#3F4753' : 'none',
                    strokeWidth: selectedElement.strokeWidth ? 0 : 1,
                  })
                }
                className="text-[11px] text-[#9fcaff] hover:underline"
              >
                {selectedElement.stroke === 'none' ? '+ Add Stroke' : 'Remove'}
              </button>
            </div>
            {selectedElement.stroke !== 'none' && (
              <div className="flex items-center justify-between bg-[#201f1f] p-2 rounded border border-[#353534]/50">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => {
                      setStrokeColor(e.target.value);
                      onUpdateElement({ stroke: e.target.value });
                    }}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={(selectedElement.stroke || '#353534').toUpperCase()}
                    onChange={(e) => {
                      setStrokeColor(e.target.value);
                      onUpdateElement({ stroke: e.target.value });
                    }}
                    className="font-mono text-xs text-[#e5e2e1] bg-transparent outline-none w-20"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={selectedElement.strokeWidth ?? 1}
                    onChange={(e) =>
                      onUpdateElement({ strokeWidth: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-10 bg-[#141416] border border-[#353534] rounded px-1 text-center font-mono text-xs text-[#e5e2e1]"
                  />
                  <span className="text-[#89919e] text-[10px]">px</span>
                </div>
              </div>
            )}
          </div>

          {/* Effects / Shadow Section */}
          <div className="space-y-2 border-t border-[#353534]/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                Drop Shadow
              </span>
              <button
                onClick={() =>
                  onUpdateElement({
                    shadowBlur: selectedElement.shadowBlur ? 0 : 16,
                    shadowY: selectedElement.shadowY ? 0 : 4,
                  })
                }
                className="text-[11px] text-[#9fcaff] hover:underline"
              >
                {selectedElement.shadowBlur ? 'Remove' : '+ Add Shadow'}
              </button>
            </div>
            {Boolean(selectedElement.shadowBlur) && (
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#201f1f] p-2 rounded border border-[#353534]/50">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[#89919e]">Blur:</span>
                  <input
                    type="number"
                    value={selectedElement.shadowBlur ?? 16}
                    onChange={(e) =>
                      onUpdateElement({ shadowBlur: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-12 bg-[#141416] border border-[#353534] rounded text-center text-[#e5e2e1] font-mono"
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[#89919e]">Offset Y:</span>
                  <input
                    type="number"
                    value={selectedElement.shadowY ?? 4}
                    onChange={(e) => onUpdateElement({ shadowY: Number(e.target.value) })}
                    className="w-12 bg-[#141416] border border-[#353534] rounded text-center text-[#e5e2e1] font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Design Systems & Material Surfaces (Material 3, iOS, Glass Effect) */}
          <div className="space-y-2 border-t border-[#353534]/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                Material Systems
              </span>
              <button
                onClick={() =>
                  onUpdateElement({
                    materialPreset: 'none',
                    glassEffect: 'none',
                    backdropBlur: 0,
                  })
                }
                className="text-[11px] text-[#89919e] hover:text-[#e5e2e1] hover:underline"
              >
                Clear Preset
              </button>
            </div>

            {/* Separate System Navigation Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#141416] p-1 rounded-lg border border-[#353534]/60">
              <button
                type="button"
                onClick={() => setMaterialSystemTab('material3')}
                className={`py-1.5 px-1 rounded text-[10px] font-medium transition-all text-center ${
                  materialSystemTab === 'material3'
                    ? 'bg-[#d0bcff]/20 text-[#d0bcff] font-semibold shadow-sm ring-1 ring-[#d0bcff]/30'
                    : 'text-[#89919e] hover:text-[#e5e2e1]'
                }`}
              >
                Material 3
              </button>
              <button
                type="button"
                onClick={() => setMaterialSystemTab('ios')}
                className={`py-1.5 px-1 rounded text-[10px] font-medium transition-all text-center ${
                  materialSystemTab === 'ios'
                    ? 'bg-[#007aff]/20 text-[#9fcaff] font-semibold shadow-sm ring-1 ring-[#007aff]/30'
                    : 'text-[#89919e] hover:text-[#e5e2e1]'
                }`}
              >
                iOS Material
              </button>
              <button
                type="button"
                onClick={() => setMaterialSystemTab('glass')}
                className={`py-1.5 px-1 rounded text-[10px] font-medium transition-all text-center ${
                  materialSystemTab === 'glass'
                    ? 'bg-[#0d99ff]/20 text-[#0d99ff] font-semibold shadow-sm ring-1 ring-[#0d99ff]/30'
                    : 'text-[#89919e] hover:text-[#e5e2e1]'
                }`}
              >
                Glass Effect
              </button>
            </div>

            {/* Material 3 Presets Panel */}
            {materialSystemTab === 'material3' && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-[#89919e]">Google Material You Expressive tokens</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {MATERIAL_3_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onUpdateElement(preset.props)}
                      className="p-2 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#d0bcff]/60 rounded-lg text-left transition-all group flex flex-col justify-between h-14"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-semibold text-[#e5e2e1] group-hover:text-[#d0bcff] truncate">
                          {preset.badge}
                        </span>
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.props.fill }}
                        />
                      </div>
                      <span className="text-[9px] text-[#89919e] line-clamp-1">
                        R{preset.props.borderRadius} • {preset.props.fillOpacity ?? 100}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* iOS Material Presets Panel */}
            {materialSystemTab === 'ios' && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-[#89919e]">Apple HIG Vibrancy & Continuous Curvature</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {IOS_MATERIAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onUpdateElement(preset.props)}
                      className="p-2 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#007aff]/60 rounded-lg text-left transition-all group flex flex-col justify-between h-14"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-semibold text-[#e5e2e1] group-hover:text-[#9fcaff] truncate">
                          {preset.badge}
                        </span>
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.badgeColor }}
                        />
                      </div>
                      <span className="text-[9px] text-[#89919e] line-clamp-1">
                        Blur {preset.props.backdropBlur || 0}px • R{preset.props.borderRadius}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Glass Effect Presets Panel */}
            {materialSystemTab === 'glass' && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-[#89919e]">Glassmorphic acrylic with specular highlight</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {GLASS_EFFECT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onUpdateElement(preset.props)}
                      className="p-2 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#0d99ff]/60 rounded-lg text-left transition-all group flex flex-col justify-between h-14"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-semibold text-[#e5e2e1] group-hover:text-[#0d99ff] truncate">
                          {preset.badge}
                        </span>
                        <Sparkles className="w-3 h-3 text-[#9fcaff]" />
                      </div>
                      <span className="text-[9px] text-[#89919e] line-clamp-1">
                        Blur {preset.props.backdropBlur || 16}px
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Backdrop Blur Slider */}
            <div className="bg-[#201f1f] rounded p-2 border border-[#353534]/50 space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#89919e] uppercase font-semibold">Backdrop Filter Blur</span>
                <span className="font-mono text-[#e5e2e1]">{selectedElement.backdropBlur ?? 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={selectedElement.backdropBlur ?? 0}
                onChange={(e) => onUpdateElement({ backdropBlur: Number(e.target.value) })}
                className="w-full accent-[#0d99ff] h-1 bg-[#353534] rounded cursor-pointer"
              />
            </div>

            {/* Glass Specular Effect Variant Picker */}
            <div className="flex items-center justify-between bg-[#201f1f] p-1.5 rounded border border-[#353534]/50">
              <span className="text-[10px] text-[#89919e] px-1">Glass Specular</span>
              <div className="flex items-center gap-1 text-[10px]">
                {(['none', 'frosted', 'neon', 'smoke', 'prism'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() =>
                      onUpdateElement({
                        glassEffect: style,
                        backdropBlur: style !== 'none' ? Math.max(16, selectedElement.backdropBlur || 20) : selectedElement.backdropBlur,
                      })
                    }
                    className={`px-1.5 py-0.5 rounded capitalize transition-colors ${
                      (selectedElement.glassEffect || 'none') === style
                        ? 'bg-[#0d99ff] text-[#002f55] font-semibold'
                        : 'text-[#89919e] hover:text-[#e5e2e1]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
          )}

          {/* Quick Export Button */}
          <div className="pt-2 border-t border-[#353534]">
            <button
              id="btn-quick-export"
              onClick={onExportSelected}
              className="w-full bg-[#201f1f] hover:bg-[#2a2a2a] text-[#bfc7d5] hover:text-[#e5e2e1] border border-[#353534] py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#9fcaff]" />
              <span>Export {selectedElement.name}...</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PROTOTYPE SETTINGS */}
      {activeTab === 'prototype' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs text-[#e5e2e1]">
          {/* Main Play Simulator CTA */}
          <div className="bg-gradient-to-br from-[#0d99ff]/20 to-[#6001d1]/20 p-3.5 rounded-xl border border-[#0d99ff]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9fcaff]" />
                Prototype Simulator
              </span>
              <span className="text-[10px] bg-[#0d99ff] text-[#002f55] px-1.5 py-0.5 rounded font-bold">
                READY
              </span>
            </div>
            <p className="text-[11px] text-[#bfc7d5] leading-relaxed">
              Test full screen navigation, interactive clicks, and mobile device wrappers directly in
              ZLab.
            </p>
            <button
              id="btn-inspector-play-proto"
              onClick={onOpenPrototype}
              className="w-full bg-[#0d99ff] hover:bg-[#0088ea] text-[#00284d] py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Interactive Prototype</span>
            </button>
          </div>

          {/* Download Interactive Prototype Section */}
          <div className="bg-[#201f1f] p-3 rounded-xl border border-[#353534] space-y-2.5">
            <span className="text-xs font-semibold text-white block">Offline Prototype Export</span>
            <p className="text-[11px] text-[#89919e] leading-relaxed">
              Download a standalone, self-contained HTML prototype that can be opened in any web
              browser without an internet connection.
            </p>
            <button
              id="btn-inspector-download-proto-html"
              onClick={() =>
                downloadInteractivePrototypeHtml(
                  projectTitle,
                  allElements,
                  devicePreview === 'mobile' ? 'mobile' : 'desktop'
                )
              }
              className="w-full bg-[#2a2a2a] hover:bg-[#353534] text-[#9fcaff] hover:text-white border border-[#3f4753] py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Download Prototype (.html)</span>
            </button>
          </div>

          {/* Interaction Trigger & Action Config (Figma-Style Prototype) */}
          <div className="space-y-3 border-t border-[#353534]/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                Interaction Details
              </span>
              <span className="text-[10px] bg-[#0d99ff]/20 text-[#0d99ff] px-2 py-0.5 rounded font-mono font-semibold">
                Figma Prototype
              </span>
            </div>

            <div className="space-y-2">
              {/* Trigger */}
              <div className="flex items-center justify-between bg-[#201f1f] px-3 py-2 rounded-lg border border-[#353534]/50">
                <span className="text-[11px] text-[#89919e] font-medium">Trigger</span>
                <select
                  value={protoTrigger}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setProtoTrigger(next);
                    onUpdateElement({
                      prototype: {
                        trigger: next,
                        action: protoAction,
                        destinationId: protoDestination,
                        animation: protoAnimation,
                        easing: protoEasing,
                        duration: protoDuration,
                      },
                    });
                  }}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer text-right font-medium"
                >
                  <option value="tap" className="bg-[#1c1b1b]">On tap</option>
                  <option value="click" className="bg-[#1c1b1b]">On click</option>
                  <option value="hover" className="bg-[#1c1b1b]">While hovering</option>
                  <option value="drag" className="bg-[#1c1b1b]">On drag</option>
                  <option value="delay" className="bg-[#1c1b1b]">After delay</option>
                </select>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between bg-[#201f1f] px-3 py-2 rounded-lg border border-[#353534]/50">
                <span className="text-[11px] text-[#89919e] font-medium">Action</span>
                <select
                  value={protoAction}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setProtoAction(next);
                    onUpdateElement({
                      prototype: {
                        trigger: protoTrigger,
                        action: next,
                        destinationId: protoDestination,
                        animation: protoAnimation,
                        easing: protoEasing,
                        duration: protoDuration,
                      },
                    });
                  }}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer text-right font-medium"
                >
                  <option value="navigate" className="bg-[#1c1b1b]">Navigate to</option>
                  <option value="overlay" className="bg-[#1c1b1b]">Open overlay</option>
                  <option value="url" className="bg-[#1c1b1b]">Open external link</option>
                  <option value="back" className="bg-[#1c1b1b]">Back</option>
                </select>
              </div>

              {/* Destination */}
              <div className="flex items-center justify-between bg-[#201f1f] px-3 py-2 rounded-lg border border-[#353534]/50">
                <span className="text-[11px] text-[#89919e] font-medium">Destination</span>
                <select
                  value={protoDestination}
                  onChange={(e) => {
                    const next = e.target.value;
                    setProtoDestination(next);
                    onUpdateElement({
                      prototype: {
                        trigger: protoTrigger,
                        action: protoAction,
                        destinationId: next,
                        animation: protoAnimation,
                        easing: protoEasing,
                        duration: protoDuration,
                      },
                    });
                  }}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer text-right font-medium max-w-[150px] truncate"
                >
                  <option value="signin-screen-frame" className="bg-[#1c1b1b]">Sign-In Screen</option>
                  <option value="welcome-screen-frame" className="bg-[#1c1b1b]">Welcome Screen</option>
                  <option value="desktop-1440" className="bg-[#1c1b1b]">Desktop - 1440</option>
                  <option value="mobile-app-view" className="bg-[#1c1b1b]">Mobile App View</option>
                  {(Object.values(allElements) as CanvasElement[])
                    .filter((el) => (el.type === 'frame' || el.id.includes('screen')) && !['signin-screen-frame', 'welcome-screen-frame', 'desktop-1440', 'mobile-app-view'].includes(el.id))
                    .map((f) => (
                      <option key={f.id} value={f.id} className="bg-[#1c1b1b]">
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Animation Transition */}
              <div className="flex items-center justify-between bg-[#201f1f] px-3 py-2 rounded-lg border border-[#353534]/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#89919e] font-medium">Animation</span>
                  {protoAnimation === 'smart_animate' && (
                    <span className="text-[9px] bg-[#d2bbff]/20 text-[#d2bbff] px-1.5 py-0.2 rounded font-mono">
                      Smooth
                    </span>
                  )}
                </div>
                <select
                  value={protoAnimation}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setProtoAnimation(next);
                    onUpdateElement({
                      prototype: {
                        trigger: protoTrigger,
                        action: protoAction,
                        destinationId: protoDestination,
                        animation: next,
                        easing: protoEasing,
                        duration: protoDuration,
                      },
                    });
                  }}
                  className="bg-transparent text-xs text-[#0d99ff] font-semibold outline-none cursor-pointer text-right"
                >
                  <option value="smart_animate" className="bg-[#1c1b1b] text-[#9fcaff]">✦ Smart Animate</option>
                  <option value="dissolve" className="bg-[#1c1b1b] text-white">Dissolve</option>
                  <option value="instant" className="bg-[#1c1b1b] text-white">Instant</option>
                  <option value="slide_in" className="bg-[#1c1b1b] text-white">Slide In</option>
                  <option value="slide_out" className="bg-[#1c1b1b] text-white">Slide Out</option>
                  <option value="push" className="bg-[#1c1b1b] text-white">Push</option>
                </select>
              </div>

              {/* Smart Animate Easing & Duration Controls */}
              {protoAnimation === 'smart_animate' && (
                <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#0d99ff]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#9fcaff] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Smart Animate Curve
                    </span>
                    <span className="text-[10px] text-[#89919e]">{protoDuration}ms</span>
                  </div>

                  {/* Easing */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setProtoEasing('ease-out');
                        onUpdateElement({
                          prototype: {
                            trigger: protoTrigger,
                            action: protoAction,
                            destinationId: protoDestination,
                            animation: 'smart_animate',
                            easing: 'ease-out',
                            duration: protoDuration,
                          },
                        });
                      }}
                      className={`px-2 py-1.5 rounded border text-left transition-colors ${
                        protoEasing === 'ease-out'
                          ? 'bg-[#0d99ff]/20 border-[#0d99ff] text-[#9fcaff] font-semibold'
                          : 'bg-[#201f1f] border-[#353534] text-[#89919e] hover:text-[#e5e2e1]'
                      }`}
                    >
                      Ease out
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProtoEasing('ease-in-out');
                        onUpdateElement({
                          prototype: {
                            trigger: protoTrigger,
                            action: protoAction,
                            destinationId: protoDestination,
                            animation: 'smart_animate',
                            easing: 'ease-in-out',
                            duration: protoDuration,
                          },
                        });
                      }}
                      className={`px-2 py-1.5 rounded border text-left transition-colors ${
                        protoEasing === 'ease-in-out'
                          ? 'bg-[#0d99ff]/20 border-[#0d99ff] text-[#9fcaff] font-semibold'
                          : 'bg-[#201f1f] border-[#353534] text-[#89919e] hover:text-[#e5e2e1]'
                      }`}
                    >
                      Ease in & out
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProtoEasing('spring');
                        onUpdateElement({
                          prototype: {
                            trigger: protoTrigger,
                            action: protoAction,
                            destinationId: protoDestination,
                            animation: 'smart_animate',
                            easing: 'spring',
                            duration: protoDuration,
                          },
                        });
                      }}
                      className={`px-2 py-1.5 rounded border text-left transition-colors ${
                        protoEasing === 'spring'
                          ? 'bg-[#0d99ff]/20 border-[#0d99ff] text-[#9fcaff] font-semibold'
                          : 'bg-[#201f1f] border-[#353534] text-[#89919e] hover:text-[#e5e2e1]'
                      }`}
                    >
                      Bouncy / Spring
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProtoEasing('linear');
                        onUpdateElement({
                          prototype: {
                            trigger: protoTrigger,
                            action: protoAction,
                            destinationId: protoDestination,
                            animation: 'smart_animate',
                            easing: 'linear',
                            duration: protoDuration,
                          },
                        });
                      }}
                      className={`px-2 py-1.5 rounded border text-left transition-colors ${
                        protoEasing === 'linear'
                          ? 'bg-[#0d99ff]/20 border-[#0d99ff] text-[#9fcaff] font-semibold'
                          : 'bg-[#201f1f] border-[#353534] text-[#89919e] hover:text-[#e5e2e1]'
                      }`}
                    >
                      Linear
                    </button>
                  </div>

                  {/* Duration Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#89919e]">Duration Preset</span>
                    <div className="flex items-center gap-1">
                      {[300, 450, 600, 800].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setProtoDuration(d);
                            onUpdateElement({
                              prototype: {
                                trigger: protoTrigger,
                                action: protoAction,
                                destinationId: protoDestination,
                                animation: 'smart_animate',
                                easing: protoEasing,
                                duration: d,
                              },
                            });
                          }}
                          className={`flex-1 py-1 rounded text-[10px] font-mono transition-colors ${
                            protoDuration === d
                              ? 'bg-[#0d99ff] text-[#002f55] font-bold'
                              : 'bg-[#201f1f] text-[#89919e] hover:text-white'
                          }`}
                        >
                          {d}ms
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Motion Visualizer hint */}
                  <div className="h-10 bg-[#121215] rounded-md border border-[#2a2a2e] flex items-center justify-between px-3 overflow-hidden text-[10px] text-[#89919e]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0d99ff] animate-ping" />
                      <span className="text-[#e5e2e1]">Smooth motion active</span>
                    </div>
                    <span className="font-mono text-[#9fcaff]">Matching layers morph</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CODE INSPECTOR */}
      {activeTab === 'inspect' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
          {/* Code Flavor Pills */}
          <div className="flex items-center bg-[#141416] p-1 rounded-lg border border-[#353534]">
            <button
              onClick={() => setCodeType('css')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                codeType === 'css' ? 'bg-[#2a2a2a] text-white shadow' : 'text-[#89919e] hover:text-white'
              }`}
            >
              CSS
            </button>
            <button
              onClick={() => setCodeType('tailwind')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                codeType === 'tailwind' ? 'bg-[#2a2a2a] text-white shadow' : 'text-[#89919e] hover:text-white'
              }`}
            >
              Tailwind
            </button>
            <button
              onClick={() => setCodeType('react')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                codeType === 'react' ? 'bg-[#2a2a2a] text-white shadow' : 'text-[#89919e] hover:text-white'
              }`}
            >
              React JSX
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[11px] text-[#89919e]">Generated Snippet</span>
            <button
              onClick={handleCopyCode}
              className="text-[#9fcaff] hover:underline flex items-center gap-1 text-[11px]"
            >
              {copiedCode ? <Check className="w-3 h-3 text-[#34d399]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="bg-[#131313] p-3 rounded-lg border border-[#353534] text-[11px] font-mono text-[#34d399] overflow-x-auto leading-relaxed max-h-72">
            {codeType === 'css' &&
              `.${selectedElement.id} {
  width: ${selectedElement.width}px;
  height: ${selectedElement.height}px;
  border-radius: ${selectedElement.borderRadius ?? 8}px;
  background: ${selectedElement.fill};
  border: ${selectedElement.strokeWidth ?? 0}px solid ${selectedElement.stroke};
  box-shadow: 0 ${selectedElement.shadowY ?? 0}px ${selectedElement.shadowBlur ?? 0}px rgba(0,0,0,0.35);${
    selectedElement.backdropBlur
      ? `\n  backdrop-filter: blur(${selectedElement.backdropBlur}px);\n  -webkit-backdrop-filter: blur(${selectedElement.backdropBlur}px);`
      : ''
  }
}`}
            {codeType === 'tailwind' &&
              `className="w-[${selectedElement.width}px] h-[${selectedElement.height}px] rounded-[${selectedElement.borderRadius ?? 8}px] bg-[${selectedElement.fill}] border-[${selectedElement.strokeWidth ?? 0}px] border-[${selectedElement.stroke}] shadow-md${
                selectedElement.backdropBlur ? ` backdrop-blur-[${selectedElement.backdropBlur}px]` : ''
              }"`}
            {codeType === 'react' &&
              `<div
  style={{
    width: ${selectedElement.width},
    height: ${selectedElement.height},
    backgroundColor: '${selectedElement.fill}',
    borderRadius: ${selectedElement.borderRadius ?? 8},${
      selectedElement.backdropBlur
        ? `\n    backdropFilter: 'blur(${selectedElement.backdropBlur}px)',\n    WebkitBackdropFilter: 'blur(${selectedElement.backdropBlur}px)',`
        : ''
    }
  }}
>
  ${selectedElement.textContent || selectedElement.name}
</div>`}
          </pre>
        </div>
      )}
    </aside>
  );
};
