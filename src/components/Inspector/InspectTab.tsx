import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { CanvasElement } from '../../types';

interface InspectTabProps {
  element: CanvasElement;
}

export const InspectTab: React.FC<InspectTabProps> = ({ element }) => {
  const [lang, setLang] = useState<'css' | 'tailwind' | 'react'>('css');
  const [copied, setCopied] = useState(false);

  const getCssCode = () => {
    const lines = [
      `/* Element: ${element.name} (${element.type}) */`,
      `width: ${element.width}px;`,
      `height: ${element.height}px;`,
      `background: ${element.fill || 'transparent'};`,
      element.borderRadius ? `border-radius: ${element.borderRadius}px;` : null,
      element.stroke && element.stroke !== 'none'
        ? `border: ${element.strokeWidth || 1}px solid ${element.stroke};`
        : null,
      (element.shadowBlur || 0) > 0 || (element.shadowY || 0) > 0
        ? `box-shadow: 0px ${element.shadowY || 0}px ${element.shadowBlur || 0}px rgba(0, 0, 0, 0.25);`
        : null,
      element.type === 'text'
        ? [
            `font-size: ${element.fontSize || 16}px;`,
            `font-weight: ${element.fontWeight || 400};`,
            `color: ${element.textColor || element.fill || '#ffffff'};`,
            `text-align: ${element.textAlign || 'left'};`,
          ].join('\n')
        : null,
    ];
    return lines.filter(Boolean).join('\n');
  };

  const getTailwindCode = () => {
    const classes = [
      `w-[${element.width}px]`,
      `h-[${element.height}px]`,
      element.fill ? `bg-[${element.fill}]` : '',
      element.borderRadius ? `rounded-[${element.borderRadius}px]` : '',
      element.stroke && element.stroke !== 'none'
        ? `border border-[${element.stroke}]`
        : '',
      (element.shadowBlur || 0) > 0 ? 'shadow-lg' : '',
      element.type === 'text' ? `text-[${element.fontSize || 16}px]` : '',
    ];
    return classes.filter(Boolean).join(' ');
  };

  const getReactCode = () => {
    return `<div className="${getTailwindCode()}">\n  {/* ${element.name} */}\n</div>`;
  };

  const codeString =
    lang === 'css' ? getCssCode() : lang === 'tailwind' ? getTailwindCode() : getReactCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-[#e5e2e1]">
          <Code2 className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>Code Inspection</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-medium text-[#9fcaff] hover:underline"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#34d399]" />
              <span className="text-[#34d399]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Language Switcher */}
      <div className="flex items-center bg-[#141416] p-1 rounded-lg border border-[#353534]">
        <button
          onClick={() => setLang('css')}
          className={`flex-1 py-1 rounded text-xs transition-colors ${
            lang === 'css' ? 'bg-[#0d99ff] text-[#002f55] font-semibold' : 'text-[#89919e]'
          }`}
        >
          CSS
        </button>
        <button
          onClick={() => setLang('tailwind')}
          className={`flex-1 py-1 rounded text-xs transition-colors ${
            lang === 'tailwind' ? 'bg-[#0d99ff] text-[#002f55] font-semibold' : 'text-[#89919e]'
          }`}
        >
          Tailwind
        </button>
        <button
          onClick={() => setLang('react')}
          className={`flex-1 py-1 rounded text-xs transition-colors ${
            lang === 'react' ? 'bg-[#0d99ff] text-[#002f55] font-semibold' : 'text-[#89919e]'
          }`}
        >
          React JSX
        </button>
      </div>

      {/* Code Display Box */}
      <pre className="p-3 bg-[#141416] rounded-lg border border-[#353534] font-mono text-[11px] text-[#9fcaff] overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {codeString}
      </pre>
    </div>
  );
};
