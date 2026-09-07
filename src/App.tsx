/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { FloatingToolbar } from './components/FloatingToolbar';
import { Canvas } from './components/Canvas';
import { Inspector } from './components/Inspector';
import { StatusBar } from './components/StatusBar';
import { DashboardView } from './components/DashboardView';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { PrototypeModal } from './components/PrototypeModal';
import {
  AppView,
  CanvasElement,
  Collaborator,
  ProjectFile,
  SettingsTab,
  TemplateItem,
  ToolMode,
  UserSettings,
} from './types';
import {
  INITIAL_COLLABORATORS,
  INITIAL_ELEMENTS,
  INITIAL_RECENT_FILES,
  INITIAL_SETTINGS,
  TEMPLATES,
} from './mockData';
import {
  getMaterial3KitElements,
  getIOSKitElements,
  getAllMaterialsElements,
} from './data/designKits';
import { computeAutoLayouts } from './utils/layoutEngine';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    return window.location.pathname.includes('/editor') ? 'editor' : 'dashboard';
  });

  useEffect(() => {
    const path = currentView === 'editor' ? '/editor' : '/';
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [currentView]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(window.location.pathname.includes('/editor') ? 'editor' : 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [projectTitle, setProjectTitle] = useState('Untitled Design v2.4');
  const [zoom, setZoom] = useState(0.8);
  const [currentTool, setCurrentTool] = useState<ToolMode>('move');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedElementId, setSelectedElementId] = useState<string>('main-hero-title');
  
  const [elementsRaw, setElementsRaw] = useState<Record<string, CanvasElement>>(INITIAL_ELEMENTS);
  
  const setElements = useCallback((value: React.SetStateAction<Record<string, CanvasElement>>) => {
    setElementsRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      return computeAutoLayouts(next);
    });
  }, []);

  const elements = elementsRaw;

  const handleDeviceChange = useCallback((mode: 'desktop' | 'mobile') => {
    setDevicePreview(mode);
    if (mode === 'desktop') {
      if (
        selectedElementId === 'mobile-app-view' ||
        (selectedElementId && elements[selectedElementId]?.parentId === 'mobile-app-view')
      ) {
        setSelectedElementId('desktop-1440');
      }
    } else {
      if (
        selectedElementId === 'desktop-1440' ||
        (selectedElementId && elements[selectedElementId]?.parentId === 'desktop-1440')
      ) {
        setSelectedElementId('mobile-app-view');
      }
    }
  }, [elements, selectedElementId]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general');
  const [recentFiles, setRecentFiles] = useState<ProjectFile[]>(INITIAL_RECENT_FILES);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  // Sidebar and Inspector resizing state
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(288);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);

  // Export and Prototype modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrototypeModalOpen, setIsPrototypeModalOpen] = useState(false);

  // Left sidebar resizing handler
  const handleStartResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = leftSidebarWidth;

    const onMouseMove = (moveEv: MouseEvent) => {
      const newWidth = Math.min(500, Math.max(200, startW + (moveEv.clientX - startX)));
      setLeftSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Right inspector resizing handler
  const handleStartResizeInspector = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = inspectorWidth;

    const onMouseMove = (moveEv: MouseEvent) => {
      const newWidth = Math.min(460, Math.max(240, startW - (moveEv.clientX - startX)));
      setInspectorWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // History stack for Undo/Redo
  const [history, setHistory] = useState<Record<string, CanvasElement>[]>([INITIAL_ELEMENTS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateElementsWithHistory = useCallback(
    (newElements: Record<string, CanvasElement>) => {
      setElements(newElements);
      setHistory((prev) => {
        const upToCurrent = prev.slice(0, historyIndex + 1);
        return [...upToCurrent, newElements];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((idx) => idx - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((idx) => idx + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleUpdateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!elements[selectedElementId]) return;
    const updated = {
      ...elements,
      [selectedElementId]: {
        ...elements[selectedElementId],
        ...updates,
      },
    };
    updateElementsWithHistory(updated);
  };

  const handleInsertElement = (element: CanvasElement) => {
    const updated = {
      ...elements,
      [element.id]: element,
    };
    updateElementsWithHistory(updated);
    setSelectedElementId(element.id);
  };

  const handleDeleteElement = (id: string) => {
    if (id === 'desktop-1440' || id === 'hero-bg') return;
    const next = { ...elements };
    delete next[id];
    updateElementsWithHistory(next);
    setSelectedElementId('desktop-1440');
  };

  const handleDuplicateElement = (id: string) => {
    const el = elements[id];
    if (!el) return;
    const newId = `${el.id}_copy_${Date.now()}`;
    const duplicated: CanvasElement = {
      ...el,
      id: newId,
      name: `${el.name} Copy`,
      x: el.x + 24,
      y: el.y + 24,
    };
    handleInsertElement(duplicated);
  };

  const handleApplyColor = (color: string) => {
    if (selectedElementId && elements[selectedElementId]) {
      handleUpdateSelectedElement({ fill: color });
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input / textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        return;
      }

      // Delete key deletes selected element
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedElementId &&
        selectedElementId !== 'desktop-1440' &&
        selectedElementId !== 'hero-bg'
      ) {
        e.preventDefault();
        handleDeleteElement(selectedElementId);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Duplicate element shortcut Ctrl+D / Cmd+D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedElementId) {
          handleDuplicateElement(selectedElementId);
        }
        return;
      }

      // Escape key cancels tool or deselects
      if (e.key === 'Escape') {
        if (currentTool !== 'move') {
          setCurrentTool('move');
        } else {
          setSelectedElementId(devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
        }
        return;
      }

      // Arrow keys nudging (1px default, 10px with Shift)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (
          selectedElementId &&
          selectedElementId !== 'desktop-1440' &&
          selectedElementId !== 'mobile-app-view' &&
          elements[selectedElementId] &&
          !elements[selectedElementId].locked
        ) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const current = elements[selectedElementId];
          let newX = current.x;
          let newY = current.y;

          if (e.key === 'ArrowUp') newY -= step;
          if (e.key === 'ArrowDown') newY += step;
          if (e.key === 'ArrowLeft') newX -= step;
          if (e.key === 'ArrowRight') newX += step;

          handleUpdateSelectedElement({ x: newX, y: newY });
          return;
        }
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setCurrentTool('move');
          break;
        case 'f':
          setCurrentTool('frame');
          break;
        case 'r':
          setCurrentTool('rect');
          break;
        case 'p':
          setCurrentTool('pen');
          break;
        case 't':
          setCurrentTool('text');
          break;
        case 'h':
          setCurrentTool('hand');
          break;
        case 'c':
          setCurrentTool('comment');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, isSettingsOpen, selectedElementId, elements, currentTool, devicePreview]);

  // Subtle live collaborator cursor simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators((prev) =>
        prev.map((c) => {
          if (c.id === 'you') return c;
          const deltaX = (Math.random() - 0.5) * 40;
          const deltaY = (Math.random() - 0.5) * 30;
          return {
            ...c,
            cursorX: Math.max(120, Math.min(880, c.cursorX + deltaX)),
            cursorY: Math.max(80, Math.min(620, c.cursorY + deltaY)),
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleOpenFile = (file: ProjectFile) => {
    setProjectTitle(file.title);
    if (file.previewType === 'mobile') {
      setDevicePreview('mobile');
      setSelectedElementId('mobile-app-view');
    } else {
      setDevicePreview('desktop');
      setSelectedElementId('main-hero-title');
    }
    setCurrentView('editor');
  };

  const handleImportMaterialKit = useCallback(() => {
    const m3Kit = getMaterial3KitElements();
    const updated = { ...elements, ...m3Kit };
    updateElementsWithHistory(updated);
    setSelectedElementId('m3-kit-frame');
    setProjectTitle('Material Design 3 (M3) System');
  }, [elements, updateElementsWithHistory]);

  const handleImportIOSKit = useCallback(() => {
    const iosKit = getIOSKitElements();
    const updated = { ...elements, ...iosKit };
    updateElementsWithHistory(updated);
    setSelectedElementId('ios-kit-frame');
    setProjectTitle('Apple iOS 18 (HIG) System');
  }, [elements, updateElementsWithHistory]);

  const handleImportAllMaterials = useCallback(() => {
    const allKits = getAllMaterialsElements();
    const updated = { ...elements, ...allKits };
    updateElementsWithHistory(updated);
    setSelectedElementId('m3-kit-frame');
    setProjectTitle('Material Design 3 & iOS 18 System');
  }, [elements, updateElementsWithHistory]);

  const handleNewDesign = () => {
    const newTitle = `Untitled Design v${(Math.random() * 5 + 2).toFixed(1)}`;
    setProjectTitle(newTitle);
    setDevicePreview('desktop');
    setSelectedElementId('desktop-1440');
    setCurrentView('editor');
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    if (template.id === 'm3-full-kit') {
      handleImportMaterialKit();
      setCurrentView('editor');
      return;
    }
    if (template.id === 'ios-full-kit') {
      handleImportIOSKit();
      setCurrentView('editor');
      return;
    }
    if (template.id === 'all-materials-kit') {
      handleImportAllMaterials();
      setCurrentView('editor');
      return;
    }
    setProjectTitle(`${template.title} Draft`);
    if (template.id === 'ios-starter') {
      setDevicePreview('mobile');
      setSelectedElementId('mobile-app-view');
    } else {
      setDevicePreview('desktop');
      setSelectedElementId('main-hero-title');
    }
    setCurrentView('editor');
  };

  const handleExport = () => {
    const exportData = {
      project: projectTitle,
      exportedAt: new Date().toISOString(),
      elements,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeElement = elements[selectedElementId] || elements['desktop-1440'];

  return (
    <div
      id="app-root-container"
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#131313] text-[#e5e2e1] font-sans select-none"
    >
      {/* Top Application Header */}
      <Header
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        zoom={zoom}
        setZoom={setZoom}
        devicePreview={devicePreview}
        setDevicePreview={handleDeviceChange}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={(tab?: string) => {
          if (tab) setSettingsTab(tab as SettingsTab);
          setIsSettingsOpen(true);
        }}
        onExport={() => setIsExportModalOpen(true)}
        onOpenPrototype={() => setIsPrototypeModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onImportMaterialKit={handleImportMaterialKit}
        onImportIOSKit={handleImportIOSKit}
        onImportAllMaterials={handleImportAllMaterials}
      />

      {/* Main App Layout */}
      {currentView === 'editor' ? (
        <div id="editor-workspace" className="flex flex-1 relative overflow-hidden pt-16 pb-8">
          {/* Left Primary Nav & Secondary Layer / Component / Asset Drawer */}
          <LeftSidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            elements={elements}
            setElements={setElements}
            onInsertElement={handleInsertElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onApplyColor={handleApplyColor}
            onImportMaterialKit={handleImportMaterialKit}
            onImportIOSKit={handleImportIOSKit}
            onImportAllMaterials={handleImportAllMaterials}
            width={leftSidebarWidth}
            onStartResize={handleStartResizeLeft}
            isCollapsed={isLeftSidebarCollapsed}
            onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          />

          {/* Floating Canvas Toolbar */}
          <FloatingToolbar
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            commentCount={1}
          />

          {/* Central Infinite Canvas (with dynamic margins adapting to resizable sidebar and inspector) */}
          <div
            style={{
              marginLeft: `${isLeftSidebarCollapsed ? 56 : leftSidebarWidth}px`,
              marginRight: `${isInspectorCollapsed ? 0 : inspectorWidth}px`,
            }}
            className="flex-1 relative h-full flex overflow-hidden transition-[margin] duration-75"
          >
            <Canvas
              zoom={zoom}
              currentTool={currentTool}
              setCurrentTool={setCurrentTool}
              devicePreview={devicePreview}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              elements={elements}
              setElements={setElements}
              onUpdateElementWithHistory={updateElementsWithHistory}
              collaborators={collaborators}
              onDuplicateElement={handleDuplicateElement}
              onDeleteElement={handleDeleteElement}
            />
          </div>

          {/* Right Inspector Panel */}
          <Inspector
            selectedElement={activeElement}
            allElements={elements}
            projectTitle={projectTitle}
            devicePreview={devicePreview}
            onUpdateElement={handleUpdateSelectedElement}
            onExportSelected={() => setIsExportModalOpen(true)}
            onOpenPrototype={() => setIsPrototypeModalOpen(true)}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            width={isInspectorCollapsed ? 0 : inspectorWidth}
            onStartResize={handleStartResizeInspector}
          />
        </div>
      ) : (
        /* Full Screen Dashboard / Files Browser */
        <DashboardView
          recentFiles={recentFiles}
          templates={TEMPLATES}
          onOpenFile={handleOpenFile}
          onNewDesign={handleNewDesign}
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {/* Bottom Status Bar */}
      {currentView === 'editor' && (
        <StatusBar
          collaborators={collaborators}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onOpenShortcuts={() => {
            setSettingsTab('general');
            setIsSettingsOpen(true);
          }}
        />
      )}

      {/* Global Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={settingsTab}
        setActiveTab={setSettingsTab}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Comprehensive Export & Download Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectTitle={projectTitle}
        elements={elements}
        selectedElementId={selectedElementId}
        devicePreview={devicePreview}
      />

      {/* Interactive Prototype Simulator Modal */}
      <PrototypeModal
        isOpen={isPrototypeModalOpen}
        onClose={() => setIsPrototypeModalOpen(false)}
        projectTitle={projectTitle}
        elements={elements}
        initialDevice={devicePreview}
      />
    </div>
  );
}
