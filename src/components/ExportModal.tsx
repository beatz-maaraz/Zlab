import React, { useState } from 'react';
import {
  X,
  Download,
  Image as ImageIcon,
  FileCode,
  Globe,
  Database,
  Check,
  Sparkles,
  Crop,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { CanvasElement } from '../types';
import {
  downloadPng,
  downloadSvg,
  downloadInteractivePrototypeHtml,
  downloadJson,
} from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  elements: Record<string, CanvasElement>;
  selectedElementId?: string;
  devicePreview: 'desktop' | 'mobile';
}

export type ExportFormat = 'png' | 'svg' | 'prototype' | 'json';
export type PngScale = '1x' | '2x' | '3x' | '4x';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  elements,
  selectedElementId,
  devicePreview,
}) => {
  // Format defaults to high-resolution PNG or SVG
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<PngScale>('2x');
  const [transparentBg, setTransparentBg] = useState(false);
  const [exportScope, setExportScope] = useState<'selection' | 'artboard'>('selection');
  const [showOtherFormats, setShowOtherFormats] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  const hasSelection = Boolean(
    selectedElementId &&
    elements[selectedElementId] &&
    selectedElementId !== 'desktop-1440' &&
    selectedElementId !== 'mobile-app-view'
  );

  const selectedElement = selectedElementId ? elements[selectedElementId] : undefined;
  const fallbackArtboardId = devicePreview === 'mobile' ? 'mobile-app-view' : 'desktop-1440';
  const artboardElement = elements[fallbackArtboardId] || elements['desktop-1440'];

  const effectiveTargetId =
    exportScope === 'selection' && hasSelection
      ? selectedElementId
      : (selectedElementId && (selectedElementId === 'desktop-1440' || selectedElementId === 'mobile-app-view')
          ? selectedElementId
          : fallbackArtboardId);

  const effectiveElement = effectiveTargetId ? elements[effectiveTargetId] : artboardElement;
  const targetName = effectiveElement?.name || (exportScope === 'selection' && hasSelection ? 'Selected Element' : 'Artboard');
  const targetWidth = effectiveElement?.width || (devicePreview === 'mobile' ? 390 : 960);
  const targetHeight = effectiveElement?.height || (devicePreview === 'mobile' ? 844 : 640);

  const scaleMultiplier = scale === '1x' ? 1 : scale === '2x' ? 2 : scale === '3x' ? 3 : 4;
  const outputPixelWidth = Math.round(targetWidth * scaleMultiplier);
  const outputPixelHeight = Math.round(targetHeight * scaleMultiplier);

  const handleExecuteExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      if (format === 'png') {
        downloadPng(projectTitle, elements, effectiveTargetId, scaleMultiplier, {
          transparentBackground: transparentBg,
        });
      } else if (format === 'svg') {
        downloadSvg(projectTitle, elements, effectiveTargetId, {
          transparentBackground: transparentBg,
          includeIds: true,
          editableText: true,
        });
      } else if (format === 'prototype') {
        downloadInteractivePrototypeHtml(projectTitle, elements, devicePreview);
      } else if (format === 'json') {
        downloadJson(projectTitle, elements);
      }

      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1400);
    }, 350);
  };

  const getTargetFileName = () => {
    const slug = (targetName || 'artwork').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const proj = (projectTitle || 'zlab').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (format === 'png') return `${proj}-${slug}@${scale}.png`;
    if (format === 'svg') return `${proj}-${slug}.svg`;
    if (format === 'prototype') return `${proj}-prototype.html`;
    return `${proj}.json`;
  };

  return (
    <div
      id="modal-export-dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#9fcaff]/15 text-[#9fcaff] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Export & Download</h3>
              <p className="text-[11px] text-[#89919e]">{projectTitle}</p>
            </div>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="p-1.5 text-[#89919e] hover:text-white rounded-lg hover:bg-[#202024] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-[#e5e2e1] max-h-[75vh] overflow-y-auto">
          {/* Target Scope Switcher (Current Selection vs Artboard) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-[#89919e] uppercase tracking-wider block">
                Export Source
              </label>
              {hasSelection && (
                <span className="text-[10px] text-[#9fcaff] bg-[#9fcaff]/10 px-2 py-0.5 rounded font-mono">
                  1 Element Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-scope-selection"
                onClick={() => setExportScope('selection')}
                disabled={!hasSelection}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  exportScope === 'selection' && hasSelection
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                    : hasSelection
                    ? 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                    : 'border-[#27272a]/50 bg-[#141416]/50 text-[#52525b] cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <Crop className="w-3.5 h-3.5 text-[#9fcaff]" />
                    <span>Current Selection</span>
                  </div>
                  {exportScope === 'selection' && hasSelection && (
                    <Check className="w-3.5 h-3.5 text-[#0d99ff]" />
                  )}
                </div>
                <div className="text-[11px] text-[#e5e2e1] font-medium truncate mt-1">
                  {hasSelection ? selectedElement?.name : 'No element selected'}
                </div>
                <div className="text-[10px] text-[#89919e] mt-0.5 font-mono">
                  {hasSelection ? `${selectedElement?.width} × ${selectedElement?.height} px` : 'Select on canvas'}
                </div>
              </button>

              <button
                type="button"
                id="btn-scope-artboard"
                onClick={() => setExportScope('artboard')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportScope === 'artboard' || !hasSelection
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                    : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <Layers className="w-3.5 h-3.5 text-[#d2bbff]" />
                    <span>Entire Artboard</span>
                  </div>
                  {(exportScope === 'artboard' || !hasSelection) && (
                    <Check className="w-3.5 h-3.5 text-[#0d99ff]" />
                  )}
                </div>
                <div className="text-[11px] text-[#e5e2e1] font-medium truncate mt-1">
                  {artboardElement?.name || 'Desktop Artboard'}
                </div>
                <div className="text-[10px] text-[#89919e] mt-0.5 font-mono">
                  {artboardElement?.width || 960} × {artboardElement?.height || 640} px
                </div>
              </button>
            </div>
          </div>

          {/* Primary Format Choice: High-Res PNG vs Editable SVG */}
          <div>
            <label className="block text-[11px] font-semibold text-[#89919e] uppercase tracking-wider mb-2">
              Choose File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* High-Resolution PNG Card */}
              <button
                type="button"
                id="btn-format-png"
                onClick={() => setFormat('png')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                  format === 'png'
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff] shadow-md shadow-[#0d99ff]/10'
                    : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46] hover:bg-[#1a1a1e]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#34d399]/20 text-[#34d399] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    {format === 'png' && (
                      <span className="w-5 h-5 rounded-full bg-[#0d99ff] flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-xs text-white">High-Resolution PNG</div>
                  <div className="text-[10px] text-[#34d399] font-mono mt-0.5">.png • Lossless Raster</div>
                  <p className="text-[11px] text-[#89919e] mt-1.5 leading-relaxed">
                    Ultra-sharp raster image at Retina 2x, 3x, or 4x pixel density.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#89919e]">
                  <span>Retina Quality</span>
                  <span className="font-mono text-[#34d399]">Up to 4x</span>
                </div>
              </button>

              {/* Editable SVG Card */}
              <button
                type="button"
                id="btn-format-svg"
                onClick={() => setFormat('svg')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                  format === 'svg'
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff] shadow-md shadow-[#0d99ff]/10'
                    : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46] hover:bg-[#1a1a1e]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileCode className="w-5 h-5" />
                    </div>
                    {format === 'svg' && (
                      <span className="w-5 h-5 rounded-full bg-[#0d99ff] flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-xs text-white">Editable SVG</div>
                  <div className="text-[10px] text-[#f59e0b] font-mono mt-0.5">.svg • Scalable Vector</div>
                  <p className="text-[11px] text-[#89919e] mt-1.5 leading-relaxed">
                    Clean vector paths, grouped layers & editable text for Figma, Illustrator & Sketch.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#89919e]">
                  <span>Vector Accuracy</span>
                  <span className="font-mono text-[#f59e0b]">Infinitely Scalable</span>
                </div>
              </button>
            </div>
          </div>

          {/* PNG Specific Controls: Scale & Transparency */}
          {format === 'png' && (
            <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white block">Resolution Multiplier</span>
                  <span className="text-[10px] text-[#89919e]">
                    Output: <span className="font-mono text-white">{outputPixelWidth} × {outputPixelHeight} px</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#202024] p-1 rounded-lg border border-[#2d2d32]">
                  {(['1x', '2x', '3x', '4x'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                        scale === s
                          ? 'bg-[#0d99ff] text-white shadow-sm'
                          : 'text-[#89919e] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#27272a] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#e5e2e1] block">Transparent Background</span>
                  <span className="text-[10px] text-[#89919e]">Export without canvas solid background</span>
                </div>
                <input
                  type="checkbox"
                  id="toggle-transparent-bg-png"
                  checked={transparentBg}
                  onChange={(e) => setTransparentBg(e.target.checked)}
                  className="w-4 h-4 rounded border-[#3f3f46] text-[#0d99ff] focus:ring-0 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* SVG Specific Controls */}
          {format === 'svg' && (
            <div className="bg-[#141416] p-4 rounded-xl border border-[#27272a] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white block">Layer Structure & Typography</span>
                  <span className="text-[10px] text-[#89919e]">Preserves grouped IDs and selectable text nodes</span>
                </div>
                <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded font-mono font-medium">
                  Editable Vector
                </span>
              </div>

              <div className="pt-2 border-t border-[#27272a] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#e5e2e1] block">Transparent Canvas</span>
                  <span className="text-[10px] text-[#89919e]">Exclude root container background</span>
                </div>
                <input
                  type="checkbox"
                  id="toggle-transparent-bg-svg"
                  checked={transparentBg}
                  onChange={(e) => setTransparentBg(e.target.checked)}
                  className="w-4 h-4 rounded border-[#3f3f46] text-[#0d99ff] focus:ring-0 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* File Details Summary Card */}
          <div className="bg-[#202024]/70 p-3.5 rounded-xl border border-[#27272a] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <Sparkles className="w-4 h-4 text-[#9fcaff] shrink-0" />
              <div className="min-w-0">
                <span className="text-[#89919e] block text-[10px] uppercase font-semibold">Target File</span>
                <span className="text-white font-mono truncate block text-xs mt-0.5">{getTargetFileName()}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[#89919e] block text-[10px] uppercase font-semibold">Base Bounds</span>
              <span className="text-[#9fcaff] font-mono text-xs">{targetWidth} × {targetHeight} px</span>
            </div>
          </div>

          {/* Secondary formats toggle (Interactive Prototype / JSON Schema) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOtherFormats(!showOtherFormats)}
              className="text-[11px] text-[#89919e] hover:text-[#e5e2e1] transition-colors flex items-center gap-1"
            >
              <span>{showOtherFormats ? '▾ Hide additional formats' : '▸ Need Interactive Prototype (.html) or Schema (.json)?'}</span>
            </button>

            {showOtherFormats && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setFormat('prototype')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    format === 'prototype'
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white'
                      : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs text-white">
                    <Globe className="w-3.5 h-3.5 text-[#0d99ff]" />
                    <span>HTML Prototype</span>
                  </div>
                  <div className="text-[10px] text-[#89919e] mt-0.5">Offline interactive sim</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    format === 'json'
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white'
                      : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs text-white">
                    <Database className="w-3.5 h-3.5 text-[#d2bbff]" />
                    <span>Project Schema</span>
                  </div>
                  <div className="text-[10px] text-[#89919e] mt-0.5">Raw JSON layers</div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#141416] border-t border-[#27272a] flex items-center justify-between">
          <button
            type="button"
            id="btn-cancel-export"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#a1a1aa] hover:text-white rounded-lg hover:bg-[#202024] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-export-download"
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="bg-[#0d99ff] hover:bg-[#9fcaff] text-white hover:text-[#002f55] px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.98]"
          >
            {exportComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  {isExporting
                    ? 'Rendering Output...'
                    : format === 'png'
                    ? `Download High-Res PNG (${scale})`
                    : format === 'svg'
                    ? 'Download Editable SVG'
                    : `Download ${format.toUpperCase()}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
