import { CanvasElement } from '../../types';

export type { CanvasElement };

export interface PresetThemeTokens {
  surfaceContainer: string;
  surfaceVariant?: string;
  onSurface?: string;
  outlineVariant: string;
  cornerRadius: number;
  elevation: {
    y: number;
    blur: number;
    spread: number;
  };
  palette: string[];
}

// M3 Theme Design Tokens (Surface & Elevation)
export const M3_TOKENS: PresetThemeTokens = {
  surfaceContainer: '#1E1F22',
  surfaceVariant: '#25272C',
  onSurface: '#E6E1E5',
  outlineVariant: '#49454F',
  cornerRadius: 16, // md.sys.shape.corner.large
  elevation: {
    y: 4,
    blur: 12,
    spread: 0,
  },
  palette: [
    '#D0BCFF', // Primary
    '#CCC2DC', // Secondary
    '#EFB8C8', // Tertiary
    '#E6E1E5', // Surface Text
    '#49454F', // Outline
    '#1E1F22', // Surface Container
  ],
};

export const IOS_TOKENS: PresetThemeTokens = {
  surfaceContainer: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  onSurface: '#FFFFFF',
  outlineVariant: '#38383A',
  cornerRadius: 12,
  elevation: { y: 2, blur: 8, spread: 0 },
  palette: ['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#5856D6', '#1C1C1E'],
};

export const GLASS_TOKENS: PresetThemeTokens = {
  surfaceContainer: 'rgba(255, 255, 255, 0.08)',
  surfaceVariant: 'rgba(255, 255, 255, 0.12)',
  onSurface: '#FFFFFF',
  outlineVariant: 'rgba(255, 255, 255, 0.16)',
  cornerRadius: 20,
  elevation: { y: 8, blur: 32, spread: 0 },
  palette: ['#FFFFFF', '#A5B4FC', '#38BDF8', '#818CF8', '#C084FC', '#000000'],
};
