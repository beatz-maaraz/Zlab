import React, { useState } from 'react';
import { ZLabLogo } from '../ZLabLogo';
import { AppView } from '../../types';
import { Check } from 'lucide-react';

interface ProjectTitleProps {
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  currentView: AppView;
  onToggleView: () => void;
  lastSavedText?: string;
}

export const ProjectTitle: React.FC<ProjectTitleProps> = ({
  projectTitle,
  onUpdateTitle,
  currentView,
  onToggleView,
  lastSavedText = 'Saved',
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  return (
    <div className="flex items-center gap-3">
      <button
        id="btn-nav-logo"
        onClick={onToggleView}
        className="flex items-center gap-2 group text-left focus:outline-none"
        title="Toggle between Editor & Dashboard"
      >
        <ZLabLogo size="md" showText={false} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-[#e5e2e1] group-hover:text-[#9fcaff] transition-colors flex items-center gap-1.5">
            <span>ZLab</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0d99ff]/15 text-[#9fcaff] border border-[#0d99ff]/30 font-semibold uppercase tracking-wider">
              Studio
            </span>
          </span>

          {currentView === 'editor' && (
            isEditingTitle ? (
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
                  }
                }}
                autoFocus
                className="text-[11px] bg-[#2a2a2a] text-[#bfc7d5] px-1 py-0.5 rounded outline-none border border-[#0d99ff]"
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempTitle(projectTitle);
                    setIsEditingTitle(true);
                  }}
                  className="text-[11px] text-[#bfc7d5] hover:text-[#e5e2e1] cursor-pointer"
                  title="Click to rename design"
                >
                  {projectTitle}
                </span>
                <span className="text-[9px] text-[#89919e] flex items-center gap-0.5 opacity-70">
                  <Check className="w-2.5 h-2.5 text-[#34d399]" />
                  <span>{lastSavedText}</span>
                </span>
              </div>
            )
          )}
        </div>
      </button>
    </div>
  );
};
