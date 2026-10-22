import React from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Tooltip,
} from '@mui/material';
import { Style as PresetIcon } from '@mui/icons-material';
import { M3_TOKENS, IOS_TOKENS, GLASS_TOKENS, CanvasElement } from './applyM3Preset';

interface InspectorPresetsProps {
  element: CanvasElement;
  onUpdateElement: (updatedProps: Partial<CanvasElement>) => void;
}

export const InspectorPresets: React.FC<InspectorPresetsProps> = ({
  element,
  onUpdateElement,
}) => {
  const currentPreset =
    element.presetTheme ||
    (element.materialPreset === 'ios' || element.materialPreset === 'glass'
      ? element.materialPreset
      : 'm3');

  // 1. Handle switching the primary preset token engine
  const handlePresetChange = (
    _: React.MouseEvent<HTMLElement>,
    newPreset: 'm3' | 'ios' | 'glass' | null
  ) => {
    if (!newPreset) return;

    let tokens = M3_TOKENS;
    if (newPreset === 'ios') tokens = IOS_TOKENS;
    if (newPreset === 'glass') tokens = GLASS_TOKENS;

    // Batch update layout styling attributes atomically without touching positioning (x, y, w, h)
    onUpdateElement({
      presetTheme: newPreset,
      materialPreset: newPreset,
      fill: tokens.surfaceContainer,
      stroke: tokens.outlineVariant,
      strokeColor: tokens.outlineVariant,
      strokeWidth: 1,
      borderRadius: tokens.cornerRadius,
      radius: tokens.cornerRadius,
      shadowY: tokens.elevation.y,
      shadowBlur: tokens.elevation.blur,
      shadowSpread: tokens.elevation.spread,
    });
  };

  // 2. Handle clicking an individual palette swatch
  const handleSwatchClick = (colorHex: string) => {
    onUpdateElement({ fill: colorHex });
  };

  const activeTokens =
    currentPreset === 'ios'
      ? IOS_TOKENS
      : currentPreset === 'glass'
      ? GLASS_TOKENS
      : M3_TOKENS;

  return (
    <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
      {/* Header & Segmented Pill Switch */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <PresetIcon sx={{ fontSize: 15, color: '#9CA3AF' }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, letterSpacing: 0.5, color: '#A1A4AB' }}
          >
            PRESETS
          </Typography>
        </Stack>

        <ToggleButtonGroup
          value={currentPreset}
          exclusive
          size="small"
          onChange={handlePresetChange}
          sx={{
            height: 24,
            bgcolor: '#1E1F22',
            '& .MuiToggleButton-root': {
              color: '#8A8D93',
              fontSize: '0.68rem',
              px: 1,
              py: 0,
              border: '1px solid rgba(255,255,255,0.08)',
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: '#383B44',
                color: '#FFF',
                fontWeight: 600,
              },
            },
          }}
        >
          <ToggleButton value="m3">M3</ToggleButton>
          <ToggleButton value="ios">iOS</ToggleButton>
          <ToggleButton value="glass">Glass</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Dynamic Token Palette Swatches */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 1,
          pt: 0.5,
        }}
      >
        {activeTokens.palette.map((color, index) => {
          const isSelected =
            Boolean(element.fill) && element.fill.toLowerCase() === color.toLowerCase();
          return (
            <Tooltip title={color} key={`${currentPreset}-${index}`}>
              <Box
                onClick={() => handleSwatchClick(color)}
                sx={{
                  height: 30,
                  bgcolor: color,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: isSelected
                    ? '2px solid #6366F1'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    borderColor: 'rgba(255, 255, 255, 0.35)',
                  },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};
