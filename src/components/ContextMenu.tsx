import React, { useEffect, useRef, useCallback } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean; // renders a divider line before this item
  action: () => void;
}

export interface ContextMenuState {
  x: number;
  y: number;
  targetId: string;
  items: ContextMenuItem[];
}

interface ContextMenuProps {
  menu: ContextMenuState | null;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ menu, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Clamp menu position within viewport edges
  const getClampedPosition = useCallback(() => {
    if (!menu || !menuRef.current) return { x: 0, y: 0 };

    const el = menuRef.current;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    let { x, y } = menu;

    // Right edge
    if (x + rect.width + pad > window.innerWidth) {
      x = window.innerWidth - rect.width - pad;
    }
    // Bottom edge
    if (y + rect.height + pad > window.innerHeight) {
      y = window.innerHeight - rect.height - pad;
    }
    // Left edge
    if (x < pad) x = pad;
    // Top edge
    if (y < pad) y = pad;

    return { x, y };
  }, [menu]);

  // Auto-dismiss: outside click, Escape, scroll, blur
  useEffect(() => {
    if (!menu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleScroll = () => onClose();
    const handleBlur = () => onClose();

    // Use capture for click to intercept before other handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, [menu, onClose]);

  // Repositioning after render to clamp within viewport
  useEffect(() => {
    if (!menu || !menuRef.current) return;
    const { x, y } = getClampedPosition();
    menuRef.current.style.left = `${x}px`;
    menuRef.current.style.top = `${y}px`;
    menuRef.current.style.opacity = '1';
    menuRef.current.style.transform = 'scale(1)';
  }, [menu, getClampedPosition]);

  if (!menu) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999]"
      style={{
        left: menu.x,
        top: menu.y,
        opacity: 0,
        transform: 'scale(0.95)',
        transition: 'opacity 0.1s ease, transform 0.1s ease',
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="min-w-[200px] max-w-[260px] py-1.5 rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: '#1e1e20',
          border: '1px solid #353534',
          boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {menu.items.map((item) => (
          <React.Fragment key={item.id}>
            {item.separator && (
              <div
                className="mx-2 my-1"
                style={{ height: 1, backgroundColor: '#353534' }}
              />
            )}
            <button
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.action();
                  onClose();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-[6px] text-[11px] transition-colors outline-none ${
                item.disabled
                  ? 'text-[#555] cursor-not-allowed'
                  : item.danger
                    ? 'text-[#ffb4ab] hover:bg-[#ff453a]/15 hover:text-[#ff6b6b]'
                    : 'text-[#d4d4d8] hover:bg-[#0d99ff]/15 hover:text-[#e5e2e1]'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                {item.icon && (
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center opacity-70">
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.label}</span>
              </span>
              {item.shortcut && (
                <span
                  className="ml-4 shrink-0 font-mono text-[10px] tracking-wide"
                  style={{ color: item.disabled ? '#444' : '#6b6b70' }}
                >
                  {item.shortcut}
                </span>
              )}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
