import React from 'react';
import { Keyboard, Play } from 'lucide-react';
import { Collaborator } from '../../types';

interface CollaborationControlsProps {
  collaborators?: Collaborator[];
  onOpenPrototype?: () => void;
  onOpenShortcuts?: () => void;
  onOpenSettings: (tab?: string) => void;
}

export const CollaborationControls: React.FC<CollaborationControlsProps> = ({
  collaborators = [],
  onOpenPrototype,
  onOpenShortcuts,
  onOpenSettings,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Play Prototype Button */}
      {onOpenPrototype && (
        <button
          id="btn-header-play-proto"
          onClick={onOpenPrototype}
          className="bg-[#201f1f] hover:bg-[#2a2a2a] text-[#34d399] border border-[#353534] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          title="Play Interactive Prototype (Shift+P)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Prototype</span>
        </button>
      )}

      {/* Keyboard Shortcuts Cheat-Sheet Button */}
      {onOpenShortcuts && (
        <button
          id="btn-header-shortcuts"
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg bg-[#201f1f] text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] border border-[#353534]/60 transition-colors shadow-sm"
          title="Keyboard Shortcuts & Commands Cheat-Sheet (⌘/ or ?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      )}

      {/* User Profile Avatar */}
      <button
        id="btn-header-user-avatar"
        onClick={() => onOpenSettings('account')}
        className="w-8 h-8 rounded-full bg-[#9fcaff] text-[#003259] flex items-center justify-center font-bold text-xs ring-2 ring-[#131313] hover:ring-[#0d99ff] transition-all ml-1"
        title="User Account & Preferences"
      >
        AC
      </button>
    </div>
  );
};
