import React, { useState } from 'react';
import { ZLabLogo } from '../ZLabLogo';
import { AppView } from '../../types';
import { Check, Cloud } from 'lucide-react';

interface ProjectTitleProps {
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  currentView: AppView;
  onToggleView?: () => void;
  onGoToHome?: () => void;
  onGoToProject?: () => void;
  isSaving?: boolean;
  lastSavedText?: string;
}

export const ProjectTitle: React.FC<ProjectTitleProps> = ({
  projectTitle,
  onUpdateTitle,
  currentView,
  onToggleView,
  onGoToHome,
  isSaving = false,
  lastSavedText = 'Saved',
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  const handleLogoClick = () => {
    if (onGoToHome) {
      onGoToHome();
    } else if (onToggleView) {
      onToggleView();
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Home / Logo Button */}
      <button
        id="btn-nav-logo"
        onClick={handleLogoClick}
        className="flex items-center gap-2 group text-left focus:outline-none px-2 py-1 -ml-1 rounded-lg hover:bg-[#201f1f] transition-all cursor-pointer"
        title="Go to Home / Dashboard"
      >
        <ZLabLogo size="md" showText={false} />
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tracking-tight text-[#e5e2e1] group-hover:text-[#9fcaff] transition-colors">
            ZLab
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0d99ff]/15 text-[#9fcaff] border border-[#0d99ff]/30 font-semibold uppercase tracking-wider">
            Studio
          </span>
        </div>
      </button>

      {/* View-Specific Title & Navigation */}
      {currentView === 'editor' && (
        <>
          <span className="text-[#353534] select-none text-xs font-light">/</span>
          <div className="flex items-center gap-1.5">
            {isEditingTitle ? (
              <input
                id="input-project-title"
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  if (tempTitle.trim()) {
                    onUpdateTitle(tempTitle.trim());
                  }
                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (tempTitle.trim()) {
                      onUpdateTitle(tempTitle.trim());
                    }
                    setIsEditingTitle(false);
                  } else if (e.key === 'Escape') {
                    setTempTitle(projectTitle);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-[11px] bg-[#2a2a2a] text-[#bfc7d5] px-2 py-0.5 rounded outline-none border border-[#0d99ff] focus:ring-1 focus:ring-[#0d99ff]"
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  id="label-project-title"
                  onClick={() => {
                    setTempTitle(projectTitle);
                    setIsEditingTitle(true);
                  }}
                  className="text-[11px] text-[#bfc7d5] hover:text-[#e5e2e1] cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#201f1f] transition-colors font-medium max-w-[180px] sm:max-w-[260px] truncate"
                  title="Click to rename design project"
                >
                  {projectTitle}
                </span>
                <span className="text-[9px] text-[#89919e] flex items-center gap-0.5 opacity-75">
                  {isSaving ? (
                    <>
                      <Cloud className="w-2.5 h-2.5 text-[#0d99ff] animate-pulse" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-2.5 h-2.5 text-[#34d399]" />
                      <span>{lastSavedText}</span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
