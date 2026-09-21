/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Header } from './components/Header/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { FloatingToolbar } from './components/FloatingToolbar';
import { Canvas } from './components/Canvas';
import { Inspector } from './components/Inspector/Inspector';
import { StatusBar } from './components/StatusBar';
import { DashboardView } from './components/DashboardView';
import { AuthView } from './components/AuthView';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { PrototypeModal } from './components/PrototypeModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { NewDesignModal } from './components/NewDesignModal';
import { CyberpunkCursorModal } from './components/CyberpunkCursorModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, Loader2, Sparkles } from 'lucide-react';

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
import { getCyberpunkCursorKitElements } from './data/cyberpunkCursors';

import { useRouter } from './routes';
import { useProjectStore } from './store/projectStore';
import { useEditorStore } from './store/editorStore';
import { useUIStore } from './store/uiStore';
import { useHistoryStore } from './store/historyStore';
import { useAuthStore } from './store/authStore';

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
    addPage,
    setActivePage,
    renamePage,
    duplicatePage,
    deletePage,
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
    selectedElementIds,
    setSelectedElementIds,
    toggleElementSelection,
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
    toggleInspector,
    toast,
    showToast,
  } = useUIStore();

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Auto-Save Indicator state
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      setIsSaving(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, [elements]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCyberpunkModalOpen, setIsCyberpunkModalOpen] = useState(false);
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle device preview change while preserving selected elements and document state
  const handleDeviceChange = useCallback(
    (mode: 'desktop' | 'mobile') => {
      setDevicePreview(mode);
      updateProject(activeProject.id, { previewType: mode });

      // If the old artboard itself was selected, switch to the new artboard
      if (mode === 'desktop' && selectedElementId === 'mobile-app-view') {
        setSelectedElementId('desktop-1440');
      } else if (mode === 'mobile' && selectedElementId === 'desktop-1440') {
        setSelectedElementId('mobile-app-view');
      }
      // If an actual design element is selected, preserve it untouched
    },
    [activeProject.id, selectedElementId, setDevicePreview, setSelectedElementId, updateProject]
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
      updateActiveProjectElements(resolved);
    },
    [elements, updateActiveProjectElements]
  );

  const handleUndo = useCallback(() => {
    const previousSnapshot = undo();
    if (previousSnapshot) {
      updateActiveProjectElements(previousSnapshot);
      setToastMessage('Undo');
    }
  }, [undo, updateActiveProjectElements]);

  const handleRedo = useCallback(() => {
    const nextSnapshot = redo();
    if (nextSnapshot) {
      updateActiveProjectElements(nextSnapshot);
      setToastMessage('Redo');
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

  const handleUpdateMultipleElements = useCallback(
    (updatesMap: Record<string, Partial<CanvasElement>>) => {
      const updated = { ...elements };
      for (const [id, updates] of Object.entries(updatesMap)) {
        if (updated[id]) {
          updated[id] = { ...updated[id], ...updates };
        }
      }
      updateElementsWithHistory(updated);
    },
    [elements, updateElementsWithHistory]
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
      const elToDelete = next[id];
      delete next[id];

      // If deleted item is a group, cascade delete its children
      if (elToDelete?.type === 'group') {
        Object.values(elements).forEach((c) => {
          if (c.parentId === id) {
            delete next[c.id];
          }
        });
      }

      updateElementsWithHistory(next);
      const fallbackId = devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view';
      setSelectedElementId(fallbackId);
      setSelectedElementIds([fallbackId]);
    },
    [elements, devicePreview, updateElementsWithHistory, setSelectedElementId, setSelectedElementIds]
  );

  const handleDuplicateElement = useCallback(
    (id: string) => {
      const el = elements[id];
      if (!el) return;
      const timestamp = Date.now();
      const newId = `${el.id}_copy_${timestamp}`;
      const duplicated: CanvasElement = {
        ...el,
        id: newId,
        name: `${el.name} Copy`,
        x: el.x + 24,
        y: el.y + 24,
      };

      const next = { ...elements, [newId]: duplicated };

      if (el.type === 'group') {
        const groupChildren = Object.values(elements).filter((c) => c.parentId === id);
        groupChildren.forEach((child) => {
          const newChildId = `${child.id}_copy_${timestamp}`;
          next[newChildId] = {
            ...child,
            id: newChildId,
            parentId: newId,
          };
        });
      }

      updateElementsWithHistory(next);
      setSelectedElementId(newId);
      setSelectedElementIds([newId]);
    },
    [elements, updateElementsWithHistory, setSelectedElementId, setSelectedElementIds]
  );

  // Group multiple selected components into a new group container
  const handleGroupElements = useCallback(() => {
    let idsToGroup = selectedElementIds.filter(
      (id) =>
        id &&
        id !== 'desktop-1440' &&
        id !== 'mobile-app-view' &&
        id !== 'hero-bg' &&
        elements[id]
    );

    if (idsToGroup.length < 1 && selectedElementId && elements[selectedElementId]) {
      if (
        selectedElementId !== 'desktop-1440' &&
        selectedElementId !== 'mobile-app-view' &&
        selectedElementId !== 'hero-bg'
      ) {
        idsToGroup = [selectedElementId];
      }
    }

    if (idsToGroup.length < 1) {
      showToast('Select elements to group', 'info');
      return;
    }

    const selectedElements = idsToGroup.map((id) => elements[id]);

    const firstParentId = selectedElements[0].parentId;
    const sameParent = selectedElements.every((el) => el.parentId === firstParentId);
    const targetParentId = sameParent
      ? firstParentId
      : devicePreview === 'desktop'
      ? 'desktop-1440'
      : 'mobile-app-view';

    const minX = Math.min(...selectedElements.map((el) => el.x));
    const minY = Math.min(...selectedElements.map((el) => el.y));
    const maxX = Math.max(...selectedElements.map((el) => el.x + (el.width || 0)));
    const maxY = Math.max(...selectedElements.map((el) => el.y + (el.height || 0)));
    const groupWidth = Math.max(24, maxX - minX);
    const groupHeight = Math.max(24, maxY - minY);

    const groupId = `group_${Date.now()}`;
    const groupCount = Object.values(elements).filter((e) => e.type === 'group').length + 1;
    const groupName = `Group ${groupCount}`;

    const newGroup: CanvasElement = {
      id: groupId,
      name: groupName,
      type: 'group',
      x: minX,
      y: minY,
      width: groupWidth,
      height: groupHeight,
      rotation: 0,
      borderRadius: 0,
      fill: 'transparent',
      fillOpacity: 100,
      stroke: 'none',
      strokeWidth: 0,
      shadowBlur: 0,
      shadowY: 0,
      shadowSpread: 0,
      visible: true,
      locked: false,
      parentId: targetParentId,
    };

    const nextElements = { ...elements, [groupId]: newGroup };

    // Reparent children to new group and offset coordinates
    selectedElements.forEach((el) => {
      nextElements[el.id] = {
        ...el,
        parentId: groupId,
        x: el.x - minX,
        y: el.y - minY,
      };
    });

    updateElementsWithHistory(nextElements);
    setSelectedElementId(groupId);
    setSelectedElementIds([groupId]);
    showToast(`Grouped ${selectedElements.length} elements into "${groupName}"`, 'success');
  }, [
    elements,
    selectedElementIds,
    selectedElementId,
    devicePreview,
    updateElementsWithHistory,
    setSelectedElementId,
    setSelectedElementIds,
    showToast,
  ]);

  // Ungroup a group container and restore its children to the parent frame
  const handleUngroupElements = useCallback(
    (targetGroupId?: string) => {
      let groupId = targetGroupId;
      if (!groupId) {
        if (selectedElementId && elements[selectedElementId]?.type === 'group') {
          groupId = selectedElementId;
        } else {
          const groupInSelection = selectedElementIds.find(
            (id) => elements[id]?.type === 'group'
          );
          if (groupInSelection) {
            groupId = groupInSelection;
          } else if (selectedElementId && elements[selectedElementId]?.parentId) {
            const parent = elements[elements[selectedElementId].parentId!];
            if (parent && parent.type === 'group') {
              groupId = parent.id;
            }
          }
        }
      }

      if (!groupId || !elements[groupId] || elements[groupId].type !== 'group') {
        showToast('Select a group to ungroup', 'info');
        return;
      }

      const group = elements[groupId];
      const targetParentId =
        group.parentId ||
        (devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');

      const nextElements = { ...elements };
      delete nextElements[groupId];

      const children = Object.values(elements).filter((el) => el.parentId === groupId);
      const childIds: string[] = [];

      children.forEach((child) => {
        childIds.push(child.id);
        nextElements[child.id] = {
          ...child,
          parentId: targetParentId,
          x: group.x + child.x,
          y: group.y + child.y,
        };
      });

      updateElementsWithHistory(nextElements);
      if (childIds.length > 0) {
        setSelectedElementIds(childIds);
        setSelectedElementId(childIds[childIds.length - 1]);
      } else {
        setSelectedElementId(targetParentId);
        setSelectedElementIds([targetParentId]);
      }
      showToast(`Ungrouped "${group.name}"`, 'info');
    },
    [
      elements,
      selectedElementId,
      selectedElementIds,
      devicePreview,
      updateElementsWithHistory,
      setSelectedElementId,
      setSelectedElementIds,
      showToast,
    ]
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

  const handleImportCyberpunkKit = useCallback(() => {
    const cyberKit = getCyberpunkCursorKitElements();
    const updated = { ...elements, ...cyberKit };
    updateElementsWithHistory(updated);
    setSelectedElementId('zlab-cyberpunk-cursor-sheet');
    updateProject(activeProject.id, { name: 'ZLAB Cyberpunk HUD Cursor System' });
    showToast('ZLAB Cyberpunk Cursor System imported successfully!', 'success');
  }, [elements, updateElementsWithHistory, setSelectedElementId, updateProject, activeProject.id, showToast]);

  // Project creation & loading
  const handleNewDesign = useCallback(() => {
    openModal('newDesign');
  }, [openModal]);

  const handleOpenFile = useCallback(
    (file: ProjectFile) => {
      const storeProjects = useProjectStore.getState().projects;
      const targetProj = storeProjects[file.id] || projects[file.id];
      const targetId = targetProj ? file.id : (activeProjectId || file.id);

      setActiveProject(targetId);
      navigate({ type: 'editor', projectId: targetId });

      const pType = targetProj?.previewType || file.previewType || 'desktop';
      if (pType === 'mobile') {
        setDevicePreview('mobile');
        setSelectedElementId('mobile-app-view');
      } else {
        setDevicePreview('desktop');
        setSelectedElementId('desktop-1440');
      }
    },
    [projects, activeProjectId, setActiveProject, navigate, setDevicePreview, setSelectedElementId]
  );

  const handleSelectTemplate = useCallback(
    (template: TemplateItem) => {
      if (template.id === 'cyberpunk-cursors-kit') {
        const proj = createProject('ZLAB Cyberpunk HUD Cursor System', getCyberpunkCursorKitElements(), 'desktop');
        setActiveProject(proj.id);
        navigate({ type: 'editor', projectId: proj.id });
        setSelectedElementId('zlab-cyberpunk-cursor-sheet');
        return;
      }
      if (template.id === 'm3-full-kit') {
        const proj = createProject('Material 3 Design System', getMaterial3KitElements(), 'desktop');
        setActiveProject(proj.id);
        navigate({ type: 'editor', projectId: proj.id });
        setSelectedElementId('m3-kit-frame');
        return;
      }
      if (template.id === 'ios-full-kit') {
        const proj = createProject('iOS 18 Design System', getIOSKitElements(), 'mobile');
        setActiveProject(proj.id);
        navigate({ type: 'editor', projectId: proj.id });
        setSelectedElementId('ios-kit-frame');
        return;
      }
      if (template.id === 'all-materials-kit') {
        const proj = createProject('Complete Design Systems', getAllMaterialsElements(), 'desktop');
        setActiveProject(proj.id);
        navigate({ type: 'editor', projectId: proj.id });
        setSelectedElementId('m3-kit-frame');
        return;
      }

      const isMobile = template.id === 'ios-starter';
      const proj = createProject(`${template.title} Draft`, undefined, isMobile ? 'mobile' : 'desktop');
      setActiveProject(proj.id);
      navigate({ type: 'editor', projectId: proj.id });
      setDevicePreview(isMobile ? 'mobile' : 'desktop');
      setSelectedElementId(isMobile ? 'mobile-app-view' : 'desktop-1440');
    },
    [createProject, setActiveProject, navigate, setDevicePreview, setSelectedElementId]
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

      // Group shortcut: Cmd+G / Ctrl+G
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        handleGroupElements();
        return;
      }

      // Ungroup shortcut: Cmd+Shift+G / Ctrl+Shift+G
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        handleUngroupElements();
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
          if (!e.metaKey && !e.ctrlKey) {
            toggleGrid();
          }
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
    handleGroupElements,
    handleUngroupElements,
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

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEv: MouseEvent) => {
      const delta = moveEv.clientX - startX;
      const newWidth = Math.min(520, Math.max(240, startW - delta));
      setInspectorWidth(newWidth);
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
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
      status: p.status || 'active',
      projectType: p.projectType,
      projectStatus: p.projectStatus,
      elements: p.elements,
    }));
  }, [projects, getRecentProjectsList]);

  const activeElement = elements[selectedElementId] || elements['desktop-1440'] || Object.values(elements)[0];
  const isEditorView = route.type === 'editor' || route.type === 'prototype';

  const { isAuthenticated: uiAuth } = useUIStore();
  const { isInitialized, user } = useAuthStore();
  const isAuthenticated = Boolean(user) || uiAuth;
  
  useEffect(() => {
    if (!isInitialized) return;
    const isAuthRoute = ['login', 'signup', 'forgot-password', 'verify-email'].includes(route.type);
    if (!isAuthenticated && !isAuthRoute) {
      navigate({ type: 'login' });
    } else if (isAuthenticated && isAuthRoute) {
      navigate({ type: 'dashboard' });
    }
  }, [isAuthenticated, isInitialized, route.type, navigate]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0b] text-[#e5e2e1]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#003259] to-[#0d99ff] flex items-center justify-center mb-4 shadow-lg shadow-[#0d99ff]/20">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-[#0d99ff]" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        id="app-root-container"
        className="flex flex-col h-screen w-screen overflow-hidden bg-[#131313] text-[#e5e2e1] font-sans select-none"
      >
        {/* Top Application Header */}
        {!['login', 'signup', 'forgot-password', 'verify-email'].includes(route.type) && (
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
            onGroup={handleGroupElements}
            onUngroup={handleUngroupElements}
            onOpenShortcuts={() => openModal('shortcuts')}
            onImportMaterialKit={handleImportMaterialKit}
            onImportIOSKit={handleImportIOSKit}
            onImportAllMaterials={handleImportAllMaterials}
            onOpenCyberpunkKit={() => setIsCyberpunkModalOpen(true)}
            onImportCyberpunkKit={handleImportCyberpunkKit}
            collaborators={collaborators}
            onNewDesign={handleNewDesign}
            isSaving={isSaving}
            selectedElementIds={selectedElementIds}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed}
            onToggleLeftSidebar={toggleLeftSidebar}
            isInspectorCollapsed={isInspectorCollapsed}
            onToggleInspector={toggleInspector}
          />
        )}

        {/* Main View: Editor Workspace or Dashboard Browser or Auth */}
        {['login', 'signup', 'forgot-password', 'verify-email'].includes(route.type) ? (
          <AuthView initialMode={route.type as 'login' | 'signup' | 'forgot-password' | 'verify-email'} />
        ) : !isAuthenticated ? (
          <div className="flex-1 bg-[#131313]" /> // Blank loading state while redirecting
        ) : isEditorView ? (
          <div id="editor-workspace" className="flex flex-1 relative overflow-hidden pt-16 pb-8">
            {/* Left Sidebar */}
            <LeftSidebar
              currentView="editor"
              setCurrentView={(view) => {
                if (view === 'dashboard') {
                  navigate({ type: 'dashboard' });
                } else {
                  navigate({ type: 'editor', projectId: activeProject.id });
                }
              }}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              selectedElementIds={selectedElementIds}
              setSelectedElementIds={setSelectedElementIds}
              toggleElementSelection={toggleElementSelection}
              onGroup={handleGroupElements}
              onUngroup={handleUngroupElements}
              elements={elements}
              setElements={setElementsWrapper}
              onInsertElement={handleInsertElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onApplyColor={handleApplyColor}
              onImportMaterialKit={handleImportMaterialKit}
              onImportIOSKit={handleImportIOSKit}
              onImportAllMaterials={handleImportAllMaterials}
              onOpenCyberpunkKit={() => setIsCyberpunkModalOpen(true)}
              onImportCyberpunkKit={handleImportCyberpunkKit}
              devicePreview={devicePreview}
              width={leftSidebarWidth}
              onStartResize={handleStartResizeLeft}
              isCollapsed={isLeftSidebarCollapsed}
              onToggleCollapse={toggleLeftSidebar}
              pages={activeProject.pages || []}
              activePageId={activePageId}
              onAddPage={(name) => addPage(name)}
              onSelectPage={(pageId) => {
                setActivePage(pageId);
                setSelectedElementId(devicePreview === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
              }}
              onRenamePage={(pageId, name) => renamePage(pageId, name)}
              onDuplicatePage={(pageId) => duplicatePage(pageId)}
              onDeletePage={(pageId) => deletePage(pageId)}
            />

            {/* Central Infinite Canvas */}
            <div
              id="canvas-container"
              style={{
                marginLeft: isMobile ? 0 : `${isLeftSidebarCollapsed ? 56 : leftSidebarWidth}px`,
                marginRight: isMobile ? 0 : `${isInspectorCollapsed ? 0 : inspectorWidth}px`,
              }}
              className="canvas-container min-w-0 min-h-0 flex-1 relative h-full flex overflow-hidden transition-[margin] duration-200"
            >
              {/* Floating Toolbar */}
              <FloatingToolbar
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
                commentCount={1}
                enableDragAndDrop={userSettings.enableToolbarDrag ?? true}
              />

              <Canvas
                zoom={zoom}
                setZoom={setZoom}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
                devicePreview={devicePreview}
                selectedElementId={selectedElementId}
                setSelectedElementId={setSelectedElementId}
                selectedElementIds={selectedElementIds}
                setSelectedElementIds={setSelectedElementIds}
                toggleElementSelection={toggleElementSelection}
                onGroup={handleGroupElements}
                onUngroup={handleUngroupElements}
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
              selectedElementIds={selectedElementIds}
              onGroup={handleGroupElements}
              onUngroup={handleUngroupElements}
              onSelectElement={(id) => {
                setSelectedElementId(id);
                setSelectedElementIds([id]);
              }}
              onUpdateElement={handleUpdateSelectedElement}
              onUpdateMultipleElements={handleUpdateMultipleElements}
              onExportSelected={() => openModal('export')}
              onOpenPrototype={() => openModal('prototype')}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              width={isInspectorCollapsed ? 0 : inspectorWidth}
              onStartResize={handleStartResizeInspector}
              onClose={toggleInspector}
              isMobile={isMobile}
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
              updateProject(id, { status: 'trash' });
              showToast('Project moved to trash', 'info');
            }}
            onRestoreFile={(id) => {
              updateProject(id, { status: 'active' });
              showToast('Project restored', 'success');
            }}
            onPermanentDeleteFile={(id) => {
              deleteProject(id);
              showToast('Project permanently deleted', 'info');
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

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1c1b1b] text-white px-4 py-2 rounded-full shadow-2xl border border-[#353534] flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
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

        {/* New Design Modal */}
        <NewDesignModal
          isOpen={activeModal === 'newDesign'}
          onClose={closeModal}
          onSubmit={(details) => {
            const targetDevice = details.previewType || (details.projectType === 'Mobile App' ? 'mobile' : devicePreview);
            const newProj = createProject(details.name, undefined, targetDevice, details);
            setDevicePreview(targetDevice);
            closeModal();
            navigate({ type: 'editor', projectId: newProj.id });
            setSelectedElementId(targetDevice === 'desktop' ? 'desktop-1440' : 'mobile-app-view');
            showToast(`Created new design "${newProj.name}"`, 'success');
          }}
        />

        {/* ZLAB Cyberpunk HUD Cursor System Modal */}
        <CyberpunkCursorModal
          isOpen={isCyberpunkModalOpen}
          onClose={() => setIsCyberpunkModalOpen(false)}
          onInsertToCanvas={handleImportCyberpunkKit}
          onApplyEditorCursor={(cursorDataUri) => {
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) {
              canvasContainer.style.cursor = `url("${cursorDataUri}") 4 4, auto`;
            }
            document.body.style.cursor = `url("${cursorDataUri}") 4 4, auto`;
            showToast('ZLAB Cyberpunk Cursor activated in workspace!', 'info');
          }}
        />

        {/* Toast Notification Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-10 right-6 z-50 flex items-center gap-2.5 bg-[#181818] text-[#e5e2e1] border border-[#353534] px-4 py-2.5 rounded-xl shadow-2xl text-xs backdrop-blur-md"
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-[#9fcaff] shrink-0" />
              )}
              <span className="font-medium">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
