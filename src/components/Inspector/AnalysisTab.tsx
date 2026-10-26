import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  MousePointerClick,
  Palette,
  Grid,
  Info,
  ExternalLink,
} from 'lucide-react';
import { CanvasElement } from '../../types';
import {
  calculateContrastRatio,
  getOptimalContrastColor,
  KNOWN_DESIGN_TOKENS,
  auditElement,
} from '../../utils/analysisEngine';

interface AnalysisTabProps {
  element: CanvasElement;
  allElements?: Record<string, CanvasElement>;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onOpenFullAudit?: () => void;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  element,
  allElements = {},
  onUpdateElement,
  onOpenFullAudit,
}) => {
  const isArtboard =
    element.id === 'desktop-1440' ||
    element.id === 'mobile-app-view' ||
    element.id === 'default-artboard-frame';

  // 1. Contrast Calculation
  const parent = element.parentId ? allElements[element.parentId] : null;
  const effectiveBg =
    element.type === 'button'
      ? element.fill && element.fill !== 'none'
        ? element.fill
        : '#0D99FF'
      : parent && parent.fill && parent.fill !== 'none'
      ? parent.fill
      : '#141218';

  const effectiveFg = element.textColor || (element.type === 'text' ? element.fill : '#FFFFFF');
  const contrast = calculateContrastRatio(effectiveFg, effectiveBg);
  const optimalFg = getOptimalContrastColor(effectiveBg);

  // 2. Touch Target Analysis
  const isInteractive =
    element.type === 'button' ||
    element.type === 'input' ||
    element.type === 'icon' ||
    Boolean(element.variant?.includes('btn')) ||
    Boolean(element.variant?.includes('action'));

  const meetsM3TouchTarget = element.width >= 48 && element.height >= 48;
  const meetsIosTouchTarget = element.width >= 44 && element.height >= 44;

  // 3. Token Conformance
  const currentFillHex = (element.fill || '').toUpperCase();
  const matchedToken = KNOWN_DESIGN_TOKENS[currentFillHex];

  // 4. Geometry Sub-pixel & 8pt Grid
  const isFractional =
    element.x % 1 !== 0 ||
    element.y % 1 !== 0 ||
    element.width % 1 !== 0 ||
    element.height % 1 !== 0;

  const is8ptAligned =
    element.x % 8 === 0 &&
    element.y % 8 === 0 &&
    element.width % 8 === 0 &&
    element.height % 8 === 0;

  // 5. Run issues
  const issues = auditElement(element, allElements);

  // Auto-Fix Handlers
  const handleFixContrast = () => {
    if (element.type === 'text') {
      onUpdateElement({ fill: optimalFg, textColor: optimalFg });
    } else {
      onUpdateElement({ textColor: optimalFg });
    }
  };

  const handleFixTouchTarget = () => {
    onUpdateElement({
      width: Math.max(48, element.width),
      height: Math.max(48, element.height),
    });
  };

  const handleSnapToGrid = () => {
    onUpdateElement({
      x: Math.round(element.x / 4) * 4,
      y: Math.round(element.y / 4) * 4,
      width: Math.max(4, Math.round(element.width / 4) * 4),
      height: Math.max(4, Math.round(element.height / 4) * 4),
    });
  };

  return (
    <div className="p-3.5 space-y-4 text-xs select-none">
      {/* Element Health Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#201f1f]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#34d399]" />
          <span className="font-semibold text-[#e5e2e1] text-xs">Design & WCAG Analysis</span>
        </div>
        {onOpenFullAudit && (
          <button
            type="button"
            onClick={onOpenFullAudit}
            className="text-[10px] text-[#9fcaff] hover:underline flex items-center gap-0.5"
            title="Open Full Canvas Audit"
          >
            <span>Full Audit</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* 1. WCAG 2.1 Contrast Ratio Section */}
      <div className="bg-[#141416] p-3 rounded-xl border border-[#353534] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#89919e]">
            WCAG 2.1 Contrast
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
              contrast.normalTextAAA
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : contrast.normalTextAA
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {contrast.rating}
          </span>
        </div>

        {/* Big Contrast Ratio Gauge & Colors Preview */}
        <div className="flex items-center justify-between bg-[#1a191b] p-2.5 rounded-lg border border-[#2a292c]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border border-white/20 shadow-inner"
              style={{ backgroundColor: effectiveBg, color: effectiveFg }}
            >
              Aa
            </div>
            <div>
              <div className="text-base font-mono font-bold text-[#e5e2e1]">
                {contrast.ratio}:1
              </div>
              <div className="text-[9px] text-[#89919e] font-mono truncate max-w-[120px]">
                {effectiveFg} on {effectiveBg}
              </div>
            </div>
          </div>

          {!contrast.normalTextAA && (
            <button
              type="button"
              onClick={handleFixContrast}
              className="py-1 px-2.5 bg-[#0d99ff] hover:bg-[#007acc] text-white rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
              title={`Auto-fix to ${optimalFg} for AAA compliance`}
            >
              <Zap className="w-3 h-3" />
              <span>Auto-Fix</span>
            </button>
          )}
        </div>

        {/* Compliance Levels Matrix */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <div
            className={`p-1.5 rounded-lg border text-center ${
              contrast.normalTextAA
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="text-[9px] font-mono uppercase font-bold">AA Normal</div>
            <div className="text-[10px] font-semibold">
              {contrast.normalTextAA ? '✓ Pass (4.5:1)' : '✗ Fail'}
            </div>
          </div>

          <div
            className={`p-1.5 rounded-lg border text-center ${
              contrast.normalTextAAA
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="text-[9px] font-mono uppercase font-bold">AAA Level</div>
            <div className="text-[10px] font-semibold">
              {contrast.normalTextAAA ? '✓ Pass (7.0:1)' : '✗ Sub-7:1'}
            </div>
          </div>

          <div
            className={`p-1.5 rounded-lg border text-center ${
              contrast.uiComponentAA
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="text-[9px] font-mono uppercase font-bold">UI Graphic</div>
            <div className="text-[10px] font-semibold">
              {contrast.uiComponentAA ? '✓ Pass (3.0:1)' : '✗ Fail'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Touch Target & Ergonomics */}
      <div className="bg-[#141416] p-3 rounded-xl border border-[#353534] space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#89919e] flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-[#9fcaff]" />
            <span>Touch Target Ergonomics</span>
          </span>
          <span className="text-[10px] font-mono text-[#89919e]">
            {Math.round(element.width)} × {Math.round(element.height)}px
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              {meetsM3TouchTarget ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="text-[#e5e2e1] text-[11px] font-medium">
                {meetsM3TouchTarget
                  ? 'Exceeds Material 3 standard (≥48px)'
                  : meetsIosTouchTarget
                  ? 'Meets iOS HIG (44px), recommend 48px'
                  : 'Undersized for touch screens (<44px)'}
              </span>
            </div>
            <div className="text-[10px] text-[#89919e]">
              Target: 48×48px mobile touch ergonomics
            </div>
          </div>

          {!meetsM3TouchTarget && !isArtboard && (
            <button
              type="button"
              onClick={handleFixTouchTarget}
              className="py-1 px-2.5 bg-[#201f1f] hover:bg-[#2a292c] text-[#9fcaff] hover:text-white border border-[#353534] rounded-md text-[10px] font-semibold transition-all active:scale-95"
              title="Expand to 48×48px minimum"
            >
              Resize to 48px
            </button>
          )}
        </div>
      </div>

      {/* 3. Design Token Conformance */}
      <div className="bg-[#141416] p-3 rounded-xl border border-[#353534] space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#89919e] flex items-center gap-1">
            <Palette className="w-3 h-3 text-[#9fcaff]" />
            <span>Design Token Conformance</span>
          </span>
          {matchedToken ? (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase">
              {matchedToken.system.toUpperCase()} Token
            </span>
          ) : (
            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">
              Unlinked Hex
            </span>
          )}
        </div>

        {matchedToken ? (
          <div className="p-2 bg-[#1a191b] rounded-lg border border-[#2a292c] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: element.fill }}
              />
              <span className="text-[11px] font-mono text-[#e5e2e1] truncate">
                {matchedToken.name}
              </span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="text-[11px] text-[#89919e]">
              Current fill <code className="text-[#e5e2e1]">{element.fill || 'none'}</code> is not
              linked to system tokens.
            </div>
            <button
              type="button"
              onClick={() => onUpdateElement({ fill: '#D0BCFF', materialPreset: 'm3' })}
              className="w-full py-1.5 px-3 bg-[#381e72]/30 hover:bg-[#381e72]/50 text-[#d0bcff] hover:text-white border border-[#d0bcff]/30 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3 h-3 text-[#d0bcff]" />
              <span>Link to md.sys.color.primary (#D0BCFF)</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Layout & Grid Precision */}
      <div className="bg-[#141416] p-3 rounded-xl border border-[#353534] space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#89919e] flex items-center gap-1">
            <Grid className="w-3 h-3 text-[#9fcaff]" />
            <span>8pt Grid Precision</span>
          </span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
              !isFractional && is8ptAligned
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-amber-400 bg-amber-500/10'
            }`}
          >
            {!isFractional && is8ptAligned ? 'Aligned (8pt)' : 'Needs Snap'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#89919e] text-[11px]">
            {isFractional
              ? 'Fractional sub-pixels detected'
              : is8ptAligned
              ? 'Positions and bounds adhere to 8pt scale'
              : 'Coordinates not divisible by 8px'}
          </span>
          {(!is8ptAligned || isFractional) && !isArtboard && (
            <button
              type="button"
              onClick={handleSnapToGrid}
              className="py-1 px-2.5 bg-[#201f1f] hover:bg-[#2a292c] text-[#9fcaff] hover:text-white border border-[#353534] rounded-md text-[10px] font-semibold transition-all active:scale-95"
            >
              Snap to 4/8px
            </button>
          )}
        </div>
      </div>

      {/* Active Element Issues List */}
      {issues.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#89919e]">
            Active Recommendations ({issues.length})
          </div>
          <div className="space-y-1.5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-2 bg-[#1a191b] rounded-lg border border-[#2a292c] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[#e5e2e1] text-[11px]">
                    {issue.severity === 'error' ? (
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Info className="w-3 h-3 text-sky-400" />
                    )}
                    <span>{issue.title}</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#89919e]">{issue.description}</div>
                {issue.autoFixAvailable && issue.fixPayload && (
                  <button
                    type="button"
                    onClick={() => issue.fixPayload && onUpdateElement(issue.fixPayload)}
                    className="mt-1 text-[10px] font-semibold text-[#9fcaff] hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>{issue.autoFixLabel || 'Apply Fix'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
