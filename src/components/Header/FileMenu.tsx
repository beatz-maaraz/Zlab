import React, { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Sparkles,
  Download,
  Settings as SettingsIcon,
  Keyboard,
  Layers,
  Copy,
  FolderPlus,
  FolderMinus,
} from 'lucide-react';

interface FileMenuProps {
  onGoToDashboard: () => void;
  onNewDesign: () => void;
  onOpenSettings: (tab?: string) => void;
  onExport: () => void;
  onOpenShortcuts?: () => void;
  onImportMaterialKit?: () => void;
  onImportIOSKit?: () => void;
  onImportAllMaterials?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onGroup?: () => void;
  onUngroup?: () => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  devicePreview: 'desktop' | 'mobile';
  setDevicePreview: (mode: 'desktop' | 'mobile') => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({
  onGoToDashboard,
  onNewDesign,
  onOpenSettings,
  onExport,
  onOpenShortcuts,
  onImportMaterialKit,
  onImportIOSKit,
  onImportAllMaterials,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onGroup,
  onUngroup,
  zoom,
  setZoom,
  devicePreview,
  setDevicePreview,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
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
          <div className="absolute left-0 top-full mt-1 w-56 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]">
            <button
              onClick={() => {
                onGoToDashboard();
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
                onNewDesign();
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-[#9fcaff]" /> New Design Project
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
                <Sparkles className="w-3.5 h-3.5" /> Import Design Kits (M3 + iOS)
              </span>
              <span className="text-[10px] text-[#9fcaff]">Kits</span>
            </button>
            <div className="h-[1px] bg-[#353534] my-1" />
            <button
              onClick={() => {
                onExport();
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#9fcaff]" /> Export Artwork
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
              disabled={!canUndo}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between ${
                canUndo ? 'hover:bg-[#2a2a2a]' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span>Undo</span>
              <span className="text-[10px] text-[#89919e]">⌘Z</span>
            </button>
            <button
              onClick={() => {
                onRedo();
                setActiveMenu(null);
              }}
              disabled={!canRedo}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between ${
                canRedo ? 'hover:bg-[#2a2a2a]' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span>Redo</span>
              <span className="text-[10px] text-[#89919e]">⇧⌘Z</span>
            </button>
            <div className="h-[1px] bg-[#353534] my-1" />
            <button
              onClick={() => {
                onGroup?.();
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
            >
              <span className="flex items-center gap-2">
                <FolderPlus className="w-3.5 h-3.5 text-[#9fcaff]" /> Group Selection
              </span>
              <span className="text-[10px] text-[#89919e]">⌘G</span>
            </button>
            <button
              onClick={() => {
                onUngroup?.();
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a]"
            >
              <span className="flex items-center gap-2">
                <FolderMinus className="w-3.5 h-3.5 text-[#f59e0b]" /> Ungroup Selection
              </span>
              <span className="text-[10px] text-[#89919e]">⇧⌘G</span>
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
                <span>Apple iOS 18 (HIG) Kit</span>
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
                <span>Import Both Kits (M3 + iOS)</span>
              </span>
              <span className="text-[10px] text-[#9fcaff]">Both</span>
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
              <span>Toggle Desktop/Mobile</span>
              <span className="text-[10px] text-[#89919e]">1 / 2</span>
            </button>
            <div className="h-[1px] bg-[#353534] my-1" />
            <button
              onClick={() => {
                if (onOpenShortcuts) onOpenShortcuts();
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a] text-[#9fcaff]"
            >
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" />
                Shortcuts Cheat-Sheet
              </span>
              <span className="text-[10px] text-[#89919e]">⌘/</span>
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
              <Sparkles className="w-3.5 h-3.5 text-[#d2bbff]" /> WebGPU Renderer
            </button>
            <button
              onClick={() => {
                onOpenSettings('plugins');
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a]"
            >
              <Layers className="w-3.5 h-3.5 text-[#9fcaff]" /> Color Token Sync
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
  );
};
