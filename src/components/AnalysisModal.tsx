import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Filter,
  Sparkles,
  MousePointerClick,
  Palette,
  Grid,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CanvasElement } from '../types';
import {
  runProjectAudit,
  generateMarkdownAuditReport,
  AnalysisIssue,
  DesignSystemAuditReport,
} from '../utils/analysisEngine';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: Record<string, CanvasElement>;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateMultipleElements?: (updates: Record<string, Partial<CanvasElement>>) => void;
  onSelectElement: (id: string) => void;
  projectTitle: string;
  showAuditOverlay: boolean;
  onToggleAuditOverlay: () => void;
  devicePreview?: 'desktop' | 'mobile';
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  elements,
  onUpdateElement,
  onUpdateMultipleElements,
  onSelectElement,
  projectTitle,
  showAuditOverlay,
  onToggleAuditOverlay,
  devicePreview = 'desktop',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const artboardSize =
    devicePreview === 'mobile'
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 };

  // Run audit engine dynamically on current canvas elements
  const auditReport: DesignSystemAuditReport = useMemo(() => {
    return runProjectAudit(elements, artboardSize);
  }, [elements, artboardSize]);

  if (!isOpen) return null;

  const filteredIssues = auditReport.issues.filter((issue) => {
    if (activeCategory === 'all') return true;
    return issue.category === activeCategory;
  });

  // Batch Auto-Fix Handlers
  const handleFixAllContrast = () => {
    const contrastIssues = auditReport.issues.filter(
      (i) => i.category === 'contrast' && i.autoFixAvailable && i.fixPayload
    );
    if (contrastIssues.length === 0) return;

    if (onUpdateMultipleElements) {
      const updates: Record<string, Partial<CanvasElement>> = {};
      contrastIssues.forEach((issue) => {
        if (issue.fixPayload) {
          updates[issue.elementId] = issue.fixPayload;
        }
      });
      onUpdateMultipleElements(updates);
    } else {
      contrastIssues.forEach((issue) => {
        if (issue.fixPayload) {
          onUpdateElement(issue.elementId, issue.fixPayload);
        }
      });
    }
  };

  const handleFixAllGrid = () => {
    const layoutIssues = auditReport.issues.filter(
      (i) => i.category === 'layout' && i.autoFixAvailable && i.fixPayload
    );
    if (layoutIssues.length === 0) return;

    if (onUpdateMultipleElements) {
      const updates: Record<string, Partial<CanvasElement>> = {};
      layoutIssues.forEach((issue) => {
        if (issue.fixPayload) {
          updates[issue.elementId] = issue.fixPayload;
        }
      });
      onUpdateMultipleElements(updates);
    } else {
      layoutIssues.forEach((issue) => {
        if (issue.fixPayload) {
          onUpdateElement(issue.elementId, issue.fixPayload);
        }
      });
    }
  };

  const handleFixAllTokens = () => {
    const tokenIssues = auditReport.issues.filter(
      (i) => i.category === 'tokens' && i.autoFixAvailable && i.fixPayload
    );
    if (tokenIssues.length === 0) return;

    if (onUpdateMultipleElements) {
      const updates: Record<string, Partial<CanvasElement>> = {};
      tokenIssues.forEach((issue) => {
        if (issue.fixPayload) {
          updates[issue.elementId] = issue.fixPayload;
        }
      });
      onUpdateMultipleElements(updates);
    } else {
      tokenIssues.forEach((issue) => {
        if (issue.fixPayload) {
          onUpdateElement(issue.elementId, issue.fixPayload);
        }
      });
    }
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdownAuditReport(projectTitle, auditReport);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_design_audit.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(auditReport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIssueClick = (elementId: string) => {
    onSelectElement(elementId);
    window.dispatchEvent(new CustomEvent('zlab:focus-element', { detail: { id: elementId } }));
  };

  return (
    <div
      id="modal-backdrop-analysis"
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
    >
      <div
        id="modal-container-analysis"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-[#141416] border border-[#2a292d] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#e5e2e1]"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#201f1f] flex items-center justify-between bg-[#19191c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Design System & Accessibility Audit
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Grade {auditReport.grade} ({auditReport.overallScore}/100)
                </span>
              </div>
              <p className="text-xs text-[#89919e]">
                Automated WCAG 2.1 AA/AAA compliance, design tokens, touch ergonomics, and layout health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Visual Canvas Overlay Toggle */}
            <button
              type="button"
              onClick={onToggleAuditOverlay}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showAuditOverlay
                  ? 'bg-[#0d99ff] border-[#0d99ff] text-white shadow-sm'
                  : 'bg-[#201f1f] border-[#353534] text-[#89919e] hover:text-[#e5e2e1]'
              }`}
              title="Show interactive audit badges on canvas elements"
            >
              {showAuditOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Canvas Heatmap: {showAuditOverlay ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded-lg transition-colors"
              title="Close Audit (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Scorecard Metrics Grid */}
        <div className="p-5 border-b border-[#201f1f] bg-[#17171a] grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          {/* 1. Overall Score */}
          <div className="p-3 bg-[#131315] rounded-xl border border-[#2a292d] flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#252528]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-500"
                  strokeDasharray={`${auditReport.overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-xs text-white">
                {auditReport.overallScore}
              </span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#89919e] uppercase">Health Score</div>
              <div className="text-sm font-bold text-white">Grade {auditReport.grade}</div>
            </div>
          </div>

          {/* 2. WCAG Contrast */}
          <div className="p-3 bg-[#131315] rounded-xl border border-[#2a292d]">
            <div className="flex items-center justify-between text-[11px] text-[#89919e] uppercase font-semibold mb-1">
              <span>WCAG Contrast</span>
              <span className="text-sky-400 font-mono">
                {auditReport.summary.contrastScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#252528] rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-sky-400 rounded-full transition-all"
                style={{ width: `${auditReport.summary.contrastScore}%` }}
              />
            </div>
            <div className="text-[10px] text-[#89919e]">
              {auditReport.accessibilityStats.passedContrastCount} pass ·{' '}
              {auditReport.accessibilityStats.failedContrastCount} fail
            </div>
          </div>

          {/* 3. Token Coverage */}
          <div className="p-3 bg-[#131315] rounded-xl border border-[#2a292d]">
            <div className="flex items-center justify-between text-[11px] text-[#89919e] uppercase font-semibold mb-1">
              <span>Token Coverage</span>
              <span className="text-purple-400 font-mono">
                {auditReport.tokenStats.tokenCoveragePercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#252528] rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-purple-400 rounded-full transition-all"
                style={{ width: `${auditReport.tokenStats.tokenCoveragePercent}%` }}
              />
            </div>
            <div className="text-[10px] text-[#89919e]">
              {auditReport.tokenStats.tokenizedCount} M3 tokens ·{' '}
              {auditReport.tokenStats.rawHexCount} raw hex
            </div>
          </div>

          {/* 4. Touch Targets */}
          <div className="p-3 bg-[#131315] rounded-xl border border-[#2a292d]">
            <div className="flex items-center justify-between text-[11px] text-[#89919e] uppercase font-semibold mb-1">
              <span>Touch Sizing</span>
              <span className="text-amber-400 font-mono">
                {auditReport.summary.touchTargetScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#252528] rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${auditReport.summary.touchTargetScore}%` }}
              />
            </div>
            <div className="text-[10px] text-[#89919e]">
              ≥48px touch ergonomics standard
            </div>
          </div>
        </div>

        {/* Global Batch One-Click Actions Bar */}
        <div className="px-5 py-2.5 bg-[#141416] border-b border-[#201f1f] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#89919e]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">One-Click Auto Fixes:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFixAllContrast}
              className="py-1 px-3 bg-[#0d99ff]/15 hover:bg-[#0d99ff]/25 text-[#9fcaff] hover:text-white border border-[#0d99ff]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-[#9fcaff]" />
              <span>Fix All Contrast ({auditReport.accessibilityStats.failedContrastCount})</span>
            </button>

            <button
              type="button"
              onClick={handleFixAllGrid}
              className="py-1 px-3 bg-[#201f1f] hover:bg-[#2a292c] text-[#e5e2e1] border border-[#353534] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Grid className="w-3 h-3 text-[#89919e]" />
              <span>Snap All to 8pt Grid</span>
            </button>

            <button
              type="button"
              onClick={handleFixAllTokens}
              className="py-1 px-3 bg-[#381e72]/30 hover:bg-[#381e72]/50 text-[#d0bcff] hover:text-white border border-[#d0bcff]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Palette className="w-3 h-3 text-[#d0bcff]" />
              <span>Tokenize All Colors</span>
            </button>
          </div>
        </div>

        {/* Category Tabs & Search/Filter */}
        <div className="px-5 py-2.5 bg-[#19191c] border-b border-[#201f1f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'All Issues', count: auditReport.issues.length },
              {
                id: 'contrast',
                label: 'WCAG Contrast',
                count: auditReport.issues.filter((i) => i.category === 'contrast').length,
              },
              {
                id: 'touch-target',
                label: 'Touch Targets',
                count: auditReport.issues.filter((i) => i.category === 'touch-target').length,
              },
              {
                id: 'tokens',
                label: 'Tokens',
                count: auditReport.issues.filter((i) => i.category === 'tokens').length,
              },
              {
                id: 'layout',
                label: 'Layout & Grid',
                count: auditReport.issues.filter((i) => i.category === 'layout').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeCategory === tab.id
                    ? 'bg-[#0d99ff] text-white shadow-xs'
                    : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeCategory === tab.id ? 'bg-white/20 text-white' : 'bg-[#2a292d] text-[#89919e]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-[#89919e]">
            Showing {filteredIssues.length} of {auditReport.issues.length}
          </div>
        </div>

        {/* Scrollable Issue List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar min-h-[240px]">
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#89919e] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div className="text-sm font-semibold text-white">No Issues in this Category!</div>
              <div className="text-xs max-w-sm">
                All elements adhere strictly to WCAG 2.1 accessibility guidelines and Material 3 design system tokens.
              </div>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3 bg-[#17171a] hover:bg-[#1c1b1f] border border-[#2a292d] hover:border-[#38373c] rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => handleIssueClick(issue.elementId)}
                  className="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <div className="mt-0.5 shrink-0">
                    {issue.severity === 'error' ? (
                      <div className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : issue.severity === 'warning' ? (
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-xs group-hover:text-[#9fcaff] transition-colors">
                        {issue.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#201f1f] text-[#89919e] uppercase">
                        {issue.elementName}
                      </span>
                      <span className="text-[9px] font-mono text-[#707070]">
                        #{issue.elementId}
                      </span>
                    </div>
                    <p className="text-xs text-[#89919e] mt-0.5 leading-relaxed">
                      {issue.description}
                    </p>
                    <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
                      <span>Remediation:</span>
                      <span className="text-[#cac4d0]">{issue.recommendation}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleIssueClick(issue.elementId)}
                    className="p-1.5 bg-[#201f1f] hover:bg-[#2a292d] text-[#89919e] hover:text-white rounded-lg text-xs transition-colors"
                    title="Focus on canvas"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {issue.autoFixAvailable && issue.fixPayload && (
                    <button
                      type="button"
                      onClick={() => {
                        if (issue.fixPayload) {
                          onUpdateElement(issue.elementId, issue.fixPayload);
                        }
                      }}
                      className="py-1 px-3 bg-[#0d99ff] hover:bg-[#007acc] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{issue.autoFixLabel || 'Fix Issue'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#201f1f] bg-[#19191c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="py-1.5 px-3 bg-[#201f1f] hover:bg-[#2a292d] text-white border border-[#353534] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download detailed Markdown report for compliance"
            >
              {downloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#0d99ff]" />
              )}
              <span>{downloadSuccess ? 'Downloaded!' : 'Export Report (.md)'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="py-1.5 px-3 bg-[#201f1f] hover:bg-[#2a292d] text-white border border-[#353534] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy complete JSON audit report"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#89919e]" />
              )}
              <span>{copied ? 'JSON Copied!' : 'Copy JSON'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-[#201f1f] hover:bg-[#2a292d] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
