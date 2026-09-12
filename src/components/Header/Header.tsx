import React from 'react';
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
  collaborators?: Collaborator[];
  onNewDesign?: () => void;
  isSaving?: boolean;
  selectedElementIds?: string[];
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
  collaborators,
  onNewDesign,
  isSaving,
  selectedElementIds = [],
}) => {
  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 right-0 h-16 bg-[#131313]/90 backdrop-blur-xl z-50 flex items-center justify-between px-6 border-b border-[#201f1f] select-none"
    >
      {/* Left side: Branding & Project Title */}
      <div className="flex items-center gap-2">
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
          <FileMenu
            onGoToDashboard={() => setCurrentView('dashboard')}
            onNewDesign={onNewDesign || (() => setProjectTitle('Untitled Design v' + (Math.random() * 5 + 2).toFixed(1)))}
            onOpenSettings={onOpenSettings}
            onExport={onExport}
            onOpenShortcuts={onOpenShortcuts}
            onImportMaterialKit={onImportMaterialKit}
            onImportIOSKit={onImportIOSKit}
            onImportAllMaterials={onImportAllMaterials}
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
        )}
      </div>

      {/* Center: Boolean Operations (Visible only on multi-select) */}
      {currentView === 'editor' && selectedElementIds.length >= 2 && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#201f1f] rounded-lg p-1 border border-[#353534]">
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

      {/* Right side: ViewControls, ExportButton, CollaborationControls */}
      <div className="flex items-center gap-3">
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
