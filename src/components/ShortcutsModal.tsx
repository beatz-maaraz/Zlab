import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Keyboard,
  CornerDownLeft,
  Move,
  Square,
  PenTool,
  Type,
  Hand,
  MessageSquare,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  Grid,
  ZoomIn,
  ZoomOut,
  Smartphone,
  Monitor,
  Play,
  Download,
  Settings,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Tools' | 'Edit' | 'View & Canvas' | 'Prototype & Export' | 'General';
  keys: string[];
  actionId?: string;
  icon?: React.ReactNode;
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction?: (actionId: string) => void;
}

export const ALL_COMMANDS: CommandItem[] = [
  // Tools
  {
    id: 'tool-move',
    title: 'Select / Move Tool',
    description: 'Select, drag, resize and rotate elements on canvas',
    category: 'Tools',
    keys: ['V'],
    actionId: 'tool-move',
    icon: <Move className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'tool-frame',
    title: 'Frame Tool',
    description: 'Create responsive artboard frames and grouping containers',
    category: 'Tools',
    keys: ['F'],
    actionId: 'tool-frame',
    icon: <Layers className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'tool-rect',
    title: 'Rectangle Tool',
    description: 'Draw vector rectangles, rounded cards, and visual surfaces',
    category: 'Tools',
    keys: ['R'],
    actionId: 'tool-rect',
    icon: <Square className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'tool-pen',
    title: 'Pen / Vector Path Tool',
    description: 'Precision bezier curve and vector path drawing mode',
    category: 'Tools',
    keys: ['P'],
    actionId: 'tool-pen',
    icon: <PenTool className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'tool-text',
    title: 'Text Tool',
    description: 'Insert editable typography headers, body text, or labels',
    category: 'Tools',
    keys: ['T'],
    actionId: 'tool-text',
    icon: <Type className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'tool-hand',
    title: 'Hand / Pan Tool',
    description: 'Pan around the infinite vector canvas without selecting',
    category: 'Tools',
    keys: ['H'],
    actionId: 'tool-hand',
    icon: <Hand className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'tool-hand-space',
    title: 'Temporary Pan Canvas',
    description: 'Hold spacebar and drag to quickly pan anywhere',
    category: 'Tools',
    keys: ['Space', 'Drag'],
    icon: <Hand className="w-3.5 h-3.5 text-[#89919e]" />,
  },
  {
    id: 'tool-comment',
    title: 'Comment Tool',
    description: 'Pin design review comments and feedback markers',
    category: 'Tools',
    keys: ['C'],
    actionId: 'tool-comment',
    icon: <MessageSquare className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },

  // Edit
  {
    id: 'edit-undo',
    title: 'Undo Last Action',
    description: 'Revert the most recent canvas change or element edit',
    category: 'Edit',
    keys: ['⌘', 'Z'],
    actionId: 'undo',
    icon: <Undo2 className="w-3.5 h-3.5 text-[#34d399]" />,
  },
  {
    id: 'edit-redo',
    title: 'Redo Action',
    description: 'Reapply the previously undone operation',
    category: 'Edit',
    keys: ['⌘', '⇧', 'Z'],
    actionId: 'redo',
    icon: <Redo2 className="w-3.5 h-3.5 text-[#34d399]" />,
  },
  {
    id: 'edit-duplicate',
    title: 'Duplicate Element',
    description: 'Clone selected element with automatic staggered offset',
    category: 'Edit',
    keys: ['⌘', 'D'],
    actionId: 'duplicate',
    icon: <Copy className="w-3.5 h-3.5 text-[#d2bbff]" />,
  },
  {
    id: 'edit-delete',
    title: 'Delete Selected Element',
    description: 'Remove active item from the design canvas',
    category: 'Edit',
    keys: ['Delete'],
    actionId: 'delete',
    icon: <Trash2 className="w-3.5 h-3.5 text-[#f87171]" />,
  },
  {
    id: 'edit-nudge-1',
    title: 'Nudge 1 Pixel',
    description: 'Move selected element 1 pixel in arrow direction',
    category: 'Edit',
    keys: ['↑', '↓', '←', '→'],
    icon: <Move className="w-3.5 h-3.5 text-[#89919e]" />,
  },
  {
    id: 'edit-nudge-10',
    title: 'Big Nudge 10 Pixels',
    description: 'Move selected element 10 pixels across the layout grid',
    category: 'Edit',
    keys: ['Shift', '↑ / ↓ / ← / →'],
    icon: <Move className="w-3.5 h-3.5 text-[#89919e]" />,
  },
  {
    id: 'edit-cancel-deselect',
    title: 'Deselect / Cancel',
    description: 'Return to Move tool or deselect current active element',
    category: 'Edit',
    keys: ['Esc'],
    actionId: 'deselect',
    icon: <CornerDownLeft className="w-3.5 h-3.5 text-[#89919e]" />,
  },

  // View & Canvas
  {
    id: 'view-toggle-grid',
    title: 'Toggle Alignment Grid',
    description: 'Display 20px sub-pixel & 100px major layout grid lines',
    category: 'View & Canvas',
    keys: ['G'],
    actionId: 'toggle-grid',
    icon: <Grid className="w-3.5 h-3.5 text-[#34d399]" />,
  },
  {
    id: 'view-zoom-in',
    title: 'Zoom In',
    description: 'Increase canvas magnification by 10%',
    category: 'View & Canvas',
    keys: ['⌘', '+'],
    actionId: 'zoom-in',
    icon: <ZoomIn className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'view-zoom-out',
    title: 'Zoom Out',
    description: 'Decrease canvas magnification by 10%',
    category: 'View & Canvas',
    keys: ['⌘', '-'],
    actionId: 'zoom-out',
    icon: <ZoomOut className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'view-zoom-reset',
    title: 'Reset Zoom (100%)',
    description: 'Reset canvas viewport scale to actual 1:1 pixel size',
    category: 'View & Canvas',
    keys: ['⌘', '0'],
    actionId: 'zoom-reset',
    icon: <Monitor className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'view-device-desktop',
    title: 'Desktop Artboard View',
    description: 'Switch artboard frame to 1440 × 900 desktop viewport',
    category: 'View & Canvas',
    keys: ['1'],
    actionId: 'device-desktop',
    icon: <Monitor className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },
  {
    id: 'view-device-mobile',
    title: 'Mobile iOS View',
    description: 'Switch artboard frame to 390 × 844 mobile phone viewport',
    category: 'View & Canvas',
    keys: ['2'],
    actionId: 'device-mobile',
    icon: <Smartphone className="w-3.5 h-3.5 text-[#9fcaff]" />,
  },

  // Prototype & Export
  {
    id: 'proto-preview',
    title: 'Interactive Prototype Simulator',
    description: 'Play and test screen flows with Smart Animate physics',
    category: 'Prototype & Export',
    keys: ['Shift', 'P'],
    actionId: 'open-prototype',
    icon: <Play className="w-3.5 h-3.5 text-[#34d399]" />,
  },
  {
    id: 'export-dialog',
    title: 'Export Design & Assets',
    description: 'Download PNG, SVG vector, HTML Prototype, or JSON schema',
    category: 'Prototype & Export',
    keys: ['⌘', 'E'],
    actionId: 'open-export',
    icon: <Download className="w-3.5 h-3.5 text-[#0d99ff]" />,
  },

  // General
  {
    id: 'general-shortcuts',
    title: 'Keyboard Shortcuts Cheat-Sheet',
    description: 'Open this searchable list of all shortcuts and commands',
    category: 'General',
    keys: ['?'],
    actionId: 'open-shortcuts',
    icon: <Keyboard className="w-3.5 h-3.5 text-[#d2bbff]" />,
  },
  {
    id: 'general-quick-actions',
    title: 'Command Palette Shortcut',
    description: 'Quick action launcher & shortcuts lookup',
    category: 'General',
    keys: ['⌘', '/'],
    actionId: 'open-shortcuts',
    icon: <Sparkles className="w-3.5 h-3.5 text-[#d2bbff]" />,
  },
  {
    id: 'general-settings',
    title: 'Settings & Workspace Preferences',
    description: 'Configure grid snapping, rendering engines, and team sync',
    category: 'General',
    keys: ['⌘', ','],
    actionId: 'open-settings',
    icon: <Settings className="w-3.5 h-3.5 text-[#89919e]" />,
  },
];

const CATEGORIES = ['All', 'Tools', 'Edit', 'View & Canvas', 'Prototype & Export', 'General'] as const;

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Platform detection for Mac vs Windows
  const isMac = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform);
  }, []);

  // Format modifier symbols according to OS
  const formatKey = (key: string) => {
    if (key === '⌘') return isMac ? '⌘' : 'Ctrl';
    if (key === '⌥') return isMac ? '⌥' : 'Alt';
    if (key === '⇧') return isMac ? '⇧' : 'Shift';
    return key;
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveCategory('All');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_COMMANDS.filter((cmd) => {
      const matchesCategory =
        activeCategory === 'All' || cmd.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const titleMatch = cmd.title.toLowerCase().includes(q);
      const descMatch = cmd.description.toLowerCase().includes(q);
      const categoryMatch = cmd.category.toLowerCase().includes(q);
      const keysMatch = cmd.keys.some(
        (k) =>
          k.toLowerCase().includes(q) ||
          (k === '⌘' && (q.includes('cmd') || q.includes('ctrl') || q.includes('command'))) ||
          (k === '⇧' && q.includes('shift')) ||
          (k === '⌥' && (q.includes('alt') || q.includes('opt')))
      );

      return titleMatch || descMatch || categoryMatch || keysMatch;
    });
  }, [searchQuery, activeCategory]);

  // Keep selected index in range
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length, activeCategory]);

  // Keyboard navigation inside modal (Arrow up, Arrow down, Enter to run, Esc to close)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current && current.actionId && onExecuteAction) {
        onExecuteAction(current.actionId);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="shortcuts-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="shortcuts-modal-container"
        className="w-full max-w-2xl bg-[#141416] border border-[#2e2e34] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[82vh] text-[#e5e2e1]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header / Search Input */}
        <div className="p-4 border-b border-[#27272a] bg-[#18181c]/80 flex items-center gap-3 relative">
          <div className="w-8 h-8 rounded-lg bg-[#0d99ff]/10 border border-[#0d99ff]/30 flex items-center justify-center shrink-0">
            <Keyboard className="w-4 h-4 text-[#9fcaff]" />
          </div>

          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-[#89919e] absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              id="input-shortcuts-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all commands, shortcuts, or tools (e.g., 'Zoom', 'Rectangle', '⌘Z')..."
              className="w-full bg-[#1e1e24] text-sm text-[#e5e2e1] placeholder-[#89919e] pl-9 pr-8 py-2 rounded-xl border border-[#35353c] outline-none focus:border-[#0d99ff] focus:ring-1 focus:ring-[#0d99ff]/50 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 text-[#89919e] hover:text-[#e5e2e1] p-1 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="btn-close-shortcuts-modal"
            onClick={onClose}
            className="p-2 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#27272a] rounded-lg transition-colors"
            title="Close cheat-sheet (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2.5 bg-[#161619] border-b border-[#242428] flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? ALL_COMMANDS.length
                : ALL_COMMANDS.filter((c) => c.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  inputRef.current?.focus();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0d99ff] text-[#002f55] shadow-sm font-semibold'
                    : 'bg-[#202026] text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a32]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#002f55]/30 text-[#002f55]'
                      : 'bg-[#2a2a30] text-[#89919e]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Commands List */}
        <div
          ref={listRef}
          id="shortcuts-list-container"
          className="flex-1 overflow-y-auto p-3 divide-y divide-[#202026] space-y-0.5"
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const hasAction = Boolean(cmd.actionId && onExecuteAction);

              return (
                <div
                  key={cmd.id}
                  id={`shortcut-item-${cmd.id}`}
                  onClick={() => {
                    if (hasAction && onExecuteAction && cmd.actionId) {
                      onExecuteAction(cmd.actionId);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#202026] border border-[#0d99ff]/30 shadow-sm'
                      : 'hover:bg-[#1a1a20] border border-transparent'
                  } ${hasAction ? 'cursor-pointer' : ''}`}
                >
                  {/* Left: Icon & Title & Description */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#0d99ff]/15 border-[#0d99ff]/40 text-[#9fcaff]'
                          : 'bg-[#18181e] border-[#2a2a32] text-[#89919e]'
                      }`}
                    >
                      {cmd.icon || <Keyboard className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium truncate ${
                            isSelected ? 'text-[#ffffff]' : 'text-[#e5e2e1]'
                          }`}
                        >
                          {cmd.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#202024] text-[#89919e] font-mono shrink-0">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#89919e] truncate mt-0.5">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Key Badges & Run Prompt */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      {cmd.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 rounded-md bg-[#222228] text-[#e5e2e1] border border-[#373742] text-[11px] font-mono font-semibold shadow-inner inline-flex items-center justify-center min-w-[22px] leading-tight"
                        >
                          {formatKey(k)}
                        </kbd>
                      ))}
                    </div>

                    {hasAction && isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#9fcaff] bg-[#0d99ff]/10 border border-[#0d99ff]/30 px-2 py-0.5 rounded-md font-medium ml-1">
                        Run <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#89919e] space-y-2">
              <Keyboard className="w-8 h-8 text-[#3f3f46] mx-auto" />
              <p className="text-xs text-[#e5e2e1] font-medium">
                No shortcuts found for "{searchQuery}"
              </p>
              <p className="text-[11px] text-[#89919e]">
                Try searching for general terms like "zoom", "select", "grid", or "tool".
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-[#9fcaff] hover:underline font-medium"
              >
                Reset search
              </button>
            </div>
          )}
        </div>

        {/* Footer / Quick Tips */}
        <div className="p-3 bg-[#161619] border-t border-[#27272a] flex items-center justify-between text-[11px] text-[#89919e]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#202026] text-[#e5e2e1] border border-[#35353c] text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#202026] text-[#e5e2e1] border border-[#35353c] text-[10px] font-mono">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#202026] text-[#e5e2e1] border border-[#35353c] text-[10px] font-mono">
                ↵
              </kbd>
              <span>Execute</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#202026] text-[#e5e2e1] border border-[#35353c] text-[10px] font-mono">
                Esc
              </kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#89919e]">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#202026] text-[#9fcaff] border border-[#0d99ff]/30 text-[10px] font-mono font-semibold">
              ?
            </kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#202026] text-[#9fcaff] border border-[#0d99ff]/30 text-[10px] font-mono font-semibold">
              {isMac ? '⌘/' : 'Ctrl+/'}
            </kbd>
            <span>anywhere to reopen</span>
          </div>
        </div>
      </div>
    </div>
  );
};
