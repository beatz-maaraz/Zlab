/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback, useMemo } from 'react';
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
import { ShortcutsModal } from './components/ShortcutsModal';
import { ErrorBoundary } from './components/ErrorBoundary';

import {
  CanvasElement,
  ProjectFile,
  SettingsTab,
  TemplateItem,
} from './types';
import { TEMPLATES } from './mockData';
import {
  getMaterial3KitElements,
  getIOSKitElements,
  getAllMaterialsElements,
} from './data/designKits';

import { useRouter } from './routes';
import { useProjectStore } from './store/projectStore';
import { useEditorStore } from './store/editorStore';
import { useUIStore } from './store/uiStore';
import { useHistoryStore } from './store/historyStore';

export default function App() {
  // Routing hook
  const { route, navigate } = useRouter();

  // Project store
  const {
    projects,
    activeProjectId,
    getActiveProject,
    createProject,
    setActiveProject,
    updateProject,
    updateActiveProjectElements,
    deleteProject,
    duplicateProject,
    getRecentProjectsList,
  } = useProjectStore();

  const activeProject = getActiveProject();
  const elements = activeProject.elements;
  const projectTitle = activeProject.name;
  const activePageId = activeProject.activePageId || 'page-1';

  // Editor store
  const {
    zoom,
    setZoom,
    resetZoom,
    currentTool,
    setCurrentTool,
    devicePreview,
    setDevicePreview,
    selectedElementId,
    setSelectedElementId,
    showGrid,
    setShowGrid,
    toggleGrid,
    collaborators,
    setCollaborators,
  } = useEditorStore();

  // UI store
  const {
    activeModal,
    openModal,
    closeModal,
    settingsTab,
    setSettingsTab,
    userSettings,
    updateUserSettings,
    leftSidebarWidth,
    setLeftSidebarWidth,
    isLeftSidebarCollapsed,
    toggleLeftSidebar,
    inspectorWidth,
    setInspectorWidth,
    isInspectorCollapsed,
    toast,
    showToast,
  } = useUIStore();

  // History store
  const {
    canUndo,
    canRedo,
    pushSnapshot,
    undo,
    redo,
    resetHistory,
  } = useHistoryStore();

  // Initialize history when project changes
  useEffect(() => {
    resetHistory(elements);
  }, [activeProject.id]);

  // Sync route param with active project
  useEffect(() => {
    if ((route.type === 'editor' || route.type === 'prototype') && route.projectId) {
      if (projects[route.projectId] && route.projectId !== activeProjectId) {
        setActiveProject(route.projectId);
      }
    }
  }, [route, projects, activeProjectId, setActiveProject]);

  // Handle device preview change with artboard selection
  const handleDeviceChange = useCallback(
    (mode: 'desktop' | 'mobile') => {
      setDevicePreview(mode);
      updateProject(activeProject.id, { previewType: mode });

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
    },
    [activeProject.id, elements, selectedElementId, setDevicePreview, setSelectedElementId, updateProject]
  );

  // Update elements with Undo/Redo history tracking
  const updateElementsWithHistory = useCallback(
    (newElements: Record<string, CanvasElement>) => {
      updateActiveProjectElements(newElements);
      pushSnapshot(newElements);
    },
    [updateActiveProjectElements, pushSnapshot]
  );

  // Wrapped setElements function for components expecting Dispatch<SetStateAction<...>>
  const setElementsWrapper = useCallback(
    (value: React.SetStateAction<Record<string, CanvasElement>>) => {
      const resolved = typeof value === 'function' ? value(elements) : value;
      updateElementsWithHistory(resolved);
    },
    [elements, updateElementsWithHistory]
  );

  const handleUndo = useCallback(() => {
    const previousSnapshot = undo();
    if (previousSnapshot) {
      updateActiveProjectElements(previousSnapshot);
    }
  }, [undo, updateActiveProjectElements]);

  const handleRedo = useCallback(() => {
    const nextSnapshot = redo();
    if (nextSnapshot) {
      updateActiveProjectElements(nextSnapshot);
    }
  }, [redo, updateActiveProjectElements]);

  const handleUpdateSelectedElement = useCallback(
    (updates: Partial<CanvasElement>) => {
      if (!elements[selectedElementId]) return;
      const updated = {
        ...elements,
        [selectedElementId]: {
          ...elements[selectedElementId],
          ...updates,
        },
      };
      updateElementsWithHistory(updated);
    },
    [elements, selectedElementId, updateElementsWithHistory]
  );

  const handleInsertElement = useCallback(
    (element: CanvasElement) => {
      const updated = {
        ...elements,
        [element.id]: element,
      };
      updateElementsWithHistory(updated);
      setSelectedElementId(element.id);
    },
    [elements, updateElementsWithHistory, setSelectedElementId]
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      if (id === 'desktop-1440' || id === 'mobile-app-view' || id === 'hero-bg') return;
      const next = { ...elements };
      delete next[id];
      updateElementsWithHistory(next);
      setSelectedElementId(devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
    },
    [elements, devicePreview, updateElementsWithHistory, setSelectedElementId]
  );

  const handleDuplicateElement = useCallback(
    (id: string) => {
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
    },
    [elements, handleInsertElement]
  );

  const handleApplyColor = useCallback(
    (color: string) => {
      if (selectedElementId && elements[selectedElementId]) {
        handleUpdateSelectedElement({ fill: color });
      }
    },
    [selectedElementId, elements, handleUpdateSelectedElement]
  );

  // Design kits import
  const handleImportMaterialKit = useCallback(() => {
    const m3Kit = getMaterial3KitElements();
    const updated = { ...elements, ...m3Kit };
    updateElementsWithHistory(updated);
    setSelectedElementId('m3-kit-frame');
    updateProject(activeProject.id, { name: 'Material Design 3 (M3) System' });
    showToast('Material Design 3 Kit imported successfully!', 'success');
  }, [elements, updateElementsWithHistory, setSelectedElementId, updateProject, activeProject.id, showToast]);

  const handleImportIOSKit = useCallback(() => {
    const iosKit = getIOSKitElements();
    const updated = { ...elements, ...iosKit };
    updateElementsWithHistory(updated);
    setSelectedElementId('ios-kit-frame');
    updateProject(activeProject.id, { name: 'Apple iOS 18 (HIG) System' });
    showToast('iOS 18 Design Kit imported successfully!', 'success');
  }, [elements, updateElementsWithHistory, setSelectedElementId, updateProject, activeProject.id, showToast]);

  const handleImportAllMaterials = useCallback(() => {
    const allKits = getAllMaterialsElements();
    const updated = { ...elements, ...allKits };
    updateElementsWithHistory(updated);
    setSelectedElementId('m3-kit-frame');
    updateProject(activeProject.id, { name: 'Material Design 3 & iOS 18 System' });
    showToast('Design Systems imported successfully!', 'success');
  }, [elements, updateElementsWithHistory, setSelectedElementId, updateProject, activeProject.id, showToast]);

  // Project creation & loading
  const handleNewDesign = useCallback(() => {
    const newProj = createProject(undefined, undefined, devicePreview);
    navigate({ type: 'editor', projectId: newProj.id });
    setSelectedElementId(devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
    showToast(`Created new project "${newProj.name}"`, 'success');
  }, [createProject, devicePreview, navigate, setSelectedElementId, showToast]);

  const handleOpenFile = useCallback(
    (file: ProjectFile) => {
      if (projects[file.id]) {
        setActiveProject(file.id);
        navigate({ type: 'editor', projectId: file.id });
        if (file.previewType === 'mobile') {
          setDevicePreview('mobile');
          setSelectedElementId('mobile-app-view');
        } else {
          setDevicePreview('desktop');
          setSelectedElementId('desktop-1440');
        }
      }
    },
    [projects, setActiveProject, navigate, setDevicePreview, setSelectedElementId]
  );

  const handleSelectTemplate = useCallback(
    (template: TemplateItem) => {
      if (template.id === 'm3-full-kit') {
        const proj = createProject('Material 3 Design System', getMaterial3KitElements(), 'desktop');
        navigate({ type: 'editor', projectId: proj.id });
        setSelectedElementId('m3-kit-frame');
        return;
      }
      if (template.id === 'ios-full-kit') {
        const proj = createProject('iOS 18 Design System', getIOSKitElements(), 'mobile');
        navigate({ type: 'editor', projectId: proj.id });
        setSelectedElementId('ios-kit-frame');
        return;
      }
      if (template.id === 'all-materials-kit') {
        const proj = createProject('Complete Design Systems', getAllMaterialsElements(), 'desktop');
        navigate({ type: 'editor', projectId: proj.id });
        setSelectedElementId('m3-kit-frame');
        return;
      }

      const isMobile = template.id === 'ios-starter';
      const proj = createProject(`${template.title} Draft`, undefined, isMobile ? 'mobile' : 'desktop');
      navigate({ type: 'editor', projectId: proj.id });
      setDevicePreview(isMobile ? 'mobile' : 'desktop');
      setSelectedElementId(isMobile ? 'mobile-app-view' : 'desktop-1440');
    },
    [createProject, navigate, setDevicePreview, setSelectedElementId]
  );

  // Command palette & shortcuts execution
  const handleExecuteAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'tool-move':
          setCurrentTool('move');
          break;
        case 'tool-frame':
          setCurrentTool('frame');
          break;
        case 'tool-rect':
          setCurrentTool('rect');
          break;
        case 'tool-pen':
          setCurrentTool('pen');
          break;
        case 'tool-text':
          setCurrentTool('text');
          break;
        case 'tool-hand':
          setCurrentTool('hand');
          break;
        case 'tool-comment':
          setCurrentTool('comment');
          break;
        case 'undo':
          handleUndo();
          break;
        case 'redo':
          handleRedo();
          break;
        case 'duplicate':
          if (selectedElementId) {
            handleDuplicateElement(selectedElementId);
          }
          break;
        case 'delete':
          if (
            selectedElementId &&
            selectedElementId !== 'desktop-1440' &&
            selectedElementId !== 'mobile-app-view' &&
            selectedElementId !== 'hero-bg'
          ) {
            handleDeleteElement(selectedElementId);
          }
          break;
        case 'deselect':
          setSelectedElementId(devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
          break;
        case 'toggle-grid':
          toggleGrid();
          break;
        case 'zoom-in':
          setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
          break;
        case 'zoom-out':
          setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))));
          break;
        case 'zoom-reset':
          resetZoom();
          break;
        case 'device-desktop':
          handleDeviceChange('desktop');
          break;
        case 'device-mobile':
          handleDeviceChange('mobile');
          break;
        case 'open-prototype':
          openModal('prototype');
          break;
        case 'open-export':
          openModal('export');
          break;
        case 'open-settings':
          openModal('settings');
          break;
        case 'open-shortcuts':
          openModal('shortcuts');
          break;
        default:
          break;
      }
    },
    [
      setCurrentTool,
      handleUndo,
      handleRedo,
      selectedElementId,
      devicePreview,
      handleDuplicateElement,
      handleDeleteElement,
      setSelectedElementId,
      toggleGrid,
      setZoom,
      resetZoom,
      handleDeviceChange,
      openModal,
    ]
  );

  // Global keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input / textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Open / toggle shortcuts cheat-sheet modal (? or Shift+/ or Cmd+/ or Ctrl+/ or Cmd+K or Ctrl+K)
      if (
        e.key === '?' ||
        ((e.metaKey || e.ctrlKey) && (e.key === '/' || e.key.toLowerCase() === 'k'))
      ) {
        e.preventDefault();
        if (activeModal === 'shortcuts') {
          closeModal();
        } else {
          openModal('shortcuts');
        }
        return;
      }

      if (e.key === 'Escape') {
        if (activeModal) {
          closeModal();
          return;
        }
        if (currentTool !== 'move') {
          setCurrentTool('move');
        } else {
          setSelectedElementId(devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
        }
        return;
      }

      // Delete key deletes selected element
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedElementId &&
        selectedElementId !== 'desktop-1440' &&
        selectedElementId !== 'mobile-app-view' &&
        selectedElementId !== 'hero-bg'
      ) {
        e.preventDefault();
        handleDeleteElement(selectedElementId);
        return;
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Duplicate element shortcut Ctrl+D / Cmd+D
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedElementId) {
          handleDuplicateElement(selectedElementId);
        }
        return;
      }

      // Export modal: Cmd+E / Ctrl+E
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        openModal('export');
        return;
      }

      // Settings modal: Cmd+, / Ctrl+,
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        openModal('settings');
        return;
      }

      // Zoom in / Zoom out / Zoom 100%
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))));
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }

      // Prototype simulator: Shift+P
      if (e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openModal('prototype');
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

      // Device view hotkeys
      if (e.key === '1') {
        handleDeviceChange('desktop');
        return;
      }
      if (e.key === '2') {
        handleDeviceChange('mobile');
        return;
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
        case 'g':
          toggleGrid();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeModal,
    closeModal,
    openModal,
    currentTool,
    setCurrentTool,
    selectedElementId,
    devicePreview,
    elements,
    handleDeleteElement,
    handleRedo,
    handleUndo,
    handleDuplicateElement,
    setZoom,
    resetZoom,
    handleUpdateSelectedElement,
    handleDeviceChange,
    toggleGrid,
  ]);

  // Subtle live collaborator cursor simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators((prev) =>
        prev.map((c) => {
          if (c.id === 'you') return c;
          const deltaX = (Math.random() - 0.5) * 36;
          const deltaY = (Math.random() - 0.5) * 26;
          return {
            ...c,
            cursorX: Math.max(120, Math.min(920, c.cursorX + deltaX)),
            cursorY: Math.max(80, Math.min(640, c.cursorY + deltaY)),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [setCollaborators]);

  // Sidebar and Inspector resizing handlers
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

  const recentFilesList = useMemo(() => {
    return getRecentProjectsList().map((p) => ({
      id: p.id,
      title: p.name,
      lastEdited: new Date(p.updatedAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }),
      previewType: (p.previewType || 'desktop') as 'desktop' | 'mobile' | 'components',
    }));
  }, [projects, getRecentProjectsList]);

  const activeElement = elements[selectedElementId] || elements['desktop-1440'] || Object.values(elements)[0];
  const isEditorView = route.type === 'editor' || route.type === 'prototype';

  return (
    <ErrorBoundary>
      <div
        id="app-root-container"
        className="flex flex-col h-screen w-screen overflow-hidden bg-[#131313] text-[#e5e2e1] font-sans select-none"
      >
        {/* Top Application Header */}
        <Header
          projectTitle={projectTitle}
          setProjectTitle={(name) => updateProject(activeProject.id, { name })}
          zoom={zoom}
          setZoom={setZoom}
          devicePreview={devicePreview}
          setDevicePreview={handleDeviceChange}
          currentView={isEditorView ? 'editor' : 'dashboard'}
          setCurrentView={(view) => {
            if (view === 'dashboard') {
              navigate({ type: 'dashboard' });
            } else {
              navigate({ type: 'editor', projectId: activeProject.id });
            }
          }}
          onOpenSettings={(tab?: string) => {
            if (tab) setSettingsTab(tab as SettingsTab);
            openModal('settings');
          }}
          onExport={() => openModal('export')}
          onOpenPrototype={() => openModal('prototype')}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenShortcuts={() => openModal('shortcuts')}
          onImportMaterialKit={handleImportMaterialKit}
          onImportIOSKit={handleImportIOSKit}
          onImportAllMaterials={handleImportAllMaterials}
          collaborators={collaborators}
          onNewDesign={handleNewDesign}
        />

        {/* Main View: Editor Workspace or Dashboard Browser */}
        {isEditorView ? (
          <div id="editor-workspace" className="flex flex-1 relative overflow-hidden pt-16 pb-8">
            {/* Left Sidebar */}
            <LeftSidebar
              currentView="editor"
              setCurrentView={(view) => {
                if (view === 'dashboard') navigate({ type: 'dashboard' });
              }}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              elements={elements}
              setElements={setElementsWrapper}
              onInsertElement={handleInsertElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onApplyColor={handleApplyColor}
              onImportMaterialKit={handleImportMaterialKit}
              onImportIOSKit={handleImportIOSKit}
              onImportAllMaterials={handleImportAllMaterials}
              devicePreview={devicePreview}
              width={leftSidebarWidth}
              onStartResize={handleStartResizeLeft}
              isCollapsed={isLeftSidebarCollapsed}
              onToggleCollapse={toggleLeftSidebar}
            />

            {/* Floating Toolbar */}
            <FloatingToolbar
              currentTool={currentTool}
              setCurrentTool={setCurrentTool}
              commentCount={1}
            />

            {/* Central Infinite Canvas */}
            <div
              style={{
                marginLeft: `${isLeftSidebarCollapsed ? 56 : leftSidebarWidth}px`,
                marginRight: `${isInspectorCollapsed ? 0 : inspectorWidth}px`,
              }}
              className="flex-1 relative h-full flex overflow-hidden transition-[margin] duration-75"
            >
              <Canvas
                zoom={zoom}
                setZoom={setZoom}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
                devicePreview={devicePreview}
                selectedElementId={selectedElementId}
                setSelectedElementId={setSelectedElementId}
                elements={elements}
                setElements={setElementsWrapper}
                onUpdateElementWithHistory={updateElementsWithHistory}
                collaborators={collaborators}
                onDuplicateElement={handleDuplicateElement}
                onDeleteElement={handleDeleteElement}
                showGrid={showGrid}
                onToggleGrid={toggleGrid}
                onDropElement={(el) => {
                  handleInsertElement(el);
                  setSelectedElementId(el.id);
                }}
              />
            </div>

            {/* Right Inspector Panel */}
            <Inspector
              selectedElement={activeElement}
              allElements={elements}
              projectTitle={projectTitle}
              devicePreview={devicePreview}
              onUpdateElement={handleUpdateSelectedElement}
              onExportSelected={() => openModal('export')}
              onOpenPrototype={() => openModal('prototype')}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              width={isInspectorCollapsed ? 0 : inspectorWidth}
              onStartResize={handleStartResizeInspector}
            />
          </div>
        ) : (
          /* Full Screen Dashboard / File Browser */
          <DashboardView
            recentFiles={recentFilesList}
            templates={TEMPLATES}
            onOpenFile={handleOpenFile}
            onNewDesign={handleNewDesign}
            onSelectTemplate={handleSelectTemplate}
            onDuplicateFile={(id) => {
              const dup = duplicateProject(id);
              showToast(`Duplicated project "${dup.name}"`, 'success');
            }}
            onDeleteFile={(id) => {
              deleteProject(id);
              showToast('Project deleted', 'info');
            }}
          />
        )}

        {/* Bottom Status Bar */}
        {isEditorView && (
          <StatusBar
            collaborators={collaborators}
            currentPage={activePageId === 'page-1' ? 1 : activePageId === 'page-2' ? 2 : 3}
            totalPages={activeProject.pages?.length || 3}
            onPageChange={(page) => {
              const pageId = `page-${page}`;
              useProjectStore.getState().setActivePage(pageId);
            }}
            onOpenShortcuts={() => openModal('shortcuts')}
          />
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={activeModal === 'settings'}
          onClose={closeModal}
          activeTab={settingsTab}
          setActiveTab={setSettingsTab}
          settings={userSettings}
          setSettings={updateUserSettings}
          onOpenShortcutsOverlay={() => openModal('shortcuts')}
          onExecuteAction={handleExecuteAction}
        />

        {/* Export Modal */}
        <ExportModal
          isOpen={activeModal === 'export'}
          onClose={closeModal}
          projectTitle={projectTitle}
          elements={elements}
          selectedElementId={selectedElementId}
          devicePreview={devicePreview}
        />

        {/* Prototype Simulator Modal */}
        <PrototypeModal
          isOpen={activeModal === 'prototype' || route.type === 'prototype'}
          onClose={() => {
            closeModal();
            if (route.type === 'prototype') {
              navigate({ type: 'editor', projectId: activeProject.id });
            }
          }}
          projectTitle={projectTitle}
          elements={elements}
          initialDevice={devicePreview}
        />

        {/* Keyboard Shortcuts Modal */}
        <ShortcutsModal
          isOpen={activeModal === 'shortcuts'}
          onClose={closeModal}
          onExecuteAction={handleExecuteAction}
        />

        {/* Toast Notification Alert */}
        {toast && (
          <div className="fixed bottom-12 right-6 z-50 flex items-center gap-2 bg-[#201f1f] text-[#e5e2e1] border border-[#353534] px-4 py-2.5 rounded-lg shadow-2xl text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                toast.type === 'success'
                  ? 'bg-[#34d399]'
                  : toast.type === 'warning'
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#9fcaff]'
              }`}
            />
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
