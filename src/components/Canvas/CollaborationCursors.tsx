import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { Collaborator } from '../../types';

interface CollaborationCursorsProps {
  collaborators: Collaborator[];
}

export const CollaborationCursors: React.FC<CollaborationCursorsProps> = ({ collaborators }) => {
  return (
    <>
      {collaborators.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.cursorX}px`,
            top: `${c.cursorY}px`,
            transition: 'all 0.4s ease-out',
          }}
          className="pointer-events-none z-40 flex items-start gap-1 select-none"
        >
          <MousePointer2
            className="w-4 h-4 drop-shadow-md"
            style={{ color: c.color, fill: c.color }}
          />
          <div
            style={{ backgroundColor: c.color }}
            className="text-[10px] font-bold text-[#002f55] px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap"
          >
            {c.name}
          </div>
        </div>
      ))}
    </>
  );
};
