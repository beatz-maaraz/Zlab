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
      className="bg-[#9fcaff] text-[#003259] px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-[#0d99ff] hover:text-[#002f55] transition-colors shadow-sm"
      title="Export Artwork (⌘E)"
    >
      <Share2 className="w-4 h-4" />
      <span>{exportNotice ? 'Exported!' : 'Export'}</span>
    </button>
  );
};
