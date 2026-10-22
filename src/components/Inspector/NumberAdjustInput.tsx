import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';

export interface NumberAdjustInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: React.ReactNode;
  labelTitle?: string;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  tabIndex?: number;
}

export const NumberAdjustInput: React.FC<NumberAdjustInputProps> = ({
  value,
  onChange,
  label,
  labelTitle,
  min,
  max,
  step = 1,
  largeStep = 10,
  suffix,
  disabled = false,
  className = '',
  id,
  tabIndex,
}) => {
  const [localValue, setLocalValue] = useState<string>(String(value ?? 0));
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startVal: number }>({ startX: 0, startVal: 0 });

  useEffect(() => {
    if (!isFocused && !isDragging) {
      setLocalValue(String(value ?? 0));
    }
  }, [value, isFocused, isDragging]);

  const clamp = (val: number): number => {
    let result = val;
    if (typeof min === 'number') result = Math.max(min, result);
    if (typeof max === 'number') result = Math.min(max, result);
    return result;
  };

  const handleCommit = (strVal: string) => {
    const parsed = parseFloat(strVal);
    if (isNaN(parsed)) {
      setLocalValue(String(value ?? 0));
    } else {
      const clamped = clamp(parsed);
      setLocalValue(String(clamped));
      onChange(clamped);
    }
  };

  const handleStep = (direction: 'up' | 'down', isLarge = false) => {
    if (disabled) return;
    const delta = (isLarge ? largeStep : step) * (direction === 'up' ? 1 : -1);
    const current = typeof value === 'number' ? value : 0;
    const nextVal = clamp(Math.round((current + delta) * 100) / 100);
    setLocalValue(String(nextVal));
    onChange(nextVal);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep('up', e.shiftKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep('down', e.shiftKey);
    } else if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Label Scrubber (Drag left/right to decrease/increase)
  const handleLabelMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startVal: value ?? 0,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const currentStep = moveEvent.shiftKey ? largeStep : step;
      const change = Math.round(deltaX / 3) * currentStep;
      const nextVal = clamp(dragStartRef.current.startVal + change);
      setLocalValue(String(nextVal));
      onChange(nextVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`relative flex items-center bg-[#141416] px-2 py-1.5 rounded-lg border transition-all group ${
        isFocused
          ? 'border-[#0d99ff] ring-1 ring-[#0d99ff]/30 shadow-sm'
          : 'border-[#353534] hover:border-[#4a4a49]'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      {/* Label / Scrubber prefix */}
      {label && (
        <div
          onMouseDown={handleLabelMouseDown}
          className="flex items-center text-[#89919e] hover:text-[#9fcaff] cursor-ew-resize select-none shrink-0 font-mono text-[11px] mr-1.5 transition-colors"
          title={labelTitle || 'Drag to adjust (Shift for 10x)'}
        >
          {label}
        </div>
      )}

      {/* Direct Input */}
      <input
        id={id}
        tabIndex={tabIndex}
        type="text"
        inputMode="numeric"
        value={localValue}
        disabled={disabled}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.select();
        }}
        onBlur={(e) => {
          setIsFocused(false);
          handleCommit(e.target.value);
        }}
        onChange={(e) => {
          setLocalValue(e.target.value);
          const parsed = parseFloat(e.target.value);
          if (!isNaN(parsed)) {
            onChange(clamp(parsed));
          }
        }}
        onKeyDown={handleKeyDown}
        className="bg-transparent text-[#e5e2e1] w-full text-right outline-none font-mono text-xs disabled:opacity-40 min-w-0"
      />

      {/* Suffix (e.g. px, %, °) */}
      {suffix && (
        <span className="text-[#89919e] text-[10px] ml-1 select-none shrink-0 font-mono">
          {suffix}
        </span>
      )}

      {/* Stepper buttons (Increase / Decrease) */}
      <div className="flex flex-col ml-1.5 -mr-0.5 border-l border-[#353534]/60 pl-1 shrink-0">
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            handleStep('up', e.shiftKey);
          }}
          disabled={disabled || (typeof max === 'number' && value >= max)}
          className="text-[#89919e] hover:text-[#9fcaff] hover:bg-[#201f1f] rounded p-0.5 transition-colors disabled:opacity-20"
          title="Increase value (Shift+Click for 10x)"
        >
          <ChevronUp className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            handleStep('down', e.shiftKey);
          }}
          disabled={disabled || (typeof min === 'number' && value <= min)}
          className="text-[#89919e] hover:text-[#9fcaff] hover:bg-[#201f1f] rounded p-0.5 transition-colors disabled:opacity-20"
          title="Decrease value (Shift+Click for 10x)"
        >
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
