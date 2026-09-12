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
