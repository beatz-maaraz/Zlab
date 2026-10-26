import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  PanelLeft,
  Sparkles,
  ShieldCheck,
  MoreVertical,
  Monitor,
  Smartphone,
  Undo,
  Redo,
  Download,
  Play,
  Keyboard,
  Settings,
} from 'lucide-react';
import { AppView, Collaborator } from '../../types';
import { ProjectTitle } from './ProjectTitle';
import { FileMenu } from './FileMenu';
import { ViewControls } from './ViewControls';
import { CollaborationControls } from './CollaborationControls';
import { ExportButton } from './ExportButton';

export interface HeaderProps {
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  devicePreview: 'desktop' | 'mobile';
  setDevicePreview: (mode: 'desktop' | 'mobile') => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenSettings: (tab?: string) => void;
  onExport: () => void;
  onOpenPrototype?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onGroup?: () => void;
  onUngroup?: () => void;
  onOpenShortcuts?: () => void;
  onImportMaterialKit?: () => void;
  onImportIOSKit?: () => void;
  onImportAllMaterials?: () => void;
  onOpenCyberpunkKit?: () => void;
  onImportCyberpunkKit?: () => void;
  onOpenM3Studio?: () => void;
  onOpenAnalysis?: () => void;
  analysisScore?: number;
  collaborators?: Collaborator[];
  onNewDesign?: () => void;
  isSaving?: boolean;
  selectedElementIds?: string[];
  isLeftSidebarCollapsed?: boolean;
  onToggleLeftSidebar?: () => void;
  isInspectorCollapsed?: boolean;
  onToggleInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectTitle,
  setProjectTitle,
  zoom,
  setZoom,
  devicePreview,
  setDevicePreview,
  currentView,
  setCurrentView,
  onOpenSettings,
  onExport,
  onOpenPrototype,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onGroup,
  onUngroup,
  onOpenShortcuts,
  onImportMaterialKit,
  onImportIOSKit,
  onImportAllMaterials,
  onOpenCyberpunkKit,
  onImportCyberpunkKit,
  onOpenM3Studio,
  onOpenAnalysis,
  analysisScore,
  collaborators,
  onNewDesign,
  isSaving,
  selectedElementIds = [],
  isLeftSidebarCollapsed = false,
  onToggleLeftSidebar,
  isInspectorCollapsed = false,
  onToggleInspector,
}) => {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 right-0 h-16 bg-[#131313]/90 backdrop-blur-xl z-50 flex items-center justify-between px-3 sm:px-6 border-b border-[#201f1f] select-none gap-2"
    >
      {/* Left side: Branding & Project Title & File Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
        {onToggleLeftSidebar && currentView === 'editor' && (
          <button
            id="btn-toggle-left-sidebar"
            onClick={onToggleLeftSidebar}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors shrink-0 md:hidden ${
              !isLeftSidebarCollapsed
                ? 'bg-[#201f1f] text-[#0d99ff] border-[#0d99ff]/40 shadow-sm'
                : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] border-[#353534]/50'
            }`}
            title={!isLeftSidebarCollapsed ? 'Hide Sidebar (Layers & Pages)' : 'Show Sidebar (Layers & Pages)'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <ProjectTitle
          projectTitle={projectTitle}
          onUpdateTitle={setProjectTitle}
          currentView={currentView}
          onGoToHome={() => setCurrentView('dashboard')}
          onGoToProject={() => setCurrentView('editor')}
          onToggleView={() => setCurrentView(currentView === 'editor' ? 'dashboard' : 'editor')}
          isSaving={isSaving}
        />

        {currentView === 'editor' && (
          <>
            <div className="h-4 w-[1px] bg-[#252525] hidden lg:block mx-1 shrink-0" />
            <FileMenu
              onGoToDashboard={() => setCurrentView('dashboard')}
              onNewDesign={onNewDesign || (() => setProjectTitle('Untitled Design v' + (Math.random() * 5 + 2).toFixed(1)))}
              onOpenSettings={onOpenSettings}
              onExport={onExport}
              onOpenShortcuts={onOpenShortcuts}
              onImportMaterialKit={onImportMaterialKit}
              onImportIOSKit={onImportIOSKit}
              onImportAllMaterials={onImportAllMaterials}
              onOpenCyberpunkKit={onOpenCyberpunkKit}
              onImportCyberpunkKit={onImportCyberpunkKit}
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onGroup={onGroup}
              onUngroup={onUngroup}
              zoom={zoom}
              setZoom={setZoom}
              devicePreview={devicePreview}
              setDevicePreview={setDevicePreview}
            />
          </>
        )}
      </div>

      {/* Center: Boolean Operations (Visible only on multi-select on larger screens) */}
      {currentView === 'editor' && selectedElementIds.length >= 2 && (
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-[#201f1f] rounded-lg p-1 border border-[#353534] shadow-md z-10">
          <button className="p-1.5 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors" title="Union Selection">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H10V10H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6H12V12H6V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="p-1.5 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors" title="Subtract Selection">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H10V10H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6H12V12H6V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
            </svg>
          </button>
          <button className="p-1.5 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors" title="Intersect Selection">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="4" height="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Mobile Right Controls: Inspector Toggle & Overflow Dropdown Menu */}
      <div className="flex md:hidden items-center gap-1.5 shrink-0" ref={overflowRef}>
        {onToggleInspector && currentView === 'editor' && (
          <button
            id="btn-toggle-inspector-mobile"
            onClick={onToggleInspector}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
              !isInspectorCollapsed
                ? 'bg-[#201f1f] text-[#0d99ff] border-[#0d99ff]/40 shadow-sm'
                : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] border-[#353534]/50'
            }`}
            title={!isInspectorCollapsed ? 'Close Inspector' : 'Open Inspector'}
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Overflow Menu Button */}
        <div className="relative">
          <button
            id="btn-header-overflow-menu"
            onClick={() => setOverflowOpen(!overflowOpen)}
            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors ${
              overflowOpen
                ? 'bg-[#201f1f] text-white border-[#0d99ff]/50'
                : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] border-[#353534]/50'
            }`}
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {overflowOpen && (
            <div
              id="header-mobile-overflow-dropdown"
              className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1c] border border-[#353534] rounded-xl shadow-2xl py-2 z-50 text-xs flex flex-col gap-1 backdrop-blur-xl divide-y divide-[#2a2a2c]"
            >
              {/* Artboard Toggle */}
              {currentView === 'editor' && (
                <div className="px-2 pb-2">
                  <div className="text-[10px] uppercase font-bold text-[#89919e] px-2 py-1 tracking-wider">
                    Artboard View
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-0.5">
                    <button
                      id="btn-mobile-overflow-desktop"
                      onClick={() => {
                        setDevicePreview('desktop');
                        setOverflowOpen(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        devicePreview === 'desktop'
                          ? 'bg-[#0d99ff] text-[#002f55] font-bold shadow'
                          : 'bg-[#242426] text-[#bfc7d5] hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Desktop
                    </button>
                    <button
                      id="btn-mobile-overflow-mobile"
                      onClick={() => {
                        setDevicePreview('mobile');
                        setOverflowOpen(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        devicePreview === 'mobile'
                          ? 'bg-[#0d99ff] text-[#002f55] font-bold shadow'
                          : 'bg-[#242426] text-[#bfc7d5] hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Mobile
                    </button>
                  </div>
                </div>
              )}

              {/* Undo / Redo */}
              {currentView === 'editor' && (
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onUndo();
                      setOverflowOpen(false);
                    }}
                    disabled={!canUndo}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[#bfc7d5] hover:bg-[#252528] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    Undo
                  </button>
                  <button
                    onClick={() => {
                      onRedo();
                      setOverflowOpen(false);
                    }}
                    disabled={!canRedo}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[#bfc7d5] hover:bg-[#252528] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Redo className="w-3.5 h-3.5" />
                    Redo
                  </button>
                </div>
              )}

              {/* Quick Actions (Audit, M3 Studio, Export, Prototype) */}
              <div className="px-1.5 py-1 flex flex-col gap-0.5">
                {currentView === 'editor' && onOpenAnalysis && (
                  <button
                    onClick={() => {
                      onOpenAnalysis();
                      setOverflowOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#252528] text-emerald-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Design & A11y Audit
                    </span>
                    {typeof analysisScore === 'number' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {analysisScore}%
                      </span>
                    )}
                  </button>
                )}

                {currentView === 'editor' && onOpenM3Studio && (
                  <button
                    onClick={() => {
                      onOpenM3Studio();
                      setOverflowOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#252528] text-[#d0bcff] flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#d0bcff]" />
                    M3 Studio
                  </button>
                )}

                {currentView === 'editor' && (
                  <button
                    onClick={() => {
                      onExport();
                      setOverflowOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#252528] text-[#e5e2e1] flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#89919e]" />
                    Export Canvas
                  </button>
                )}

                {currentView === 'editor' && onOpenPrototype && (
                  <button
                    onClick={() => {
                      onOpenPrototype();
                      setOverflowOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#252528] text-[#e5e2e1] flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 text-[#89919e]" />
                    Interactive Prototype
                  </button>
                )}
              </div>

              {/* System & Settings */}
              <div className="px-1.5 pt-1 flex flex-col gap-0.5">
                {onOpenShortcuts && (
                  <button
                    onClick={() => {
                      onOpenShortcuts();
                      setOverflowOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#252528] text-[#89919e] hover:text-[#e5e2e1] flex items-center gap-2"
                  >
                    <Keyboard className="w-4 h-4" />
                    Shortcuts (?)
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenSettings();
                    setOverflowOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#252528] text-[#89919e] hover:text-[#e5e2e1] flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Right side: ViewControls, Inspector toggle, ExportButton, CollaborationControls */}
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {currentView === 'editor' && (
          <>
            <ViewControls
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={onUndo}
              onRedo={onRedo}
              zoom={zoom}
              setZoom={setZoom}
              devicePreview={devicePreview}
              setDevicePreview={setDevicePreview}
            />

            {onToggleInspector && (
              <button
                id="btn-toggle-inspector"
                onClick={onToggleInspector}
                className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
                  !isInspectorCollapsed
                    ? 'bg-[#201f1f] text-[#0d99ff] border-[#0d99ff]/40 shadow-sm'
                    : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] border-[#353534]/50'
                }`}
                title={!isInspectorCollapsed ? 'Collapse Inspector (Right Panel)' : 'Expand Inspector (Right Panel)'}
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {onOpenM3Studio && (
              <button
                id="btn-header-m3-studio"
                onClick={onOpenM3Studio}
                className="h-8 px-2.5 rounded-lg bg-[#381e72]/50 hover:bg-[#4f378b]/60 border border-[#d0bcff]/40 text-[#d0bcff] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Open Material 3 Component Studio (MUI v5/v6)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d0bcff]" />
                <span className="hidden sm:inline">M3 Studio</span>
              </button>
            )}

            {onOpenAnalysis && (
              <button
                id="btn-header-analysis"
                onClick={onOpenAnalysis}
                className="h-8 px-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Design System & Accessibility Analysis"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Audit</span>
                {typeof analysisScore === 'number' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {analysisScore}%
                  </span>
                )}
              </button>
            )}

            <ExportButton onExport={onExport} />
          </>
        )}

        <CollaborationControls
          collaborators={collaborators}
          onOpenPrototype={currentView === 'editor' ? onOpenPrototype : undefined}
          onOpenShortcuts={onOpenShortcuts}
          onOpenSettings={onOpenSettings}
        />
      </div>
    </header>
  );
};
