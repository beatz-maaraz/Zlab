import React from 'react';
import { Download, FileCode, Sliders } from 'lucide-react';
import { CanvasElement } from '../../types';
import { downloadPng, downloadSvg, downloadJson } from '../../utils/exportUtils';

interface ExportSectionProps {
  element: CanvasElement;
  onExportSelected: () => void;
  projectTitle?: string;
  allElements?: Record<string, CanvasElement>;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  element,
  onExportSelected,
  projectTitle = 'ZLab Export',
  allElements,
}) => {
  const elementsToExport: Record<string, CanvasElement> =
    allElements && Object.keys(allElements).length > 0
      ? allElements
      : { [element.id]: element };

  return (
    <div className="p-4 border-b border-[#201f1f] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#e5e2e1]">
        <span>Export Element</span>
        <button
          onClick={onExportSelected}
          className="text-[11px] font-normal text-[#9fcaff] hover:underline flex items-center gap-1"
        >
          <Sliders className="w-3 h-3" />
          <span>More Options</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={() => downloadPng(element.name, elementsToExport, element.id, 2)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#141416] hover:bg-[#201f1f] text-[#e5e2e1] rounded-lg border border-[#353534] transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>PNG (2x)</span>
        </button>

        <button
          onClick={() => downloadSvg(element.name, elementsToExport, element.id)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#141416] hover:bg-[#201f1f] text-[#e5e2e1] rounded-lg border border-[#353534] transition-colors"
        >
          <FileCode className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>SVG</span>
        </button>

        <button
          onClick={() => downloadJson(projectTitle, elementsToExport)}
          className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#141416] hover:bg-[#201f1f] text-[#e5e2e1] rounded-lg border border-[#353534] transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>Export Element JSON</span>
        </button>
      </div>
    </div>
  );
};
