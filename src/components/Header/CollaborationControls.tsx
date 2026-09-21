import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, Play, LogOut, User, Settings, Sparkles } from 'lucide-react';
import { Collaborator } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useRouter } from '../../routes';

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
  const { user, profile, signOut } = useAuthStore();
  const { userSettings } = useUIStore();
  const { navigate } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const displayName = profile?.displayName || user?.displayName || userSettings.fullName || 'Designer';
  const email = profile?.email || user?.email || userSettings.email;
  const photoURL = profile?.photoURL || user?.photoURL;
  const initials = displayName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ZL';

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate({ type: 'login' });
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
      {/* Play Prototype Button */}
      {onOpenPrototype && (
        <button
          id="btn-header-play-proto"
          onClick={onOpenPrototype}
          className="h-8 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#34d399] border border-[#353534] px-2.5 sm:px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
          title="Play Interactive Prototype (Shift+P)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Prototype</span>
        </button>
      )}

      {/* Keyboard Shortcuts Cheat-Sheet Button */}
      {onOpenShortcuts && (
        <button
          id="btn-header-shortcuts"
          onClick={onOpenShortcuts}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-[#201f1f] text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] border border-[#353534]/60 transition-colors shadow-sm cursor-pointer shrink-0"
          title="Keyboard Shortcuts & Commands Cheat-Sheet (⌘/ or ?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      )}

      {/* User Profile Avatar & Dropdown */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          id="btn-header-user-avatar"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#003259] to-[#0d99ff] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#131313] hover:ring-[#0d99ff] transition-all cursor-pointer overflow-hidden shadow-sm shrink-0"
          title={`Signed in as ${displayName}`}
        >
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </button>

        {isMenuOpen && (
          <div
            id="user-profile-menu"
            className="absolute right-0 top-10 w-60 bg-[#1e1e20] border border-[#353534] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-3 py-2.5 border-b border-[#2a2a2d] mb-1">
              <p className="text-xs font-semibold text-[#e5e2e1] truncate">{displayName}</p>
              {email && <p className="text-[11px] text-[#89919e] truncate mt-0.5">{email}</p>}
            </div>

            <button
              id="btn-menu-account"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSettings('account');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#bfc7d5] hover:text-white hover:bg-[#2a2a2e] transition-colors cursor-pointer text-left"
            >
              <User className="w-3.5 h-3.5 text-[#0d99ff]" />
              <span>Account & Profile</span>
            </button>

            <button
              id="btn-menu-settings"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSettings('general');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#bfc7d5] hover:text-white hover:bg-[#2a2a2e] transition-colors cursor-pointer text-left"
            >
              <Settings className="w-3.5 h-3.5 text-[#89919e]" />
              <span>Preferences</span>
            </button>

            <div className="my-1 border-t border-[#2a2a2d]" />

            <button
              id="btn-menu-signout"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
