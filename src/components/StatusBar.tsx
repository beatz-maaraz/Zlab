import React, { useState } from 'react';
import { Collaborator } from '../types';
import { Users, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface StatusBarProps {
  collaborators?: Collaborator[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpenShortcuts?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  collaborators = [],
  currentPage,
  totalPages,
  onPageChange,
  onOpenShortcuts,
}) => {
  const [showUsersPopup, setShowUsersPopup] = useState(false);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const safeCollaborators = collaborators || [];

  return (
    <footer
      id="canvas-status-bar"
      className="fixed bottom-0 left-0 right-0 h-8 bg-[#1c1b1b] border-t border-[#353534] px-4 flex items-center justify-between z-30 text-xs text-[#bfc7d5] select-none"
    >
      {/* Left sync & page status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] text-[#e5e2e1]">Canvas Synchronized</span>
        </div>

        <div className="h-3 w-[1px] bg-[#3f4753]" />

        {/* Page selector with decrease/increase */}
        <div className="relative flex items-center gap-0.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-0.5 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-20"
            title="Previous Page (Decrease)"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <button
            id="btn-page-selector"
            onClick={() => setShowPageMenu(!showPageMenu)}
            className="hover:text-[#e5e2e1] transition-colors cursor-pointer text-[11px] px-1 py-0.5 rounded hover:bg-[#201f1f]"
          >
            Page {currentPage} of {totalPages}
          </button>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-0.5 text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-20"
            title="Next Page (Increase)"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
          {showPageMenu && (
            <div className="absolute left-0 bottom-full mb-1 w-36 bg-[#1c1b1b] border border-[#353534] rounded-lg shadow-xl py-1 z-50 text-xs">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onPageChange(p);
                    setShowPageMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#2a2a2a] text-[#e5e2e1]"
                >
                  <span>Page {p}</span>
                  {currentPage === p && <Check className="w-3.5 h-3.5 text-[#9fcaff]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-3 w-[1px] bg-[#3f4753]" />
        
        {/* Portal target for Canvas Zoom Indicator */}
        <div id="canvas-zoom-indicator-portal" className="flex items-center" />
      </div>

      {/* Right multiplayer collaborator presence */}
      <div className="flex items-center gap-3 relative">
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="text-[11px] text-[#89919e] hover:text-[#e5e2e1] flex items-center gap-1 transition-colors mr-2"
            title="Keyboard Shortcuts & Settings"
          >
            <span>Shortcuts (⌘/)</span>
          </button>
        )}

        <div
          onClick={() => setShowUsersPopup(!showUsersPopup)}
          className="flex -space-x-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          title="Click to view live team members"
        >
          {safeCollaborators.map((c) => (
            <div
              key={c.id}
              style={{ backgroundColor: c.color }}
              className="inline-block h-5 w-5 rounded-full ring-2 ring-[#131313] text-[#002f55] text-[9px] font-bold flex items-center justify-center"
              title={c.name}
            >
              {c.initials}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowUsersPopup(!showUsersPopup)}
          className="text-[11px] hover:text-[#e5e2e1] cursor-pointer"
        >
          {safeCollaborators.length} active users
        </button>

        {/* Collaborators Popover */}
        {showUsersPopup && (
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#1c1b1b] border border-[#353534] rounded-xl shadow-2xl p-3 z-50 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#353534] mb-2 font-medium text-[#e5e2e1]">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#9fcaff]" /> Active Collaborators
              </span>
              <span className="text-[10px] text-[#89919e] font-normal">Real-time sync</span>
            </div>
            <div className="space-y-2">
              {safeCollaborators.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: collab.color }}
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-[#002f55]"
                    >
                      {collab.initials}
                    </div>
                    <span className="text-[#e5e2e1] text-xs">{collab.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Editing</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};
