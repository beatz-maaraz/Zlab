import React, { useState } from 'react';
import { Share2 } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
  const [exportNotice, setExportNotice] = useState(false);

  const handleClick = () => {
    onExport();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <button
      id="btn-header-export"
      onClick={handleClick}
      className="h-8 bg-[#9fcaff] text-[#003259] px-2.5 sm:px-3.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-[#0d99ff] hover:text-[#002f55] transition-colors shadow-sm shrink-0"
      title="Export Artwork (⌘E)"
    >
      <Share2 className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{exportNotice ? 'Exported!' : 'Export'}</span>
    </button>
  );
};
