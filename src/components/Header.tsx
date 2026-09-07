import React, { useState, useRef, useEffect } from 'react';
import {
  Undo,
  Redo,
  ZoomIn,
  Smartphone,
  Monitor,
  Share2,
  User,
  Check,
  Download,
  Settings as SettingsIcon,
  FolderOpen,
  Plus,
  Copy,
  Layers,
  Sparkles,
  Eye,
  Play,
} from 'lucide-react';
import { AppView } from '../types';
import { ZLabLogo } from './ZLabLogo';

interface HeaderProps {
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
  onImportMaterialKit?: () => void;
  onImportIOSKit?: () => void;
  onImportAllMaterials?: () => void;
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
  onImportMaterialKit,
  onImportIOSKit,
  onImportAllMaterials,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);
  const [exportNotice, setExportNotice] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (zoomRef.current && !zoomRef.current.contains(e.target as Node)) {
        setZoomMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = () => {
    onExport();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 right-0 h-16 bg-[#131313]/90 backdrop-blur-xl z-50 flex items-center justify-between px-6 border-b border-[#201f1f]"
    >
      {/* Left branding & menu */}
      <div className="flex items-center gap-4">
        <button
          id="btn-nav-logo"
          onClick={() => setCurrentView(currentView === 'editor' ? 'dashboard' : 'editor')}
          className="flex items-center gap-2 group text-left focus:outline-none"
          title="Toggle between Editor & Dashboard"
        >
          <ZLabLogo size="md" showText={false} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-[#e5e2e1] group-hover:text-[#9fcaff] transition-colors flex items-center gap-1.5">
              <span>ZLab</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0d99ff]/15 text-[#9fcaff] border border-[#0d99ff]/30 font-semibold uppercase tracking-wider">
                Studio
              </span>
            </span>
            {currentView === 'editor' && (
              isEditingTitle ? (
                <input
                  id="input-project-title"
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => {
                    setProjectTitle(tempTitle || 'Untitled Design v2.4');
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setProjectTitle(tempTitle || 'Untitled Design v2.4');
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="text-[11px] bg-[#2a2a2a] text-[#bfc7d5] px-1 py-0.5 rounded outline-none border border-[#0d99ff]"
                />
              ) : (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempTitle(projectTitle);
                    setIsEditingTitle(true);
                  }}
                  className="text-[11px] text-[#bfc7d5] hover:text-[#e5e2e1] cursor-pointer"
                  title="Click to rename design"
                >
                  {projectTitle}
                </span>
              )
            )}
          </div>
        </button>

        {/* Menu Bar Dropdowns */}
        {currentView === 'editor' && (
        <nav ref={menuRef} className="hidden lg:flex items-center gap-1 ml-6 relative">
          {/* File Menu */}
          <div className="relative">
            <button
              id="menu-btn-file"
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors ${
                activeMenu === 'file'
                  ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5 text-[#9fcaff]" /> All Files / Dashboard
                  </span>
                  <span className="text-[10px] text-[#89919e]">⌘O</span>
                </button>
                <button
                  onClick={() => {
                    setProjectTitle('Untitled Design v' + (Math.random() * 10).toFixed(1));
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-[#9fcaff]" /> New Design
                  </span>
                  <span className="text-[10px] text-[#89919e]">⌘N</span>
                </button>
                <div className="h-[1px] bg-[#353534] my-1" />
                <button
                  onClick={() => {
                    onImportAllMaterials?.();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a] text-[#9fcaff]"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Import All Materials (M3 + iOS)
                  </span>
                  <span className="text-[10px] text-[#9fcaff]">Kits</span>
                </button>
                <div className="h-[1px] bg-[#353534] my-1" />
                <button
                  onClick={() => {
                    handleExportClick();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[#9fcaff]" /> Export Artwork (PNG)
                  </span>
                  <span className="text-[10px] text-[#89919e]">⇧⌘E</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings('general');
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span className="flex items-center gap-2">
                    <SettingsIcon className="w-3.5 h-3.5 text-[#9fcaff]" /> Preferences & Settings
                  </span>
                  <span className="text-[10px] text-[#89919e]">⌘,</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              id="menu-btn-edit"
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors ${
                activeMenu === 'edit'
                  ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]">
                <button
                  onClick={() => {
                    onUndo();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Undo</span>
                  <span className="text-[10px] text-[#89919e]">⌘Z</span>
                </button>
                <button
                  onClick={() => {
                    onRedo();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Redo</span>
                  <span className="text-[10px] text-[#89919e]">⇧⌘Z</span>
                </button>
                <div className="h-[1px] bg-[#353534] my-1" />
                <button
                  onClick={() => setActiveMenu(null)}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Copy Properties</span>
                  <span className="text-[10px] text-[#89919e]">⌥⌘C</span>
                </button>
                <button
                  onClick={() => setActiveMenu(null)}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Paste Properties</span>
                  <span className="text-[10px] text-[#89919e]">⌥⌘V</span>
                </button>
              </div>
            )}
          </div>

          {/* Design Kits Menu */}
          <div className="relative">
            <button
              id="menu-btn-kits"
              onClick={() => setActiveMenu(activeMenu === 'kits' ? null : 'kits')}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
                activeMenu === 'kits'
                  ? 'bg-[#0d99ff] text-[#002f55] font-semibold'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9fcaff]" />
              <span>Design Kits</span>
            </button>
            {activeMenu === 'kits' && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#89919e] border-b border-[#353534]/60">
                  Import Design Systems
                </div>
                <button
                  onClick={() => {
                    onImportMaterialKit?.();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#2a2a2a] group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d0bcff]" />
                    <span>Google Material 3 (M3) Kit</span>
                  </span>
                  <span className="text-[10px] text-[#89919e]">21 items</span>
                </button>
                <button
                  onClick={() => {
                    onImportIOSKit?.();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#2a2a2a] group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#007aff]" />
                    <span>Apple iOS 18 (HIG) Material Kit</span>
                  </span>
                  <span className="text-[10px] text-[#89919e]">18 items</span>
                </button>
                <div className="h-[1px] bg-[#353534] my-1" />
                <button
                  onClick={() => {
                    onImportAllMaterials?.();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#2a2a2a] font-medium text-[#9fcaff]"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#9fcaff]" />
                    <span>Import All Materials (M3 + iOS)</span>
                  </span>
                  <span className="text-[10px] text-[#9fcaff]">Both Kits</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              id="menu-btn-view"
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors ${
                activeMenu === 'view'
                  ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
              }`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]">
                <button
                  onClick={() => {
                    setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Zoom In</span>
                  <span className="text-[10px] text-[#89919e]">⌘+</span>
                </button>
                <button
                  onClick={() => {
                    setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))));
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Zoom Out</span>
                  <span className="text-[10px] text-[#89919e]">⌘-</span>
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Zoom to 100%</span>
                  <span className="text-[10px] text-[#89919e]">⌘0</span>
                </button>
                <div className="h-[1px] bg-[#353534] my-1" />
                <button
                  onClick={() => {
                    setDevicePreview(devicePreview === 'desktop' ? 'mobile' : 'desktop');
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Toggle Device Preview</span>
                  <span className="text-[10px] text-[#89919e]">⌘D</span>
                </button>
              </div>
            )}
          </div>

          {/* Object Menu */}
          <div className="relative">
            <button
              id="menu-btn-object"
              onClick={() => setActiveMenu(activeMenu === 'object' ? null : 'object')}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors ${
                activeMenu === 'object'
                  ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
              }`}
            >
              Object
            </button>
            {activeMenu === 'object' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]">
                <button
                  onClick={() => setActiveMenu(null)}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Group Selection</span>
                  <span className="text-[10px] text-[#89919e]">⌘G</span>
                </button>
                <button
                  onClick={() => setActiveMenu(null)}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Ungroup</span>
                  <span className="text-[10px] text-[#89919e]">⇧⌘G</span>
                </button>
                <div className="h-[1px] bg-[#353534] my-1" />
                <button
                  onClick={() => setActiveMenu(null)}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
                >
                  <span>Create Component</span>
                  <span className="text-[10px] text-[#89919e]">⌥⌘K</span>
                </button>
              </div>
            )}
          </div>

          {/* Plugins Menu */}
          <div className="relative">
            <button
              id="menu-btn-plugins"
              onClick={() => setActiveMenu(activeMenu === 'plugins' ? null : 'plugins')}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors ${
                activeMenu === 'plugins'
                  ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
              }`}
            >
              Plugins
            </button>
            {activeMenu === 'plugins' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]">
                <button
                  onClick={() => {
                    onOpenSettings('plugins');
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d2bbff]" /> WebGPU Renderer 2.4
                </button>
                <button
                  onClick={() => {
                    onOpenSettings('plugins');
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a]"
                >
                  <Layers className="w-3.5 h-3.5 text-[#9fcaff]" /> Color Token Synchronizer
                </button>
                <div className="h-[1px] bg-[#353534] my-1" />
                <button
                  onClick={() => {
                    onOpenSettings('plugins');
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between text-[#9fcaff] hover:bg-[#2a2a2a]"
                >
                  <span>Manage Plugins...</span>
                </button>
              </div>
            )}
          </div>
        </nav>
        )}
      </div>

      {/* Right actions: Undo, Redo, Zoom, Device Preview, Export, User */}
      <div className="flex items-center gap-3">
        {currentView === 'editor' && (
        <>
        {/* Undo/Redo/Zoom/Device pill bar */}
        <div className="flex items-center gap-1 bg-[#201f1f] px-2 py-1 rounded-lg border border-[#353534]/50">
          <button
            id="btn-header-undo"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
                : 'text-[#89919e]/40 cursor-not-allowed'
            }`}
            title="Undo (⌘Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            id="btn-header-redo"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
                : 'text-[#89919e]/40 cursor-not-allowed'
            }`}
            title="Redo (⇧⌘Z)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-[#3f4753] mx-1" />

          {/* Zoom control */}
          <div ref={zoomRef} className="relative">
            <button
              id="btn-header-zoom"
              onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
              className="p-1 px-1.5 text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors flex items-center gap-1 text-xs"
              title="Zoom Level"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">{Math.round(zoom * 100)}%</span>
            </button>
            {zoomMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-xl py-1 z-50 text-xs">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setZoom(lvl);
                      setZoomMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between text-[#e5e2e1] hover:bg-[#2a2a2a]"
                  >
                    <span>{Math.round(lvl * 100)}%</span>
                    {Math.abs(zoom - lvl) < 0.05 && <Check className="w-3.5 h-3.5 text-[#9fcaff]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#3f4753] mx-1" />

          {/* Device Change Control (Desktop / Mobile) */}
          <div
            id="control-device-switcher"
            className="flex items-center bg-[#141416] p-0.5 rounded-lg border border-[#353534]"
            title="Change Canvas Viewport"
          >
            <button
              id="btn-change-control-desktop"
              onClick={() => setDevicePreview('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                devicePreview === 'desktop'
                  ? 'bg-[#0d99ff] text-[#002f55] font-semibold shadow-sm'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
              }`}
              title="Desktop Artboard (1440 × 900)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              id="btn-change-control-mobile"
              onClick={() => setDevicePreview('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                devicePreview === 'mobile'
                  ? 'bg-[#0d99ff] text-[#002f55] font-semibold shadow-sm'
                  : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
              }`}
              title="Mobile Artboard (390 × 844)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Play Prototype Button */}
        {onOpenPrototype && (
          <button
            id="btn-header-play-proto"
            onClick={onOpenPrototype}
            className="bg-[#201f1f] hover:bg-[#2a2a2a] text-[#34d399] border border-[#353534] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            title="Play Interactive Prototype"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Prototype</span>
          </button>
        )}

        {/* Export Button */}
        <button
          id="btn-header-export"
          onClick={handleExportClick}
          className="bg-[#9fcaff] text-[#003259] px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-[#0d99ff] hover:text-[#002f55] transition-colors shadow-sm"
          title="Export Artwork"
        >
          <Share2 className="w-4 h-4" />
          <span>{exportNotice ? 'Exported!' : 'Export'}</span>
        </button>
        </>
        )}

        {/* User Profile Avatar */}
        <button
          id="btn-header-user-avatar"
          onClick={() => onOpenSettings('account')}
          className="w-8 h-8 rounded-full bg-[#9fcaff] text-[#003259] flex items-center justify-center font-bold text-xs ring-2 ring-[#131313] hover:ring-[#0d99ff] transition-all"
          title="User Account & Settings"
        >
          AC
        </button>
      </div>
    </header>
  );
};
