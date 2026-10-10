import React, { useState } from 'react';
import { X, Sparkles, Download, Layers, ArrowUpRight } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { Canvas } from '../layout/Canvas';
import { CanvasElement } from '../types';

interface M3StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToCanvas?: (element?: CanvasElement) => void;
  onImportFullSuiteToMainCanvas?: () => void;
}

export const M3StudioModal: React.FC<M3StudioModalProps> = ({
  isOpen,
  onClose,
  onInsertToCanvas,
  onImportFullSuiteToMainCanvas,
}) => {
  const [activeItems, setActiveItems] = useState([
    { id: 'item-1', type: 'M3ElevatedCard', category: 'containment', name: 'Elevated Card' },
    { id: 'item-2', type: 'M3ActionsGroup', category: 'actions', name: 'Action Buttons Suite' },
    { id: 'item-3', type: 'M3SelectionGroup', category: 'selection', name: 'Selection Controls' },
    { id: 'item-4', type: 'M3TextInputsGroup', category: 'text-inputs', name: 'Text Inputs Suite' },
    { id: 'item-5', type: 'M3BottomNavWidget', category: 'navigation', name: 'Bottom Navigation' },
    { id: 'item-6', type: 'M3CommunicationGroup', category: 'communication', name: 'Communication Suite' },
  ]);

  if (!isOpen) return null;

  const handleAddComponent = (comp: any) => {
    const newItem = {
      id: `m3_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: comp.type,
      category: comp.category || 'general',
      name: comp.name,
    };
    setActiveItems((prev) => [...prev, newItem]);
  };

  const handleAddSuite = () => {
    setActiveItems([
      { id: `m3_${Date.now()}_1`, type: 'M3ActionsGroup', category: 'actions', name: 'Actions Suite' },
      { id: `m3_${Date.now()}_2`, type: 'M3CommunicationGroup', category: 'communication', name: 'Communication Suite' },
      { id: `m3_${Date.now()}_3`, type: 'M3ElevatedCard', category: 'containment', name: 'Elevated Card' },
      { id: `m3_${Date.now()}_4`, type: 'M3OutlinedCard', category: 'containment', name: 'Outlined Card' },
      { id: `m3_${Date.now()}_5`, type: 'M3DialogPreview', category: 'containment', name: 'Dialog Preview' },
      { id: `m3_${Date.now()}_6`, type: 'M3NavigationGroup', category: 'navigation', name: 'Navigation Suite' },
      { id: `m3_${Date.now()}_7`, type: 'M3SelectionGroup', category: 'selection', name: 'Selection Suite' },
      { id: `m3_${Date.now()}_8`, type: 'M3TextInputsGroup', category: 'text-inputs', name: 'Text Inputs Suite' },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-6 animate-fadeIn">
      <div className="relative w-full h-full max-w-[96vw] max-h-[94vh] bg-[#141218] border border-[#36343b] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1d1b20] border-b border-[#36343b]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d0bcff] to-[#381e72] flex items-center justify-center text-[#141218] font-bold shadow-lg shadow-[#d0bcff]/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#e6e0e9] tracking-wide">
                  Material 3 Component Studio
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/30 px-2 py-0.5 rounded-full">
                  MUI Official M3
                </span>
              </div>
              <p className="text-[11px] text-[#938f99]">
                Live workspace for 6 M3 categories with interactive preview & html-to-image export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onImportFullSuiteToMainCanvas && (
              <button
                onClick={() => {
                  onImportFullSuiteToMainCanvas();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#381e72] hover:bg-[#4f378b] border border-[#d0bcff]/40 text-xs font-semibold text-[#eaddff] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Layers className="w-3.5 h-3.5 text-[#d0bcff]" />
                <span>Import to Main Canvas</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#cac4d0] hover:text-white hover:bg-[#36343b] transition-colors"
              title="Close M3 Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Body: Sidebar on Left, Canvas on Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Sidebar */}
          <div className="w-80 md:w-96 shrink-0 h-full border-r border-[#2d2a33]">
            <Sidebar
              onAddComponent={handleAddComponent}
              onAddSuite={handleAddSuite}
            />
          </div>

          {/* Design Canvas */}
          <div className="flex-1 h-full overflow-hidden">
            <Canvas
              items={activeItems}
              setItems={setActiveItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default M3StudioModal;
