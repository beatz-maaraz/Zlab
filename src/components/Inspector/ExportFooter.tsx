import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileCode, Sliders, Check } from 'lucide-react';
import { CanvasElement } from '../../types';
import { downloadPng, downloadSvg, downloadJson } from '../../utils/exportUtils';

interface ExportFooterProps {
  element: CanvasElement;
  onExportSelected: () => void;
  projectTitle?: string;
  allElements?: Record<string, CanvasElement>;
}

type ExportFormat = 'png' | 'svg' | 'json';

export const ExportFooter: React.FC<ExportFooterProps> = ({
  element,
  onExportSelected,
  projectTitle = 'ZLab Export',
  allElements,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const elementsToExport: Record<string, CanvasElement> =
    allElements && Object.keys(allElements).length > 0
      ? allElements
      : { [element.id]: element };

  // Handle outside click & ESC key
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const executeExport = (format: ExportFormat) => {
    switch (format) {
      case 'png':
        downloadPng(element.name, elementsToExport, element.id, 2);
        break;
      case 'svg':
        downloadSvg(element.name, elementsToExport, element.id);
        break;
      case 'json':
        downloadJson(projectTitle, elementsToExport);
        break;
    }
  };

  const handlePrimaryClick = () => {
    executeExport(selectedFormat);
  };

  const handleSelectFormat = (format: ExportFormat) => {
    setSelectedFormat(format);
    setIsDropdownOpen(false);
    executeExport(format);
  };

  const getFormatLabel = (format: ExportFormat): string => {
    switch (format) {
      case 'png':
        return 'PNG (2x)';
      case 'svg':
        return 'SVG';
      case 'json':
        return 'Element JSON';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="p-3 bg-[#131313] border-t border-[#201f1f] shrink-0 sticky bottom-0 z-30 select-none"
    >
      <div className="relative flex items-center shadow-sm">
        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handlePrimaryClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#0d99ff] hover:bg-[#007acc] text-white text-xs font-semibold rounded-l-lg transition-colors active:scale-[0.99]"
          title={`Export as ${getFormatLabel(selectedFormat)}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {getFormatLabel(selectedFormat)}</span>
        </button>

        {/* Dropdown Caret Button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="py-2 px-2.5 bg-[#0d99ff] hover:bg-[#007acc] text-white border-l border-white/20 rounded-r-lg transition-colors"
          title="Pick alternate export format"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Upward Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute bottom-full mb-1.5 right-0 left-0 bg-[#1a191a] border border-[#353534] rounded-xl shadow-2xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#89919e] tracking-wider">
              Export Format
            </div>

            <button
              type="button"
              onClick={() => handleSelectFormat('png')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#e5e2e1] hover:bg-[#201f1f] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>PNG (2x)</span>
              </div>
              {selectedFormat === 'png' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectFormat('svg')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#e5e2e1] hover:bg-[#201f1f] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>SVG</span>
              </div>
              {selectedFormat === 'svg' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectFormat('json')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#e5e2e1] hover:bg-[#201f1f] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Element JSON</span>
              </div>
              {selectedFormat === 'json' && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
            </button>

            <div className="my-1 border-t border-[#2a292a]" />

            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                onExportSelected();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[#9fcaff] hover:bg-[#201f1f] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>More Options...</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
