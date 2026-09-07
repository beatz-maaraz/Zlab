import React from 'react';
import {
  MousePointer,
  Crop,
  Square,
  PenTool,
  Type,
  Hand,
  MessageSquare,
} from 'lucide-react';
import { ToolMode } from '../types';

interface FloatingToolbarProps {
  currentTool: ToolMode;
  setCurrentTool: (tool: ToolMode) => void;
  commentCount?: number;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  currentTool,
  setCurrentTool,
  commentCount = 1,
}) => {
  const tools: { id: ToolMode; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { id: 'move', label: 'Move Tool', shortcut: 'V', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'frame', label: 'Frame Tool', shortcut: 'F', icon: <Crop className="w-4 h-4" /> },
    { id: 'rect', label: 'Rectangle', shortcut: 'R', icon: <Square className="w-4 h-4" /> },
    { id: 'pen', label: 'Pen Tool', shortcut: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'text', label: 'Text Tool', shortcut: 'T', icon: <Type className="w-4 h-4" /> },
    { id: 'hand', label: 'Hand Tool', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
    {
      id: 'comment',
      label: 'Comments',
      shortcut: 'C',
      icon: (
        <div className="relative">
          <MessageSquare className="w-4 h-4" />
          {commentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#0d99ff] ring-1 ring-[#131313]" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      id="floating-canvas-toolbar"
      className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-[#2a2a2a]/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-2xl border border-[#353534]"
    >
      {tools.map((t) => {
        const isActive = currentTool === t.id;
        return (
          <button
            key={t.id}
            id={`tool-btn-${t.id}`}
            onClick={() => setCurrentTool(t.id)}
            title={`${t.label} (${t.shortcut})`}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              isActive
                ? 'bg-[#0d99ff] text-[#002f55] shadow-md scale-105 font-medium'
                : 'text-[#bfc7d5] hover:text-[#e5e2e1] hover:bg-[#353534]'
            }`}
          >
            {t.icon}
          </button>
        );
      })}
    </div>
  );
};
