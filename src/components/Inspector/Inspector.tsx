import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Pin,
  PinOff,
  Copy,
  Trash2,
  Sliders,
  Play,
  Code2,
} from 'lucide-react';
import { CanvasElement, InspectorTab } from '../../types';
import { PositionSection } from './PositionSection';
import { TypographySection } from './TypographySection';
import { FillSection } from './FillSection';
import { BorderSection } from './BorderSection';
import { ShadowSection } from './ShadowSection';
import { LayoutSection } from './LayoutSection';
import { ExportSection } from './ExportSection';
import { PrototypeTab } from './PrototypeTab';
import { InspectTab } from './InspectTab';

export interface InspectorProps {
  selectedElement: CanvasElement;
  allElements?: Record<string, CanvasElement>;
  projectTitle?: string;
  devicePreview?: 'desktop' | 'mobile';
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onExportSelected: () => void;
  onOpenPrototype?: () => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  width?: number;
  onStartResize?: (e: React.MouseEvent) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedElement,
  allElements = {},
  projectTitle = 'ZLab Project',
  devicePreview = 'desktop',
  onUpdateElement,
  onExportSelected,
  onOpenPrototype,
  onDeleteElement,
  onDuplicateElement,
  width = 288,
  onStartResize,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('design');

  const isArtboard =
    selectedElement.id === 'desktop-1440' ||
    selectedElement.id === 'mobile-app-view' ||
    selectedElement.id === 'default-artboard-frame';

  const isLocked = !!selectedElement.locked;
  const isPinned = !!(selectedElement.pinned || selectedElement.fixed);

  return (
    <aside
      id="inspector-sidebar"
      style={{ width }}
      className="fixed top-16 right-0 bottom-0 bg-[#171717] border-l border-[#201f1f] flex flex-col z-30 select-none shadow-xl"
    >
      {/* Left resize handle */}
      {onStartResize && (
        <div
          onMouseDown={onStartResize}
          className="absolute -left-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-[#0d99ff]/30 transition-colors z-40"
          title="Drag to resize Inspector panel"
        />
      )}

      {/* Header: Element Title, Pin, Lock, Duplicate, Delete */}
      <div className="h-12 border-b border-[#201f1f] px-4 flex items-center justify-between shrink-0 bg-[#131313]">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xs font-bold text-[#e5e2e1] truncate max-w-[140px]">
            {selectedElement.name}
          </span>
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#89919e]">
            {selectedElement.type}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Pin/Fix toggle */}
          <button
            onClick={() =>
              onUpdateElement({
                pinned: !isPinned,
                fixed: !isPinned,
              })
            }
            className={`p-1 rounded transition-colors ${
              isPinned
                ? 'text-[#0d99ff] bg-[#0d99ff]/20'
                : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
            }`}
            title={isPinned ? 'Unpin from artboard' : 'Pin to artboard (Fixed position)'}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* Lock toggle */}
          <button
            onClick={() => onUpdateElement({ locked: !isLocked })}
            className={`p-1 rounded transition-colors ${
              isLocked
                ? 'text-[#f59e0b] bg-[#f59e0b]/20'
                : 'text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f]'
            }`}
            title={isLocked ? 'Unlock element' : 'Lock element'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Duplicate */}
          {!isArtboard && onDuplicateElement && (
            <button
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="p-1 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded transition-colors"
              title="Duplicate (⌘D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete */}
          {!isArtboard && onDeleteElement && (
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              className="p-1 text-[#89919e] hover:text-[#ffb4ab] hover:bg-[#201f1f] rounded transition-colors"
              title="Delete element (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lock banner if locked or pinned */}
      {(isLocked || isPinned) && (
        <div className="bg-[#f59e0b]/10 border-b border-[#f59e0b]/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-[#f59e0b]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>Element is {isLocked ? 'locked' : 'fixed/pinned'}</span>
          </span>
          <button
            onClick={() =>
              onUpdateElement({
                locked: false,
                fixed: false,
                pinned: false,
              })
            }
            className="text-[10px] font-bold underline hover:opacity-80 ml-2"
          >
            Unfix & Unlock
          </button>
        </div>
      )}

      {/* Inspector Tabs (Design / Prototype / Inspect) */}
      <div className="flex items-center border-b border-[#201f1f] bg-[#141416] shrink-0">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'design'
              ? 'text-[#9fcaff] border-[#0d99ff] bg-[#1c1b1b]'
              : 'text-[#89919e] border-transparent hover:text-[#e5e2e1]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Design</span>
        </button>

        <button
          onClick={() => setActiveTab('prototype')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'prototype'
              ? 'text-[#9fcaff] border-[#0d99ff] bg-[#1c1b1b]'
              : 'text-[#89919e] border-transparent hover:text-[#e5e2e1]'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Prototype</span>
        </button>

        <button
          onClick={() => setActiveTab('inspect')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'inspect'
              ? 'text-[#9fcaff] border-[#0d99ff] bg-[#1c1b1b]'
              : 'text-[#89919e] border-transparent hover:text-[#e5e2e1]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
      </div>

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'design' && (
          <>
            <PositionSection
              element={selectedElement}
              onUpdate={onUpdateElement}
              isArtboard={isArtboard}
              disabled={isLocked}
            />

            <TypographySection
              element={selectedElement}
              onUpdate={onUpdateElement}
              disabled={isLocked}
            />

            <FillSection
              element={selectedElement}
              onUpdate={onUpdateElement}
              disabled={isLocked}
            />

            <BorderSection
              element={selectedElement}
              onUpdate={onUpdateElement}
              disabled={isLocked}
            />

            <ShadowSection
              element={selectedElement}
              onUpdate={onUpdateElement}
              disabled={isLocked}
            />

            <LayoutSection
              element={selectedElement}
              onUpdate={onUpdateElement}
              disabled={isLocked}
            />

            <ExportSection
              element={selectedElement}
              onExportSelected={onExportSelected}
            />
          </>
        )}

        {activeTab === 'prototype' && (
          <PrototypeTab
            element={selectedElement}
            allElements={allElements}
            onUpdate={onUpdateElement}
            onOpenPrototype={onOpenPrototype}
          />
        )}

        {activeTab === 'inspect' && <InspectTab element={selectedElement} />}
      </div>
    </aside>
  );
};
