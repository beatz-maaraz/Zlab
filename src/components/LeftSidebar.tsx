import React, { useState, useMemo } from 'react';
import {
  Layers,
  Component,
  Image as ImageIcon,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Monitor,
  Smartphone,
  Square,
  Type,
  MousePointerClick,
  Grid,
  Globe,
  Search,
  Plus,
  Trash2,
  Copy,
  Edit3,
  FileText,
  Sparkles,
  Palette,
  Circle,
  Shapes,
  Check,
  Zap,
  TrendingUp,
  User,
  Users,
  Shield,
  Tag,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { CanvasElement, AppView, LibraryComponentItem, ProjectPage } from '../types';
import {
  LIBRARY_COMPONENTS,
  COMPONENT_CATEGORIES,
  VECTOR_ICONS_LIST,
  GEOMETRIC_SHAPES_LIST,
  COLOR_PALETTES,
  BRAND_ASSETS,
} from '../data/libraryData';
import { DynamicIcon } from './DynamicIcon';
import { ZLabLogo } from './ZLabLogo';

interface LeftSidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedElementId: string;
  setSelectedElementId: (id: string) => void;
  elements: Record<string, CanvasElement>;
  setElements: React.Dispatch<React.SetStateAction<Record<string, CanvasElement>>>;
  onInsertElement: (element: CanvasElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onApplyColor: (color: string) => void;
  onImportMaterialKit?: () => void;
  onImportIOSKit?: () => void;
  onImportAllMaterials?: () => void;
  devicePreview?: 'desktop' | 'mobile';
  width?: number;
  onStartResize?: (e: React.MouseEvent) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // Pages
  pages?: ProjectPage[];
  activePageId?: string;
  onAddPage?: (name?: string) => void;
  onSelectPage?: (pageId: string) => void;
  onRenamePage?: (pageId: string, name: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  onDeletePage?: (pageId: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentView,
  setCurrentView,
  selectedElementId,
  setSelectedElementId,
  elements,
  setElements,
  onInsertElement,
  onDeleteElement,
  onDuplicateElement,
  onApplyColor,
  onImportMaterialKit,
  onImportIOSKit,
  onImportAllMaterials,
  devicePreview = 'desktop',
  width = 300,
  onStartResize,
  isCollapsed = false,
  onToggleCollapse,
  pages = [],
  activePageId = 'page-1',
  onAddPage,
  onSelectPage,
  onRenamePage,
  onDuplicatePage,
  onDeletePage,
}) => {
  // Navigation tabs: 'layers' | 'components' | 'assets'
  const [activeNavTab, setActiveNavTab] = useState<'layers' | 'components' | 'assets'>('layers');

  // Search queries
  const [componentSearch, setComponentSearch] = useState('');
  const [selectedComponentCat, setSelectedComponentCat] = useState<string>('all');
  const [assetSearch, setAssetSearch] = useState('');
  const [activeAssetSubTab, setActiveAssetSubTab] = useState<'icons' | 'shapes' | 'brand' | 'palettes'>('icons');
  const [layerSearch, setLayerSearch] = useState('');

  // Expand states for layer groups
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'page-group': true,
    'desktop-1440': true,
    'mobile-app-view': true,
  });

  // Inline rename state for layer item
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // Pages management state
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [tempPageName, setTempPageName] = useState('');
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  // Feedback notification when item is inserted
  const [insertNotice, setInsertNotice] = useState<string | null>(null);

  const triggerNotice = (name: string) => {
    setInsertNotice(`Added "${name}" to canvas`);
    setTimeout(() => setInsertNotice(null), 2200);
  };

  const toggleExpand = (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const toggleVisibility = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setElements((prev) => {
      const el = prev[elementId];
      if (!el) return prev;
      return {
        ...prev,
        [elementId]: {
          ...el,
          visible: !el.visible,
        },
      };
    });
  };

  const toggleLock = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setElements((prev) => {
      const el = prev[elementId];
      if (!el) return prev;
      return {
        ...prev,
        [elementId]: {
          ...el,
          locked: !el.locked,
        },
      };
    });
  };

  // Filtered components
  const filteredComponents = useMemo(() => {
    return LIBRARY_COMPONENTS.filter((comp) => {
      const matchesCat =
        selectedComponentCat === 'all' || comp.category === selectedComponentCat;
      const matchesSearch =
        !componentSearch ||
        comp.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
        comp.description.toLowerCase().includes(componentSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [componentSearch, selectedComponentCat]);

  // Filtered icons
  const filteredIcons = useMemo(() => {
    return VECTOR_ICONS_LIST.filter((icon) => {
      if (!assetSearch) return true;
      return (
        icon.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        icon.label.toLowerCase().includes(assetSearch.toLowerCase()) ||
        icon.category.toLowerCase().includes(assetSearch.toLowerCase())
      );
    });
  }, [assetSearch]);

  // Target placement helper ensuring elements land correctly in desktop or mobile artboard
  const getTargetPlacement = (width = 200, height = 60) => {
    const selectedEl = elements[selectedElementId];
    const isMobile =
      (selectedEl && (selectedEl.id === 'mobile-app-view' || selectedEl.parentId === 'mobile-app-view')) ||
      (devicePreview === 'mobile' && (!selectedEl || selectedEl.id === 'desktop-1440'));

    if (isMobile) {
      const existing = (Object.values(elements) as CanvasElement[]).filter(
        (e) => e.parentId === 'mobile-app-view'
      ).length;
      return {
        parentId: 'mobile-app-view',
        x: Math.max(16, Math.min(390 - width - 16, 24 + (existing % 3) * 15)),
        y: Math.max(70, Math.min(844 - height - 40, 120 + (existing % 6) * 45)),
      };
    }

    const existing = (Object.values(elements) as CanvasElement[]).filter(
      (e) => e.parentId === 'desktop-1440'
    ).length;
    return {
      parentId: 'desktop-1440',
      x: 320 + (existing % 6) * 30,
      y: 180 + (existing % 5) * 35,
    };
  };

  // Insert a Library Component onto the canvas
  const handleInsertComponent = (comp: LibraryComponentItem) => {
    const timestamp = Date.now();
    const newId = `comp_${comp.id}_${timestamp}`;
    const w = comp.defaultProps.width || 200;
    const h = comp.defaultProps.height || 60;
    const placement = getTargetPlacement(w, h);

    const newElement: CanvasElement = {
      id: newId,
      name: comp.name,
      type: comp.defaultProps.type || 'component',
      x: placement.x,
      y: placement.y,
      width: w,
      height: h,
      rotation: 0,
      borderRadius: comp.defaultProps.borderRadius ?? 8,
      fill: comp.defaultProps.fill || '#1c1b1b',
      fillOpacity: comp.defaultProps.fillOpacity ?? 100,
      stroke: comp.defaultProps.stroke || '#353534',
      strokeWidth: comp.defaultProps.strokeWidth ?? 1,
      shadowBlur: comp.defaultProps.shadowBlur ?? 8,
      shadowY: comp.defaultProps.shadowY ?? 2,
      shadowSpread: comp.defaultProps.shadowSpread ?? 0,
      visible: true,
      locked: false,
      parentId: placement.parentId,
      textContent: comp.defaultProps.textContent,
      subText: comp.defaultProps.subText,
      textColor: comp.defaultProps.textColor,
      fontSize: comp.defaultProps.fontSize,
      variant: comp.defaultProps.variant,
      iconName: comp.defaultProps.iconName,
      backdropBlur: comp.defaultProps.backdropBlur,
      glassEffect: comp.defaultProps.glassEffect,
      materialPreset: comp.defaultProps.materialPreset,
    };
    onInsertElement(newElement);
    triggerNotice(comp.name);
  };

  // Insert a Vector Icon onto the canvas
  const handleInsertIcon = (iconName: string, label: string) => {
    const timestamp = Date.now();
    const newId = `icon_${iconName.toLowerCase()}_${timestamp}`;
    const placement = getTargetPlacement(48, 48);

    const newElement: CanvasElement = {
      id: newId,
      name: `${label} Icon`,
      type: 'icon',
      x: placement.x,
      y: placement.y,
      width: 48,
      height: 48,
      rotation: 0,
      borderRadius: 10,
      fill: '#201f1f',
      fillOpacity: 100,
      stroke: '#9fcaff',
      strokeWidth: 1.5,
      shadowBlur: 10,
      shadowY: 3,
      shadowSpread: 0,
      visible: true,
      locked: false,
      parentId: placement.parentId,
      iconName: iconName,
      textContent: label,
      textColor: '#9fcaff',
    };
    onInsertElement(newElement);
    triggerNotice(label);
  };

  // Insert a Geometric Shape
  const handleInsertShape = (shape: typeof GEOMETRIC_SHAPES_LIST[0]) => {
    const timestamp = Date.now();
    const newId = `shape_${shape.shapeType}_${timestamp}`;
    const placement = getTargetPlacement(shape.width, shape.height);

    const newElement: CanvasElement = {
      id: newId,
      name: shape.name,
      type: 'shape',
      x: placement.x,
      y: placement.y,
      width: shape.width,
      height: shape.height,
      rotation: 0,
      borderRadius: shape.borderRadius,
      fill: shape.fill,
      fillOpacity: 100,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      shadowBlur: 12,
      shadowY: 4,
      shadowSpread: 0,
      visible: true,
      locked: false,
      parentId: placement.parentId,
      variant: shape.shapeType,
    };
    onInsertElement(newElement);
    triggerNotice(shape.name);
  };

  // Insert Brand Asset
  const handleInsertBrandAsset = (asset: typeof BRAND_ASSETS[0]) => {
    const timestamp = Date.now();
    const newId = `brand_${asset.id}_${timestamp}`;
    const placement = getTargetPlacement(asset.width, asset.height);

    const newElement: CanvasElement = {
      id: newId,
      name: asset.name,
      type: 'component',
      x: placement.x,
      y: placement.y,
      width: asset.width,
      height: asset.height,
      rotation: 0,
      borderRadius: 12,
      fill: asset.fill || '#1c1b1b',
      fillOpacity: 100,
      stroke: asset.stroke || '#353534',
      strokeWidth: 1,
      shadowBlur: 14,
      shadowY: 4,
      shadowSpread: 0,
      visible: true,
      locked: false,
      parentId: placement.parentId,
      textContent: asset.textContent,
      textColor: asset.textColor,
      tag: asset.type,
    };
    onInsertElement(newElement);
    triggerNotice(asset.name);
  };

  // Group elements into desktop-children, mobile-children and others
  const desktopChildren = useMemo(() => {
    return (Object.values(elements) as CanvasElement[]).filter(
      (el) => el.parentId === 'desktop-1440' && el.id !== 'desktop-1440'
    );
  }, [elements]);

  const mobileChildren = useMemo(() => {
    return (Object.values(elements) as CanvasElement[]).filter(
      (el) => el.parentId === 'mobile-app-view' && el.id !== 'mobile-app-view'
    );
  }, [elements]);

  // Root or other elements
  const otherElements = useMemo(() => {
    return (Object.values(elements) as CanvasElement[]).filter(
      (el) =>
        el.id !== 'desktop-1440' &&
        el.id !== 'mobile-app-view' &&
        el.parentId !== 'desktop-1440' &&
        el.parentId !== 'mobile-app-view'
    );
  }, [elements]);

  // Element type icon helper
  const renderElementIcon = (el: CanvasElement) => {
    if (el.type === 'button') return <MousePointerClick className="w-3.5 h-3.5 text-[#d2bbff] shrink-0" />;
    if (el.type === 'text') return <Type className="w-3.5 h-3.5 text-[#9fcaff] shrink-0" />;
    if (el.type === 'grid' || el.type === 'card') return <Grid className="w-3.5 h-3.5 text-[#c8c6c5] shrink-0" />;
    if (el.type === 'icon') {
      return (
        <DynamicIcon
          name={el.iconName || 'Sparkles'}
          className="w-3.5 h-3.5 text-[#9fcaff] shrink-0"
        />
      );
    }
    if (el.type === 'input') return <Sliders className="w-3.5 h-3.5 text-[#34d399] shrink-0" />;
    if (el.type === 'badge') return <Shield className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />;
    if (el.type === 'avatar') return <Users className="w-3.5 h-3.5 text-[#d2bbff] shrink-0" />;
    if (el.type === 'shape') return <Circle className="w-3.5 h-3.5 text-[#fb7185] shrink-0" />;
    if (el.type === 'frame') return <Monitor className="w-3.5 h-3.5 text-[#bfc7d5] shrink-0" />;
    return <Square className="w-3.5 h-3.5 text-[#89919e] shrink-0" />;
  };

  return (
    <>
      {/* Primary Rail Navigation (compact 56px / w-14) */}
      <aside
        id="sidebar-primary-nav"
        className="fixed left-0 top-16 bottom-8 w-14 bg-[#181717] border-r border-[#27272a] z-40 flex flex-col items-center py-3 select-none justify-between"
      >
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo / App Switcher */}
          <button
            onClick={() => setCurrentView(currentView === 'editor' ? 'dashboard' : 'editor')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              currentView === 'dashboard'
                ? 'bg-[#9fcaff] text-[#003259]'
                : 'text-[#89919e] hover:text-white hover:bg-[#201f1f]'
            }`}
            title={currentView === 'dashboard' ? 'Back to Editor' : 'Open Files Dashboard'}
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          <div className="w-8 h-[1px] bg-[#2d2d32]" />

          {/* Nav Icons */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            <button
              id="nav-btn-canvas-layers"
              onClick={() => {
                setActiveNavTab('layers');
                if (currentView === 'dashboard') setCurrentView('editor');
                if (isCollapsed && onToggleCollapse) onToggleCollapse();
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center relative transition-all ${
                activeNavTab === 'layers' && currentView === 'editor' && !isCollapsed
                  ? 'bg-[#6001d1] text-[#c9aeff] shadow-sm'
                  : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
              }`}
              title="Canvas Layers Tree"
            >
              <Layers className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 text-[9px] bg-[#131313] text-[#bfc7d5] px-1 rounded-full font-mono">
                {Object.keys(elements).length}
              </span>
            </button>

            <button
              id="nav-btn-components"
              onClick={() => {
                setActiveNavTab('components');
                if (currentView === 'dashboard') setCurrentView('editor');
                if (isCollapsed && onToggleCollapse) onToggleCollapse();
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center relative transition-all ${
                activeNavTab === 'components' && currentView === 'editor' && !isCollapsed
                  ? 'bg-[#6001d1] text-[#c9aeff] shadow-sm'
                  : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
              }`}
              title="Component Library"
            >
              <Component className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 text-[9px] bg-[#0d99ff]/20 text-[#9fcaff] px-1 rounded-full font-mono">
                {LIBRARY_COMPONENTS.length}
              </span>
            </button>

            <button
              id="nav-btn-assets"
              onClick={() => {
                setActiveNavTab('assets');
                if (currentView === 'dashboard') setCurrentView('editor');
                if (isCollapsed && onToggleCollapse) onToggleCollapse();
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center relative transition-all ${
                activeNavTab === 'assets' && currentView === 'editor' && !isCollapsed
                  ? 'bg-[#6001d1] text-[#c9aeff] shadow-sm'
                  : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
              }`}
              title="Asset & Icon Library"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 text-[9px] bg-[#d2bbff]/20 text-[#d2bbff] px-1 rounded-full font-mono">
                48+
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Rail Action: Collapse / Expand Toggle */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#89919e] hover:text-white hover:bg-[#201f1f] transition-colors"
              title={isCollapsed ? 'Expand sidebar drawer' : 'Collapse sidebar drawer'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </aside>

      {/* Secondary Drawer inside Editor View */}
      {currentView === 'editor' && !isCollapsed && (
        <div
          id="panel-layer-tree"
          style={{ left: '56px', width: `${Math.max(180, (width || 300) - 56)}px` }}
          className="fixed top-16 bottom-8 bg-[#1c1b1b] border-r border-[#353534]/60 flex flex-col z-20 select-none overflow-hidden"
        >
          {/* Resizer Handle on the Right Edge of Drawer */}
          {onStartResize && (
            <div
              onMouseDown={onStartResize}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0d99ff] active:bg-[#0d99ff] transition-colors z-30 group"
              title="Drag to resize sidebar"
            >
              <div className="w-0.5 h-6 bg-[#3f4753] group-hover:bg-[#0d99ff] rounded-full mx-auto my-auto absolute top-1/2 -translate-y-1/2 right-0.5" />
            </div>
          )}

          {/* Sub Header / Tabs based on activeNavTab */}
          <div className="flex items-center justify-between border-b border-[#353534] px-3 py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveNavTab('layers')}
                className={`text-xs font-medium pb-0.5 transition-colors ${
                  activeNavTab === 'layers'
                    ? 'text-[#e5e2e1] border-b-2 border-[#9fcaff]'
                    : 'text-[#89919e] hover:text-[#bfc7d5]'
                }`}
              >
                Layers
              </button>
              <button
                onClick={() => setActiveNavTab('components')}
                className={`text-xs font-medium pb-0.5 transition-colors ${
                  activeNavTab === 'components'
                    ? 'text-[#e5e2e1] border-b-2 border-[#9fcaff]'
                    : 'text-[#89919e] hover:text-[#bfc7d5]'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveNavTab('assets')}
                className={`text-xs font-medium pb-0.5 transition-colors ${
                  activeNavTab === 'assets'
                    ? 'text-[#e5e2e1] border-b-2 border-[#9fcaff]'
                    : 'text-[#89919e] hover:text-[#bfc7d5]'
                }`}
              >
                Assets
              </button>
            </div>

            {/* Quick Action Button */}
            {activeNavTab === 'layers' && (
              <button
                onClick={() => {
                  const timestamp = Date.now();
                  const newEl: CanvasElement = {
                    id: `rect_${timestamp}`,
                    name: `Rectangle ${Object.keys(elements).length + 1}`,
                    type: 'rectangle',
                    x: 300,
                    y: 200,
                    width: 140,
                    height: 80,
                    rotation: 0,
                    borderRadius: 8,
                    fill: '#201f1f',
                    fillOpacity: 100,
                    stroke: '#353534',
                    strokeWidth: 1,
                    shadowBlur: 8,
                    shadowY: 2,
                    shadowSpread: 0,
                    visible: true,
                    locked: false,
                    parentId: 'desktop-1440',
                  };
                  onInsertElement(newEl);
                }}
                className="p-1 rounded text-[#9fcaff] hover:bg-[#2a2a2a]"
                title="Add New Rectangle Element"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Insertion Feedback Banner */}
          {insertNotice && (
            <div className="bg-[#0d99ff]/20 border-b border-[#0d99ff]/40 px-3 py-1.5 text-[11px] text-[#9fcaff] flex items-center justify-between animate-fadeIn">
              <span className="truncate">{insertNotice}</span>
              <Check className="w-3 h-3 text-[#9fcaff] shrink-0" />
            </div>
          )}

          {/* TAB 1: CANVAS LAYERS */}
          {activeNavTab === 'layers' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* PAGES MANAGEMENT SECTION */}
              <div className="border-b border-[#2d2d32] pb-1.5 bg-[#141416]/50">
                <div className="flex items-center justify-between px-3 py-2">
                  <button
                    onClick={() => setIsPagesExpanded(!isPagesExpanded)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#bfc7d5] hover:text-white transition-colors"
                  >
                    <span className="text-[#89919e]">
                      {isPagesExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <span className="tracking-wide uppercase text-[10px] text-[#89919e]">Pages</span>
                    <span className="text-[9px] font-mono bg-[#2a2a2a] text-[#89919e] px-1.5 py-0.5 rounded-full">
                      {(pages.length || 1)}
                    </span>
                  </button>

                  <button
                    id="btn-layer-add-page"
                    onClick={() => setIsAddingPage(true)}
                    className="px-2 py-1 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#0d99ff] text-[#9fcaff] hover:text-white rounded flex items-center gap-1 text-[11px] font-medium transition-all shadow-sm"
                    title="Add new page to project"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Page</span>
                  </button>
                </div>

                {/* Pages List */}
                {isPagesExpanded && (
                  <div className="px-2 space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {(pages.length > 0 ? pages : [{ id: activePageId || 'page-1', name: 'Page 1 — Main Canvas' }]).map((p) => {
                      const isActive = p.id === activePageId;
                      const isRenaming = renamingPageId === p.id;

                      return (
                        <div
                          key={p.id}
                          onClick={() => onSelectPage?.(p.id)}
                          onDoubleClick={() => {
                            setRenamingPageId(p.id);
                            setTempPageName(p.name);
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer group transition-all ${
                            isActive
                              ? 'bg-[#0d99ff]/15 text-[#9fcaff] font-medium ring-1 ring-[#0d99ff]/30'
                              : 'text-[#bfc7d5] hover:bg-[#201f1f] hover:text-[#e5e2e1]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? 'text-[#0d99ff]' : 'text-[#89919e]'
                              }`}
                            />
                            {isRenaming ? (
                              <input
                                type="text"
                                value={tempPageName}
                                onChange={(e) => setTempPageName(e.target.value)}
                                onBlur={() => {
                                  if (tempPageName.trim()) {
                                    onRenamePage?.(p.id, tempPageName);
                                  }
                                  setRenamingPageId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (tempPageName.trim()) {
                                      onRenamePage?.(p.id, tempPageName);
                                    }
                                    setRenamingPageId(null);
                                  } else if (e.key === 'Escape') {
                                    setRenamingPageId(null);
                                  }
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#141416] text-[#e5e2e1] px-1.5 py-0.5 rounded text-xs outline-none border border-[#0d99ff] w-full"
                              />
                            ) : (
                              <span className="truncate text-[11px]">{p.name}</span>
                            )}
                          </div>

                          {/* Action buttons on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingPageId(p.id);
                                setTempPageName(p.name);
                              }}
                              className="p-0.5 text-[#89919e] hover:text-[#e5e2e1] rounded"
                              title="Rename Page"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicatePage?.(p.id);
                              }}
                              className="p-0.5 text-[#89919e] hover:text-[#9fcaff] rounded"
                              title="Duplicate Page"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {pages.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePage?.(p.id);
                                }}
                                className="p-0.5 text-[#89919e] hover:text-[#ffb4ab] rounded"
                                title="Delete Page"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Inline Adding Page Input */}
                    {isAddingPage && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#181717] rounded border border-[#0d99ff] mt-1">
                        <FileText className="w-3.5 h-3.5 text-[#0d99ff] shrink-0" />
                        <input
                          type="text"
                          value={newPageName}
                          onChange={(e) => setNewPageName(e.target.value)}
                          placeholder={`Page ${(pages.length || 1) + 1}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onAddPage?.(newPageName.trim() || `Page ${(pages.length || 1) + 1}`);
                              setNewPageName('');
                              setIsAddingPage(false);
                            } else if (e.key === 'Escape') {
                              setIsAddingPage(false);
                              setNewPageName('');
                            }
                          }}
                          className="flex-1 bg-transparent text-xs text-[#e5e2e1] outline-none"
                        />
                        <button
                          onClick={() => {
                            onAddPage?.(newPageName.trim() || `Page ${(pages.length || 1) + 1}`);
                            setNewPageName('');
                            setIsAddingPage(false);
                          }}
                          className="p-0.5 text-[#0d99ff] hover:text-white"
                          title="Create Page"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Layer search */}
              <div className="p-2 border-b border-[#353534]/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#89919e]" />
                  <input
                    type="text"
                    value={layerSearch}
                    onChange={(e) => setLayerSearch(e.target.value)}
                    placeholder="Filter layers..."
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-7 py-1 text-xs text-[#e5e2e1] placeholder-[#89919e] outline-none focus:border-[#0d99ff]"
                  />
                </div>
              </div>

              {/* Layer Tree */}
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 text-xs text-[#e5e2e1]">
                {/* Page Group */}
                <div
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#2a2a2a] group cursor-pointer"
                  onClick={() => toggleExpand('page-group')}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#9fcaff]">
                      {expandedNodes['page-group'] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                    <Globe className="w-4 h-4 text-[#d2bbff] shrink-0" />
                    <span className="font-medium text-xs truncate">Landing Page v2</span>
                  </div>
                </div>

                {expandedNodes['page-group'] && (
                  <div className="pl-3 space-y-0.5 border-l border-[#353534] ml-3">
                    {/* Desktop Frame Item */}
                    <div
                      onClick={() => {
                        setSelectedElementId('desktop-1440');
                        toggleExpand('desktop-1440');
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded group cursor-pointer transition-colors ${
                        selectedElementId === 'desktop-1440'
                          ? 'bg-[#201f1f] text-[#9fcaff] font-medium ring-1 ring-[#0d99ff]/50'
                          : 'hover:bg-[#2a2a2a] text-[#e5e2e1]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[#9fcaff]">
                          {expandedNodes['desktop-1440'] ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <Monitor className="w-3.5 h-3.5 text-[#bfc7d5] shrink-0" />
                        <span className="truncate">Desktop - 1440</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => toggleVisibility('desktop-1440', e)}
                          className="text-[#bfc7d5] hover:text-[#e5e2e1]"
                          title="Toggle Visibility"
                        >
                          {elements['desktop-1440']?.visible !== false ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-[#89919e]" />
                          )}
                        </button>
                        <button
                          onClick={(e) => toggleLock('desktop-1440', e)}
                          className="text-[#bfc7d5] hover:text-[#e5e2e1]"
                          title="Toggle Lock"
                        >
                          {elements['desktop-1440']?.locked ? (
                            <Lock className="w-3 h-3 text-[#f59e0b]" />
                          ) : (
                            <Unlock className="w-3 h-3 text-[#89919e]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Children of Desktop Frame (including dynamically added elements!) */}
                    {expandedNodes['desktop-1440'] && (
                      <div className="pl-3 space-y-0.5 border-l border-[#353534] ml-3">
                        {desktopChildren
                          .filter(
                            (el) =>
                              !layerSearch ||
                              el.name.toLowerCase().includes(layerSearch.toLowerCase())
                          )
                          .map((el) => {
                            const isSelected = selectedElementId === el.id;
                            const isRenaming = renamingId === el.id;

                            return (
                              <div
                                key={el.id}
                                onClick={() => setSelectedElementId(el.id)}
                                onDoubleClick={() => {
                                  setRenamingId(el.id);
                                  setTempName(el.name);
                                }}
                                className={`flex items-center justify-between px-2 py-1.5 rounded group cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-[#0d99ff]/20 text-[#9fcaff] font-medium'
                                    : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                                  {renderElementIcon(el)}
                                  {isRenaming ? (
                                    <input
                                      type="text"
                                      value={tempName}
                                      onChange={(e) => setTempName(e.target.value)}
                                      onBlur={() => {
                                        if (tempName.trim()) {
                                          setElements((prev) => ({
                                            ...prev,
                                            [el.id]: { ...prev[el.id], name: tempName },
                                          }));
                                        }
                                        setRenamingId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          if (tempName.trim()) {
                                            setElements((prev) => ({
                                              ...prev,
                                              [el.id]: { ...prev[el.id], name: tempName },
                                            }));
                                          }
                                          setRenamingId(null);
                                        }
                                      }}
                                      autoFocus
                                      className="bg-[#201f1f] text-[#e5e2e1] px-1 rounded text-xs outline-none border border-[#0d99ff] w-full"
                                    />
                                  ) : (
                                    <span className="truncate text-[11px]">{el.name}</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicateElement(el.id);
                                    }}
                                    className="text-[#89919e] hover:text-[#9fcaff] p-0.5"
                                    title="Duplicate Node"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => toggleVisibility(el.id, e)}
                                    className="text-[#89919e] hover:text-[#e5e2e1] p-0.5"
                                    title="Toggle Visibility"
                                  >
                                    {el.visible !== false ? (
                                      <Eye className="w-3 h-3" />
                                    ) : (
                                      <EyeOff className="w-3 h-3 text-[#f59e0b]" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteElement(el.id);
                                    }}
                                    className="text-[#89919e] hover:text-[#ffb4ab] p-0.5"
                                    title="Delete Element"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Mobile App View Frame */}
                    <div
                      onClick={() => {
                        setSelectedElementId('mobile-app-view');
                        toggleExpand('mobile-app-view');
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded group cursor-pointer transition-colors mt-2 ${
                        selectedElementId === 'mobile-app-view'
                          ? 'bg-[#201f1f] text-[#9fcaff] font-medium'
                          : 'text-[#e5e2e1] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[#9fcaff]">
                          {expandedNodes['mobile-app-view'] ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <Smartphone className="w-3.5 h-3.5 text-[#bfc7d5] shrink-0" />
                        <span className="truncate">Mobile App View</span>
                      </div>
                      <button
                        onClick={(e) => toggleVisibility('mobile-app-view', e)}
                        className="text-[#bfc7d5] hover:text-[#e5e2e1]"
                      >
                        {elements['mobile-app-view']?.visible !== false ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-[#89919e]" />
                        )}
                      </button>
                    </div>

                    {/* Children of Mobile View Frame */}
                    {expandedNodes['mobile-app-view'] && (
                      <div className="pl-3 space-y-0.5 border-l border-[#353534] ml-3 mt-1">
                        {mobileChildren
                          .filter(
                            (el) =>
                              !layerSearch ||
                              el.name.toLowerCase().includes(layerSearch.toLowerCase())
                          )
                          .map((el) => {
                            const isSelected = selectedElementId === el.id;
                            const isRenaming = renamingId === el.id;

                            return (
                              <div
                                key={el.id}
                                onClick={() => setSelectedElementId(el.id)}
                                onDoubleClick={() => {
                                  setRenamingId(el.id);
                                  setTempName(el.name);
                                }}
                                className={`flex items-center justify-between px-2 py-1.5 rounded group cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-[#0d99ff]/20 text-[#9fcaff] font-medium'
                                    : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                                  {renderElementIcon(el)}
                                  {isRenaming ? (
                                    <input
                                      type="text"
                                      value={tempName}
                                      onChange={(e) => setTempName(e.target.value)}
                                      onBlur={() => {
                                        if (tempName.trim()) {
                                          setElements((prev) => ({
                                            ...prev,
                                            [el.id]: { ...prev[el.id], name: tempName },
                                          }));
                                        }
                                        setRenamingId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          if (tempName.trim()) {
                                            setElements((prev) => ({
                                              ...prev,
                                              [el.id]: { ...prev[el.id], name: tempName },
                                            }));
                                          }
                                          setRenamingId(null);
                                        }
                                      }}
                                      autoFocus
                                      className="bg-[#201f1f] text-[#e5e2e1] px-1 rounded text-xs outline-none border border-[#0d99ff] w-full"
                                    />
                                  ) : (
                                    <span className="truncate text-[11px]">{el.name}</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicateElement(el.id);
                                    }}
                                    className="text-[#89919e] hover:text-[#9fcaff] p-0.5"
                                    title="Duplicate Node"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => toggleVisibility(el.id, e)}
                                    className="text-[#89919e] hover:text-[#e5e2e1] p-0.5"
                                    title="Toggle Visibility"
                                  >
                                    {el.visible !== false ? (
                                      <Eye className="w-3 h-3" />
                                    ) : (
                                      <EyeOff className="w-3 h-3 text-[#f59e0b]" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteElement(el.id);
                                    }}
                                    className="text-[#89919e] hover:text-[#ffb4ab] p-0.5"
                                    title="Delete Element"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Free floating elements outside desktop frame */}
                    {otherElements.length > 0 && (
                      <div className="pt-2 border-t border-[#353534]/40 mt-2">
                        <span className="text-[10px] uppercase font-semibold text-[#89919e] px-2 block mb-1">
                          Other Canvas Nodes
                        </span>
                        {otherElements.map((el) => (
                          <div
                            key={el.id}
                            onClick={() => setSelectedElementId(el.id)}
                            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                              selectedElementId === el.id
                                ? 'bg-[#0d99ff]/20 text-[#9fcaff]'
                                : 'text-[#bfc7d5] hover:bg-[#2a2a2a]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {renderElementIcon(el)}
                              <span className="text-[11px] truncate">{el.name}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteElement(el.id);
                              }}
                              className="text-[#89919e] hover:text-[#ffb4ab]"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMPONENT LIBRARY */}
          {activeNavTab === 'components' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search & Category filter */}
              <div className="p-3 border-b border-[#353534]/50 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#89919e]" />
                  <input
                    type="text"
                    value={componentSearch}
                    onChange={(e) => setComponentSearch(e.target.value)}
                    placeholder="Search UI components..."
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-8 py-1.5 text-xs text-[#e5e2e1] placeholder-[#89919e] outline-none focus:border-[#0d99ff]"
                  />
                </div>

                {/* Categories horizontal scroll pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {COMPONENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedComponentCat(cat.id)}
                      className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-colors ${
                        selectedComponentCat === cat.id
                          ? 'bg-[#0d99ff] text-[#002f55] font-semibold'
                          : 'bg-[#201f1f] text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Component Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                {/* Quick Design Systems & Kits Importer */}
                <div className="p-3 bg-gradient-to-br from-[#201f1f] to-[#181818] border border-[#353534] rounded-xl space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#e5e2e1] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9fcaff]" /> Design Systems & Materials
                    </span>
                    <span className="text-[9px] bg-[#0d99ff]/20 text-[#9fcaff] px-1.5 py-0.5 rounded font-mono font-bold">KITS</span>
                  </div>
                  <p className="text-[10px] text-[#89919e] leading-relaxed">
                    Import full design systems with dedicated artboard frames, design tokens, buttons, inputs, and system navigation.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      onClick={() => onImportMaterialKit?.()}
                      className="px-2 py-1.5 rounded-lg bg-[#2b2930] hover:bg-[#381e72]/60 border border-[#d0bcff]/40 text-[10px] text-[#d0bcff] font-medium transition-all flex items-center justify-center gap-1 shadow-sm"
                      title="Import Google Material 3 (M3) System Artboard & 21 Components"
                    >
                      <span>✦ M3 Material</span>
                    </button>
                    <button
                      onClick={() => onImportIOSKit?.()}
                      className="px-2 py-1.5 rounded-lg bg-[#1c1c1e] hover:bg-[#007aff]/30 border border-[#007aff]/40 text-[10px] text-[#9fcaff] font-medium transition-all flex items-center justify-center gap-1 shadow-sm"
                      title="Import Apple iOS 18 (HIG) System Artboard & 18 Components"
                    >
                      <span>✦ iOS Material</span>
                    </button>
                  </div>
                  <button
                    onClick={() => onImportAllMaterials?.()}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#d0bcff]/20 to-[#007aff]/20 hover:from-[#d0bcff]/30 hover:to-[#007aff]/30 border border-white/10 text-[11px] text-white font-semibold transition-all flex items-center justify-center gap-1.5 shadow"
                    title="Import Both Material 3 and iOS 18 Design Systems side-by-side"
                  >
                    <span>Import All Materials (M3 + iOS)</span>
                  </button>
                </div>

                <div className="text-[10px] text-[#89919e] flex items-center justify-between pt-1">
                  <span>{filteredComponents.length} components available</span>
                  <span>Click or drag to insert</span>
                </div>

                {filteredComponents.map((comp) => {
                  return (
                    <div
                      key={comp.id}
                      draggable
                      onDragStart={(e) => {
                        const payload = {
                          ...comp.defaultProps,
                          name: comp.name,
                          type: comp.defaultProps.type || 'component',
                          width: comp.defaultProps.width || 200,
                          height: comp.defaultProps.height || 60,
                        };
                        e.dataTransfer.setData('application/zlab-element', JSON.stringify(payload));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleInsertComponent(comp)}
                      className="p-3 bg-[#201f1f] border border-[#353534] rounded-xl hover:border-[#9fcaff] hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group flex flex-col gap-2"
                    >
                      {/* Component preview box */}
                      <div className="h-16 bg-[#131313] rounded-lg border border-[#2a2a2a] flex items-center justify-center p-2 overflow-hidden relative group-hover:bg-[#181818] transition-colors">
                        {/* Interactive miniature preview based on category */}
                        {comp.category === 'buttons' && (
                          <div
                            style={{
                              backgroundColor: comp.defaultProps.fill,
                              color: comp.defaultProps.textColor,
                              borderRadius: `${comp.defaultProps.borderRadius ?? 8}px`,
                              border:
                                comp.defaultProps.stroke && comp.defaultProps.stroke !== 'none'
                                  ? `1px solid ${comp.defaultProps.stroke}`
                                  : 'none',
                            }}
                            className="px-3 py-1.5 text-[11px] font-medium shadow flex items-center gap-1"
                          >
                            <span>{comp.defaultProps.textContent || 'Button'}</span>
                          </div>
                        )}

                        {comp.category === 'inputs' && (
                          <div className="w-full bg-[#1c1b1b] border border-[#353534] rounded px-2.5 py-1.5 flex items-center justify-between text-[10px] text-[#89919e]">
                            <span className="truncate">{comp.defaultProps.textContent}</span>
                            <Sliders className="w-3 h-3 text-[#9fcaff]" />
                          </div>
                        )}

                        {comp.category === 'cards' && (
                          <div className="w-full bg-[#1c1b1b] border border-[#2a2a2a] rounded-md p-2 flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-[#e5e2e1] truncate">
                                {comp.defaultProps.textContent}
                              </div>
                              <div className="text-[9px] text-[#89919e] truncate">
                                {comp.defaultProps.subText}
                              </div>
                            </div>
                            <Zap className="w-3.5 h-3.5 text-[#d2bbff] shrink-0 ml-2" />
                          </div>
                        )}

                        {comp.category === 'badges' && (
                          <div
                            style={{
                              backgroundColor: comp.defaultProps.fill,
                              color: comp.defaultProps.textColor,
                              borderRadius: `${comp.defaultProps.borderRadius ?? 999}px`,
                              border: `1px solid ${comp.defaultProps.stroke}`,
                            }}
                            className="px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <span>{comp.defaultProps.textContent}</span>
                          </div>
                        )}

                        {comp.category === 'nav' && (
                          <div className="w-full bg-[#1c1b1b] border border-[#353534] rounded px-2 py-1 flex items-center justify-between text-[10px] text-[#bfc7d5]">
                            <span className="font-semibold text-[#9fcaff]">ZLab</span>
                            <span className="text-[9px] text-[#89919e]">Explore →</span>
                          </div>
                        )}

                        {comp.category === 'media' && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[#bfc7d5]">
                            <Users className="w-4 h-4 text-[#9fcaff]" />
                            <span>{comp.defaultProps.textContent}</span>
                          </div>
                        )}

                        {comp.category === 'material3' && (
                          <div
                            style={{
                              backgroundColor: comp.defaultProps.fill,
                              color: comp.defaultProps.textColor,
                              borderRadius: `${comp.defaultProps.borderRadius ?? 16}px`,
                              border: comp.defaultProps.stroke && comp.defaultProps.stroke !== 'none'
                                ? `1px solid ${comp.defaultProps.stroke}`
                                : 'none',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                            className="px-3 py-1.5 text-[11px] font-medium flex items-center gap-1.5"
                          >
                            <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                            <span>{comp.defaultProps.textContent || comp.name}</span>
                          </div>
                        )}

                        {comp.category === 'ios' && (
                          <div
                            style={{
                              backgroundColor: comp.defaultProps.fill,
                              color: comp.defaultProps.textColor || '#ffffff',
                              borderRadius: `${comp.defaultProps.borderRadius ?? 14}px`,
                              border: comp.defaultProps.stroke && comp.defaultProps.stroke !== 'none'
                                ? `1px solid ${comp.defaultProps.stroke}`
                                : 'none',
                              backdropFilter: comp.defaultProps.backdropBlur ? 'blur(12px)' : undefined,
                              WebkitBackdropFilter: comp.defaultProps.backdropBlur ? 'blur(12px)' : undefined,
                            }}
                            className="px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{comp.defaultProps.textContent || comp.name}</span>
                          </div>
                        )}

                        {comp.category === 'glass' && (
                          <div
                            style={{
                              backgroundColor: comp.defaultProps.fill,
                              color: comp.defaultProps.textColor || '#ffffff',
                              borderRadius: `${comp.defaultProps.borderRadius ?? 16}px`,
                              border: comp.defaultProps.stroke && comp.defaultProps.stroke !== 'none'
                                ? `1px solid ${comp.defaultProps.stroke}`
                                : '1px solid rgba(255,255,255,0.2)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                              backdropFilter: 'blur(16px)',
                              WebkitBackdropFilter: 'blur(16px)',
                            }}
                            className="px-3 py-1.5 text-[11px] font-medium flex items-center gap-1.5 relative overflow-hidden"
                          >
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                            <Sparkles className="w-3 h-3 text-[#9fcaff] shrink-0" />
                            <span>{comp.defaultProps.textContent || comp.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Info & insert trigger */}
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-[#e5e2e1] group-hover:text-[#9fcaff] transition-colors truncate">
                              {comp.name}
                            </span>
                            {comp.category === 'material3' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d0bcff]/20 text-[#d0bcff] font-mono shrink-0">
                                M3
                              </span>
                            )}
                            {comp.category === 'ios' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#007aff]/20 text-[#9fcaff] font-mono shrink-0">
                                iOS
                              </span>
                            )}
                            {comp.category === 'glass' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0d99ff]/20 text-[#0d99ff] font-mono shrink-0">
                                Glass
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#89919e] line-clamp-1">
                            {comp.description}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertComponent(comp);
                          }}
                          className="bg-[#2a2a2a] text-[#bfc7d5] hover:bg-[#0d99ff] hover:text-[#002f55] p-1.5 rounded text-[10px] flex items-center gap-1 transition-all"
                          title="Insert into canvas"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ASSET LIBRARY */}
          {activeNavTab === 'assets' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Asset Sub-Tabs */}
              <div className="flex items-center border-b border-[#353534] px-2 py-1.5 gap-1 bg-[#181717]">
                <button
                  onClick={() => setActiveAssetSubTab('icons')}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    activeAssetSubTab === 'icons'
                      ? 'bg-[#2a2a2a] text-[#9fcaff] font-medium'
                      : 'text-[#89919e] hover:text-[#e5e2e1]'
                  }`}
                >
                  Icons
                </button>
                <button
                  onClick={() => setActiveAssetSubTab('shapes')}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    activeAssetSubTab === 'shapes'
                      ? 'bg-[#2a2a2a] text-[#9fcaff] font-medium'
                      : 'text-[#89919e] hover:text-[#e5e2e1]'
                  }`}
                >
                  Shapes
                </button>
                <button
                  onClick={() => setActiveAssetSubTab('brand')}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    activeAssetSubTab === 'brand'
                      ? 'bg-[#2a2a2a] text-[#9fcaff] font-medium'
                      : 'text-[#89919e] hover:text-[#e5e2e1]'
                  }`}
                >
                  Brand
                </button>
                <button
                  onClick={() => setActiveAssetSubTab('palettes')}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    activeAssetSubTab === 'palettes'
                      ? 'bg-[#2a2a2a] text-[#9fcaff] font-medium'
                      : 'text-[#89919e] hover:text-[#e5e2e1]'
                  }`}
                >
                  Colors
                </button>
              </div>

              {/* Asset Search */}
              <div className="p-2 border-b border-[#353534]/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#89919e]" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Search assets..."
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-7 py-1 text-xs text-[#e5e2e1] placeholder-[#89919e] outline-none focus:border-[#0d99ff]"
                  />
                </div>
              </div>

              {/* Sub-view: ICONS */}
              {activeAssetSubTab === 'icons' && (
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="text-[10px] text-[#89919e] mb-2 flex items-center justify-between">
                    <span>{filteredIcons.length} vector icons</span>
                    <span>Click to add</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {filteredIcons.map((icon) => (
                      <button
                        key={icon.name}
                        draggable
                        onDragStart={(e) => {
                          const payload = {
                            name: `${icon.label} Icon`,
                            type: 'icon',
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            fill: '#201f1f',
                            fillOpacity: 100,
                            stroke: '#9fcaff',
                            strokeWidth: 1.5,
                            shadowBlur: 10,
                            shadowY: 3,
                            shadowSpread: 0,
                            iconName: icon.name,
                            textContent: icon.label,
                            textColor: '#9fcaff',
                          };
                          e.dataTransfer.setData('application/zlab-element', JSON.stringify(payload));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handleInsertIcon(icon.name, icon.label)}
                        className="p-2.5 bg-[#201f1f] border border-[#353534] rounded-lg hover:border-[#9fcaff] hover:bg-[#2a2a2a] flex flex-col items-center justify-center text-center group transition-all cursor-grab active:cursor-grabbing"
                        title={`Insert or drag ${icon.label} Icon`}
                      >
                        <DynamicIcon
                          name={icon.name}
                          className="w-4 h-4 text-[#bfc7d5] group-hover:text-[#9fcaff] group-hover:scale-110 transition-transform mb-1"
                        />
                        <span className="text-[9px] text-[#89919e] group-hover:text-[#e5e2e1] truncate w-full">
                          {icon.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-view: GEOMETRIC SHAPES */}
              {activeAssetSubTab === 'shapes' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="text-[10px] text-[#89919e]">
                    Vector primitive geometric shapes with editable bounds
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {GEOMETRIC_SHAPES_LIST.map((shape) => (
                      <div
                        key={shape.id}
                        onClick={() => handleInsertShape(shape)}
                        className="p-3 bg-[#201f1f] border border-[#353534] rounded-xl hover:border-[#9fcaff] cursor-pointer flex flex-col items-center justify-center text-center group transition-all"
                      >
                        <div className="h-14 w-full flex items-center justify-center mb-1.5">
                          {shape.shapeType === 'circle' && (
                            <div className="w-10 h-10 rounded-full bg-[#6001d1] border border-[#d2bbff]" />
                          )}
                          {shape.shapeType === 'pill' && (
                            <div className="w-16 h-8 rounded-full bg-[#0d99ff] border border-[#9fcaff]" />
                          )}
                          {shape.shapeType === 'hexagon' && (
                            <div className="w-10 h-10 bg-[#1c1b1b] border-2 border-[#c9aeff] rotate-45 rounded" />
                          )}
                          {shape.shapeType === 'diamond' && (
                            <div className="w-8 h-8 bg-[#2a2a2a] border-2 border-[#0d99ff] rotate-45" />
                          )}
                          {shape.shapeType === 'star' && (
                            <Sparkles className="w-9 h-9 text-[#f59e0b]" />
                          )}
                        </div>
                        <span className="text-[11px] text-[#e5e2e1] font-medium group-hover:text-[#9fcaff]">
                          {shape.name}
                        </span>
                        <span className="text-[9px] text-[#89919e]">
                          {shape.width} × {shape.height}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-view: BRAND ASSETS */}
              {activeAssetSubTab === 'brand' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="text-[10px] text-[#89919e]">
                    Official brand signatures & badges
                  </div>

                  {BRAND_ASSETS.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleInsertBrandAsset(asset)}
                      className="p-3 bg-[#201f1f] border border-[#353534] rounded-xl hover:border-[#9fcaff] cursor-pointer flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {asset.type === 'logo' ? (
                          <ZLabLogo size="sm" showText={false} />
                        ) : asset.type === 'monogram' ? (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0d99ff] to-[#005299] flex items-center justify-center font-black text-white text-[11px] shadow border border-[#9fcaff]/30">
                            ZL
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-[#1c1b1b] border border-[#0d99ff]/50 flex items-center justify-center text-xs text-[#0d99ff]">
                            ⚡
                          </div>
                        )}
                        <div>
                          <div className="text-[11px] text-[#e5e2e1] font-medium group-hover:text-[#9fcaff]">
                            {asset.name}
                          </div>
                          <div className="text-[9px] text-[#89919e]">
                            Vector Brand Node • {asset.width} × {asset.height}
                          </div>
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-[#89919e] group-hover:text-[#9fcaff]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-view: COLOR PALETTES */}
              {activeAssetSubTab === 'palettes' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="text-[10px] text-[#89919e]">
                    Click any swatch to apply to active selection or insert swatch token
                  </div>

                  {COLOR_PALETTES.map((palette) => (
                    <div
                      key={palette.name}
                      className="p-2.5 bg-[#201f1f] border border-[#353534] rounded-xl space-y-2"
                    >
                      <span className="text-[11px] text-[#e5e2e1] font-medium block">
                        {palette.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {palette.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => onApplyColor(color)}
                            style={{ backgroundColor: color }}
                            className="w-8 h-8 rounded-md border border-white/10 hover:scale-110 transition-transform shadow"
                            title={`Apply ${color} to selection`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
