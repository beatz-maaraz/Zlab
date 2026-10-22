import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Layers,
  MousePointerClick,
  Check,
  Sliders,
  Bell,
  Eye,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { M3_CATEGORIES } from './M3Widgets';
import { CanvasElement } from '../types';

interface M3StudioPanelProps {
  onInsertComponent: (comp: any) => void;
  onInsertSuite?: () => void;
  onOpenFullScreenStudio?: () => void;
}

export const M3StudioPanel: React.FC<M3StudioPanelProps> = ({
  onInsertComponent,
  onInsertSuite,
  onOpenFullScreenStudio,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => [
    { id: 'all', label: 'All (26)', icon: Sparkles },
    { id: 'actions', label: 'Actions (7)', icon: MousePointerClick },
    { id: 'communication', label: 'Comm (4)', icon: Bell },
    { id: 'containment', label: 'Cards (4)', icon: Layers },
    { id: 'navigation', label: 'Nav (4)', icon: ExternalLink },
    { id: 'selection', label: 'Select (5)', icon: Sliders },
    { id: 'text-inputs', label: 'Inputs (4)', icon: Eye },
  ], []);

  const allComponents = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      type: string;
      variant?: string;
      categoryId: string;
      categoryName: string;
      description?: string;
    }> = [];

    M3_CATEGORIES.forEach((cat) => {
      cat.components.forEach((c) => {
        list.push({
          id: c.id,
          name: c.name,
          type: c.type,
          variant: c.variant,
          categoryId: cat.id,
          categoryName: cat.name,
          description: cat.description,
        });
      });
    });

    return list;
  }, []);

  const filteredComponents = useMemo(() => {
    return allComponents.filter((comp) => {
      if (selectedCategory !== 'all' && comp.categoryId !== selectedCategory) {
        return false;
      }
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.type.toLowerCase().includes(q) ||
        comp.categoryName.toLowerCase().includes(q)
      );
    });
  }, [allComponents, selectedCategory, searchTerm]);

  const handleComponentClick = (comp: any) => {
    onInsertComponent(comp);
    setCopiedId(comp.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-xs bg-[#141218]">
      {/* Studio Header & Quick Action */}
      <div className="p-3 border-b border-[#2d2a33] space-y-2 bg-[#1d1b20]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#d0bcff] to-[#381e72] flex items-center justify-center text-white shadow-sm shadow-[#d0bcff]/30">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#e6e0e9] text-xs">Material 3 Studio</span>
              <span className="ml-1.5 text-[9px] bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/30 px-1 rounded font-mono font-bold">
                MUI
              </span>
            </div>
          </div>

          {onOpenFullScreenStudio && (
            <button
              onClick={onOpenFullScreenStudio}
              className="p-1 rounded text-[#cac4d0] hover:text-white hover:bg-[#2d2a33] transition-colors"
              title="Open full-screen M3 studio modal"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#d0bcff]" />
            </button>
          )}
        </div>

        <p className="text-[10px] text-[#938f99] leading-tight">
          Official Google Material 3 components ready to click or drag onto canvas.
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#938f99]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search M3 buttons, cards, inputs..."
            className="w-full bg-[#141218] border border-[#36343b] rounded-lg px-8 py-1.5 text-xs text-[#e6e0e9] placeholder-[#938f99] outline-none focus:border-[#d0bcff] transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#381e72] text-[#d0bcff] border border-[#d0bcff]/50 font-semibold shadow-sm'
                  : 'bg-[#26242c] text-[#cac4d0] hover:bg-[#312e38] hover:text-white border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Suite Importer Banner */}
      {onInsertSuite && (
        <div className="px-3 pt-2">
          <button
            onClick={onInsertSuite}
            className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#381e72]/70 to-[#2b2930] hover:from-[#4f378b] hover:to-[#381e72] border border-[#d0bcff]/40 text-[#eaddff] font-semibold text-[11px] flex items-center justify-between transition-all shadow-md group cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d0bcff] group-hover:rotate-12 transition-transform" />
              <span>✦ Insert Full M3 Suite to Canvas</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#d0bcff]/20 text-[#d0bcff] font-mono font-bold">
              6 SUITES
            </span>
          </button>
        </div>
      )}

      {/* Component Grid / List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] text-[#938f99]">
          <span>{filteredComponents.length} components available</span>
          <span>Click or drag to artboard</span>
        </div>

        {filteredComponents.map((comp) => {
          const isSuite = comp.variant === 'suite';
          const isCopied = copiedId === comp.id;

          return (
            <div
              key={comp.id}
              draggable
              onDragStart={(e) => {
                const payload = {
                  type: 'm3-component',
                  componentType: comp.type,
                  category: comp.categoryId,
                  name: comp.name,
                };
                e.dataTransfer.setData('application/json', JSON.stringify(payload));
                e.dataTransfer.setData('application/zlab-element', JSON.stringify(payload));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => handleComponentClick(comp)}
              className={`p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2 group ${
                isSuite
                  ? 'bg-[#211f26] border-[#d0bcff]/40 hover:border-[#d0bcff] shadow-sm'
                  : 'bg-[#1d1b20] border-[#36343b] hover:border-[#d0bcff]/60 hover:bg-[#25232a]'
              }`}
            >
              {/* Mini Preview Box */}
              <div className="h-14 bg-[#141218] rounded-lg border border-[#2d2a33] flex items-center justify-center p-2 overflow-hidden relative group-hover:border-[#381e72] transition-colors">
                {/* 1. ACTIONS */}
                {comp.type === 'M3FilledButton' && (
                  <div className="px-3 py-1 rounded-full bg-[#d0bcff] text-[#381e72] text-[10px] font-bold shadow flex items-center gap-1">
                    <span>Filled Button</span>
                  </div>
                )}
                {comp.type === 'M3TonalButton' && (
                  <div className="px-3 py-1 rounded-full bg-[#4a4458] text-[#e8def8] text-[10px] font-medium shadow flex items-center gap-1">
                    <span>Tonal Button</span>
                  </div>
                )}
                {comp.type === 'M3OutlinedButton' && (
                  <div className="px-3 py-1 rounded-full border border-[#938f99] text-[#d0bcff] text-[10px] font-medium">
                    <span>Outlined Button</span>
                  </div>
                )}
                {comp.type === 'M3TextButton' && (
                  <span className="text-[#d0bcff] text-[11px] font-medium underline">
                    Text Action
                  </span>
                )}
                {comp.type === 'M3Fab' && (
                  <div className="w-8 h-8 rounded-xl bg-[#d0bcff] text-[#381e72] flex items-center justify-center font-bold text-sm shadow-md">
                    +
                  </div>
                )}
                {comp.type === 'M3ExtendedFab' && (
                  <div className="px-3 py-1 rounded-xl bg-[#eaddff] text-[#21005d] text-[10px] font-bold shadow flex items-center gap-1">
                    <span>✦ Compose</span>
                  </div>
                )}
                {comp.type === 'M3ActionsGroup' && (
                  <div className="flex items-center gap-1 scale-90">
                    <span className="px-2 py-0.5 rounded-full bg-[#d0bcff] text-[#381e72] text-[9px] font-bold">Filled</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#4a4458] text-[#e8def8] text-[9px]">Tonal</span>
                    <span className="w-5 h-5 rounded-lg bg-[#d0bcff] text-[#381e72] flex items-center justify-center text-[10px] font-bold">+</span>
                  </div>
                )}

                {/* 2. COMMUNICATION */}
                {comp.type === 'M3BadgeWidget' && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bell className="w-4 h-4 text-[#e6e0e9]" />
                      <span className="absolute -top-1 -right-1.5 w-3 h-3 rounded-full bg-[#d0bcff] text-[#381e72] text-[8px] font-bold flex items-center justify-center">
                        5
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#2b2930] text-[#cac4d0] text-[9px]">Updates</span>
                  </div>
                )}
                {comp.type === 'M3ProgressWidget' && (
                  <div className="w-full px-2 flex flex-col gap-1.5">
                    <div className="w-full h-1.5 rounded-full bg-[#36343b] overflow-hidden">
                      <div className="w-[68%] h-full bg-[#d0bcff]" />
                    </div>
                    <span className="text-[9px] text-[#cac4d0] text-center">Progress 68%</span>
                  </div>
                )}
                {comp.type === 'M3SnackbarWidget' && (
                  <div className="w-full bg-[#313033] px-2 py-1 rounded flex items-center justify-between text-[9px] text-[#e6e0e9]">
                    <span className="truncate">Saved changes</span>
                    <span className="text-[#d0bcff] font-bold">Undo</span>
                  </div>
                )}
                {comp.type === 'M3CommunicationGroup' && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[#d0bcff] border-t-transparent animate-spin" />
                    <span className="text-[9px] text-[#d0bcff] font-bold">Communication Suite</span>
                  </div>
                )}

                {/* 3. CONTAINMENT */}
                {comp.type === 'M3ElevatedCard' && (
                  <div className="w-full bg-[#211f26] border border-[#36343b] rounded-lg p-1.5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-[#e6e0e9] truncate">Elevated Card</span>
                      <span className="text-[8px] px-1 rounded bg-[#d0bcff]/20 text-[#d0bcff]">Level 1</span>
                    </div>
                    <span className="text-[8px] text-[#938f99] truncate">Dynamic tokens</span>
                  </div>
                )}
                {comp.type === 'M3OutlinedCard' && (
                  <div className="w-full bg-[#1d1b20] border border-[#49454f] rounded-lg p-1.5 flex flex-col justify-between h-full">
                    <span className="font-bold text-[10px] text-[#e6e0e9] truncate">Outlined Card</span>
                    <span className="text-[8px] text-[#938f99]">Border token 1.5dp</span>
                  </div>
                )}
                {comp.type === 'M3DialogPreview' && (
                  <div className="w-full bg-[#2b2930] border border-[#49454f] rounded-xl p-1.5 flex flex-col justify-between h-full">
                    <span className="font-bold text-[9px] text-[#e6e0e9]">Confirm Action?</span>
                    <div className="flex justify-end gap-1 text-[8px]">
                      <span className="text-[#d0bcff]">Cancel</span>
                      <span className="text-[#d0bcff] font-bold">Confirm</span>
                    </div>
                  </div>
                )}
                {comp.type === 'M3ContainmentGroup' && (
                  <div className="flex items-center gap-1.5 text-[9px] text-[#d0bcff] font-bold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cards & Dialog Suite</span>
                  </div>
                )}

                {/* 4. NAVIGATION */}
                {comp.type === 'M3BottomNavWidget' && (
                  <div className="w-full bg-[#211f26] rounded-lg px-2 py-1 flex items-center justify-around text-[9px]">
                    <span className="px-2 py-0.5 rounded-full bg-[#4a4458] text-[#d0bcff] font-bold">★ Home</span>
                    <span className="text-[#938f99]">Search</span>
                    <span className="text-[#938f99]">Profile</span>
                  </div>
                )}
                {comp.type === 'M3TabsWidget' && (
                  <div className="w-full flex border-b border-[#36343b] text-[9px] justify-around">
                    <span className="text-[#d0bcff] border-b-2 border-[#d0bcff] pb-0.5 font-bold">Overview</span>
                    <span className="text-[#938f99] pb-0.5">Tokens</span>
                    <span className="text-[#938f99] pb-0.5">Settings</span>
                  </div>
                )}
                {comp.type === 'M3NavDrawerWidget' && (
                  <div className="flex items-center gap-1 text-[9px] text-[#d0bcff]">
                    <span className="px-2 py-0.5 rounded bg-[#4a4458] text-[#d0bcff] font-bold">≡ Rail Menu</span>
                  </div>
                )}
                {comp.type === 'M3NavigationGroup' && (
                  <div className="flex items-center gap-1.5 text-[9px] text-[#d0bcff] font-bold">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Navigation Suite</span>
                  </div>
                )}

                {/* 5. SELECTION */}
                {comp.type === 'M3SwitchWidget' && (
                  <div className="w-full flex items-center justify-between px-2 text-[10px] text-[#e6e0e9]">
                    <span>Dark Theme</span>
                    <div className="w-8 h-4 rounded-full bg-[#d0bcff] p-0.5 flex items-center justify-end">
                      <div className="w-3 h-3 rounded-full bg-[#381e72] flex items-center justify-center text-[7px] text-white font-bold">✓</div>
                    </div>
                  </div>
                )}
                {comp.type === 'M3SliderWidget' && (
                  <div className="w-full px-2 flex flex-col gap-1">
                    <div className="w-full h-1.5 rounded-full bg-[#4a4458] relative">
                      <div className="w-[70%] h-full bg-[#d0bcff] rounded-full" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#381e72] border border-[#d0bcff] absolute left-[70%] top-1/2 -translate-y-1/2 -translate-x-1/2" />
                    </div>
                  </div>
                )}
                {comp.type === 'M3CheckboxWidget' && (
                  <div className="flex items-center gap-2 text-[10px] text-[#e6e0e9]">
                    <div className="w-4 h-4 rounded bg-[#d0bcff] text-[#381e72] flex items-center justify-center text-[10px] font-bold">✓</div>
                    <span>Checkbox Option</span>
                  </div>
                )}
                {comp.type === 'M3RadioWidget' && (
                  <div className="flex items-center gap-2 text-[10px] text-[#e6e0e9]">
                    <div className="w-4 h-4 rounded-full border-2 border-[#d0bcff] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#d0bcff]" />
                    </div>
                    <span>Radio Option</span>
                  </div>
                )}
                {comp.type === 'M3SelectionGroup' && (
                  <div className="flex items-center gap-1.5 text-[9px] text-[#d0bcff] font-bold">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Selection Controls Suite</span>
                  </div>
                )}

                {/* 6. TEXT INPUTS */}
                {comp.type === 'M3OutlinedTextField' && (
                  <div className="w-full border border-[#49454f] rounded-lg px-2 py-1 flex items-center justify-between text-[9px] text-[#cac4d0]">
                    <span>Outlined Input</span>
                    <span className="text-[#938f99]">|</span>
                  </div>
                )}
                {comp.type === 'M3FilledTextField' && (
                  <div className="w-full bg-[#211f26] border-b-2 border-[#d0bcff] px-2 py-1 flex items-center justify-between text-[9px] text-[#e6e0e9]">
                    <span>Filled Input</span>
                    <span className="text-[#d0bcff]">|</span>
                  </div>
                )}
                {comp.type === 'M3SearchField' && (
                  <div className="w-full bg-[#211f26] border border-[#49454f] rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[9px] text-[#938f99]">
                    <Search className="w-3 h-3 text-[#d0bcff]" />
                    <span>Search M3...</span>
                  </div>
                )}
                {comp.type === 'M3TextInputsGroup' && (
                  <div className="flex items-center gap-1.5 text-[9px] text-[#d0bcff] font-bold">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Text Inputs Suite</span>
                  </div>
                )}
              </div>

              {/* Component Label & Actions */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="font-semibold text-[#e6e0e9] text-[11px] truncate">
                    {comp.name}
                  </div>
                  <div className="text-[9px] text-[#938f99] truncate font-mono">
                    {comp.type}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComponentClick(comp);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0 ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#381e72] hover:bg-[#4f378b] text-[#d0bcff] hover:text-white shadow-sm'
                  }`}
                  title="Insert into canvas"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Insert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default M3StudioPanel;
