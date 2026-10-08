import React, { useState, useEffect, useRef } from 'react';
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  Sliders,
  Copy,
  Palette,
  FileText,
  AlertCircle,
  Settings2,
} from 'lucide-react';
import { CanvasElement } from '../types';
import {
  downloadPng,
  downloadJpeg,
  downloadSvg,
  downloadInteractivePrototypeHtml,
  downloadJson,
  downloadReactCode,
  downloadHtmlCode,
  generateExportPreview,
  ExportPreviewData,
} from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  elements: Record<string, CanvasElement>;
  selectedElementId?: string;
  devicePreview: 'desktop' | 'mobile';
}

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'prototype' | 'json' | 'react' | 'html';
export type ScaleMultiplier = '1x' | '2x' | '3x' | '4x';

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  elements,
  selectedElementId,
  devicePreview,
}) => {
  // Format selection: defaults to PNG with full support for JPG and SVG
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<ScaleMultiplier>('2x');
  const [transparentBg, setTransparentBg] = useState(false);
  const [exportScope, setExportScope] = useState<'selection' | 'artboard'>('selection');
  
  // JPG specific quality settings
  const [jpgQuality, setJpgQuality] = useState<number>(0.90);
  const [jpgBackground, setJpgBackground] = useState<'canvas' | 'white' | 'dark' | 'custom'>('canvas');
  const [customJpgBg, setCustomJpgBg] = useState<string>('#ffffff');

  // Preview management
  const [previewData, setPreviewData] = useState<ExportPreviewData | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewZoomMode, setPreviewZoomMode] = useState<'fit' | 'actual' | 'custom'>('fit');
  const [customZoom, setCustomZoom] = useState<number>(1);
  const [svgViewMode, setSvgViewMode] = useState<'visual' | 'code'>('visual');
  const [copiedCode, setCopiedCode] = useState(false);

  // Secondary formats toggle & export action states
  const [showOtherFormats, setShowOtherFormats] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

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
      ? selectedElementId!
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

  // Derive active background color for JPG or preview
  const getActiveJpgBgColor = () => {
    if (jpgBackground === 'white') return '#ffffff';
    if (jpgBackground === 'dark') return '#131313';
    if (jpgBackground === 'custom') return customJpgBg;
    return effectiveElement?.fill || '#131313';
  };

  // Real-time Preview Generation Effect
  useEffect(() => {
    if (!isOpen) {
      setPreviewData(null);
      setIsPreviewLoading(false);
      return;
    }

    let isMounted = true;
    setIsPreviewLoading(true);
    setPreviewError(null);

    // Debounce preview rendering to keep controls snappy when dragging quality slider
    const timer = setTimeout(async () => {
      try {
        const previewFormat = (format === 'png' || format === 'jpg' || format === 'svg') ? format : 'png';
        const activeBg = getActiveJpgBgColor();

        const result = await generateExportPreview(
          effectiveTargetId,
          previewFormat,
          scaleMultiplier,
          {
            quality: jpgQuality,
            transparentBackground: format === 'jpg' ? false : transparentBg,
            backgroundColor: format === 'jpg' ? activeBg : undefined,
          }
        );

        if (isMounted) {
          if (result) {
            setPreviewData(result);
            setPreviewError(null);
          } else {
            setPreviewError('Generating real-time canvas preview...');
          }
          setIsPreviewLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Real-time export preview error:', err);
          setPreviewError(err?.message || 'Failed to render live export preview');
          setIsPreviewLoading(false);
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    isOpen,
    effectiveTargetId,
    format,
    scale,
    scaleMultiplier,
    transparentBg,
    jpgQuality,
    jpgBackground,
    customJpgBg,
  ]);

  const handleExecuteExport = async () => {
    setIsExporting(true);

    try {
      if (format === 'png') {
        await downloadPng(projectTitle, elements, effectiveTargetId, scaleMultiplier, {
          transparentBackground: transparentBg,
        });
      } else if (format === 'jpg') {
        await downloadJpeg(projectTitle, elements, effectiveTargetId, scaleMultiplier, {
          quality: jpgQuality,
          backgroundColor: getActiveJpgBgColor(),
        });
      } else if (format === 'svg') {
        await downloadSvg(projectTitle, elements, effectiveTargetId, {
          transparentBackground: transparentBg,
          includeIds: true,
          editableText: true,
        });
      } else if (format === 'prototype') {
        await downloadInteractivePrototypeHtml(projectTitle, elements, devicePreview);
      } else if (format === 'react') {
        downloadReactCode(projectTitle, elements, effectiveTargetId);
      } else if (format === 'html') {
        downloadHtmlCode(projectTitle, elements, effectiveTargetId);
      } else if (format === 'json') {
        downloadJson(projectTitle, elements);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1400);
    }
  };

  const getTargetFileName = () => {
    const slug = (targetName || 'artwork').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const proj = (projectTitle || 'zlab').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (format === 'png') return `${proj}-${slug}@${scale}.png`;
    if (format === 'jpg') return `${proj}-${slug}@${scale}-q${Math.round(jpgQuality * 100)}.jpg`;
    if (format === 'svg') return `${proj}-${slug}.svg`;
    if (format === 'prototype') return `${proj}-prototype.html`;
    if (format === 'react') return `${proj}-${slug}.tsx`;
    if (format === 'html') return `${proj}-${slug}-code.html`;
    return `${proj}.json`;
  };

  const handleCopySvgCode = () => {
    if (previewData?.svgText) {
      navigator.clipboard.writeText(previewData.svgText);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleZoomIn = () => {
    setPreviewZoomMode('custom');
    setCustomZoom((prev) => Math.min(3, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setPreviewZoomMode('custom');
    setCustomZoom((prev) => Math.max(0.25, +(prev - 0.25).toFixed(2)));
  };

  const handleResetZoom = (mode: 'fit' | 'actual') => {
    setPreviewZoomMode(mode);
    if (mode === 'actual') {
      setCustomZoom(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-export-dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#09090b]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-[#161619] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-[#27272a] flex items-center justify-between bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0d99ff]/15 text-[#0d99ff] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Export & Download</h3>
                <span className="text-[10px] bg-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded font-mono font-medium">
                  {format.toUpperCase()} Real-Time Preview
                </span>
              </div>
              <p className="text-[11px] text-[#89919e] truncate max-w-xs sm:max-w-md">{projectTitle}</p>
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

        {/* Modal Main Content: Split Two-Column Layout */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden text-xs text-[#e5e2e1]">
          {/* Left Column: Settings, Quality & Controls */}
          <div className="w-full md:w-[420px] shrink-0 border-b md:border-b-0 md:border-r border-[#27272a] p-4 sm:p-5 space-y-4 overflow-y-auto bg-[#161619] max-h-[50vh] md:max-h-none">
            {/* Export Scope Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-[#89919e] uppercase tracking-wider block">
                  Export Source
                </label>
                {hasSelection && (
                  <span className="text-[10px] text-[#0d99ff] bg-[#0d99ff]/10 px-2 py-0.5 rounded font-mono">
                    Element Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-scope-selection"
                  onClick={() => setExportScope('selection')}
                  disabled={!hasSelection}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    exportScope === 'selection' && hasSelection
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                      : hasSelection
                      ? 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46]'
                      : 'border-[#27272a]/50 bg-[#121214]/50 text-[#52525b] cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <Crop className="w-3.5 h-3.5 text-[#0d99ff]" />
                      <span>Selection</span>
                    </div>
                    {exportScope === 'selection' && hasSelection && (
                      <Check className="w-3.5 h-3.5 text-[#0d99ff]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#e5e2e1] font-medium truncate mt-0.5">
                    {hasSelection ? selectedElement?.name : 'No selection'}
                  </div>
                  <div className="text-[10px] text-[#89919e] font-mono mt-0.5">
                    {hasSelection ? `${selectedElement?.width} × ${selectedElement?.height} px` : '—'}
                  </div>
                </button>

                <button
                  type="button"
                  id="btn-scope-artboard"
                  onClick={() => setExportScope('artboard')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    exportScope === 'artboard' || !hasSelection
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff]'
                      : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <Layers className="w-3.5 h-3.5 text-[#d2bbff]" />
                      <span>Artboard</span>
                    </div>
                    {(exportScope === 'artboard' || !hasSelection) && (
                      <Check className="w-3.5 h-3.5 text-[#0d99ff]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#e5e2e1] font-medium truncate mt-0.5">
                    {artboardElement?.name || 'Artboard'}
                  </div>
                  <div className="text-[10px] text-[#89919e] font-mono mt-0.5">
                    {artboardElement?.width || 960} × {artboardElement?.height || 640} px
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Format Selector (PNG, JPG, SVG) */}
            <div>
              <label className="block text-[10px] font-bold text-[#89919e] uppercase tracking-wider mb-2">
                File Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* PNG Card */}
                <button
                  type="button"
                  id="btn-format-png"
                  onClick={() => setFormat('png')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    format === 'png'
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff] shadow-sm'
                      : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46] hover:bg-[#1a1a1e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-7 h-7 rounded-lg bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px]">
                      PNG
                    </span>
                    {format === 'png' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                  </div>
                  <div className="font-semibold text-xs text-white">Lossless PNG</div>
                  <div className="text-[10px] text-[#34d399] font-mono mt-0.5">Retina + Alpha</div>
                </button>

                {/* JPG Card */}
                <button
                  type="button"
                  id="btn-format-jpg"
                  onClick={() => setFormat('jpg')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    format === 'jpg'
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff] shadow-sm'
                      : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46] hover:bg-[#1a1a1e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-7 h-7 rounded-lg bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center font-bold text-[10px]">
                      JPG
                    </span>
                    {format === 'jpg' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                  </div>
                  <div className="font-semibold text-xs text-white">Compressed JPG</div>
                  <div className="text-[10px] text-[#38bdf8] font-mono mt-0.5">Quality Slider</div>
                </button>

                {/* SVG Card */}
                <button
                  type="button"
                  id="btn-format-svg"
                  onClick={() => setFormat('svg')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    format === 'svg'
                      ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white ring-1 ring-[#0d99ff] shadow-sm'
                      : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46] hover:bg-[#1a1a1e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-7 h-7 rounded-lg bg-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center font-bold text-[10px]">
                      SVG
                    </span>
                    {format === 'svg' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                  </div>
                  <div className="font-semibold text-xs text-white">Vector SVG</div>
                  <div className="text-[10px] text-[#f59e0b] font-mono mt-0.5">Scalable XML</div>
                </button>
              </div>
            </div>

            {/* JPG Quality & Setting Controls */}
            {format === 'jpg' && (
              <div className="bg-[#121214] p-4 rounded-xl border border-[#27272a] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                    <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Compression Quality</span>
                  </div>
                  <span
                    id="badge-jpg-quality-value"
                    className="font-mono text-xs font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-2 py-0.5 rounded"
                  >
                    {Math.round(jpgQuality * 100)}%
                  </span>
                </div>

                {/* Quality Slider */}
                <div>
                  <input
                    type="range"
                    id="slider-jpg-quality"
                    min="0.10"
                    max="1.0"
                    step="0.05"
                    value={jpgQuality}
                    onChange={(e) => setJpgQuality(parseFloat(e.target.value))}
                    className="w-full accent-[#0d99ff] cursor-pointer h-1.5 bg-[#27272a] rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-[#89919e] font-mono mt-1">
                    <span>10% (Low)</span>
                    <span>60% (Draft)</span>
                    <span>85% (Good)</span>
                    <span>100% (Max)</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[
                    { label: 'Draft', value: 0.60 },
                    { label: 'Web', value: 0.80 },
                    { label: 'High', value: 0.90 },
                    { label: 'Max', value: 1.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      id={`btn-preset-q-${preset.label.toLowerCase()}`}
                      onClick={() => setJpgQuality(preset.value)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono transition-all ${
                        jpgQuality === preset.value
                          ? 'bg-[#0d99ff] text-white font-semibold'
                          : 'bg-[#1f1f23] text-[#89919e] hover:text-white hover:bg-[#27272a]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Resolution Multiplier */}
                <div className="pt-2.5 border-t border-[#27272a] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-white block">Resolution Scale</span>
                    <span className="text-[10px] text-[#89919e]">
                      {outputPixelWidth} × {outputPixelHeight} px
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#1f1f23] p-1 rounded-lg border border-[#2d2d32]">
                    {(['1x', '2x', '3x', '4x'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        id={`btn-scale-jpg-${s}`}
                        onClick={() => setScale(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
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

                {/* Background Fill (JPEG has no alpha channel) */}
                <div className="pt-2.5 border-t border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#e5e2e1] block">Background Color</span>
                      <span className="text-[10px] text-[#89919e]">Required for non-transparent JPG</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      id="btn-jpg-bg-canvas"
                      onClick={() => setJpgBackground('canvas')}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium truncate transition-all ${
                        jpgBackground === 'canvas'
                          ? 'border-[#0d99ff] bg-[#0d99ff]/15 text-white'
                          : 'border-[#27272a] bg-[#1f1f23] text-[#89919e] hover:text-white'
                      }`}
                    >
                      Canvas Fill
                    </button>
                    <button
                      type="button"
                      id="btn-jpg-bg-white"
                      onClick={() => setJpgBackground('white')}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                        jpgBackground === 'white'
                          ? 'border-[#0d99ff] bg-[#0d99ff]/15 text-white'
                          : 'border-[#27272a] bg-[#1f1f23] text-[#89919e] hover:text-white'
                      }`}
                    >
                      White (#FFF)
                    </button>
                    <button
                      type="button"
                      id="btn-jpg-bg-dark"
                      onClick={() => setJpgBackground('dark')}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                        jpgBackground === 'dark'
                          ? 'border-[#0d99ff] bg-[#0d99ff]/15 text-white'
                          : 'border-[#27272a] bg-[#1f1f23] text-[#89919e] hover:text-white'
                      }`}
                    >
                      Dark (#131)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PNG Specific Controls */}
            {format === 'png' && (
              <div className="bg-[#121214] p-4 rounded-xl border border-[#27272a] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-white block">Resolution Multiplier</span>
                    <span className="text-[10px] text-[#89919e]">
                      Output: <span className="font-mono text-white">{outputPixelWidth} × {outputPixelHeight} px</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#1f1f23] p-1 rounded-lg border border-[#2d2d32]">
                    {(['1x', '2x', '3x', '4x'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        id={`btn-scale-png-${s}`}
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

                <div className="pt-2.5 border-t border-[#27272a] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#e5e2e1] block">Transparent Background</span>
                    <span className="text-[10px] text-[#89919e]">Export with 32-bit RGBA alpha channel</span>
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
              <div className="bg-[#121214] p-4 rounded-xl border border-[#27272a] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-white block">Scalable Vector Graphics</span>
                    <span className="text-[10px] text-[#89919e]">Infinitely zoomable paths & text nodes</span>
                  </div>
                  <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded font-mono font-medium">
                    Vector XML
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#27272a] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#e5e2e1] block">Transparent Canvas</span>
                    <span className="text-[10px] text-[#89919e]">Omit root container fill color</span>
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

            {/* Prototype Specific Controls */}
            {format === 'prototype' && (
              <div className="bg-[#121214] p-4 rounded-xl border border-[#27272a] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-white block">Interactive Prototype Player</span>
                    <span className="text-[10px] text-[#89919e]">Self-contained offline HTML simulation</span>
                  </div>
                  <span className="text-[10px] bg-[#0d99ff]/20 text-[#0d99ff] px-2 py-0.5 rounded font-mono font-medium">
                    Dual Device
                  </span>
                </div>
                <div className="text-[11px] text-[#a1a1aa] leading-relaxed space-y-1.5 pt-1 border-t border-[#27272a]/60">
                  <div className="flex items-center gap-2 text-[#e5e2e1]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0" />
                    <span>Includes both Desktop 1440 and Mobile iOS frames</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e5e2e1]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d99ff] shrink-0" />
                    <span>Clickable hotspots with feedback toasts & tactile feedback</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e5e2e1]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                    <span>Dynamic island, status bars, zoom & fullscreen controls</span>
                  </div>
                </div>
              </div>
            )}

            {/* File Details Summary Card */}
            <div className="bg-[#1a1a1e] p-3.5 rounded-xl border border-[#27272a] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0d99ff] shrink-0" />
                  <span className="text-[#89919e] truncate font-mono text-[10px]">
                    {getTargetFileName()}
                  </span>
                </div>
                <span className="text-[#0d99ff] font-mono text-[10px] uppercase font-semibold">
                  {format.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Secondary Formats Collapsible (Prototype, HTML, React, JSON) */}
            <div className="pt-1">
              <button
                type="button"
                id="btn-toggle-other-formats"
                onClick={() => setShowOtherFormats(!showOtherFormats)}
                className="text-[11px] text-[#89919e] hover:text-[#e5e2e1] transition-colors flex items-center gap-1.5"
              >
                <span>{showOtherFormats ? '▾ Hide developer code formats' : '▸ Need Code (.tsx/.html), Prototype or JSON?'}</span>
              </button>

              {showOtherFormats && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#27272a]">
                  <button
                    type="button"
                    id="btn-format-prototype"
                    onClick={() => setFormat('prototype')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === 'prototype'
                        ? 'border-[#0d99ff] bg-[#0d99ff]/10 text-white'
                        : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-[10px] text-white">
                      <Globe className="w-3.5 h-3.5 text-[#0d99ff]" />
                      <span>Interactive Prototype</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-format-html"
                    onClick={() => setFormat('html')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === 'html'
                        ? 'border-[#f97316] bg-[#f97316]/10 text-white'
                        : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-[10px] text-white">
                      <FileCode className="w-3.5 h-3.5 text-[#f97316]" />
                      <span>HTML + CSS</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-format-react"
                    onClick={() => setFormat('react')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === 'react'
                        ? 'border-[#10b981] bg-[#10b981]/10 text-white'
                        : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-[10px] text-white">
                      <FileCode className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>React TSX</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-format-json"
                    onClick={() => setFormat('json')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === 'json'
                        ? 'border-[#d2bbff] bg-[#d2bbff]/10 text-white'
                        : 'border-[#27272a] bg-[#121214] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-[10px] text-white">
                      <Database className="w-3.5 h-3.5 text-[#d2bbff]" />
                      <span>JSON Schema</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Real-Time Export Preview Stage */}
          <div className="flex-1 flex flex-col bg-[#0f0f11] min-h-[360px] md:min-h-[480px] overflow-hidden">
            {/* Preview Toolbar */}
            <div className="px-4 py-2.5 border-b border-[#27272a] bg-[#121214] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-[11px] font-semibold text-white tracking-wide uppercase">
                  Real-Time Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f1f23] text-[#89919e] font-mono">
                  {format === 'jpg'
                    ? `JPG @ q${Math.round(jpgQuality * 100)}`
                    : format === 'png'
                    ? `PNG @ ${scale}`
                    : format === 'svg'
                    ? 'SVG Vector'
                    : format.toUpperCase()}
                </span>
              </div>

              {/* View & Zoom Controls */}
              <div className="flex items-center gap-1.5">
                {format === 'svg' && (
                  <div className="flex items-center bg-[#1f1f23] p-0.5 rounded-lg border border-[#2d2d32] mr-2">
                    <button
                      type="button"
                      id="btn-svg-view-visual"
                      onClick={() => setSvgViewMode('visual')}
                      className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 transition-all ${
                        svgViewMode === 'visual' ? 'bg-[#0d99ff] text-white' : 'text-[#89919e] hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Visual</span>
                    </button>
                    <button
                      type="button"
                      id="btn-svg-view-code"
                      onClick={() => setSvgViewMode('code')}
                      className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 transition-all ${
                        svgViewMode === 'code' ? 'bg-[#0d99ff] text-white' : 'text-[#89919e] hover:text-white'
                      }`}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>XML Code</span>
                    </button>
                  </div>
                )}

                {/* Zoom out, Fit, 1:1, Zoom in */}
                <button
                  type="button"
                  id="btn-zoom-out"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 text-[#89919e] hover:text-white rounded hover:bg-[#202024] transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  id="btn-zoom-fit"
                  onClick={() => handleResetZoom('fit')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                    previewZoomMode === 'fit'
                      ? 'bg-[#0d99ff]/20 text-[#0d99ff] font-semibold'
                      : 'text-[#89919e] hover:text-white hover:bg-[#202024]'
                  }`}
                >
                  Fit
                </button>

                <button
                  type="button"
                  id="btn-zoom-actual"
                  onClick={() => handleResetZoom('actual')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                    previewZoomMode === 'actual'
                      ? 'bg-[#0d99ff]/20 text-[#0d99ff] font-semibold'
                      : 'text-[#89919e] hover:text-white hover:bg-[#202024]'
                  }`}
                >
                  100%
                </button>

                <button
                  type="button"
                  id="btn-zoom-in"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 text-[#89919e] hover:text-white rounded hover:bg-[#202024] transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Stage Viewport */}
            <div
              ref={previewContainerRef}
              id="export-preview-viewport"
              className="flex-1 relative overflow-auto flex items-center justify-center p-6 select-none"
              style={{
                backgroundImage:
                  transparentBg && format !== 'jpg'
                    ? 'linear-gradient(45deg, #18181c 25%, transparent 25%), linear-gradient(-45deg, #18181c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181c 75%), linear-gradient(-45deg, transparent 75%, #18181c 75%)'
                    : undefined,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                backgroundColor: format === 'jpg' ? '#0f0f11' : '#121215',
              }}
            >
              {/* Preview Rendering Spinner Overlay */}
              {isPreviewLoading && (
                <div className="absolute top-4 right-4 z-20 bg-[#121214]/90 backdrop-blur border border-[#27272a] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <RefreshCw className="w-3 h-3 text-[#0d99ff] animate-spin" />
                  <span className="text-[10px] text-white font-medium">Updating {format.toUpperCase()} preview...</span>
                </div>
              )}

              {/* Prototype Format Active Indicator Badge */}
              {format === 'prototype' && !isPreviewLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#0d99ff]/95 text-[#002544] px-3.5 py-1 rounded-full text-[11px] font-bold shadow-xl flex items-center gap-1.5 backdrop-blur-sm">
                  <span>✦ Interactive Prototype HTML</span>
                  <span className="opacity-75 font-medium text-[10px]">• Desktop 1440 & Mobile iOS Included</span>
                </div>
              )}

              {/* Error or Empty State */}
              {previewError && !previewData ? (
                <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm text-[#89919e]">
                  <AlertCircle className="w-8 h-8 text-[#f59e0b] mb-2" />
                  <p className="text-xs text-white font-medium mb-1">Canvas Node Initializing</p>
                  <p className="text-[11px] leading-relaxed">{previewError}</p>
                </div>
              ) : format === 'svg' && svgViewMode === 'code' ? (
                /* SVG XML Code Inspector */
                <div className="w-full h-full max-h-[420px] bg-[#121214] border border-[#27272a] rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#27272a]">
                    <span className="text-[10px] font-mono text-[#89919e]">SVG Source Code ({previewData?.byteSize ? formatBytes(previewData.byteSize) : '—'})</span>
                    <button
                      type="button"
                      id="btn-copy-svg-code"
                      onClick={handleCopySvgCode}
                      className="px-2.5 py-1 rounded bg-[#202024] hover:bg-[#2d2d32] text-[#e5e2e1] text-[10px] flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied XML' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="flex-1 overflow-auto font-mono text-[10px] text-[#34d399] leading-relaxed select-text p-1">
                    <code>{previewData?.svgText || '<!-- Generating SVG markup... -->'}</code>
                  </pre>
                </div>
              ) : previewData?.dataUrl ? (
                /* Visual Rendered Image */
                <div
                  className="transition-all duration-150 flex items-center justify-center"
                  style={{
                    transform:
                      previewZoomMode === 'fit'
                        ? 'none'
                        : `scale(${previewZoomMode === 'actual' ? 1 : customZoom})`,
                    maxWidth: previewZoomMode === 'fit' ? '100%' : undefined,
                    maxHeight: previewZoomMode === 'fit' ? '100%' : undefined,
                  }}
                >
                  <img
                    id="export-rendered-preview-img"
                    src={previewData.dataUrl}
                    alt="Export preview"
                    className={`rounded shadow-2xl transition-all ${
                      previewZoomMode === 'fit' ? 'max-w-full max-h-[380px] object-contain' : ''
                    }`}
                    style={{
                      imageRendering: format === 'png' || format === 'svg' ? 'auto' : 'auto',
                    }}
                  />
                </div>
              ) : (
                /* Fallback loading indicator */
                <div className="flex flex-col items-center justify-center text-[#89919e]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0d99ff] mb-2" />
                  <span className="text-[11px]">Generating real-time {format.toUpperCase()} preview...</span>
                </div>
              )}
            </div>

            {/* Live Inspector Status Bar */}
            <div className="px-4 py-2 bg-[#121214] border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#89919e] font-mono shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">
                  {outputPixelWidth} × {outputPixelHeight} px
                </span>
                <span>•</span>
                <span>
                  Format: <span className="text-[#0d99ff] uppercase">{format}</span>
                  {format === 'jpg' && ` (q${Math.round(jpgQuality * 100)})`}
                </span>
                <span>•</span>
                <span>
                  {format === 'jpg'
                    ? '24-bit RGB'
                    : transparentBg
                    ? '32-bit RGBA (Alpha)'
                    : '24-bit RGB'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span>
                  Est. Size:{' '}
                  <span
                    id="badge-preview-file-size"
                    className={`font-bold ${
                      (previewData?.byteSize || 0) < 300000
                        ? 'text-[#10b981]'
                        : (previewData?.byteSize || 0) < 1500000
                        ? 'text-[#38bdf8]'
                        : 'text-[#f59e0b]'
                    }`}
                  >
                    {previewData?.byteSize ? formatBytes(previewData.byteSize) : 'Calculating...'}
                  </span>
                </span>
                <span>•</span>
                <span className="text-[#a1a1aa]">{scale} Scale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#121214] border-t border-[#27272a] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#89919e] hidden sm:block">
            Target: <span className="text-white font-medium">{targetName}</span> ({targetWidth} × {targetHeight} pt)
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
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
              className="bg-[#0d99ff] hover:bg-[#38bdf8] text-white hover:text-[#00284d] px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.98]"
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
                      ? `Download PNG (${scale})`
                      : format === 'jpg'
                      ? `Download JPG (${Math.round(jpgQuality * 100)}% • ${scale})`
                      : format === 'svg'
                      ? 'Download Scalable SVG'
                      : `Download ${format.toUpperCase()}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
