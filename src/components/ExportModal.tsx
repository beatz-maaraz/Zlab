import React, { useState } from 'react';
import {
  X,
  Download,
  Image,
  FileCode,
  Globe,
  Database,
  Check,
  Sparkles,
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

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  elements,
  selectedElementId,
  devicePreview,
}) => {
  const [format, setFormat] = useState<ExportFormat>('prototype');
  const [scale, setScale] = useState<'1x' | '2x' | '3x'>('2x');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  const targetElement = selectedElementId ? elements[selectedElementId] : elements['desktop-1440'];
  const targetName = targetElement?.name || 'Artboard';

  const handleExecuteExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      if (format === 'prototype') {
        downloadInteractivePrototypeHtml(projectTitle, elements, devicePreview);
      } else if (format === 'png') {
        downloadPng(projectTitle, elements, selectedElementId);
      } else if (format === 'svg') {
        downloadSvg(projectTitle, elements, selectedElementId);
      } else if (format === 'json') {
        downloadJson(projectTitle, elements);
      }

      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1400);
    }, 300);
  };

  return (
    <div
      id="modal-export-dialog"
      className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
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
            onClick={onClose}
            className="p-1.5 text-[#89919e] hover:text-white rounded-lg hover:bg-[#202024] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-[#e5e2e1]">
          {/* Format Selection Cards */}
          <div>
            <label className="block text-[11px] font-medium text-[#89919e] uppercase tracking-wider mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Interactive Prototype Option */}
              <button
                type="button"
                onClick={() => setFormat('prototype')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'prototype'
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                    : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0d99ff]/20 text-[#9fcaff] flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  {format === 'prototype' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">Interactive Prototype</div>
                  <div className="text-[10px] text-[#89919e] mt-0.5">Standalone HTML (.html)</div>
                </div>
              </button>

              {/* PNG Raster Option */}
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'png'
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                    : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#34d399]/20 text-[#34d399] flex items-center justify-center">
                    <Image className="w-4 h-4" />
                  </div>
                  {format === 'png' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">Raster Artwork</div>
                  <div className="text-[10px] text-[#89919e] mt-0.5">High-DPI Image (.png)</div>
                </div>
              </button>

              {/* SVG Vector Option */}
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'svg'
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                    : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center">
                    <FileCode className="w-4 h-4" />
                  </div>
                  {format === 'svg' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">Scalable Vector</div>
                  <div className="text-[10px] text-[#89919e] mt-0.5">Clean Vectors (.svg)</div>
                </div>
              </button>

              {/* JSON Project Data Option */}
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'json'
                    ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                    : 'border-[#27272a] bg-[#141416] text-[#a1a1aa] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#d2bbff]/20 text-[#d2bbff] flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  {format === 'json' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">ZLab Project</div>
                  <div className="text-[10px] text-[#89919e] mt-0.5">Raw Schema (.json)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scale options for PNG */}
          {format === 'png' && (
            <div className="bg-[#141416] p-3 rounded-xl border border-[#27272a] flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-white block">Export Resolution</span>
                <span className="text-[10px] text-[#89919e]">High-DPI Retina pixel density</span>
              </div>
              <div className="flex items-center gap-1 bg-[#202024] p-1 rounded-lg border border-[#2d2d32]">
                {(['1x', '2x', '3x'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScale(s)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                      scale === s ? 'bg-[#3f3f46] text-white' : 'text-[#89919e] hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description Callout */}
          <div className="bg-[#202024]/60 p-3 rounded-xl border border-[#27272a] text-[11px] text-[#a1a1aa] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#9fcaff] shrink-0 mt-0.5" />
            <div>
              {format === 'prototype' && (
                <span>
                  Generates an interactive, standalone HTML prototype with working navigation,
                  screen switcher, and device frames that can be shared and opened in any browser offline.
                </span>
              )}
              {format === 'png' && (
                <span>
                  Exports a sharp {scale} resolution PNG raster image of "{targetName}" ready for
                  presentations, social media, and client sign-off.
                </span>
              )}
              {format === 'svg' && (
                <span>
                  Generates clean, scalable SVG vector markup with exact layers, paths, typography,
                  and styling.
                </span>
              )}
              {format === 'json' && (
                <span>
                  Exports all layer coordinates, styling rules, tokens, and node hierarchies in
                  standard JSON format.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#141416] border-t border-[#27272a] flex items-center justify-between">
          <button
            type="button"
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
            className="bg-[#9fcaff] hover:bg-[#0d99ff] text-[#003259] px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {exportComplete ? (
              <>
                <Check className="w-4 h-4 text-[#003259]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#003259]" />
                <span>{isExporting ? 'Generating...' : `Download ${format.toUpperCase()}`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
