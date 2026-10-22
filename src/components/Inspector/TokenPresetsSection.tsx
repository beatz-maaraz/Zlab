import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Smartphone,
  Monitor,
  Tablet,
  Layers,
  Palette,
} from 'lucide-react';
import { CanvasElement } from '../../types';

interface TokenPresetsSectionProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  isArtboard?: boolean;
  disabled?: boolean;
}

type PresetCategory = 'm3' | 'ios' | 'glass';

interface ComponentToken {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  category: PresetCategory;
  variant: string;
  description: string;
  tokens: {
    fill: string;
    fillOpacity?: number;
    stroke: string;
    strokeWidth: number;
    borderRadius: number;
    shadowY: number;
    shadowBlur: number;
    shadowSpread: number;
    textColor?: string;
    backdropBlur?: number;
    glassEffect?: 'frosted' | 'neon' | 'smoke' | 'prism' | 'none';
  };
}

// 1. Structured M3 Theme Tokens (Full Design System Tokens)
const M3_COMPONENT_TOKENS: ComponentToken[] = [
  {
    id: 'm3-surface-container-high',
    name: 'Elevated Container',
    badge: 'M3 Surface',
    badgeColor: '#d0bcff',
    category: 'm3',
    variant: 'elevated',
    description: 'md.sys.color.surfaceContainerHigh with Level 2 elevation & medium corners',
    tokens: {
      fill: '#2b2930',
      fillOpacity: 100,
      stroke: '#49454f',
      strokeWidth: 1,
      borderRadius: 16,
      shadowY: 4,
      shadowBlur: 10,
      shadowSpread: 0,
      textColor: '#e6e0e9',
      backdropBlur: 0,
      glassEffect: 'none',
    },
  },
  {
    id: 'm3-filled-primary',
    name: 'Filled Primary',
    badge: 'M3 Filled',
    badgeColor: '#d0bcff',
    category: 'm3',
    variant: 'filled',
    description: 'md.sys.color.primary filled surface with 20px pill curvature',
    tokens: {
      fill: '#d0bcff',
      fillOpacity: 100,
      stroke: 'none',
      strokeWidth: 0,
      borderRadius: 20,
      shadowY: 2,
      shadowBlur: 6,
      shadowSpread: 0,
      textColor: '#381e72',
      backdropBlur: 0,
      glassEffect: 'none',
    },
  },
  {
    id: 'm3-tonal-container',
    name: 'Tonal Container',
    badge: 'M3 Tonal',
    badgeColor: '#ccc2dc',
    category: 'm3',
    variant: 'tonal',
    description: 'md.sys.color.secondaryContainer with subtle elevation level 1',
    tokens: {
      fill: '#4a4458',
      fillOpacity: 100,
      stroke: 'none',
      strokeWidth: 0,
      borderRadius: 16,
      shadowY: 2,
      shadowBlur: 6,
      shadowSpread: 0,
      textColor: '#e8def8',
      backdropBlur: 0,
      glassEffect: 'none',
    },
  },
  {
    id: 'm3-outlined-container',
    name: 'Outlined Container',
    badge: 'M3 Outlined',
    badgeColor: '#938f99',
    category: 'm3',
    variant: 'outlined',
    description: 'md.sys.color.outlineVariant with 1px border and level 0 elevation',
    tokens: {
      fill: '#141218',
      fillOpacity: 100,
      stroke: '#938f99',
      strokeWidth: 1,
      borderRadius: 12,
      shadowY: 0,
      shadowBlur: 0,
      shadowSpread: 0,
      textColor: '#cac4d0',
      backdropBlur: 0,
      glassEffect: 'none',
    },
  },
  {
    id: 'm3-fab-floating',
    name: 'Floating FAB',
    badge: 'M3 FAB',
    badgeColor: '#eaddff',
    category: 'm3',
    variant: 'fab',
    description: 'Level 3 elevation with primary container lavender fill',
    tokens: {
      fill: '#eaddff',
      fillOpacity: 100,
      stroke: 'none',
      strokeWidth: 0,
      borderRadius: 16,
      shadowY: 6,
      shadowBlur: 16,
      shadowSpread: 0,
      textColor: '#21005d',
      backdropBlur: 0,
      glassEffect: 'none',
    },
  },
];

// 2. iOS HIG Material Tokens
const IOS_COMPONENT_TOKENS: ComponentToken[] = [
  {
    id: 'ios-vibrancy-thin',
    name: 'Vibrancy Thin',
    badge: 'iOS HIG',
    badgeColor: '#007aff',
    category: 'ios',
    variant: 'ios-vibrancy',
    description: 'Apple HIG thin material with continuous squircle curvature',
    tokens: {
      fill: 'rgba(30, 30, 32, 0.65)',
      fillOpacity: 90,
      stroke: 'rgba(255, 255, 255, 0.16)',
      strokeWidth: 1,
      borderRadius: 20,
      shadowY: 8,
      shadowBlur: 20,
      shadowSpread: 0,
      textColor: '#ffffff',
      backdropBlur: 20,
      glassEffect: 'none',
    },
  },
  {
    id: 'ios-primary-action',
    name: 'Primary Blue Action',
    badge: 'iOS Filled',
    badgeColor: '#007aff',
    category: 'ios',
    variant: 'ios-primary',
    description: 'Apple System Blue action button token',
    tokens: {
      fill: '#007aff',
      fillOpacity: 100,
      stroke: 'none',
      strokeWidth: 0,
      borderRadius: 14,
      shadowY: 4,
      shadowBlur: 12,
      shadowSpread: 0,
      textColor: '#ffffff',
      backdropBlur: 0,
      glassEffect: 'none',
    },
  },
  {
    id: 'ios-ultra-card',
    name: 'Ultra-Thin Card',
    badge: 'iOS Card',
    badgeColor: '#ffffff',
    category: 'ios',
    variant: 'ios-card',
    description: 'Translucent Apple card layer with 24px curvature',
    tokens: {
      fill: 'rgba(255, 255, 255, 0.08)',
      fillOpacity: 100,
      stroke: 'rgba(255, 255, 255, 0.18)',
      strokeWidth: 1,
      borderRadius: 24,
      shadowY: 10,
      shadowBlur: 26,
      shadowSpread: 0,
      textColor: '#ffffff',
      backdropBlur: 25,
      glassEffect: 'none',
    },
  },
  {
    id: 'ios-dynamic-capsule',
    name: 'Dynamic Capsule',
    badge: 'iOS Island',
    badgeColor: '#ffffff',
    category: 'ios',
    variant: 'ios-capsule',
    description: 'Pure black pill with subtle specular border',
    tokens: {
      fill: '#000000',
      fillOpacity: 100,
      stroke: '#2c2c2e',
      strokeWidth: 1,
      borderRadius: 999,
      shadowY: 6,
      shadowBlur: 18,
      shadowSpread: 0,
      textColor: '#ffffff',
      backdropBlur: 0,
      glassEffect: 'none',
    },
  },
];

// 3. Glassmorphism Tokens
const GLASS_COMPONENT_TOKENS: ComponentToken[] = [
  {
    id: 'glass-frosted',
    name: 'Frosted Glass',
    badge: 'Glass',
    badgeColor: '#9fcaff',
    category: 'glass',
    variant: 'glass-frosted',
    description: 'Frosted glass with diffuse shadow and specular border',
    tokens: {
      fill: 'rgba(255, 255, 255, 0.08)',
      fillOpacity: 100,
      stroke: 'rgba(255, 255, 255, 0.22)',
      strokeWidth: 1,
      borderRadius: 20,
      shadowY: 8,
      shadowBlur: 24,
      shadowSpread: -4,
      textColor: '#ffffff',
      backdropBlur: 20,
      glassEffect: 'frosted',
    },
  },
  {
    id: 'glass-prism',
    name: 'Prism Neon Glass',
    badge: 'Neon Glass',
    badgeColor: '#38bdf8',
    category: 'glass',
    variant: 'glass-prism',
    description: 'Vibrant azure prism glass with neon border accent',
    tokens: {
      fill: 'rgba(13, 153, 255, 0.12)',
      fillOpacity: 100,
      stroke: 'rgba(13, 153, 255, 0.4)',
      strokeWidth: 1,
      borderRadius: 16,
      shadowY: 6,
      shadowBlur: 20,
      shadowSpread: 0,
      textColor: '#ffffff',
      backdropBlur: 16,
      glassEffect: 'prism',
    },
  },
  {
    id: 'glass-smoke',
    name: 'Dark Smoke Glass',
    badge: 'Smoke',
    badgeColor: '#e5e2e1',
    category: 'glass',
    variant: 'glass-smoke',
    description: 'Moody dark smoke glass for high-contrast overlays',
    tokens: {
      fill: 'rgba(18, 18, 20, 0.8)',
      fillOpacity: 100,
      stroke: 'rgba(255, 255, 255, 0.14)',
      strokeWidth: 1,
      borderRadius: 18,
      shadowY: 10,
      shadowBlur: 28,
      shadowSpread: -2,
      textColor: '#ffffff',
      backdropBlur: 24,
      glassEffect: 'smoke',
    },
  },
];

// Artboard / Frame Device Presets
const FRAME_DEVICE_PRESETS = [
  {
    id: 'desktop-1440',
    name: 'Desktop',
    dimensions: '1440 × 900',
    width: 1440,
    height: 900,
    icon: Monitor,
  },
  {
    id: 'android-large',
    name: 'Android Large',
    dimensions: '360 × 800',
    width: 360,
    height: 800,
    icon: Smartphone,
  },
  {
    id: 'tablet-840',
    name: 'Tablet 840',
    dimensions: '840 × 1200',
    width: 840,
    height: 1200,
    icon: Tablet,
  },
  {
    id: 'mobile-390',
    name: 'Mobile 390',
    dimensions: '390 × 844',
    width: 390,
    height: 844,
    icon: Smartphone,
  },
];

// Artboard / Frame M3 Dark Surface Theme Tokens
const FRAME_SURFACE_TOKENS = [
  {
    id: 'm3-surface-dark',
    name: 'M3 Surface (#141218)',
    fill: '#141218',
    stroke: '#49454f',
    label: 'Surface Dark',
  },
  {
    id: 'm3-surface-container',
    name: 'M3 Container (#1D1B20)',
    fill: '#1d1b20',
    stroke: '#49454f',
    label: 'Container',
  },
  {
    id: 'm3-surface-dim',
    name: 'M3 Dim (#121212)',
    fill: '#121212',
    stroke: '#36343b',
    label: 'Dim Baseline',
  },
  {
    id: 'm3-surface-light',
    name: 'M3 Light (#FEF7FF)',
    fill: '#fef7ff',
    stroke: '#79747e',
    label: 'Surface Light',
  },
];

export const TokenPresetsSection: React.FC<TokenPresetsSectionProps> = ({
  element,
  onUpdate,
  isArtboard = false,
  disabled = false,
}) => {
  const isFrame =
    isArtboard ||
    element.type === 'frame' ||
    element.id === 'desktop-1440' ||
    element.id === 'mobile-app-view' ||
    element.id === 'default-artboard-frame';

  // Active state bound to element metadata
  const initialCategory: PresetCategory =
    element.materialPreset === 'ios'
      ? 'ios'
      : element.materialPreset === 'glass'
      ? 'glass'
      : 'm3';

  const [activeCategory, setActiveCategory] = useState<PresetCategory>(initialCategory);

  // Sync state if element.materialPreset changes from outside
  useEffect(() => {
    if (element.materialPreset && element.materialPreset !== 'none') {
      setActiveCategory(element.materialPreset as PresetCategory);
    }
  }, [element.materialPreset]);

  // Dispatch atomic batch update for component tokens, strictly preserving element x, y, width, height
  const applyComponentToken = (token: ComponentToken) => {
    if (disabled || !token || !element) return;

    // Single atomic update containing fill, stroke, elevation, radius, etc.
    onUpdate({
      fill: token.tokens.fill,
      fillOpacity: token.tokens.fillOpacity ?? 100,
      stroke: token.tokens.stroke,
      strokeWidth: token.tokens.strokeWidth,
      borderRadius: token.tokens.borderRadius,
      shadowY: token.tokens.shadowY,
      shadowBlur: token.tokens.shadowBlur,
      shadowSpread: token.tokens.shadowSpread,
      textColor: token.tokens.textColor ?? element.textColor,
      backdropBlur: token.tokens.backdropBlur ?? 0,
      glassEffect: token.tokens.glassEffect ?? 'none',
      materialPreset: token.category,
      variant: token.variant,
    });
  };

  // Dispatch frame preset resize without resetting custom positioning
  const applyFrameDevicePreset = (device: (typeof FRAME_DEVICE_PRESETS)[0]) => {
    if (disabled || !device) return;
    onUpdate({
      width: device.width,
      height: device.height,
    });
  };

  // Dispatch frame surface token without mutating dimensions or coordinates
  const applyFrameSurfaceToken = (token: (typeof FRAME_SURFACE_TOKENS)[0]) => {
    if (disabled || !token) return;
    onUpdate({
      fill: token.fill,
      fillOpacity: 100,
      stroke: token.stroke,
      strokeWidth: 1,
      materialPreset: 'm3',
    });
  };

  const getTokensForCategory = (): ComponentToken[] => {
    switch (activeCategory) {
      case 'm3':
        return M3_COMPONENT_TOKENS;
      case 'ios':
        return IOS_COMPONENT_TOKENS;
      case 'glass':
        return GLASS_COMPONENT_TOKENS;
      default:
        return M3_COMPONENT_TOKENS;
    }
  };

  // --- 1. FRAME / ARTBOARD MODE: Device Presets & Surface Tokens ---
  if (isFrame) {
    return (
      <div className="p-3 border-b border-[#201f1f] space-y-2.5 select-none bg-[#141416]/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-[#0d99ff]" />
            <span>Frame Presets</span>
          </span>
          <span className="text-[9px] font-mono text-[#0d99ff] bg-[#0d99ff]/10 px-1.5 py-0.5 rounded">
            Artboard Context
          </span>
        </div>

        {/* Device Dimensions Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {FRAME_DEVICE_PRESETS.map((dev) => {
            const Icon = dev.icon;
            const isCurrentSize =
              element.width === dev.width && element.height === dev.height;
            return (
              <button
                key={dev.id}
                type="button"
                disabled={disabled}
                onClick={() => applyFrameDevicePreset(dev)}
                className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between group ${
                  isCurrentSize
                    ? 'bg-[#0d99ff]/15 border-[#0d99ff] text-white shadow-xs'
                    : 'bg-[#141416] border-[#353534] hover:border-[#4a4a49] text-[#e5e2e1]'
                } disabled:opacity-40`}
                title={`Set frame dimensions to ${dev.dimensions}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 text-[#89919e] group-hover:text-[#9fcaff] shrink-0" />
                  <div className="truncate">
                    <div className="text-[11px] font-medium truncate">{dev.name}</div>
                    <div className="text-[9px] text-[#89919e] font-mono">{dev.dimensions}</div>
                  </div>
                </div>
                {isCurrentSize && <Check className="w-3 h-3 text-[#0d99ff] shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Standard M3 Surface Tokens for Frames */}
        <div className="pt-2 border-t border-[#201f1f]/80">
          <div className="text-[10px] text-[#89919e] uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1">
            <Palette className="w-3 h-3 text-[#9fcaff]" />
            <span>M3 Surface Tokens</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {FRAME_SURFACE_TOKENS.map((st) => {
              const isApplied = element.fill === st.fill;
              return (
                <button
                  key={st.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => applyFrameSurfaceToken(st)}
                  className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    isApplied
                      ? 'bg-[#0d99ff]/15 border-[#0d99ff] text-white'
                      : 'bg-[#141416] border-[#353534] hover:border-[#4a4a49] text-[#e5e2e1]'
                  } disabled:opacity-40`}
                  title={`Apply ${st.name}`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: st.fill }}
                  />
                  <span className="text-[10px] font-medium truncate">{st.label}</span>
                  {isApplied && <Check className="w-3 h-3 text-[#0d99ff] ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- 2. UI COMPONENT / LAYER MODE: Full M3 / iOS / Glass Component Tokens ---
  return (
    <div className="p-3 border-b border-[#201f1f] space-y-2.5 select-none bg-[#141416]/20">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#9fcaff]" />
          <span>Design System Tokens</span>
        </span>

        {/* Clean Segmented Pill Switch with Active State Binding */}
        <div className="flex items-center bg-[#141416] p-0.5 rounded-lg border border-[#353534]">
          {(['m3', 'ios', 'glass'] as const).map((cat) => {
            const isActive = activeCategory === cat;
            const label = cat === 'm3' ? 'M3' : cat === 'ios' ? 'iOS' : 'Glass';
            return (
              <button
                key={cat}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setActiveCategory(cat);
                  onUpdate({ materialPreset: cat });
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#0d99ff] text-white shadow-xs font-semibold'
                    : 'text-[#89919e] hover:text-[#e5e2e1]'
                } disabled:opacity-40`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Variant Token Cards */}
      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in duration-150">
        {getTokensForCategory().map((token) => {
          const isApplied =
            element.variant === token.variant ||
            (element.fill === token.tokens.fill &&
              element.borderRadius === token.tokens.borderRadius);

          return (
            <button
              key={token.id}
              type="button"
              disabled={disabled}
              onClick={() => applyComponentToken(token)}
              className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all group relative ${
                isApplied
                  ? 'bg-[#0d99ff]/15 border-[#0d99ff] ring-1 ring-[#0d99ff]/40 text-white'
                  : 'bg-[#141416] border-[#353534] hover:border-[#4a4a49] text-[#e5e2e1]'
              } disabled:opacity-40`}
              title={token.description}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: token.tokens.fill }}
                  />
                  <span className="text-[9px] font-mono text-[#89919e] uppercase">
                    {token.badge}
                  </span>
                </div>
                {isApplied && <Check className="w-3 h-3 text-[#0d99ff]" />}
              </div>

              <div className="truncate text-[11px] font-semibold text-[#e5e2e1]">
                {token.name}
              </div>

              <div className="flex items-center gap-2 mt-1 text-[9px] text-[#89919e] font-mono">
                <span>R: {token.tokens.borderRadius}px</span>
                {token.tokens.shadowBlur > 0 && <span>Elev: {token.tokens.shadowBlur}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
